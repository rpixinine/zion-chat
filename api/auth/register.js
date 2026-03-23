import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { emailBoasVindas } from "./email-templates.js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")   return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { nome, nif, email, telefone, onde_conheceu, foto_url, password } = req.body;

        // ── Validações básicas ─────────────────────────────────
        if (!nome?.trim())   return res.status(400).json({ error: "Nome obrigatório." });
        if (!email?.trim())  return res.status(400).json({ error: "Email obrigatório." });
        if (!password)       return res.status(400).json({ error: "Password obrigatória." });
        if (password.length < 6) return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres." });

        const emailNorm = email.toLowerCase().trim();
        const nifNorm   = nif?.replace(/\D/g, '') || null;

        if (nifNorm && nifNorm.length !== 9)
            return res.status(400).json({ error: "NIF inválido. Deve ter 9 dígitos." });

        // ── Verifica se email já está registado ────────────────
        const { data: emailExistente } = await supabase
            .from("usuarios")
            .select("id")
            .eq("email", emailNorm)
            .maybeSingle();

        if (emailExistente)
            return res.status(409).json({ error: "Este email já tem conta registada." });

        // ── Auto-vínculo com membro existente ──────────────────
        let membroId    = null;
        let visitanteId = null;
        let tipo        = "visitante";

        // 1. Por NIF
        if (nifNorm) {
            const { data: membroPorNif } = await supabase
                .from("membros")
                .select("id, nome, email")
                .eq("nif", nifNorm)
                .eq("ativo", true)
                .maybeSingle();

            if (membroPorNif) {
                membroId = membroPorNif.id;
                tipo     = "membro";
                console.log(`[register] Vínculo por NIF → membro_id=${membroId}`);
            }
        }

        // 2. Por email
        if (!membroId) {
            const { data: membroPorEmail } = await supabase
                .from("membros")
                .select("id, nome")
                .eq("email", emailNorm)
                .eq("ativo", true)
                .maybeSingle();

            if (membroPorEmail) {
                membroId = membroPorEmail.id;
                tipo     = "membro";
                console.log(`[register] Vínculo por email → membro_id=${membroId}`);
            }
        }

        // 3. Cria visitante se não vinculou
        if (!membroId) {
            const { data: novoVisitante, error: visitanteErr } = await supabase
                .from("visitantes")
                .insert({
                    nome:          nome.trim(),
                    email:         emailNorm,
                    telefone:      telefone || null,
                    onde_conheceu: onde_conheceu || null,
                    ativo:         true,
                })
                .select("id")
                .single();

            if (visitanteErr) {
                console.warn("[register] Erro ao criar visitante:", visitanteErr.message);
            } else {
                visitanteId = novoVisitante.id;
            }
        }

        // ── Hash da password ───────────────────────────────────
        const passwordHash = await bcrypt.hash(password, 12);

        // ── Cria utilizador ────────────────────────────────────
        const { data: novoUser, error: userErr } = await supabase
            .from("usuarios")
            .insert({
                nome:          nome.trim(),
                email:         emailNorm,
                password_hash: passwordHash,
                tipo,
                membro_id:     membroId,
                visitante_id:  visitanteId,
                ativo:         true,
                e_admin:       false,
            })
            .select("id, nome, email, tipo, membro_id, visitante_id")
            .single();

        if (userErr) {
            console.error("[register] Erro ao inserir usuario:", JSON.stringify(userErr));
            if (userErr.code === "23505")
                return res.status(409).json({ error: "Este email já tem conta registada." });
            throw new Error(userErr.message);
        }

        // Actualiza foto no membro se vinculou e enviou foto
        if (membroId && foto_url) {
            await supabase
                .from("membros")
                .update({ foto_url })
                .eq("id", membroId)
                .is("foto_url", null);
        }

        // ── Envia email de boas-vindas ─────────────────────────
        // Não bloqueia o registo se o email falhar
        try {
            const { subject, html } = emailBoasVindas({
                nome: novoUser.nome,
                tipo: novoUser.tipo,
            });

            await transporter.sendMail({
                from:    `"Zion Lisboa" <${process.env.GMAIL_USER}>`,
                to:      emailNorm,
                subject,
                html,
            });

            console.log(`[register] Email de boas-vindas enviado para ${emailNorm}`);
        } catch (emailErr) {
            // Loga mas não falha o registo
            console.warn("[register] Erro ao enviar email de boas-vindas:", emailErr.message);
        }

        // ── Gera token JWT ─────────────────────────────────────
        const token = jwt.sign(
            { id: novoUser.id, email: novoUser.email, tipo: novoUser.tipo },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            token,
            user: {
                id:           novoUser.id,
                nome:         novoUser.nome,
                email:        novoUser.email,
                tipo:         novoUser.tipo,
                membro_id:    novoUser.membro_id    || null,
                visitante_id: novoUser.visitante_id || null,
                vinculado:    !!membroId,
            }
        });

    } catch (err) {
        console.error("[auth/register] ERRO GERAL:", err.message);
        return res.status(500).json({ error: err.message || "Erro interno. Tenta novamente." });
    }
}

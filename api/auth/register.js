import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { emailBoasVindas } from "./email-templates.js";

const sbAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { nome, nif, email, telefone, onde_conheceu, foto_url, password } = req.body;

        if (!nome?.trim())   return res.status(400).json({ error: "Nome obrigatório." });
        if (!email?.trim())  return res.status(400).json({ error: "Email obrigatório." });
        if (!password || password.length < 6)
            return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres." });

        const emailNorm = email.toLowerCase().trim();
        const nifNorm   = nif?.replace(/\D/g, '') || null;

        if (nifNorm && nifNorm.length !== 9)
            return res.status(400).json({ error: "NIF inválido." });

        // 1. Criar no Supabase Auth
        const { data: authData, error: authErr } = await sbAdmin.auth.admin.createUser({
            email:         emailNorm,
            password,
            email_confirm: true,
            user_metadata: { nome: nome.trim() }
        });

        if (authErr) {
            if (authErr.message.includes("already been registered"))
                return res.status(409).json({ error: "Este email já tem conta registada." });
            throw new Error(authErr.message);
        }

        // 2. Auto-vínculo com membro existente (mantém lógica original)
        let membroId   = null;
        let visitanteId = null;
        let tipo       = "visitante";

        if (nifNorm) {
            const { data: m } = await sbAdmin.from("membros")
                .select("id").eq("nif", nifNorm).eq("ativo", true).maybeSingle();
            if (m) { membroId = m.id; tipo = "membro"; }
        }

        if (!membroId) {
            const { data: m } = await sbAdmin.from("membros")
                .select("id").eq("email", emailNorm).eq("ativo", true).maybeSingle();
            if (m) { membroId = m.id; tipo = "membro"; }
        }

        if (!membroId) {
            const { data: v } = await sbAdmin.from("visitantes")
                .insert({ nome: nome.trim(), email: emailNorm, telefone: telefone || null,
                          onde_conheceu: onde_conheceu || null, ativo: true })
                .select("id").single();
            if (v) visitanteId = v.id;
        }

        // 3. Criar na tabela usuarios
        const { data: novoUser, error: userErr } = await sbAdmin
            .from("usuarios")
            .insert({ nome: nome.trim(), email: emailNorm, tipo, membro_id: membroId,
                      visitante_id: visitanteId, ativo: true, e_admin: false })
            .select("id, nome, email, tipo, membro_id, visitante_id")
            .single();

        if (userErr) {
            if (userErr.code === "23505")
                return res.status(409).json({ error: "Este email já tem conta registada." });
            throw new Error(userErr.message);
        }

        // 4. Actualiza foto no membro se vinculou
        if (membroId && foto_url) {
            await sbAdmin.from("membros")
                .update({ foto_url }).eq("id", membroId).is("foto_url", null);
        }

        // 5. Email de boas-vindas
        try {
            const { subject, html } = emailBoasVindas({ nome: novoUser.nome, tipo: novoUser.tipo });
            await transporter.sendMail({
                from: `"Zion Lisboa" <${process.env.GMAIL_USER}>`,
                to: emailNorm, subject, html,
            });
        } catch (emailErr) {
            console.warn("[register] Email falhou:", emailErr.message);
        }

        return res.status(201).json({
            ok: true,
            user: { ...novoUser, membro_id: novoUser.membro_id || null, vinculado: !!membroId }
        });

    } catch (err) {
        console.error("[register]", err.message);
        return res.status(500).json({ error: err.message || "Erro interno." });
    }
}

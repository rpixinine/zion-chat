import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")   return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { nome, nif, email, telefone, onde_conheceu, foto_url, password } = req.body;

        // ── Validações básicas ─────────────────────────────────
        if (!nome?.trim())     return res.status(400).json({ error: "Nome obrigatório." });
        if (!email?.trim())    return res.status(400).json({ error: "Email obrigatório." });
        if (!password)         return res.status(400).json({ error: "Password obrigatória." });
        if (password.length < 6) return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres." });

        const emailNorm = email.toLowerCase().trim();
        const nifNorm   = nif?.replace(/\D/g, '') || null;

        // Valida NIF se fornecido (9 dígitos)
        if (nifNorm && nifNorm.length !== 9) {
            return res.status(400).json({ error: "NIF inválido. Deve ter 9 dígitos." });
        }

        // ── Verifica se email já está registado ────────────────
        const { data: emailExistente } = await supabase
            .from("usuarios")
            .select("id")
            .eq("email", emailNorm)
            .single();

        if (emailExistente) {
            return res.status(409).json({ error: "Este email já tem conta registada." });
        }

        // ── Verifica se NIF já está registado noutro utilizador ─
        if (nifNorm) {
            const { data: nifExistente } = await supabase
                .from("usuarios")
                .select("id")
                .eq("nif", nifNorm)
                .single();

            if (nifExistente) {
                return res.status(409).json({ error: "Este NIF já está associado a outra conta." });
            }
        }

        // ── Auto-vínculo com membro existente ──────────────────
        // Procura membro pelo NIF (prioridade) ou email
        // Não dá permissão de admin — máximo é 'membro'
        let membroId   = null;
        let visitanteId = null;
        let tipo        = "visitante";

        // 1. Tenta match por NIF
        if (nifNorm) {
            const { data: membroPorNif } = await supabase
                .from("membros")
                .select("id, email, ativo")
                .eq("nif", nifNorm)
                .eq("ativo", true)
                .single();

            if (membroPorNif) {
                membroId = membroPorNif.id;
                tipo     = "membro";
            }
        }

        // 2. Se não encontrou por NIF, tenta por email
        if (!membroId) {
            const { data: membroPorEmail } = await supabase
                .from("membros")
                .select("id, ativo")
                .eq("email", emailNorm)
                .eq("ativo", true)
                .single();

            if (membroPorEmail) {
                membroId = membroPorEmail.id;
                tipo     = "membro";
            }
        }

        // 3. Se não é membro, cria registo de visitante
        if (!membroId) {
            const { data: novoVisitante, error: visitanteErr } = await supabase
                .from("visitantes")
                .insert({
                    nome:           nome.trim(),
                    nif:            nifNorm,
                    email:          emailNorm,
                    telefone:       telefone || null,
                    onde_conheceu:  onde_conheceu || null,
                    foto_url:       foto_url || null,
                })
                .select("id")
                .single();

            if (visitanteErr) {
                console.error("[register] visitante insert:", visitanteErr);
                throw new Error("Erro ao criar perfil de visitante.");
            }

            visitanteId = novoVisitante.id;
        }

        // ── Hash da password ───────────────────────────────────
        const passwordHash = await bcrypt.hash(password, 12);

        // ── Cria utilizador ────────────────────────────────────
        const { data: novoUser, error: userErr } = await supabase
            .from("usuarios")
            .insert({
                nome:         nome.trim(),
                nif:          nifNorm,
                email:        emailNorm,
                password_hash: passwordHash,
                tipo,                          // 'visitante' ou 'membro'
                membro_id:    membroId,         // null se visitante
                visitante_id: visitanteId,      // null se membro vinculado
                foto_url:     foto_url || null,
                ativo:        true,
            })
            .select("id, nome, email, tipo, membro_id, visitante_id")
            .single();

        if (userErr) {
            console.error("[register] usuario insert:", userErr);
            throw new Error("Erro ao criar conta.");
        }

        // Se vinculou a membro, actualiza o registo do membro com o user_id
        if (membroId) {
            await supabase
                .from("membros")
                .update({ usuario_id: novoUser.id })
                .eq("id", membroId);
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
                tipo:         novoUser.tipo,       // 'visitante' ou 'membro' (nunca 'admin' por registo)
                membro_id:    novoUser.membro_id,
                visitante_id: novoUser.visitante_id,
                vinculado:    !!membroId,          // true se foi auto-vinculado a membro
            }
        });

    } catch (err) {
        console.error("[auth/register]", err);
        return res.status(500).json({ error: err.message || "Erro interno. Tenta novamente." });
    }
}

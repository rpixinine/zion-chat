// api/auth/update-password.js
// Atualiza password na tabela usuarios com bcrypt (sem Supabase Auth)
// Chamado pelo painel de admin para criacao de um user

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
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")   return res.status(405).json({ error: "Método não permitido" });

    // ── 1. Verificar admin autenticado ──────────────────────────────────────────
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
        return res.status(401).json({ error: "Não autenticado." });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    const { data: adminUser } = await supabase
        .from("usuarios")
        .select("id, e_admin, ativo")
        .eq("id", payload.id)
        .single();

    if (!adminUser || !adminUser.ativo || !adminUser.e_admin) {
        return res.status(403).json({ error: "Sem permissão — não és admin." });
    }

    // ── 2. Validar dados ────────────────────────────────────────────────────────
    const { userId, password } = req.body;

    if (!userId)   return res.status(400).json({ error: "userId é obrigatório." });
    if (!password) return res.status(400).json({ error: "Password é obrigatória." });
    if (password.length < 6)
        return res.status(400).json({ error: "Password deve ter mínimo 6 caracteres." });

    // ── 3. Verificar que o utilizador alvo existe ───────────────────────────────
    const { data: targetUser } = await supabase
        .from("usuarios")
        .select("id, ativo")
        .eq("id", userId)
        .single();

    if (!targetUser) {
        return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    // ── 4. Hash da nova password (bcrypt, igual ao resto do sistema) ────────────
    try {
        const password_hash = await bcrypt.hash(password, 12);

        const { error: updateErr } = await supabase
            .from("usuarios")
            .update({
                password_hash,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (updateErr) throw new Error("Erro ao atualizar: " + updateErr.message);

        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error("[update-password]", err);
        return res.status(500).json({ error: err.message || "Erro interno." });
    }
}

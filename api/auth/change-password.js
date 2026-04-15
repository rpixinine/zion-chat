// api/auth/change-password.js
// Permite que um utilizador autenticado troque a sua própria senha.
// Não precisa de ser admin — qualquer utilizador logado pode usar.

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

    // ── 1. Verificar token ────────────────────────────────────────────────────
    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "Não autenticado." });

    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ error: "Token inválido ou expirado." }); }

    // ── 2. Validar body ───────────────────────────────────────────────────────
    const { senha_atual, nova_senha } = req.body || {};

    if (!senha_atual || !nova_senha) {
        return res.status(400).json({ error: "Senha atual e nova senha são obrigatórias." });
    }
    if (nova_senha.length < 8) {
        return res.status(400).json({ error: "A nova senha deve ter pelo menos 8 caracteres." });
    }
    if (nova_senha === senha_atual) {
        return res.status(400).json({ error: "A nova senha deve ser diferente da atual." });
    }

    // ── 3. Buscar utilizador ──────────────────────────────────────────────────
    const { data: user, error: errUser } = await supabase
        .from("usuarios")
        .select("id, password_hash, ativo")
        .eq("id", payload.id)
        .single();

    if (errUser || !user) return res.status(404).json({ error: "Utilizador não encontrado." });
    if (!user.ativo)       return res.status(403).json({ error: "Conta inativa." });

    // ── 4. Verificar senha atual ──────────────────────────────────────────────
    const senhaCorreta = await bcrypt.compare(senha_atual, user.password_hash);
    if (!senhaCorreta) {
        return res.status(401).json({ error: "Senha atual incorreta." });
    }

    // ── 5. Hash da nova senha e update ────────────────────────────────────────
    const nova_hash = await bcrypt.hash(nova_senha, 12);

    const { error: updateErr } = await supabase
        .from("usuarios")
        .update({
            password_hash: nova_hash,
            updated_at:    new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateErr) {
        console.error("[change-password]", updateErr);
        return res.status(500).json({ error: "Erro ao actualizar a senha." });
    }

    return res.status(200).json({ ok: true, mensagem: "Senha actualizada com sucesso." });
}
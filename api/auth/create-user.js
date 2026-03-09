// api/auth/create-user.js
// Cria utilizador diretamente na tabela usuarios (bcrypt + JWT — sem Supabase Auth)
// Chamado pelo painel de admin

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

    // ── 1. Verificar que quem chama é um admin autenticado ──────────────────────
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

    // Confirma que o utilizador logado é admin
    const { data: adminUser } = await supabase
        .from("usuarios")
        .select("id, e_admin, ativo")
        .eq("id", payload.id)
        .single();

    if (!adminUser || !adminUser.ativo || !adminUser.e_admin) {
        return res.status(403).json({ error: "Sem permissão — não és admin." });
    }

    // ── 2. Validar dados recebidos ──────────────────────────────────────────────
    const { email, password, nome, tipo, e_admin, ativo, ...perms } = req.body;

    if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email é obrigatório." });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password deve ter mínimo 6 caracteres." });
    }

    const emailNorm = email.toLowerCase().trim();

    // ── 3. Verificar duplicado ──────────────────────────────────────────────────
    const { data: existing } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", emailNorm)
        .single();

    if (existing) {
        return res.status(409).json({ error: "Já existe utilizador com este email." });
    }

    // ── 4. Hash da password (igual ao register.js) ──────────────────────────────
    const password_hash = await bcrypt.hash(password, 12);

    // ── 5. Inserir na tabela usuarios ───────────────────────────────────────────
    try {
        const { data: novoUser, error: insertErr } = await supabase
            .from("usuarios")
            .insert({
                email:         emailNorm,
                nome:          nome || null,
                password_hash,
                tipo:          tipo || "membro",
                e_admin:       !!e_admin,
                ativo:         ativo !== false,
                created_at:    new Date().toISOString(),
                updated_at:    new Date().toISOString(),
                ...perms,
            })
            .select()
            .single();

        if (insertErr) throw new Error("Erro ao inserir: " + insertErr.message);

        return res.status(200).json({ ok: true, user: novoUser });

    } catch (err) {
        console.error("[create-user]", err);
        return res.status(500).json({ error: err.message || "Erro interno." });
    }
}
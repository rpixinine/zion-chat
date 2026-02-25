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
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { nome, email, telefone, password, onde_conheceu } = req.body;

        if (!nome || !email || !password)
            return res.status(400).json({ error: "Nome, email e password são obrigatórios." });

        if (password.length < 6)
            return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres." });

        const emailNorm = email.toLowerCase().trim();

        // Verifica se email já existe
        const { data: existing } = await supabase
            .from("usuarios")
            .select("id")
            .eq("email", emailNorm)
            .single();

        if (existing)
            return res.status(409).json({ error: "Este email já tem conta. Faz login." });

        // Hash da password
        const password_hash = await bcrypt.hash(password, 12);

        // 1. Cria registo na tabela visitantes
        const { data: visitante, error: errV } = await supabase
            .from("visitantes")
            .insert({
                nome,
                email: emailNorm,
                telefone:       telefone || null,
                onde_conheceu:  onde_conheceu || null,
                data_visita:    new Date().toISOString().split("T")[0],
                ativo:          true,
            })
            .select()
            .single();

        if (errV) throw new Error("Erro ao criar visitante: " + errV.message);

        // 2. Cria conta na tabela usuarios
        const { data: usuario, error: errU } = await supabase
            .from("usuarios")
            .insert({
                nome,
                email:        emailNorm,
                password_hash,
                tipo:         "visitante",
                visitante_id: visitante.id,
                membro_id:    null,
                ativo:        true,
            })
            .select()
            .single();

        if (errU) throw new Error("Erro ao criar utilizador: " + errU.message);

        // Gera token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            token,
            user: {
                id:           usuario.id,
                nome:         usuario.nome,
                email:        usuario.email,
                tipo:         usuario.tipo,
                visitante_id: usuario.visitante_id,
                membro_id:    null,
            }
        });

    } catch (err) {
        console.error("[auth/register]", err);
        return res.status(500).json({ error: err.message || "Erro interno." });
    }
}
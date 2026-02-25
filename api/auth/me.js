import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer "))
            return res.status(401).json({ error: "Não autenticado." });

        const token = auth.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const { data: user, error } = await supabase
            .from("usuarios")
            .select("id, nome, email, tipo, membro_id, visitante_id, ativo")
            .eq("id", payload.id)
            .single();

        if (error || !user || !user.ativo)
            return res.status(401).json({ error: "Sessão inválida." });

        return res.status(200).json({ user });

    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
}
import { createClient } from "@supabase/supabase-js";

const sbAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
        if (!token) return res.status(401).json({ error: "Não autenticado." });

        // Troca jwt.verify por Supabase Auth
        const { data: { user: authUser }, error } = await sbAdmin.auth.getUser(token);
        if (error || !authUser) return res.status(401).json({ error: "Sessão inválida." });

        const { data: membro } = await sbAdmin
            .from("membros")
            .select("id, nome, email, tipo, e_admin, e_lider, ativo")
            .eq("email", authUser.email)
            .eq("ativo", true)
            .single();

        if (!membro) return res.status(401).json({ error: "Sessão inválida." });

        return res.status(200).json({ user: { ...membro, membro_id: membro.id } });

    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
}

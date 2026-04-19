import { createClient } from "@supabase/supabase-js";

const sbAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "Não autenticado." });

    const { data: { user: authUser }, error: authErr } = await sbAdmin.auth.getUser(token);
    if (authErr || !authUser) return res.status(401).json({ error: "Token inválido ou expirado." });

    const { data: adminMembro } = await sbAdmin
        .from("membros")
        .select("e_admin")
        .eq("email", authUser.email)
        .eq("ativo", true)
        .single();

    if (!adminMembro?.e_admin)
        return res.status(403).json({ error: "Sem permissão — não és admin." });

    const { userId, password } = req.body;
    if (!userId)   return res.status(400).json({ error: "userId é obrigatório." });
    if (!password || password.length < 6)
        return res.status(400).json({ error: "Password deve ter mínimo 6 caracteres." });

    try {
        // Actualiza no Supabase Auth directamente
        const { error: updateErr } = await sbAdmin.auth.admin.updateUserById(
            userId,
            { password }
        );

        if (updateErr) throw new Error(updateErr.message);

        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error("[update-password]", err);
        return res.status(500).json({ error: err.message || "Erro interno." });
    }
}

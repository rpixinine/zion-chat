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

    // Verifica sessão
    const { data: { user: authUser }, error: authErr } = await sbAdmin.auth.getUser(token);
    if (authErr || !authUser) return res.status(401).json({ error: "Token inválido ou expirado." });

    const { nova_senha } = req.body || {};
    if (!nova_senha || nova_senha.length < 8)
        return res.status(400).json({ error: "A nova senha deve ter pelo menos 8 caracteres." });

    // Actualiza no Supabase Auth (não precisa de bcrypt)
    const { error: updateErr } = await sbAdmin.auth.admin.updateUserById(
        authUser.id,
        { password: nova_senha }
    );

    if (updateErr) {
        console.error("[change-password]", updateErr);
        return res.status(500).json({ error: "Erro ao actualizar a senha." });
    }

    return res.status(200).json({ ok: true, mensagem: "Senha actualizada com sucesso." });
}

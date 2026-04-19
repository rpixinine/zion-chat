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

    // Verifica admin
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

    const { email, password, nome, tipo, e_admin, ativo, ...perms } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: "Email é obrigatório." });
    if (!password || password.length < 6)
        return res.status(400).json({ error: "Password deve ter mínimo 6 caracteres." });

    const emailNorm = email.toLowerCase().trim();

    try {
        // 1. Criar no Supabase Auth
        const { error: authCreateErr } = await sbAdmin.auth.admin.createUser({
            email:         emailNorm,
            password,
            email_confirm: true,
            user_metadata: { nome: nome || null }
        });

        if (authCreateErr && !authCreateErr.message.includes("already been registered"))
            throw new Error("Supabase Auth: " + authCreateErr.message);

        // 2. Criar na tabela usuarios
        const { data: novoUser, error: insertErr } = await sbAdmin
            .from("usuarios")
            .upsert({
                email:      emailNorm,
                nome:       nome || null,
                tipo:       tipo || "membro",
                e_admin:    !!e_admin,
                ativo:      ativo !== false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...perms,
            }, { onConflict: "email" })
            .select()
            .single();

        if (insertErr) throw new Error("Tabela usuarios: " + insertErr.message);

        return res.status(200).json({ ok: true, user: novoUser });

    } catch (err) {
        console.error("[create-user]", err);
        return res.status(500).json({ error: err.message || "Erro interno." });
    }
}

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

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
        const { token, password } = req.body;

        if (!token)    return res.status(400).json({ error: "Token inválido." });
        if (!password) return res.status(400).json({ error: "Password obrigatória." });
        if (password.length < 6)
            return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres." });

        // 1. Busca o token
        const { data: reset, error: resetErr } = await supabase
            .from("password_resets")
            .select("*")
            .eq("token", token)
            .eq("usado", false)
            .single();

        if (resetErr || !reset)
            return res.status(400).json({ error: "Link inválido ou já utilizado." });

        // 2. Verifica expiração
        if (new Date() > new Date(reset.expires_at))
            return res.status(400).json({ error: "Este link expirou. Pede um novo." });

        // 3. Busca o utilizador
        const { data: user, error: userErr } = await supabase
            .from("usuarios")
            .select("id, ativo")
            .eq("email", reset.email)
            .single();

        if (userErr || !user || !user.ativo)
            return res.status(400).json({ error: "Conta não encontrada ou desactivada." });

        // 4. Hash da nova password
        const password_hash = await bcrypt.hash(password, 12);

        // 5. Actualiza a password
        const { error: updateErr } = await supabase
            .from("usuarios")
            .update({ password_hash })
            .eq("id", user.id);

        if (updateErr) throw new Error("Erro ao actualizar password: " + updateErr.message);

        // 6. Marca o token como usado
        await supabase
            .from("password_resets")
            .update({ usado: true })
            .eq("id", reset.id);

        // 7. Invalida todos os outros tokens deste email (limpeza)
        await supabase
            .from("password_resets")
            .update({ usado: true })
            .eq("email", reset.email)
            .neq("id", reset.id);

        return res.status(200).json({ message: "Password alterada com sucesso." });

    } catch (err) {
        console.error("[auth/reset-password]", err);
        return res.status(500).json({ error: "Erro interno. Tenta novamente." });
    }
}

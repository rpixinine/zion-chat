import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { emailRecuperacaoPassword, APP_URL } from "./emailTemplates.js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")   return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { email } = req.body;

        if (!email?.trim())
            return res.status(400).json({ error: "Email obrigatório." });

        const emailNorm = email.toLowerCase().trim();

        // 1. Verifica se utilizador existe e está activo
        const { data: user } = await supabase
            .from("usuarios")
            .select("id, nome, email, ativo")
            .eq("email", emailNorm)
            .maybeSingle();

        // Responde sempre com sucesso (não revela se email existe)
        if (user && user.ativo) {

            // 2. Invalida tokens anteriores
            await supabase
                .from("password_resets")
                .update({ usado: true })
                .eq("email", emailNorm)
                .eq("usado", false);

            // 3. Gera token seguro
            const token     = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

            // 4. Guarda na BD
            const { error: insertErr } = await supabase
                .from("password_resets")
                .insert({
                    email:      emailNorm,
                    token,
                    expires_at: expiresAt.toISOString(),
                    usado:      false,
                });

            if (insertErr) throw new Error("Erro ao gerar token: " + insertErr.message);

            // 5. Envia email usando o template partilhado
            const resetUrl = `${APP_URL}/reset-password.html?token=${token}`;
            const { subject, html } = emailRecuperacaoPassword({
                nome: user.nome,
                resetUrl,
            });

            await transporter.sendMail({
                from:    `"Zion Lisboa" <${process.env.GMAIL_USER}>`,
                to:      emailNorm,
                subject,
                html,
            });

            console.log(`[forgot-password] Email enviado para ${emailNorm}`);
        } else {
            console.log(`[forgot-password] Email não encontrado ou inactivo: ${emailNorm}`);
        }

        return res.status(200).json({
            message: "Se este email tiver conta, receberás instruções em breve."
        });

    } catch (err) {
        console.error("[auth/forgot-password]", err);
        return res.status(500).json({ error: "Erro interno. Tenta novamente." });
    }
}

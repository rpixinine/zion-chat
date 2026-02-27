import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Email remetente:
//   Desenvolvimento → usa onboarding@resend.dev (não precisa de domínio verificado)
//   Produção        → define RESEND_FROM_EMAIL=noreply@zionlisboa.pt (ou o teu domínio)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_URL    = process.env.APP_URL || "https://zion-lisboa.vercel.app"; // ajusta para o teu URL Vercel

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

        // 1. Verifica se o utilizador existe (não revela se existe ou não por segurança)
        const { data: user } = await supabase
            .from("usuarios")
            .select("id, nome, email, ativo")
            .eq("email", emailNorm)
            .single();

        // Responde sempre com sucesso para não revelar se o email existe
        // O email só é enviado se o utilizador existir e estiver activo
        if (user && user.ativo) {
            // 2. Invalida tokens anteriores deste email
            await supabase
                .from("password_resets")
                .update({ usado: true })
                .eq("email", emailNorm)
                .eq("usado", false);

            // 3. Gera token seguro
            const token     = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

            // 4. Guarda na base de dados
            const { error: insertErr } = await supabase
                .from("password_resets")
                .insert({
                    email:      emailNorm,
                    token,
                    expires_at: expiresAt.toISOString(),
                });

            if (insertErr) throw new Error("Erro ao gerar token: " + insertErr.message);

            // 5. Envia email
            const resetUrl = `${APP_URL}/reset-password.html?token=${token}`;
            const primeiroNome = (user.nome || "").split(" ")[0];

            await resend.emails.send({
                from:    FROM_EMAIL,
                to:      emailNorm,
                subject: "Recuperação de password — Zion Lisboa",
                html: `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de password</title>
</head>
<body style="margin:0;padding:0;background:#F5FAFA;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5FAFA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#007078,#009098);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:700;letter-spacing:10px;color:#fff;">ZION</p>
              <p style="margin:6px 0 0;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Lisboa · Portugal</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;font-size:15px;color:#0A2020;">Olá, <strong>${primeiroNome}</strong></p>
              <p style="margin:0 0 24px;font-size:14px;color:#4A6A6A;line-height:1.6;">
                Recebemos um pedido para recuperar a password da tua conta na plataforma Zion Lisboa.
                Clica no botão abaixo para definir uma nova password.
              </p>

              <!-- Botão -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#007078,#009098);border-radius:8px;">
                    <a href="${resetUrl}"
                       style="display:block;padding:14px 36px;font-family:Georgia,serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#fff;text-decoration:none;font-weight:600;">
                      Redefinir Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;color:#7A9A9A;line-height:1.6;">
                Este link é válido por <strong>1 hora</strong>. Se não pediste a recuperação, podes ignorar este email — a tua password não foi alterada.
              </p>

              <!-- Link alternativo -->
              <div style="background:#F5FAFA;border-radius:6px;padding:12px;margin-top:20px;">
                <p style="margin:0 0 4px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#7A9A9A;">Link alternativo</p>
                <p style="margin:0;font-size:11px;color:#009098;word-break:break-all;">${resetUrl}</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5FAFA;padding:20px 40px;border-top:1px solid rgba(0,144,152,0.1);text-align:center;">
              <p style="margin:0;font-size:11px;color:#7A9A9A;">© 2026 Zion Church Lisboa · Rua do Centro Cultural, 11 · Alvalade</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
            });
        }

        // Resposta sempre igual (não revela se email existe)
        return res.status(200).json({
            message: "Se este email tiver conta, receberás instruções em breve."
        });

    } catch (err) {
        console.error("[auth/forgot-password]", err);
        return res.status(500).json({ error: "Erro interno. Tenta novamente." });
    }
}
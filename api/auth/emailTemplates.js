// ── Template base de email Zion Lisboa ────────────────────────────────────────
const APP_URL = process.env.APP_URL || "https://chat.zionlisboa.pt";

const LOGO_URL = `${APP_URL}/assets/logo-zion-branca.svg`;

// ── Wrapper HTML base ─────────────────────────────────────────────────────────
function emailBase({ titulo, corpo, rodape = '' }) {
    return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#F0F7F7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 32px rgba(0,80,85,0.10);">

          <!-- Header com logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#02161e 0%,#07303f 100%);padding:32px 40px;text-align:center;">
              <!-- Linha decorativa -->
              <div style="width:36px;height:2px;background:#009098;border-radius:2px;margin:0 auto 18px;"></div>
              <!-- Logo: tenta imagem, fallback para texto -->
              <img src="${LOGO_URL}" alt="ZION" width="120" height="auto"
                   style="display:block;margin:0 auto 10px;max-height:48px;object-fit:contain;"
                   onerror="this.style.display='none'">
              <!-- Fallback texto caso logo não carregue -->
              <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:700;letter-spacing:12px;color:#ffffff;">ZION</p>
              <p style="margin:6px 0 0;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.50);text-transform:uppercase;">Lisboa · Portugal</p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:36px 40px 28px;">
              ${corpo}
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background:#F0F7F7;padding:18px 40px;border-top:1px solid rgba(0,144,152,0.10);text-align:center;">
              <p style="margin:0;font-size:11px;color:#7A9A9A;line-height:1.6;">
                © 2026 Zion Church Lisboa · Rua do Centro Cultural, 11 · Alvalade<br>
                ${rodape}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Email: Bem-vindo (novo registo) ───────────────────────────────────────────
export function emailBoasVindas({ nome, tipo }) {
    const primeiroNome = (nome || '').split(' ')[0];
    const eMembro = tipo === 'membro';

    const corpo = `
      <p style="margin:0 0 6px;font-size:15px;color:#0A2020;">
        Olá, <strong>${primeiroNome}</strong> 👋
      </p>
      <p style="margin:0 0 22px;font-size:14px;color:#4A6A6A;line-height:1.7;">
        Bem-vindo${eMembro ? '' : 'a'} à plataforma da <strong>Zion Lisboa</strong>!
        ${eMembro
        ? 'A tua conta foi criada e vinculada ao teu perfil de membro. Tens acesso à área de membros.'
        : 'A tua conta foi criada como visitante. Assim que te tornares membro, o teu acesso será actualizado automaticamente.'
    }
      </p>

      <!-- Destaque -->
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td style="background:#F5FAFA;border-left:3px solid #009098;border-radius:0 8px 8px 0;padding:14px 18px;">
            <p style="margin:0;font-size:13px;color:#2A5A5A;line-height:1.6;">
              ${eMembro
        ? '✓ Acesso a área de membros<br>✓ Histórico de eventos e presenças<br>✓ Ministérios e agenda'
        : '✓ Perfil de visitante criado<br>✓ Acesso à área de boas-vindas<br>✓ Informações sobre a Zion'
    }
            </p>
          </td>
        </tr>
      </table>

      <!-- Botão -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:linear-gradient(135deg,#007078,#009098);border-radius:8px;">
            <a href="${APP_URL}/admin.html"
               style="display:block;padding:13px 36px;font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;font-weight:600;">
              Entrar na plataforma
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:12px;color:#7A9A9A;line-height:1.6;text-align:center;">
        Se tiveres alguma questão, fala connosco pelo WhatsApp ou no próximo culto.
      </p>`;

    return {
        subject: `Bem-vindo${eMembro ? '' : 'a'} à Zion Lisboa, ${primeiroNome}!`,
        html: emailBase({
            titulo: `Bem-vindo à Zion Lisboa`,
            corpo,
            rodape: 'Este email foi enviado porque criaste uma conta na plataforma Zion Lisboa.'
        })
    };
}

// ── Email: Recuperação de password ────────────────────────────────────────────
export function emailRecuperacaoPassword({ nome, resetUrl }) {
    const primeiroNome = (nome || '').split(' ')[0];

    const corpo = `
      <p style="margin:0 0 6px;font-size:15px;color:#0A2020;">
        Olá, <strong>${primeiroNome}</strong>
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#4A6A6A;line-height:1.7;">
        Recebemos um pedido para recuperar a password da tua conta na plataforma Zion Lisboa.
        Clica no botão abaixo para definir uma nova password.
      </p>

      <!-- Botão -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          <td style="background:linear-gradient(135deg,#007078,#009098);border-radius:8px;">
            <a href="${resetUrl}"
               style="display:block;padding:13px 36px;font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;font-weight:600;">
              Redefinir Password
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 16px;font-size:12px;color:#7A9A9A;line-height:1.6;text-align:center;">
        Este link é válido por <strong>1 hora</strong>.<br>
        Se não pediste a recuperação, podes ignorar este email — a tua password não foi alterada.
      </p>

      <!-- Link alternativo -->
      <div style="background:#F5FAFA;border-radius:8px;padding:12px 16px;">
        <p style="margin:0 0 4px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#7A9A9A;">Link alternativo</p>
        <p style="margin:0;font-size:11px;color:#009098;word-break:break-all;">${resetUrl}</p>
      </div>`;

    return {
        subject: 'Recuperação de password — Zion Lisboa',
        html: emailBase({
            titulo: 'Recuperação de password',
            corpo,
            rodape: 'Se não pediste esta recuperação, ignora este email.'
        })
    };
}

export { APP_URL };
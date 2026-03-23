// ── Email Templates — Zion Lisboa ────────────────────────────────────────────

const APP_URL = process.env.APP_URL || "https://chat.zionlisboa.pt";

// ── Wrapper base ──────────────────────────────────────────────────────────────
function emailBase({ titulo, corpo, rodape = '' }) {
    return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${titulo}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f7f7;" bgcolor="#f0f7f7">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f0f7f7;" bgcolor="#f0f7f7">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0" border="0"
               style="max-width:520px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;"
               bgcolor="#ffffff">

          <!-- ── HEADER ESCURO ── -->
          <tr>
            <td align="center" bgcolor="#02161e"
                style="background-color:#02161e;padding:32px 40px;">

              <!-- Linha decorativa teal -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;">
                <tr>
                  <td width="40" height="2" bgcolor="#009098"
                      style="background-color:#009098;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Logo SVG — visível porque o fundo é escuro (#02161e) -->
              <!-- alt="ZION" aparece quando o cliente de email bloqueia imagens -->
              <img src="${APP_URL}/assets/logo-zion-branca.svg"
                   alt="ZION"
                   width="130" height="48"
                   style="display:block;margin:0 auto 10px;width:130px;height:auto;max-height:48px;border:0;outline:none;text-decoration:none;color:#ffffff;font-family:Georgia,serif;font-size:24px;font-weight:700;letter-spacing:10px;">
              <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.50);text-transform:uppercase;text-align:center;">Lisboa &middot; Portugal</p>

            </td>
          </tr>

          <!-- ── CORPO ── -->
          <tr>
            <td style="padding:36px 40px 28px;background-color:#ffffff;" bgcolor="#ffffff">
              ${corpo}
            </td>
          </tr>

          <!-- ── RODAPÉ ── -->
          <tr>
            <td align="center" bgcolor="#f0f7f7"
                style="background-color:#f0f7f7;padding:18px 40px;border-top:1px solid #d0e8e8;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#7a9a9a;line-height:1.6;text-align:center;">
                &copy; 2026 Zion Church Lisboa &middot; Rua do Centro Cultural, 11 &middot; Alvalade<br>
                ${rodape}
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>`;
}

// ── Botão CTA reutilizável ────────────────────────────────────────────────────
// Usa tabela + bgcolor para garantir que aparece em todos os clientes
function emailBotao(url, texto) {
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
        <tr>
          <td align="center" bgcolor="#007078"
              style="background-color:#007078;border-radius:8px;padding:0;">
            <a href="${url}"
               style="display:inline-block;padding:14px 36px;font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#007078;">
              ${texto}
            </a>
          </td>
        </tr>
      </table>`;
}

// ── Email: Boas-vindas ────────────────────────────────────────────────────────
export function emailBoasVindas({ nome, tipo }) {
    const primeiroNome = (nome || '').split(' ')[0];
    const eMembro = tipo === 'membro';

    const corpo = `
      <!-- Saudação -->
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:15px;color:#0a2020;">
        Olá, <strong>${primeiroNome}</strong> 👋
      </p>
      <p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:14px;color:#4a6a6a;line-height:1.7;">
        Bem-vindo${eMembro ? '' : 'a'} à plataforma da <strong style="color:#007078;">Zion Lisboa</strong>!
        ${eMembro
        ? 'A tua conta foi criada e vinculada ao teu perfil de membro.'
        : 'A tua conta foi criada como visitante. Assim que te tornares membro, o teu acesso será actualizado automaticamente.'
    }
      </p>

      <!-- Destaque -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:24px;border-left:3px solid #009098;background-color:#f5fafa;" bgcolor="#f5fafa">
        <tr>
          <td style="padding:14px 18px;background-color:#f5fafa;" bgcolor="#f5fafa">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2a5a5a;line-height:1.8;">
              ${eMembro
        ? '&#10003; Acesso &agrave; &aacute;rea de membros<br>&#10003; Hist&oacute;rico de eventos e presen&ccedil;as<br>&#10003; Minist&eacute;rios e agenda'
        : '&#10003; Perfil de visitante criado<br>&#10003; Acesso &agrave; &aacute;rea de boas-vindas<br>&#10003; Informa&ccedil;&otilde;es sobre a Zion'
    }
            </p>
          </td>
        </tr>
      </table>

      ${emailBotao(`${APP_URL}/admin.html`, 'Entrar na plataforma')}

      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7a9a9a;line-height:1.6;text-align:center;">
        Se tiveres alguma quest&atilde;o, fala connosco pelo WhatsApp ou no pr&oacute;ximo culto.
      </p>`;

    return {
        subject: `Bem-vindo${eMembro ? '' : 'a'} à Zion Lisboa, ${primeiroNome}!`,
        html: emailBase({
            titulo: 'Bem-vindo à Zion Lisboa',
            corpo,
            rodape: 'Este email foi enviado porque criaste uma conta na plataforma Zion Lisboa.'
        })
    };
}

// ── Email: Recuperação de password ────────────────────────────────────────────
export function emailRecuperacaoPassword({ nome, resetUrl }) {
    const primeiroNome = (nome || '').split(' ')[0];

    const corpo = `
      <!-- Saudação -->
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:15px;color:#0a2020;">
        Ol&aacute;, <strong>${primeiroNome}</strong>
      </p>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#4a6a6a;line-height:1.7;">
        Recebemos um pedido para recuperar a password da tua conta na plataforma Zion Lisboa.
        Clica no bot&atilde;o abaixo para definir uma nova password.
      </p>

      ${emailBotao(resetUrl, 'Redefinir Password')}

      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:12px;color:#7a9a9a;line-height:1.6;text-align:center;">
        Este link &eacute; v&aacute;lido por <strong>1 hora</strong>.<br>
        Se n&atilde;o pediste a recupera&ccedil;&atilde;o, podes ignorar este email &mdash; a tua password n&atilde;o foi alterada.
      </p>

      <!-- Link alternativo -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="background-color:#f5fafa;border-radius:8px;padding:12px 16px;" bgcolor="#f5fafa">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#7a9a9a;">Link alternativo</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#007078;word-break:break-all;">
              <a href="${resetUrl}" style="color:#007078;text-decoration:none;">${resetUrl}</a>
            </p>
          </td>
        </tr>
      </table>`;

    return {
        subject: 'Recuperação de password — Zion Lisboa',
        html: emailBase({
            titulo: 'Recuperação de password',
            corpo,
            rodape: 'Se n&atilde;o pediste esta recupera&ccedil;&atilde;o, ignora este email.'
        })
    };
}

export { APP_URL };

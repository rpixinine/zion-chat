// ── Email Templates — Zion Lisboa ────────────────────────────────────────────

const APP_URL = process.env.APP_URL || "https://chat.zionlisboa.pt";

// ── Wrapper base ──────────────────────────────────────────────────────────────
function emailBase({titulo, corpo, rodape = ''}) {
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
                    style="background-color:#007078FF;padding:32px 40px;">

              <!-- Linha decorativa teal -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;">
                <tr>
                  <td width="40" height="2" bgcolor="#009098"
                      style="background-color:#009098;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <img src="${APP_URL}/assets/logo-zion-branca.svg"
                   alt="ZION"
                   width="130" height="48"
                   style="display:block;margin:0 auto 10px;
                   width:130px; !important;
                   max-height:48px; !important;
                   outline:none;
                   text-decoration:none;
                   color:#ffffff;
                   font-family:Georgia,serif;
                   font-size:24px;
                   font-weight:700;
                   letter-spacing:10px;">
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
export function emailBoasVindas({nome, tipo}) {
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
export function emailRecuperacaoPassword({nome, resetUrl}) {
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


// ── Email: Confirmação de Inscrição em Evento ─────────────────────────────────
export function emailConfirmacaoInscricao({nome, evento, data, local, valor, posicao, identificador}) {
    const primeiroNome = (nome || '').split(' ')[0];
    const gratuito = !valor || Number(valor) === 0;
    const valorStr = gratuito ? 'Gratuito' : `${Number(valor).toFixed(2)} €`;

    const qrData = encodeURIComponent(identificador);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&color=005f65&bgcolor=ffffff&data=${qrData}`;

    const corpo = `
      <!-- Saudação -->
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:15px;color:#0a2020;">
        Ol&aacute;, <strong>${primeiroNome}</strong> 👋
      </p>
      <p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:14px;color:#4a6a6a;line-height:1.7;">
        A tua inscri&ccedil;&atilde;o no evento <strong style="color:#007078;">${evento}</strong>
        foi registada com sucesso!
        ${!gratuito
        ? ' Dirige-te &agrave; secretaria no dia do evento para efectuar o pagamento.'
        : ''}
      </p>

      <!-- Card do evento -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:22px;border-radius:10px;overflow:hidden;border:1px solid #d0e8e8;">
        <tr>
          <td bgcolor="#007078" style="background-color:#007078;padding:14px 20px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;
                      font-weight:700;color:#ffffff;letter-spacing:.3px;">${evento}</p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f5fafa" style="background-color:#f5fafa;padding:16px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              ${data ? `
              <tr>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;width:80px;">&#128197; Data</td>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;
                           color:#0a2020;font-weight:600;">${data}</td>
              </tr>` : ''}
              ${local ? `
              <tr>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;">&#128205; Local</td>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;
                           color:#0a2020;font-weight:600;">${local}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;">&#128179; Valor</td>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;
                           font-weight:700;color:${gratuito ? '#2e7d32' : '#007078'};">${valorStr}</td>
              </tr>
              ${posicao ? `
              <tr>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;">&#35; Posição</td>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;
                           font-weight:700;color:#007078;">${posicao}º na fila</td>
              </tr>` : ''}
            </table>
          </td>
        </tr>
      </table>

      <!-- Secção QR Code -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:24px;border:1px solid #d0e8e8;border-radius:10px;overflow:hidden;">
        <tr>
          <td align="center" bgcolor="#f5fafa"
              style="background-color:#f5fafa;padding:22px 20px 8px;">
            <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:11px;
                      letter-spacing:2px;text-transform:uppercase;color:#007078;">
              O Teu QR Code de Check-in
            </p>
            <!-- QR Code via api.qrserver.com — compatível com todos os clientes -->
            <img src="${qrUrl}"
                 alt="QR Code Check-in"
                 width="160" height="160"
                 style="display:block;margin:0 auto;width:160px;height:160px;border:0;
                        border-radius:6px;outline:none;text-decoration:none;">
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="#f5fafa"
              style="background-color:#f5fafa;padding:12px 20px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#7a9a9a;">
              Apresenta este c&oacute;digo na entrada ou usa o identificador:
            </p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;
                      font-weight:700;color:#007078;letter-spacing:.5px;">
              ${identificador}
            </p>
          </td>
        </tr>
      </table>

      <!-- Instrução de pagamento (só para eventos pagos) -->
      ${!gratuito ? `
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:22px;border-left:3px solid #e65100;background-color:#fff8f5;" bgcolor="#fff8f5">
        <tr>
          <td style="padding:12px 16px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#7a3a00;line-height:1.7;">
              <strong>Pagamento:</strong> No dia do evento, dirige-te &agrave; secretaria,
              informa o teu nome ou email e efectua o pagamento de
              <strong>${valorStr}</strong>. Ap&oacute;s confirma&ccedil;&atilde;o, poder&aacute;s
              fazer o check-in normalmente.
            </p>
          </td>
        </tr>
      </table>` : ''}

      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7a9a9a;
                line-height:1.6;text-align:center;">
        Tens d&uacute;vidas? Fala connosco pelo WhatsApp ou no pr&oacute;ximo culto.
      </p>`;

    return {
        subject: `Inscrição confirmada — ${evento}`,
        html: emailBase({
            titulo: `Inscrição — ${evento}`,
            corpo,
            rodape: `Este email foi enviado porque te inscreveste no evento <strong>${evento}</strong>.`
        })
    };
}

// ── Email: Boas-vindas ao App — Acesso inicial ────────────────────────────────
export function emailBoasVindasApp({ nome, email }) {
    const primeiroNome = (nome || 'Caro Membro').split(' ')[0];
    const appUrl = 'https://chat.zionlisboa.pt';
    const senhaDefault = 'Zion@Lisboa777';

    const corpo = `
      <!-- Saudação -->
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:15px;color:#0a2020;">
        Ol&aacute;, <strong>${primeiroNome}</strong> 👋
      </p>
      <p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:14px;color:#4a6a6a;line-height:1.7;">
        A plataforma digital da <strong style="color:#007078;">Zion Lisboa</strong> est&aacute; dispon&iacute;vel!
        J&aacute; criámos o teu acesso — podes entrar hoje mesmo.
      </p>
 
      <!-- Card de acesso -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid #d0e8e8;">
        <tr>
          <td bgcolor="#007078" style="background-color:#007078;padding:14px 20px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;
                      font-weight:700;color:#ffffff;letter-spacing:.5px;text-transform:uppercase;">
              Os teus dados de acesso
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f5fafa" style="background-color:#f5fafa;padding:20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;width:70px;vertical-align:top;">&#128231; Email</td>
                <td style="padding:6px 0;font-family:'Courier New',monospace;font-size:13px;
                           color:#007078;font-weight:700;word-break:break-all;">${email}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;vertical-align:top;">&#128274; Senha</td>
                <td style="padding:6px 0;font-family:'Courier New',monospace;font-size:15px;
                           color:#0a2020;font-weight:700;letter-spacing:1px;">${senhaDefault}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
 
      <!-- Aviso de trocar senha -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:24px;border-left:3px solid #e65100;background-color:#fff8f5;" bgcolor="#fff8f5">
        <tr>
          <td style="padding:12px 16px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#7a3a00;line-height:1.7;">
              &#9888;&nbsp;<strong>Importante:</strong> ap&oacute;s o primeiro acesso, clica em
              <strong>"Redefinir Senha"</strong> no menu para criares a tua senha pessoal.
            </p>
          </td>
        </tr>
      </table>
 
      <!-- O que podes fazer -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:24px;border-left:3px solid #009098;background-color:#f5fafa;" bgcolor="#f5fafa">
        <tr>
          <td style="padding:14px 18px;">
            <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:12px;
                      letter-spacing:1.5px;text-transform:uppercase;color:#007078;">
              O que podes fazer na plataforma
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2a5a5a;line-height:2;">
              &#128197;&nbsp;Consultar a agenda da Zion<br>
              &#10067;&nbsp;Tirar d&uacute;vidas com o assistente virtual<br>
              &#128218;&nbsp;Saber mais sobre os minist&eacute;rios e grupos<br>
              &#128205;&nbsp;Ver a localiza&ccedil;&atilde;o e informa&ccedil;&otilde;es da igreja<br>
              &#127979;&nbsp;Aceder aos cursos ZAO<br>
              &#127981;&nbsp;Agendar salas e espa&ccedil;os
            </p>
          </td>
        </tr>
      </table>
 
      <!-- CTA principal -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
        <tr>
          <td align="center" bgcolor="#007078"
              style="background-color:#007078;border-radius:8px;padding:0;">
            <a href="${appUrl}"
               style="display:inline-block;padding:15px 40px;font-family:Georgia,'Times New Roman',serif;
                      font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
                      color:#ffffff;text-decoration:none;border-radius:8px;background-color:#007078;">
              Entrar na Plataforma
            </a>
          </td>
        </tr>
      </table>
 
      <!-- Instalar como App — Android -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:14px;border-radius:10px;overflow:hidden;border:1px solid #d0e8e8;">
        <tr>
          <td bgcolor="#e8f5e9" style="background-color:#e8f5e9;padding:14px 20px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;
                      letter-spacing:1px;text-transform:uppercase;color:#2e7d32;font-weight:700;">
              &#129504; Instalar no Android
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f5fafa" style="background-color:#f5fafa;padding:14px 20px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2a5a5a;line-height:1.8;">
              Ao abrires o site no Chrome, aparecer&aacute; automaticamente um
              bot&atilde;o <strong>"Instalar App Zion Lisboa"</strong> na parte inferior do ecr&atilde;.
              Basta clicar para instalar como app nativa.
            </p>
          </td>
        </tr>
      </table>
 
      <!-- Instalar como App — iOS -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #d0e8e8;">
        <tr>
          <td bgcolor="#e3f2fd" style="background-color:#e3f2fd;padding:14px 20px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:12px;
                      letter-spacing:1px;text-transform:uppercase;color:#1565c0;font-weight:700;">
               &#127822; Instalar no iPhone / iPad
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f5fafa" style="background-color:#f5fafa;padding:14px 20px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2a5a5a;line-height:2;">
              <strong>1.</strong>&nbsp;Abre o site no Safari<br>
              <strong>2.</strong>&nbsp;Toca no &iacute;cone de partilha
              <span style="font-size:15px;">&#11014;</span> (barra inferior)<br>
              <strong>3.</strong>&nbsp;Selecciona <strong>"Adicionar ao Ecr&atilde; de In&iacute;cio"</strong><br>
              <strong>4.</strong>&nbsp;Confirma — a app fica guardada como nativa!
            </p>
          </td>
        </tr>
      </table>
 
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7a9a9a;
                line-height:1.6;text-align:center;">
        Tens d&uacute;vidas? Fala connosco pelo WhatsApp ou no pr&oacute;ximo culto. &#128591;
      </p>`;

    return {
        subject: `${primeiroNome}, o teu acesso à Zion Lisboa está pronto!`,
        html: emailBase({
            titulo: 'Acesso à Plataforma Zion Lisboa',
            corpo,
            rodape: `Este email foi enviado porque tens registo na Zion Lisboa.
                     O teu email de acesso &eacute; <strong>${email}</strong>.`
        })
    };
}

// ── Email: Agendamento de Sala — Aprovado / Recusado ─────────────────────────
export function emailAgendamentoSala({ nome, sala, data, horaIni, horaFim, estado, motivo }) {
    const primeiroNome = (nome || '').split(' ')[0];
    const aprovado = estado === 'aprovado';

    const corEstado  = aprovado ? '#2e7d32' : '#c62828';
    const bgEstado   = aprovado ? '#e8f5e9' : '#ffebee';
    const icone      = aprovado ? '✓' : '✗';
    const labelEstado = aprovado ? 'Aprovado' : 'Recusado';

    const corpo = `
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:15px;color:#0a2020;">
        Olá, <strong>${primeiroNome}</strong>
      </p>
      <p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:14px;color:#4a6a6a;line-height:1.7;">
        O teu pedido de agendamento da sala <strong style="color:#007078;">${sala}</strong>
        foi <strong style="color:${corEstado};">${labelEstado.toLowerCase()}</strong>.
      </p>

      <!-- Badge de estado -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 22px;">
        <tr>
          <td align="center" bgcolor="${bgEstado}"
              style="background-color:${bgEstado};border:2px solid ${corEstado};
                     border-radius:8px;padding:12px 28px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:18px;
                      font-weight:700;color:${corEstado};letter-spacing:1px;">
              ${icone} ${labelEstado}
            </p>
          </td>
        </tr>
      </table>

      <!-- Detalhes do agendamento -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:${motivo ? '16px' : '24px'};border-radius:10px;
                    overflow:hidden;border:1px solid #d0e8e8;">
        <tr>
          <td bgcolor="#007078" style="background-color:#007078;padding:12px 20px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-weight:700;
                      color:#ffffff;letter-spacing:.5px;text-transform:uppercase;">
              Detalhes do Agendamento
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f5fafa" style="background-color:#f5fafa;padding:16px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;width:80px;">🏠 Sala</td>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;
                           color:#0a2020;font-weight:600;">${sala}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;">📅 Data</td>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;
                           color:#0a2020;font-weight:600;">${data}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;
                           color:#7a9a9a;">🕐 Horário</td>
                <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:13px;
                           color:#0a2020;font-weight:600;">${horaIni} – ${horaFim}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Motivo da recusa (só aparece se recusado e tiver motivo) -->
      ${!aprovado && motivo ? `
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:24px;border-left:3px solid #e53935;background-color:#fff8f8;" bgcolor="#fff8f8">
        <tr>
          <td style="padding:12px 16px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;
                      letter-spacing:1px;text-transform:uppercase;color:#c62828;">Motivo</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;
                      color:#5a0000;line-height:1.6;">${motivo}</p>
          </td>
        </tr>
      </table>` : ''}

      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7a9a9a;
                line-height:1.6;text-align:center;">
        ${aprovado
        ? 'Aparece no espaço na hora marcada. Deixa-o limpo e organizado após o uso.'
        : 'Podes efectuar um novo pedido com outro horário se necessário.'
    }
        <br>Tens dúvidas? Fala connosco no próximo culto.
      </p>
    `;

    return {
        subject: `Agendamento ${labelEstado} — ${sala}`,
        html: emailBase({
            titulo: `Agendamento ${labelEstado}`,
            corpo,
            rodape: `Este email foi enviado em resposta ao teu pedido de agendamento da sala <strong>${sala}</strong>.`
        })
    };
}

export {APP_URL};

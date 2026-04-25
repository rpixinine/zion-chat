/**
 * rgpd_membros_patch.js — Versão para perfil.html
 * Usa as variáveis CSS do perfil (--teal, --navy-card, etc.)
 * e um modal próprio em vez do drawer do admin.
 */

const _RGPD_VERSAO = 'v1.0-2025-01';

const _rgpdFinalidades = {
    gestao_membros: 'Gestão interna de membros e comunidade',
    eventos:        'Registo de presenças em eventos e reuniões',
    comunicacoes:   'Comunicações internas da Zion Lisboa',
    financeiro:     'Gestão de dízimos e contribuições financeiras',
    fotografias:    'Uso de fotografias em materiais da comunidade',
};

/* ══════════════════════════════════════════════════════════════
   BLOCO HTML — injetado no formulário
   ══════════════════════════════════════════════════════════════ */
function rgpdConsentimentoHtml(membro) {
    const jaTemConsent  = membro?.consentimento_dados;
    const dataConsent   = membro?.consentimento_data
        ? new Date(membro.consentimento_data).toLocaleDateString('pt-PT', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
        : null;
    const finalidades = membro?.finalidades || ['gestao_membros', 'eventos', 'comunicacoes'];

    const finOpts = Object.entries(_rgpdFinalidades).map(function(entry) {
        var key   = entry[0];
        var label = entry[1];
        var checked = finalidades.includes(key) ||
            (!membro && ['gestao_membros','eventos','comunicacoes'].includes(key));
        var isCore = key === 'gestao_membros';
        return '<label style="display:flex;align-items:flex-start;gap:10px;cursor:' + (isCore ? 'default' : 'pointer') + ';padding:9px 0;border-bottom:1px solid var(--navy-border)">' +
            '<input type="checkbox" name="rgpd_fin" value="' + key + '" ' + (checked ? 'checked' : '') + ' ' + (isCore ? 'disabled' : '') + ' style="margin-top:2px;width:16px;height:16px;accent-color:var(--teal);flex-shrink:0">' +
            '<span style="font-size:12px;color:var(--text-muted);line-height:1.5">' +
            '<strong style="color:var(--text-main)">' + label + '</strong>' +
            (isCore ? '<span style="font-size:10px;color:var(--teal);margin-left:5px">(obrigatório)</span>' : '') +
            '</span>' +
            '</label>';
    }).join('');

    var membroId = membro ? membro.id : '';

    return '<div style="background:rgba(0,144,152,.06);border:1px solid var(--teal);border-radius:14px;padding:18px;margin:20px 0 16px" id="rgpd-bloco-inner">' +

        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
        '<div style="width:36px;height:36px;border-radius:10px;background:var(--teal-glow);color:var(--teal);font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(0,144,152,.3)">🔒</div>' +
        '<div style="flex:1">' +
        '<div style="font-family:var(--font-title);font-size:9px;letter-spacing:2px;color:var(--teal);text-transform:uppercase;margin-bottom:3px">Proteção de Dados — RGPD / Lei 58/2019</div>' +
        '<div style="font-size:10px;color:var(--text-faint)">Versão: <strong style="color:var(--text-muted)">' + _RGPD_VERSAO + '</strong>' +
        (dataConsent ? ' · Consentido em <strong style="color:var(--green)">' + dataConsent + '</strong>' : '') +
        '</div>' +
        '</div>' +
        (jaTemConsent
                ? '<span style="background:var(--green-dim);color:var(--green);border:1px solid rgba(67,160,71,.3);border-radius:20px;font-size:9px;font-weight:700;padding:4px 10px;white-space:nowrap;font-family:var(--font-title);letter-spacing:.5px">✓ Consentido</span>'
                : '<span style="background:var(--red-dim);color:var(--red);border:1px solid rgba(239,83,80,.25);border-radius:20px;font-size:9px;font-weight:700;padding:4px 10px;white-space:nowrap;font-family:var(--font-title);letter-spacing:.5px">Pendente</span>'
        ) +
        '</div>' +

        '<div style="font-size:12px;color:var(--text-muted);line-height:1.7;margin-bottom:16px;background:var(--navy-card);border-radius:10px;padding:14px;border-left:3px solid var(--teal)">' +
        'A <strong style="color:var(--text-main)">Zion Lisboa</strong> trata os teus dados com base no ' +
        '<strong style="color:var(--text-main)">Art. 9.º/2/d do RGPD</strong> enquanto organização religiosa ' +
        'sem fins lucrativos, e com o teu <strong style="color:var(--text-main)">consentimento explícito</strong>.<br><br>' +
        'Os teus dados são usados <strong style="color:var(--text-main)">exclusivamente para gestão interna</strong> ' +
        'da comunidade e <strong style="color:var(--text-main)">nunca são partilhados com terceiros</strong>.<br><br>' +
        'Consulta a nossa <a href="privacidade.html" target="_blank" style="color:var(--teal)">Política de Privacidade</a> ' +
        'ou contacta <a href="mailto:contacto@zionlisboa.pt" style="color:var(--teal)">contacto@zionlisboa.pt</a>. ' +
        'Supervisão: <a href="https://www.cnpd.pt" target="_blank" style="color:var(--teal)">CNPD</a>.' +
        '</div>' +

        '<div style="margin-bottom:16px">' +
        '<div style="font-family:var(--font-title);font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--text-faint);margin-bottom:10px">Finalidades do Tratamento</div>' +
        finOpts +
        '</div>' +

        '<label id="rgpd-consent-label" style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;background:var(--navy-card);border-radius:10px;padding:14px;border:1px solid ' + (jaTemConsent ? 'rgba(67,160,71,.4)' : 'var(--navy-border)') + ';transition:border-color .2s">' +
        '<input type="checkbox" id="rgpd_consentimento" ' + (jaTemConsent ? 'checked' : '') + ' style="width:18px;height:18px;margin-top:2px;accent-color:var(--teal);flex-shrink:0" onchange="rgpdOnConsentChange(this.checked)">' +
        '<span style="font-size:13px;color:var(--text-main);line-height:1.6">' +
        '<strong>Declaro que li e compreendi</strong> a ' +
        '<a href="privacidade.html" target="_blank" style="color:var(--teal);text-decoration:none;border-bottom:1px solid rgba(0,144,152,.3)">política de privacidade</a> ' +
        'da Zion Lisboa e consinto o tratamento dos meus dados para as finalidades assinaladas, ' +
        'podendo revogar este consentimento a qualquer momento.' +
        '</span>' +
        '</label>' +

        (membro ? (
            '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
            '<button type="button" onclick="rgpdAbrirPainel(\'' + membroId + '\')" class="btn-inline">📋 Os Meus Dados</button>' +
            '<button type="button" onclick="rgpdSolicitarExportacao(\'' + membroId + '\')" class="btn-inline">↓ Exportar Dados</button>' +
            (jaTemConsent ? '<button type="button" onclick="rgpdRevogarConsentimento(\'' + membroId + '\')" style="padding:8px 14px;border:1px solid rgba(239,83,80,.4);border-radius:9px;background:transparent;color:var(--red);font-family:var(--font-title);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer">Revogar</button>' : '') +
            '</div>'
        ) : '') +

        '</div>';
}

/* ══════════════════════════════════════════════════════════════
   LER FORMULÁRIO
   ══════════════════════════════════════════════════════════════ */
function rgpdLerFormulario() {
    var dados = document.getElementById('rgpd_consentimento') ? document.getElementById('rgpd_consentimento').checked : false;
    var fins  = Array.from(document.querySelectorAll('input[name="rgpd_fin"]:checked')).map(function(el) { return el.value; });
    if (!fins.includes('gestao_membros')) fins.unshift('gestao_membros');
    return { dados: dados, versao: _RGPD_VERSAO, finalidades: fins };
}

/* ══════════════════════════════════════════════════════════════
   GRAVAR CONSENTIMENTO
   ══════════════════════════════════════════════════════════════ */
async function rgpdSalvarConsentimento(membroId, consent) {
    if (!membroId || !window.sb) return;
    try {
        // Uma única RPC que grava tudo numa transacção
        const res = await window.sb('rpc/rgpd_guardar_consentimento', {
            method: 'POST',
            body: JSON.stringify({
                p_membro_id:   membroId,
                p_dados:       consent.dados,
                p_versao:      consent.versao,
                p_canal:       'self',
                p_finalidades: consent.finalidades,
                p_notas:       'Registado via perfil público'
            })
        });
        console.log('[RGPD] Consentimento gravado:', res);
    } catch(e) {
        console.error('[RGPD] Erro ao guardar consentimento:', e);
    }
}

/* ══════════════════════════════════════════════════════════════
   onChange DO CHECKBOX
   ══════════════════════════════════════════════════════════════ */
function rgpdOnConsentChange(checked) {
    var label = document.getElementById('rgpd-consent-label');
    if (!label) return;
    label.style.borderColor = checked ? 'rgba(67,160,71,.4)'  : 'var(--navy-border)';
    label.style.background  = checked ? 'rgba(67,160,71,.04)' : 'var(--navy-card)';
}

/* ══════════════════════════════════════════════════════════════
   MODAL "OS MEUS DADOS"
   ══════════════════════════════════════════════════════════════ */
async function rgpdAbrirPainel(membroId) {
    var existing = document.getElementById('rgpd-modal-ov');
    if (existing) existing.remove();

    var ov = document.createElement('div');
    ov.id = 'rgpd-modal-ov';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9998;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px 16px;backdrop-filter:blur(4px)';
    ov.onclick = function(e) { if (e.target === ov) ov.remove(); };
    ov.innerHTML = '<div style="background:var(--navy-card);border:1px solid var(--navy-border);border-radius:16px;width:100%;max-width:480px;margin:auto">' +
        '<div style="padding:20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--navy-border)">' +
        '<span style="font-size:20px">🔒</span>' +
        '<div style="flex:1;font-family:var(--font-title);font-size:11px;letter-spacing:2px;color:var(--teal);text-transform:uppercase">Os Meus Dados</div>' +
        '<button onclick="document.getElementById(\'rgpd-modal-ov\').remove()" style="background:none;border:none;color:var(--text-faint);font-size:24px;cursor:pointer;padding:0;line-height:1">×</button>' +
        '</div>' +
        '<div style="padding:24px;text-align:center">' +
        '<div style="width:28px;height:28px;border:2px solid var(--navy-border);border-top-color:var(--teal);border-radius:50%;animation:spin .75s linear infinite;margin:0 auto 12px"></div>' +
        '<div style="font-size:12px;color:var(--text-faint)">A carregar...</div>' +
        '</div>' +
        '</div>';
    document.body.appendChild(ov);

    try {
        var results = await Promise.all([
            window.sb('membros?id=eq.' + membroId + '&select=id,nome,email,telefone,nif,data_nascimento,foto_url,ativo,created_at,consentimento_dados,consentimento_data,consentimento_versao,consentimento_canal,finalidades,anonimizar_pedido_em').then(function(r) { return r && r[0]; }),
            window.sb('consentimento_log?membro_id=eq.' + membroId + '&order=criado_em.desc&limit=10').catch(function() { return []; })
        ]);
        var membro  = results[0];
        var logRows = results[1] || [];

        if (!membro) { ov.remove(); return; }

        var dtConsent = membro.consentimento_data
            ? new Date(membro.consentimento_data).toLocaleDateString('pt-PT', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
            : 'Não registado';

        var acaoLabel = {
            'concedido':                  { l: '✓ Consentimento concedido',  c: 'var(--green)' },
            'revogado':                   { l: '✗ Consentimento revogado',    c: 'var(--red)'   },
            'exportacao_pedida':          { l: '↓ Exportação pedida',         c: 'var(--teal)'  },
            'anonimizacao_pedida':        { l: '⚠ Anonimização pedida',        c: 'var(--amber)' },
            'pendente_sem_consentimento': { l: '— Sem consentimento',         c: 'var(--text-faint)' },
        };

        var logHtml = logRows.length
            ? logRows.map(function(l) {
                var info = acaoLabel[l.acao] || { l: l.acao, c: 'var(--text-faint)' };
                var dt   = new Date(l.criado_em).toLocaleDateString('pt-PT', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
                return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--navy-border);gap:10px">' +
                    '<span style="font-size:11px;font-weight:700;color:' + info.c + '">' + info.l + '</span>' +
                    '<span style="font-size:10px;color:var(--text-faint);white-space:nowrap">' + dt + '</span>' +
                    '</div>';
            }).join('')
            : '<div style="font-size:12px;color:var(--text-faint);padding:12px 0;font-style:italic">Sem registos.</div>';

        var fins = membro.finalidades || [];
        var dadosLinhas = [
            ['Nome',         membro.nome || '—'],
            ['Email',        membro.email || '—'],
            ['Telemóvel',    membro.telefone || '—'],
            ['NIF',          membro.nif ? '●●●●●●●' : '—'],
            ['Nascimento',   membro.data_nascimento ? new Date(membro.data_nascimento).toLocaleDateString('pt-PT') : '—'],
            ['Foto',         membro.foto_url ? 'Guardada em servidor seguro' : 'Não'],
            ['Presenças',    'Histórico de eventos e reuniões'],
            ['Membro desde', membro.created_at ? new Date(membro.created_at).toLocaleDateString('pt-PT') : '—'],
            ['Finalidades',  fins.length ? fins.map(function(f) { return _rgpdFinalidades[f] || f; }).join(', ') : '—'],
        ].map(function(row) {
            return '<div style="display:flex;padding:9px 14px;border-bottom:1px solid var(--navy-border)">' +
                '<span style="font-size:11px;color:var(--text-faint);min-width:100px;flex-shrink:0">' + row[0] + '</span>' +
                '<span style="font-size:12px;color:var(--text-main)">' + row[1] + '</span>' +
                '</div>';
        }).join('');

        ov.querySelector('div').innerHTML =
            '<div style="display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--navy-border)">' +
            '<span style="font-size:20px">🔒</span>' +
            '<div style="flex:1">' +
            '<div style="font-family:var(--font-title);font-size:11px;letter-spacing:2px;color:var(--teal);text-transform:uppercase">Os Meus Dados</div>' +
            '<div style="font-size:11px;color:var(--text-faint);margin-top:2px">' + membro.nome + '</div>' +
            '</div>' +
            '<button onclick="document.getElementById(\'rgpd-modal-ov\').remove()" style="background:none;border:none;color:var(--text-faint);font-size:24px;cursor:pointer;padding:0;line-height:1">×</button>' +
            '</div>' +
            '<div style="padding:20px;max-height:75vh;overflow-y:auto">' +

            '<div style="background:' + (membro.consentimento_dados ? 'var(--green-dim)' : 'var(--red-dim)') + ';border:1px solid ' + (membro.consentimento_dados ? 'rgba(67,160,71,.3)' : 'rgba(239,83,80,.25)') + ';border-radius:10px;padding:14px;margin-bottom:16px;display:flex;gap:12px;align-items:center">' +
            '<span style="font-size:22px">' + (membro.consentimento_dados ? '🔒' : '⚠️') + '</span>' +
            '<div>' +
            '<div style="font-family:var(--font-title);font-size:10px;font-weight:700;color:' + (membro.consentimento_dados ? 'var(--green)' : 'var(--red)') + '">' +
            (membro.consentimento_dados ? 'Consentimento RGPD em vigor' : 'Consentimento RGPD pendente') +
            '</div>' +
            '<div style="font-size:11px;color:var(--text-faint);margin-top:3px">' +
            (membro.consentimento_dados
                ? 'Concedido em <strong style="color:var(--text-muted)">' + dtConsent + '</strong>'
                : 'Tratado ao abrigo do Art. 9.º/2/d RGPD (organização religiosa).') +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div style="font-family:var(--font-title);font-size:8px;letter-spacing:2px;color:var(--text-faint);margin-bottom:8px">Dados guardados</div>' +
            '<div style="background:var(--navy-card);border:1px solid var(--navy-border);border-radius:10px;margin-bottom:16px;overflow:hidden">' + dadosLinhas + '</div>' +

            '<div style="font-size:11px;color:var(--text-muted);background:var(--navy-card);border:1px solid var(--navy-border);border-radius:10px;padding:12px;margin-bottom:16px;line-height:1.6">' +
            'Prazo de resposta: <strong style="color:var(--text-main)">30 dias</strong> (Art. 12.º RGPD). ' +
            'Contacto: <a href="mailto:contacto@zionlisboa.pt" style="color:var(--teal)">contacto@zionlisboa.pt</a> · ' +
            'Supervisão: <a href="https://www.cnpd.pt" target="_blank" style="color:var(--teal)">CNPD</a>' +
            '</div>' +

            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
            '<button onclick="rgpdSolicitarExportacao(\'' + membro.id + '\')" style="padding:11px 16px;border:none;border-radius:10px;background:var(--green-dim);color:var(--green);font-family:var(--font-title);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border:1px solid rgba(67,160,71,.3)">↓ Exportar</button>' +
            (membro.consentimento_dados
                    ? '<button onclick="rgpdRevogarConsentimento(\'' + membro.id + '\')" style="padding:11px 16px;border:1px solid rgba(239,83,80,.35);border-radius:10px;background:var(--red-dim);color:var(--red);font-family:var(--font-title);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer">Revogar</button>'
                    : '<button onclick="rgpdConcederConsentimento(\'' + membro.id + '\')" style="padding:11px 16px;border:none;border-radius:10px;background:var(--teal);color:#fff;font-family:var(--font-title);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer">✓ Consentir</button>'
            ) +
            '<button onclick="rgpdSolicitarAnonimizacao(\'' + membro.id + '\')" style="padding:11px 16px;border:1px solid var(--navy-border);border-radius:10px;background:transparent;color:var(--text-faint);font-family:var(--font-title);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-left:auto">⚠ Apagar</button>' +
            '</div>' +

            '<div style="font-family:var(--font-title);font-size:8px;letter-spacing:2px;color:var(--text-faint);margin-bottom:8px">Registo de auditoria</div>' +
            '<div style="background:var(--navy-card);border:1px solid var(--navy-border);border-radius:10px;padding:4px 14px">' + logHtml + '</div>' +
            '<div style="font-size:10px;color:var(--text-faint);margin-top:6px">Conservado por mínimo 5 anos como prova de conformidade (Art. 5.º/2 RGPD).</div>' +
            '</div>';

    } catch(e) {
        console.error('[RGPD] Erro ao abrir painel:', e);
        ov.remove();
    }
}

/* ══════════════════════════════════════════════════════════════
   REVOGAR / CONCEDER
   ══════════════════════════════════════════════════════════════ */
async function rgpdRevogarConsentimento(membroId) {
    if (!confirm('Tens a certeza que queres revogar o consentimento?\n\nOs dados continuarão a ser tratados ao abrigo do Art. 9.º/2/d RGPD para gestão interna.')) return;
    try {
        await window.sb('rpc/atualizar_perfil', { method: 'POST', body: JSON.stringify({ p_id: membroId, p_dados: { consentimento_dados: false } }) });
        await window.sb('rpc/rgpd_gravar_log', { method: 'POST', body: JSON.stringify({ p_membro_id: membroId, p_acao: 'revogado', p_versao: _RGPD_VERSAO, p_canal: 'self', p_notas: 'Revogado via perfil público' }) }).catch(function(){});
        var ov = document.getElementById('rgpd-modal-ov');
        if (ov) ov.remove();
        alert('Consentimento revogado e registado com sucesso.');
    } catch(e) { alert('Erro: ' + (e && e.message ? e.message : e)); }
}

async function rgpdConcederConsentimento(membroId) {
    try {
        await window.sb('rpc/atualizar_perfil', { method: 'POST', body: JSON.stringify({ p_id: membroId, p_dados: {
                    consentimento_dados:  true,
                    consentimento_data:   new Date().toISOString(),
                    consentimento_versao: _RGPD_VERSAO,
                    consentimento_canal:  'self',
                    finalidades:          ['gestao_membros','eventos','comunicacoes']
                }})});
        await window.sb('rpc/rgpd_gravar_log', { method: 'POST', body: JSON.stringify({ p_membro_id: membroId, p_acao: 'concedido', p_versao: _RGPD_VERSAO, p_canal: 'self', p_finalidades: ['gestao_membros','eventos','comunicacoes'], p_notas: 'Concedido via perfil público' }) }).catch(function(){});
        var ov = document.getElementById('rgpd-modal-ov');
        if (ov) ov.remove();
        alert('Consentimento registado com sucesso.');
    } catch(e) { alert('Erro: ' + (e && e.message ? e.message : e)); }
}

/* ══════════════════════════════════════════════════════════════
   EXPORTAR DADOS
   ══════════════════════════════════════════════════════════════ */
async function rgpdSolicitarExportacao(membroId) {
    try {
        var results = await Promise.all([
            window.sb('membros?id=eq.' + membroId + '&select=*').then(function(r){ return r && r[0]; }),
            window.sb('evento_presencas?membro_id=eq.' + membroId + '&select=status,registado_em').catch(function(){ return []; }),
            window.sb('membro_ministerios?membro_id=eq.' + membroId + '&select=papel,ministerios(nome,tipo)&ativo=eq.true').catch(function(){ return []; }),
            window.sb('consentimento_log?membro_id=eq.' + membroId + '&order=criado_em.desc').catch(function(){ return []; })
        ]);
        var membro = results[0]; var presencas = results[1] || []; var mins = results[2] || []; var logRows = results[3] || [];

        var exportData = {
            exportado_em:   new Date().toISOString(),
            aviso:          'Exportação ao abrigo do Art. 20.º RGPD — Direito à portabilidade.',
            responsavel:    'Zion Lisboa — contacto@zionlisboa.pt',
            dados_pessoais: { nome: membro && membro.nome, email: membro && membro.email, telefone: membro && membro.telefone, data_nascimento: membro && membro.data_nascimento, membro_desde: membro && membro.created_at },
            consentimento:  { dado: membro && membro.consentimento_dados, data: membro && membro.consentimento_data, versao: membro && membro.consentimento_versao, finalidades: membro && membro.finalidades },
            presencas:      presencas.map(function(p){ return { status: p.status, data: p.registado_em }; }),
            ministerios:    mins.map(function(m){ return { nome: m.ministerios && m.ministerios.nome, papel: m.papel }; }),
            log:            logRows.map(function(l){ return { acao: l.acao, data: l.criado_em, canal: l.canal }; }),
        };

        var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href = url; a.download = 'meus-dados-zion-' + new Date().toISOString().slice(0,10) + '.json'; a.click();
        URL.revokeObjectURL(url);

        await window.sb('rpc/rgpd_gravar_log', { method: 'POST', body: JSON.stringify({ p_membro_id: membroId, p_acao: 'exportacao_pedida', p_versao: _RGPD_VERSAO, p_canal: 'self', p_notas: 'Exportação Art. 20.º RGPD' }) }).catch(function(){});
    } catch(e) { alert('Erro ao exportar: ' + (e && e.message ? e.message : e)); }
}

/* ══════════════════════════════════════════════════════════════
   SOLICITAR ANONIMIZAÇÃO
   ══════════════════════════════════════════════════════════════ */
async function rgpdSolicitarAnonimizacao(membroId) {
    if (!confirm('⚠️ Pedido de apagamento de dados (Art. 17.º RGPD)\n\nEste pedido será avaliado pela administração no prazo de 30 dias.\n\nAlguns dados podem ser mantidos por obrigação legal.\n\nConfirmar?')) return;
    try {
        await window.sb('rpc/atualizar_perfil', { method: 'POST', body: JSON.stringify({ p_id: membroId, p_dados: { anonimizar_pedido_em: new Date().toISOString() } }) });
        await window.sb('rpc/rgpd_gravar_log', { method: 'POST', body: JSON.stringify({ p_membro_id: membroId, p_acao: 'anonimizacao_pedida', p_versao: _RGPD_VERSAO, p_canal: 'self', p_notas: 'Pedido Art. 17.º RGPD. Prazo: 30 dias.' }) }).catch(function(){});
        var ov = document.getElementById('rgpd-modal-ov');
        if (ov) ov.remove();
        alert('Pedido registado. Responderemos em até 30 dias para contacto@zionlisboa.pt.');
    } catch(e) { alert('Erro: ' + (e && e.message ? e.message : e)); }
}

/* ══════════════════════════════════════════════════════════════
   EXPORTS
   ══════════════════════════════════════════════════════════════ */
Object.assign(window, {
    rgpdConsentimentoHtml:      rgpdConsentimentoHtml,
    rgpdLerFormulario:          rgpdLerFormulario,
    rgpdSalvarConsentimento:    rgpdSalvarConsentimento,
    rgpdOnConsentChange:        rgpdOnConsentChange,
    rgpdAbrirPainel:            rgpdAbrirPainel,
    rgpdRevogarConsentimento:   rgpdRevogarConsentimento,
    rgpdConcederConsentimento:  rgpdConcederConsentimento,
    rgpdSolicitarExportacao:    rgpdSolicitarExportacao,
    rgpdSolicitarAnonimizacao:  rgpdSolicitarAnonimizacao,
});

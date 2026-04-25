// api/auth/[route].js
// Router único — substitui: register.js, inscricao-confirmacao.js,
//                            bulk-send-welcome.js, sala-agendamento-status.js

import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import {
    emailBoasVindas,
    emailConfirmacaoInscricao,
    emailBoasVindasApp,
    emailAgendamentoSala,
} from "./email-templates.js";

// ── Clientes Supabase ─────────────────────────────────────────
const sbAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ── Mailer ────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

async function sendMail({ to, subject, html }) {
    return mailer.sendMail({
        from: `"Zion Lisboa" <${process.env.GMAIL_USER}>`,
        to, subject, html,
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Router principal ──────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();

    const route = req.query.route;

    if (route === "register")                return handleRegister(req, res);
    if (route === "inscricao-confirmacao")   return handleInscricaoConfirmacao(req, res);
    if (route === "bulk-send-welcome")       return handleBulkSendWelcome(req, res);
    if (route === "sala-agendamento-status") return handleSalaAgendamentoStatus(req, res);

    return res.status(404).json({ error: `Rota desconhecida: ${route}` });
}

// ══════════════════════════════════════════════════════════════
// HANDLER: register
// ══════════════════════════════════════════════════════════════
async function handleRegister(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { nome, nif, email, telefone, onde_conheceu, foto_url, password } = req.body;

        if (!nome?.trim())  return res.status(400).json({ error: "Nome obrigatório." });
        if (!email?.trim()) return res.status(400).json({ error: "Email obrigatório." });
        if (!password || password.length < 6)
            return res.status(400).json({ error: "Password deve ter pelo menos 6 caracteres." });

        const emailNorm = email.toLowerCase().trim();
        const nifNorm   = nif?.replace(/\D/g, "") || null;

        if (nifNorm && nifNorm.length !== 9)
            return res.status(400).json({ error: "NIF inválido." });

        // 1. Criar no Supabase Auth
        const { data: authData, error: authErr } = await sbAdmin.auth.admin.createUser({
            email:         emailNorm,
            password,
            email_confirm: true,
            user_metadata: { nome: nome.trim() },
        });

        if (authErr) {
            if (authErr.message.includes("already been registered"))
                return res.status(409).json({ error: "Este email já tem conta registada." });
            throw new Error(authErr.message);
        }

        // 2. Auto-vínculo com membro existente
        let membroId    = null;
        let visitanteId = null;
        let tipo        = "visitante";

        if (nifNorm) {
            const { data: m } = await sbAdmin.from("membros")
                .select("id").eq("nif", nifNorm).eq("ativo", true).maybeSingle();
            if (m) { membroId = m.id; tipo = "membro"; }
        }

        if (!membroId) {
            const { data: m } = await sbAdmin.from("membros")
                .select("id").eq("email", emailNorm).eq("ativo", true).maybeSingle();
            if (m) { membroId = m.id; tipo = "membro"; }
        }

        if (!membroId) {
            const { data: v } = await sbAdmin.from("visitantes")
                .insert({ nome: nome.trim(), email: emailNorm, telefone: telefone || null,
                    onde_conheceu: onde_conheceu || null, ativo: true })
                .select("id").single();
            if (v) visitanteId = v.id;
        }

        // 3. Criar na tabela usuarios
        const { data: novoUser, error: userErr } = await sbAdmin
            .from("usuarios")
            .insert({ nome: nome.trim(), email: emailNorm, tipo, membro_id: membroId,
                visitante_id: visitanteId, ativo: true, e_admin: false })
            .select("id, nome, email, tipo, membro_id, visitante_id")
            .single();

        if (userErr) {
            if (userErr.code === "23505")
                return res.status(409).json({ error: "Este email já tem conta registada." });
            throw new Error(userErr.message);
        }

        // 4. Actualiza foto no membro se vinculou
        if (membroId && foto_url) {
            await sbAdmin.from("membros")
                .update({ foto_url }).eq("id", membroId).is("foto_url", null);
        }

        // 5. Email de boas-vindas
        try {
            const { subject, html } = emailBoasVindas({ nome: novoUser.nome, tipo: novoUser.tipo });
            await sendMail({ to: emailNorm, subject, html });
        } catch (emailErr) {
            console.warn("[register] Email falhou:", emailErr.message);
        }

        return res.status(201).json({
            ok: true,
            user: { ...novoUser, membro_id: novoUser.membro_id || null, vinculado: !!membroId },
        });

    } catch (err) {
        console.error("[register]", err.message);
        return res.status(500).json({ error: err.message || "Erro interno." });
    }
}

// ══════════════════════════════════════════════════════════════
// HANDLER: inscricao-confirmacao
// ══════════════════════════════════════════════════════════════
async function handleInscricaoConfirmacao(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { inscricao_id } = req.body;

        if (!inscricao_id?.trim())
            return res.status(400).json({ error: "inscricao_id obrigatório." });

        const { data: insc, error: inscErr } = await sbAdmin
            .from("evento_inscricoes")
            .select("*, eventos(id, titulo, data_inicio, local, valor, gratuito)")
            .eq("id", inscricao_id)
            .maybeSingle();

        if (inscErr || !insc)
            return res.status(404).json({ error: "Inscrição não encontrada." });

        if (!insc.email)
            return res.status(200).json({ message: "Sem email — confirmação não enviada." });

        const ev = insc.eventos;

        const { count } = await sbAdmin
            .from("evento_inscricoes")
            .select("id", { count: "exact", head: true })
            .eq("evento_id", ev.id)
            .eq("status", "pendente")
            .lte("created_at", insc.created_at);

        const posicao = count || 1;

        const dataStr = ev.data_inicio
            ? new Date(ev.data_inicio).toLocaleDateString("pt-PT", {
                weekday: "long", day: "numeric", month: "long",
                year: "numeric", hour: "2-digit", minute: "2-digit",
            })
            : null;

        const identificador = insc.email || insc.telemovel || insc.nome;

        const { subject, html } = emailConfirmacaoInscricao({
            nome:          insc.nome,
            evento:        ev.titulo,
            data:          dataStr,
            local:         ev.local || null,
            valor:         ev.gratuito ? 0 : (ev.valor || 0),
            posicao:       Number(ev.valor) > 0 ? posicao : null,
            identificador,
        });

        await sendMail({ to: insc.email, subject, html });

        console.log(`[inscricao-confirmacao] Email enviado para ${insc.email} — evento: ${ev.titulo}`);
        return res.status(200).json({ message: "Email enviado com sucesso." });

    } catch (err) {
        console.error("[inscricao-confirmacao]", err);
        return res.status(500).json({ error: "Erro interno. Tenta novamente." });
    }
}

// ══════════════════════════════════════════════════════════════
// HANDLER: bulk-send-welcome
// ══════════════════════════════════════════════════════════════
const SENHA_DEFAULT = "Zion@Lisboa777";
const BATCH_SIZE    = 10;
const DELAY_MS      = 300;

async function handleBulkSendWelcome(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "Não autenticado." });

    const { data: { user: authUser }, error: authError } = await sbAdmin.auth.getUser(token);
    if (authError || !authUser)
        return res.status(401).json({ error: "Token inválido ou expirado." });

    const { data: adminMembro } = await sbAdmin
        .from("membros")
        .select("id, e_admin, ativo")
        .eq("email", authUser.email)
        .eq("ativo", true)
        .single();

    if (!adminMembro?.e_admin)
        return res.status(403).json({ error: "Sem permissão — não és admin." });

    const dry_run         = req.body?.dry_run === true;
    const apenas_novos    = req.body?.apenas_novos !== false;
    const ids_especificos = req.body?.membro_ids || null;

    let query = sbAdmin
        .from("membros")
        .select("id, nome, email, tipo")
        .not("email", "is", null)
        .neq("email", "")
        .eq("ativo", true);

    if (ids_especificos?.length) query = query.in("id", ids_especificos);

    const { data: membros, error: erroMembros } = await query;

    if (erroMembros)
        return res.status(500).json({ error: "Erro ao buscar membros: " + erroMembros.message });
    if (!membros?.length)
        return res.status(200).json({ ok: true, processados: 0, mensagem: "Nenhum membro com email encontrado." });

    const emails = membros.map(m => m.email.toLowerCase().trim());
    const { data: usuariosExistentes } = await sbAdmin.from("usuarios").select("email").in("email", emails);
    const emailsComConta = new Set((usuariosExistentes || []).map(u => u.email.toLowerCase()));

    const alvo = apenas_novos
        ? membros.filter(m => !emailsComConta.has(m.email.toLowerCase().trim()))
        : membros;

    if (!alvo.length) {
        return res.status(200).json({
            ok: true, processados: 0,
            mensagem: "Todos os membros seleccionados já têm conta.",
            total_membros: membros.length, ja_tem_conta: emailsComConta.size,
        });
    }

    if (dry_run) {
        return res.status(200).json({
            ok: true, dry_run: true,
            total_membros: membros.length, ja_tem_conta: emailsComConta.size,
            a_criar: alvo.length,
            lista: alvo.map(m => ({ id: m.id, nome: m.nome, email: m.email })),
        });
    }

    const resultado = { ok: true, total_alvo: alvo.length, criados: 0, emails_enviados: 0, erros: [] };

    for (let i = 0; i < alvo.length; i += BATCH_SIZE) {
        const lote = alvo.slice(i, i + BATCH_SIZE);
        for (const membro of lote) {
            const emailNorm = membro.email.toLowerCase().trim();
            try {
                const { error: authCreateError } = await sbAdmin.auth.admin.createUser({
                    email: emailNorm, password: SENHA_DEFAULT,
                    email_confirm: true, user_metadata: { nome: membro.nome },
                });
                if (authCreateError && !authCreateError.message.includes("already been registered"))
                    throw new Error("Supabase Auth: " + authCreateError.message);

                const { error: insertErr } = await sbAdmin.from("usuarios").upsert(
                    { email: emailNorm, nome: membro.nome, tipo: "membro", e_admin: false,
                        ativo: true, membro_id: membro.id, password_hash: "supabase_auth",
                        created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                    { onConflict: "email", ignoreDuplicates: apenas_novos }
                );
                if (insertErr && !insertErr.message.includes("duplicate"))
                    throw new Error("Tabela usuarios: " + insertErr.message);

                resultado.criados++;
            } catch (err) {
                resultado.erros.push({ email: emailNorm, etapa: "criar_conta", erro: err.message });
                continue;
            }
            try {
                const { subject, html } = emailBoasVindasApp({ nome: membro.nome, email: emailNorm });
                await sendMail({ to: emailNorm, subject, html });
                resultado.emails_enviados++;
            } catch (err) {
                resultado.erros.push({ email: emailNorm, etapa: "enviar_email", erro: err.message });
            }
            await sleep(DELAY_MS);
        }
    }

    return res.status(200).json(resultado);
}

// ══════════════════════════════════════════════════════════════
// HANDLER: sala-agendamento-status
// ══════════════════════════════════════════════════════════════
async function handleSalaAgendamentoStatus(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const { agendamento_id, estado, motivo } = req.body || {};

    if (!agendamento_id || !estado)
        return res.status(400).json({ error: "agendamento_id e estado são obrigatórios." });

    const { data: ag, error: agErr } = await sbAdmin
        .from("sala_agendamentos")
        .select("*, salas(nome)")
        .eq("id", agendamento_id)
        .single();

    if (agErr || !ag)
        return res.status(404).json({ error: "Agendamento não encontrado." });

    const emailDest = ag.solicitante_email;
    if (!emailDest)
        return res.status(200).json({ ok: true, aviso: "Sem email do solicitante — notificação ignorada." });

    const ini    = new Date(ag.data_inicio);
    const fim    = new Date(ag.data_fim);
    const dataPt = ini.toLocaleDateString("pt-PT", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    const horaIni = ini.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    const horaFim = fim.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

    try {
        const { subject, html } = emailAgendamentoSala({
            nome:    ag.solicitante_nome || emailDest,
            sala:    ag.salas?.nome || "Sala",
            data:    dataPt, horaIni, horaFim,
            estado,  motivo: motivo || null,
        });

        await sendMail({ to: emailDest, subject, html });
        return res.status(200).json({ ok: true, email_enviado: emailDest });

    } catch (err) {
        console.error("[sala-agendamento-status]", err.message);
        return res.status(500).json({ error: err.message });
    }
}
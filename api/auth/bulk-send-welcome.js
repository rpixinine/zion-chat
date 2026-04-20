// api/auth/bulk-send-welcome.js

import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { emailBoasVindasApp } from "./email-templates.js";

// ── MUDANÇA 1: dois clientes Supabase ────────────────────────────────────────
// sbAdmin usa a service_role — só no servidor, nunca no frontend
const sbAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY   // service_role key
);

// sbAnon para verificar o token do utilizador
const sbAnon = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const SENHA_DEFAULT = "Zion@Lisboa777";
const BATCH_SIZE    = 10;
const DELAY_MS      = 300;

// ── Mailer (igual ao que tens) ────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

async function enviarEmail({ to, subject, html }) {
    return mailer.sendMail({
        from: `"Zion Lisboa" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")   return res.status(405).json({ error: "Método não permitido" });

    // ── MUDANÇA 2: verificar token via Supabase Auth ──────────────────────────
    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "Não autenticado." });

    console.log('Token length:', token.length);
    console.log('Token prefix:', token.substring(0, 30));

    // Valida o JWT do Supabase Auth
    const { data: { user: authUser }, error: authError } = await sbAdmin.auth.getUser(token);

    console.log('authUser:', authUser?.email);
    console.log('authError:', authError?.message);
    
    if (authError || !authUser) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    // Verifica se é admin na tabela membros
    const { data: adminMembro } = await sbAdmin
        .from("membros")
        .select("id, e_admin, ativo")
        .eq("email", authUser.email)
        .eq("ativo", true)
        .single();

    if (!adminMembro?.e_admin) {
        return res.status(403).json({ error: "Sem permissão — não és admin." });
    }
    // ── FIM DAS MUDANÇAS NA AUTH ──────────────────────────────────────────────

    // ── Parâmetros (igual ao que tens) ────────────────────────────────────────
    const dry_run        = req.body?.dry_run === true;
    const apenas_novos   = req.body?.apenas_novos !== false;
    const ids_especificos = req.body?.membro_ids || null;

    // ── Buscar membros (igual ao que tens) ────────────────────────────────────
    let query = sbAdmin
        .from("membros")
        .select("id, nome, email, tipo")
        .not("email", "is", null)
        .neq("email", "")
        .eq("ativo", true);

    if (ids_especificos?.length) {
        query = query.in("id", ids_especificos);
    }

    const { data: membros, error: erroMembros } = await query;

    if (erroMembros) {
        return res.status(500).json({ error: "Erro ao buscar membros: " + erroMembros.message });
    }
    if (!membros?.length) {
        return res.status(200).json({ ok: true, processados: 0, mensagem: "Nenhum membro com email encontrado." });
    }

    // ── Verificar quais já têm conta ──────────────────────────────────────────
    // Verifica nas duas fontes: tabela usuarios E Supabase Auth
    const emails = membros.map(m => m.email.toLowerCase().trim());

    const { data: usuariosExistentes } = await sbAdmin
        .from("usuarios")
        .select("email")
        .in("email", emails);

    const emailsComConta = new Set(
        (usuariosExistentes || []).map(u => u.email.toLowerCase())
    );

    const alvo = apenas_novos
        ? membros.filter(m => !emailsComConta.has(m.email.toLowerCase().trim()))
        : membros;

    if (!alvo.length) {
        return res.status(200).json({
            ok: true,
            processados: 0,
            mensagem: "Todos os membros seleccionados já têm conta.",
            total_membros: membros.length,
            ja_tem_conta: emailsComConta.size,
        });
    }

    // ── Dry run (igual ao que tens) ───────────────────────────────────────────
    if (dry_run) {
        return res.status(200).json({
            ok: true,
            dry_run: true,
            total_membros: membros.length,
            ja_tem_conta: emailsComConta.size,
            a_criar: alvo.length,
            lista: alvo.map(m => ({ id: m.id, nome: m.nome, email: m.email })),
        });
    }

    // ── Processar em lotes ────────────────────────────────────────────────────
    const resultado = {
        ok: true,
        total_alvo:     alvo.length,
        criados:        0,
        emails_enviados: 0,
        erros:          [],
    };

    for (let i = 0; i < alvo.length; i += BATCH_SIZE) {
        const lote = alvo.slice(i, i + BATCH_SIZE);

        for (const membro of lote) {
            const emailNorm = membro.email.toLowerCase().trim();

            // ── MUDANÇA 3: criar no Supabase Auth + tabela usuarios ───────────
            try {
                // 1. Criar no Supabase Auth
                const { error: authCreateError } = await sbAdmin.auth.admin.createUser({
                    email:          emailNorm,
                    password:       SENHA_DEFAULT,
                    email_confirm:  true,   // confirma logo, sem email de verificação extra
                    user_metadata:  { nome: membro.nome }
                });

                // Ignora se já existe no Supabase Auth
                if (authCreateError && !authCreateError.message.includes("already been registered")) {
                    throw new Error("Supabase Auth: " + authCreateError.message);
                }

                // 2. Criar na tabela usuarios (o teu sistema de permissões)
                const { error: insertErr } = await sbAdmin
                    .from("usuarios")
                    .upsert(
                        {
                            email:        emailNorm,
                            nome:         membro.nome,
                            tipo:         "membro",
                            e_admin:      false,
                            ativo:        true,
                            membro_id:    membro.id,
                            created_at:   new Date().toISOString(),
                            updated_at:   new Date().toISOString(),
                        },
                        { onConflict: "email", ignoreDuplicates: apenas_novos }
                    );

                if (insertErr && !insertErr.message.includes("duplicate")) {
                    throw new Error("Tabela usuarios: " + insertErr.message);
                }

                resultado.criados++;

            } catch (err) {
                resultado.erros.push({ email: emailNorm, etapa: "criar_conta", erro: err.message });
                continue; // não envia email se falhou a criar
            }
            // ── FIM DA MUDANÇA 3 ─────────────────────────────────────────────

            // ── Enviar email (igual ao que tens) ──────────────────────────────
            try {
                const { subject, html } = emailBoasVindasApp({
                    nome:  membro.nome,
                    email: emailNorm,
                });
                await enviarEmail({ to: emailNorm, subject, html });
                resultado.emails_enviados++;
            } catch (err) {
                resultado.erros.push({ email: emailNorm, etapa: "enviar_email", erro: err.message });
            }

            await sleep(DELAY_MS);
        }
    }

    return res.status(200).json(resultado);
}

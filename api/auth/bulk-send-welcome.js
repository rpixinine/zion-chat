// api/auth/bulk-send-welcome.js
// Lê membros com email → cria usuario (se não existir) com senha padrão → envia email de boas-vindas
// Chamado pelo admin. Suporta dry_run=true para simular sem criar nem enviar.

import {createClient} from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {emailBoasVindasApp} from "../../emails/templates.js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const SENHA_DEFAULT = "Zion@Lisboa777";
const BATCH_SIZE = 10;   // processa N membros por vez
const DELAY_MS = 300;  // pausa entre emails (evitar rate-limit do SMTP)

// ── Mailer ────────────────────────────────────────────────────────────────────
function criarMailer() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

async function enviarEmail(mailer, {to, subject, html}) {
    return mailer.sendMail({
        from: `"Zion Lisboa" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
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
    if (req.method !== "POST") return res.status(405).json({error: "Método não permitido"});

    // ── 1. Auth — só admin ────────────────────────────────────────────────────
    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({error: "Não autenticado."});

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({error: "Token inválido ou expirado."});
    }

    const {data: adminUser} = await supabase
        .from("usuarios")
        .select("id, e_admin, ativo")
        .eq("id", payload.id)
        .single();

    if (!adminUser?.ativo || !adminUser?.e_admin) {
        return res.status(403).json({error: "Sem permissão — não és admin."});
    }

    // ── 2. Parâmetros opcionais ───────────────────────────────────────────────
    const dry_run = req.body?.dry_run === true;      // só simula, não cria nem envia
    const apenas_novos = req.body?.apenas_novos !== false; // default: só quem ainda não tem usuario
    const ids_especificos = req.body?.membro_ids || null;  // array de UUIDs — opcional

    // ── 3. Buscar membros com email ───────────────────────────────────────────
    let query = supabase
        .from("membros")
        .select("id, nome, email, tipo")
        .not("email", "is", null)
        .neq("email", "")
        .eq("ativo", true);

    if (ids_especificos?.length) {
        query = query.in("id", ids_especificos);
    }

    const {data: membros, error: erroMembros} = await query;
    if (erroMembros) return res.status(500).json({error: "Erro ao buscar membros: " + erroMembros.message});
    if (!membros?.length) return res.status(200).json({
        ok: true,
        processados: 0,
        mensagem: "Nenhum membro com email encontrado."
    });

    // ── 4. Verificar quais já têm usuario ────────────────────────────────────
    const emails = membros.map(m => m.email.toLowerCase().trim());

    const {data: usuariosExistentes} = await supabase
        .from("usuarios")
        .select("email")
        .in("email", emails);

    const emailsComConta = new Set((usuariosExistentes || []).map(u => u.email.toLowerCase()));

    const alvo = apenas_novos
        ? membros.filter(m => !emailsComConta.has(m.email.toLowerCase().trim()))
        : membros;

    if (!alvo.length) {
        return res.status(200).json({
            ok: true,
            processados: 0,
            mensagem: "Todos os membros já têm conta criada.",
            total_membros: membros.length,
            ja_tem_conta: emailsComConta.size
        });
    }

    // ── 5. Dry run — devolve lista sem criar nada ─────────────────────────────
    if (dry_run) {
        return res.status(200).json({
            ok: true,
            dry_run: true,
            total_membros: membros.length,
            ja_tem_conta: emailsComConta.size,
            a_criar: alvo.length,
            lista: alvo.map(m => ({id: m.id, nome: m.nome, email: m.email}))
        });
    }

    // ── 6. Hash da senha padrão (calculado uma vez) ───────────────────────────
    const password_hash = await bcrypt.hash(SENHA_DEFAULT, 12);
    const mailer = criarMailer();

    // ── 7. Processar em lotes ─────────────────────────────────────────────────
    const resultado = {
        ok: true,
        total_alvo: alvo.length,
        criados: 0,
        emails_enviados: 0,
        erros: [],
    };

    for (let i = 0; i < alvo.length; i += BATCH_SIZE) {
        const lote = alvo.slice(i, i + BATCH_SIZE);

        for (const membro of lote) {
            const emailNorm = membro.email.toLowerCase().trim();

            // 7a. Criar usuario (pode já existir se apenas_novos=false)
            try {
                const {error: insertErr} = await supabase
                    .from("usuarios")
                    .upsert(
                        {
                            email: emailNorm,
                            nome: membro.nome,
                            password_hash,
                            tipo: membro.tipo === 'membro' ? 'membro' : 'visitante',
                            e_admin: false,
                            ativo: true,
                            membro_id: membro.id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                        {onConflict: "email", ignoreDuplicates: apenas_novos}
                    );

                if (insertErr && !insertErr.message.includes("duplicate")) {
                    throw new Error(insertErr.message);
                }

                resultado.criados++;
            } catch (err) {
                resultado.erros.push({email: emailNorm, etapa: "criar_usuario", erro: err.message});
                continue; // não envia email se falhou a criar
            }

            // 7b. Enviar email
            try {
                const {subject, html} = emailBoasVindasApp({
                    nome: membro.nome,
                    email: emailNorm,
                });
                await enviarEmail(mailer, {to: emailNorm, subject, html});
                resultado.emails_enviados++;
            } catch (err) {
                resultado.erros.push({email: emailNorm, etapa: "enviar_email", erro: err.message});
            }

            await sleep(DELAY_MS);
        }
    }

    return res.status(200).json(resultado);
}

// api/inscricao-confirmacao.js
// Envia email de confirmação de inscrição em evento — mesma stack do forgot-password

import { createClient } from "@supabase/supabase-js";
import nodemailer        from "nodemailer";
import { emailConfirmacaoInscricao, APP_URL } from "./email-templates.js";

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
        const { inscricao_id } = req.body;

        if (!inscricao_id?.trim())
            return res.status(400).json({ error: "inscricao_id obrigatório." });

        // ── 1. Buscar inscrição + evento via service key ──────────────
        const { data: insc, error: inscErr } = await supabase
            .from("evento_inscricoes")
            .select("*, eventos(id, titulo, data_inicio, local, valor, gratuito)")
            .eq("id", inscricao_id)
            .maybeSingle();

        if (inscErr || !insc)
            return res.status(404).json({ error: "Inscrição não encontrada." });

        if (!insc.email)
            return res.status(200).json({ message: "Sem email — confirmação não enviada." });

        const ev = insc.eventos;

        // ── 2. Calcular posição na fila ───────────────────────────────
        const { count } = await supabase
            .from("evento_inscricoes")
            .select("id", { count: "exact", head: true })
            .eq("evento_id", ev.id)
            .eq("status", "pendente")
            .lte("created_at", insc.created_at);

        const posicao = count || 1;

        // ── 3. Data formatada ─────────────────────────────────────────
        const dataStr = ev.data_inicio
            ? new Date(ev.data_inicio).toLocaleDateString("pt-PT", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            : null;

        // ── 4. Identificador para o QR Code ───────────────────────────
        // Prioridade: email > telemóvel (o presenca.html aceita ambos)
        const identificador = insc.email || insc.telemovel || insc.nome;

        // ── 5. Gerar email ────────────────────────────────────────────
        const { subject, html } = emailConfirmacaoInscricao({
            nome:          insc.nome,
            evento:        ev.titulo,
            data:          dataStr,
            local:         ev.local   || null,
            valor:         ev.gratuito ? 0 : (ev.valor || 0),
            posicao:       Number(ev.valor) > 0 ? posicao : null,  // posição só faz sentido em eventos pagos
            identificador,
        });

        // ── 6. Enviar ─────────────────────────────────────────────────
        await transporter.sendMail({
            from:    `"Zion Lisboa" <${process.env.GMAIL_USER}>`,
            to:      insc.email,
            subject,
            html,
        });

        console.log(`[inscricao-confirmacao] Email enviado para ${insc.email} — evento: ${ev.titulo}`);

        return res.status(200).json({ message: "Email enviado com sucesso." });

    } catch (err) {
        console.error("[inscricao-confirmacao]", err);
        return res.status(500).json({ error: "Erro interno. Tenta novamente." });
    }
}
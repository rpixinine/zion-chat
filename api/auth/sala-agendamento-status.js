// api/auth/sala-agendamento-status.js

import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { emailAgendamentoSala } from "./email-templates.js";

const sbAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    const { agendamento_id, estado, motivo } = req.body || {};

    if (!agendamento_id || !estado) {
        return res.status(400).json({ error: "agendamento_id e estado são obrigatórios." });
    }

    // Buscar o agendamento + sala
    const { data: ag, error: agErr } = await sbAdmin
        .from("sala_agendamentos")
        .select("*, salas(nome)")
        .eq("id", agendamento_id)
        .single();

    if (agErr || !ag) {
        return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    const emailDest = ag.solicitante_email;
    if (!emailDest) {
        return res.status(200).json({ ok: true, aviso: "Sem email do solicitante — notificação ignorada." });
    }

    const dataObj   = new Date(ag.data_inicio);
    const dataFimObj = new Date(ag.data_fim);

    const dataPt = dataObj.toLocaleDateString("pt-PT", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric"
    });
    const horaIni = dataObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    const horaFim = dataFimObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

    try {
        const { subject, html } = emailAgendamentoSala({
            nome:    ag.solicitante_nome || emailDest,
            sala:    ag.salas?.nome || "Sala",
            data:    dataPt,
            horaIni,
            horaFim,
            estado,
            motivo:  motivo || null,
        });

        await mailer.sendMail({
            from: `"Zion Lisboa" <${process.env.GMAIL_USER}>`,
            to:      emailDest,
            subject,
            html,
        });

        return res.status(200).json({ ok: true, email_enviado: emailDest });

    } catch (err) {
        console.error("[sala-agendamento-status]", err.message);
        return res.status(500).json({ error: err.message });
    }
}
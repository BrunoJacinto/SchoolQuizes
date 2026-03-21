import nodemailer from "nodemailer";
import { Resend } from "resend";

import type { ResultsPayload } from "@/types/game";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function renderEmail(payload: ResultsPayload): { html: string; text: string } {
  const missedQuestionsHtml =
    payload.missedQuestions.length > 0
      ? payload.missedQuestions
          .map(
            (item) => `
              <li style="margin-bottom:16px;">
                <strong>${escapeHtml(item.prompt)}</strong><br />
                Respondida: ${escapeHtml(item.selectedAnswer)}<br />
                Correta: ${escapeHtml(item.correctAnswer)}<br />
                Explicação: ${escapeHtml(item.explanation)}
              </li>
            `,
          )
          .join("")
      : "<li>Sem perguntas falhadas.</li>";

  const topicErrorsHtml =
    payload.topMistakeTopics.length > 0
      ? payload.topMistakeTopics
          .map((topic) => `<li>${escapeHtml(topic.topic)}: ${topic.count}</li>`)
          .join("")
      : "<li>Sem tópicos com erros.</li>";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#07101f;padding:24px;color:#f8fafc;">
      <div style="max-width:720px;margin:0 auto;background:#0f1b36;border-radius:24px;padding:32px;border:1px solid rgba(255,255,255,0.12);">
        <p style="margin:0 0 12px;color:#f6c76a;letter-spacing:0.2em;text-transform:uppercase;font-size:12px;">Resultado Final</p>
        <h1 style="margin:0 0 8px;font-size:36px;color:#ffffff;">Quem Quer Ser Milionário? 5.º Ano</h1>
        <p style="margin:0 0 24px;color:#d7def7;">Resumo da run escolar realizada por ${escapeHtml(payload.participant.studentName)}.</p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:24px;">
          <div style="padding:16px;border-radius:18px;background:#13254a;">
            <span style="display:block;color:#b7c7f2;">Pontuação total</span>
            <strong style="font-size:28px;color:#fff;">${new Intl.NumberFormat("pt-PT").format(payload.totalScore)}</strong>
          </div>
          <div style="padding:16px;border-radius:18px;background:#13254a;">
            <span style="display:block;color:#b7c7f2;">Certas / Erradas</span>
            <strong style="font-size:28px;color:#fff;">${payload.correctCount} / ${payload.wrongCount}</strong>
          </div>
          <div style="padding:16px;border-radius:18px;background:#13254a;">
            <span style="display:block;color:#b7c7f2;">Tempo total</span>
            <strong style="font-size:28px;color:#fff;">${formatDuration(payload.totalTimeSeconds)}</strong>
          </div>
        </div>

        <p style="margin:0 0 8px;color:#d7def7;">Email do encarregado: ${escapeHtml(payload.participant.guardianEmail)}</p>
        <p style="margin:0 0 8px;color:#d7def7;">Modo: ${escapeHtml(payload.mode)}</p>
        <p style="margin:0 0 8px;color:#d7def7;">Início: ${formatDateTime(payload.startedAt)}</p>
        <p style="margin:0 0 24px;color:#d7def7;">Fim: ${formatDateTime(payload.completedAt)}</p>

        <h2 style="margin:0 0 12px;color:#fff;">Tópicos com mais erros</h2>
        <ul style="margin:0 0 24px;padding-left:20px;color:#d7def7;">${topicErrorsHtml}</ul>

        <h2 style="margin:0 0 12px;color:#fff;">Perguntas falhadas</h2>
        <ul style="margin:0;padding-left:20px;color:#d7def7;">${missedQuestionsHtml}</ul>
      </div>
    </div>
  `;

  const text = [
    `Resultado final de ${payload.participant.studentName}`,
    `Email do encarregado: ${payload.participant.guardianEmail}`,
    `Pontuação total: ${payload.totalScore}`,
    `Respostas certas: ${payload.correctCount}`,
    `Respostas erradas: ${payload.wrongCount}`,
    `Tempo total: ${formatDuration(payload.totalTimeSeconds)}`,
    `Início: ${formatDateTime(payload.startedAt)}`,
    `Fim: ${formatDateTime(payload.completedAt)}`,
    "",
    "Tópicos com mais erros:",
    ...payload.topMistakeTopics.map((topic) => `- ${topic.topic}: ${topic.count}`),
    "",
    "Perguntas falhadas:",
    ...payload.missedQuestions.map(
      (item) =>
        `- ${item.prompt} | Respondida: ${item.selectedAnswer} | Correta: ${item.correctAnswer} | ${item.explanation}`,
    ),
  ].join("\n");

  return { html, text };
}

export async function sendResultsEmail(payload: ResultsPayload): Promise<void> {
  const mailFrom = process.env.MAIL_FROM;

  if (!mailFrom) {
    throw new Error("Falta a variável de ambiente MAIL_FROM.");
  }

  const { html, text } = renderEmail(payload);
  const subject = `Resultado final de ${payload.participant.studentName} | Quem Quer Ser Milionário? 5.º Ano`;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: mailFrom,
      to: payload.participant.guardianEmail,
      subject,
      html,
      text,
    });
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: mailFrom,
      to: payload.participant.guardianEmail,
      subject,
      html,
      text,
    });
    return;
  }

  throw new Error("Configuração de email ausente. Define RESEND_API_KEY ou SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.");
}

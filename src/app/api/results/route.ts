import { NextResponse } from "next/server";

import { sendResultsEmail } from "@/lib/email";
import type { ResultsPayload } from "@/types/game";

export const runtime = "nodejs";

function isResultsPayload(value: unknown): value is ResultsPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as ResultsPayload;

  return (
    typeof candidate.participant?.studentName === "string" &&
    typeof candidate.participant?.guardianEmail === "string" &&
    typeof candidate.mode === "string" &&
    typeof candidate.startedAt === "string" &&
    typeof candidate.completedAt === "string" &&
    typeof candidate.totalScore === "number" &&
    typeof candidate.correctCount === "number" &&
    typeof candidate.wrongCount === "number" &&
    typeof candidate.totalTimeSeconds === "number" &&
    Array.isArray(candidate.topMistakeTopics) &&
    Array.isArray(candidate.missedQuestions)
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!isResultsPayload(body)) {
      return NextResponse.json(
        { ok: false, message: "Payload de resultados inválido." },
        { status: 400 },
      );
    }

    await sendResultsEmail(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falhou o envio do resultado.";

    return NextResponse.json(
      { ok: false, message },
      { status: 500 },
    );
  }
}

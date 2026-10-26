import { MATH_6_QUESTION_BANK } from "@/data/question-bank-6ano";
import { MillionaireApp } from "@/components/millionaire-app";

export default function SextoAnoPage() {
  return (
    <MillionaireApp
      questionBank={MATH_6_QUESTION_BANK}
      storageKey="milionario-6ano-matematica"
      testTitle="6.º F — Matemática · Números e Polígonos"
    />
  );
}

import { STATISTICS_QUESTION_BANK } from "@/data/question-bank-statistics";
import { MillionaireApp } from "@/components/millionaire-app";

export default function EstatisticaPage() {
  return (
    <MillionaireApp
      questionBank={STATISTICS_QUESTION_BANK}
      storageKey="milionario-5ano-estatistica"
      testTitle="Estatística e Probabilidades"
    />
  );
}

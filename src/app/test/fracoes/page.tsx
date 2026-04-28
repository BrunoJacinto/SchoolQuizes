import { QUESTION_BANK } from "@/data/question-bank";
import { MillionaireApp } from "@/components/millionaire-app";

export default function FracoesPage() {
  return (
    <MillionaireApp
      questionBank={QUESTION_BANK}
      storageKey="milionario-5ano-fracoes"
      testTitle="Frações, Decimais e Percentagens"
    />
  );
}

import { NATUREZA_1_QUESTION_BANK } from "@/data/question-bank-ciencias-natureza-1";
import { MillionaireApp } from "@/components/millionaire-app";

export default function CienciasNatureza1Page() {
  return (
    <MillionaireApp
      questionBank={NATUREZA_1_QUESTION_BANK}
      storageKey="milionario-6ano-ciencias-natureza-teste-1"
      testTitle="Ciências da Natureza · Teste 1"
    />
  );
}

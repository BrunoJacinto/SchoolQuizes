import { DIFFICULTIES, type Difficulty, type Question, TOPICS, type Topic } from "@/types/game";

type ChoiceBundle = {
  options: [string, string, string, string];
  correctIndex: number;
};

type RoundingTarget = "dezena" | "centena" | "milhar" | "unidade" | "decima" | "centesima";

const EQUIVALENT_TOPIC: Topic = "Frações equivalentes";
const SIMPLIFY_TOPIC: Topic = "Simplificação de frações";
const PERCENT_TOPIC: Topic = "Percentagens";
const DECIMAL_COMPARE_TOPIC: Topic = "Comparação de números decimais";
const ROUNDING_TOPIC: Topic = "Arredondamentos e aproximações";
const FRACTION_COMPARE_TOPIC: Topic = "Comparação de frações";
const FRACTION_OPERATIONS_TOPIC: Topic = "Adição e subtração de frações";
const NATURAL_BY_FRACTION_TOPIC: Topic = "Multiplicação de número natural por fração";
const DECIMAL_MULTIPLICATION_TOPIC: Topic = "Multiplicação de decimais";
const DECIMAL_DIVISION_TOPIC: Topic = "Divisão de decimais";

const ROUNDING_META: Record<
  RoundingTarget,
  { step: number; label: string; digits: number }
> = {
  dezena: { step: 10, label: "às dezenas", digits: 0 },
  centena: { step: 100, label: "às centenas", digits: 0 },
  milhar: { step: 1000, label: "às unidades de milhar", digits: 0 },
  unidade: { step: 1, label: "às unidades", digits: 0 },
  decima: { step: 0.1, label: "às décimas", digits: 1 },
  centesima: { step: 0.01, label: "às centésimas", digits: 2 },
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function roundNumber(value: number, digits = 6): number {
  return Number(value.toFixed(digits));
}

function simplifyFraction(numerator: number, denominator: number): [number, number] {
  const factor = gcd(numerator, denominator);
  return [numerator / factor, denominator / factor];
}

function fraction(numerator: number, denominator: number): string {
  return `${numerator}/${denominator}`;
}

function formatFractionOrWhole(numerator: number, denominator: number): string {
  const [simpleNumerator, simpleDenominator] = simplifyFraction(numerator, denominator);

  if (simpleDenominator === 1) {
    return String(simpleNumerator);
  }

  return fraction(simpleNumerator, simpleDenominator);
}

function formatPtNumber(value: number): string {
  return roundNumber(value).toString().replace(".", ",");
}

function formatFixedPtNumber(value: number, digits: number): string {
  if (digits === 0) {
    return String(Math.trunc(roundNumber(value, 0)));
  }

  return roundNumber(value, digits).toFixed(digits).replace(".", ",");
}

function parsePtNumber(value: string): number {
  return Number(value.replace(",", "."));
}

function parseFraction(value: string): number {
  const [numerator, denominator] = value.split("/").map(Number);
  return numerator / denominator;
}

function buildChoices(correct: string, distractors: Array<string | null>, correctSlot: number): ChoiceBundle {
  const uniqueDistractors = [...new Set(distractors.filter((item): item is string => Boolean(item)))]
    .filter((item) => item !== correct)
    .slice(0, 3);

  assert(uniqueDistractors.length === 3, `Foi impossível criar 3 distrações válidas para ${correct}.`);

  const options = [...uniqueDistractors];
  const slot = correctSlot % 4;
  options.splice(slot, 0, correct);

  return {
    options: options as [string, string, string, string],
    correctIndex: slot,
  };
}

function buildNumericChoices(
  correct: number,
  distractors: number[],
  correctSlot: number,
  digits?: number,
): ChoiceBundle {
  const formatter = digits === undefined ? formatPtNumber : (value: number) => formatFixedPtNumber(value, digits);

  return buildChoices(
    formatter(correct),
    distractors.map((item) => formatter(item)),
    correctSlot,
  );
}

function buildQuestion(
  id: string,
  topic: Topic,
  difficulty: Difficulty,
  prompt: string,
  explanation: string,
  choiceBundle: ChoiceBundle,
): Question {
  return {
    id,
    topic,
    difficulty,
    prompt,
    explanation,
    options: choiceBundle.options,
    correctIndex: choiceBundle.correctIndex,
  };
}

function buildFixedOptionsQuestion(
  id: string,
  topic: Topic,
  difficulty: Difficulty,
  prompt: string,
  explanation: string,
  options: [string, string, string, string],
  correctIndex: number,
): Question {
  assert(new Set(options).size === 4, `A pergunta ${id} tem opções repetidas.`);
  assert(correctIndex >= 0 && correctIndex < 4, `Índice correto inválido em ${id}.`);

  return {
    id,
    topic,
    difficulty,
    prompt,
    explanation,
    options,
    correctIndex,
  };
}

function makeId(topicCode: string, difficulty: Difficulty, index: number): string {
  return `${topicCode}-${difficulty}-${String(index + 1).padStart(2, "0")}`;
}

function buildEquivalentQuestions(): Question[] {
  const easySeeds = [
    [1, 2, 2],
    [1, 3, 3],
    [2, 3, 2],
    [2, 5, 3],
    [3, 4, 2],
    [3, 5, 4],
    [4, 7, 2],
    [5, 6, 2],
    [3, 8, 3],
    [4, 9, 2],
  ] as const;

  const mediumSeeds = [
    [2, 3, 12],
    [3, 5, 20],
    [4, 7, 28],
    [5, 8, 32],
    [3, 4, 16],
    [5, 6, 24],
    [7, 9, 45],
    [4, 5, 35],
    [3, 8, 40],
    [6, 7, 42],
  ] as const;

  const hardSeeds = [
    [2, 3, 7, 9],
    [3, 5, 4, 7],
    [4, 7, 5, 9],
    [5, 8, 3, 7],
    [3, 4, 6, 11],
    [5, 6, 5, 9],
    [7, 9, 3, 8],
    [4, 5, 7, 11],
    [5, 7, 4, 9],
    [6, 11, 3, 5],
  ] as const;

  const easy = easySeeds.map(([numerator, denominator, factor], index) =>
    buildQuestion(
      makeId("equiv", "facil", index),
      EQUIVALENT_TOPIC,
      "facil",
      `Qual destas frações é equivalente a ${fraction(numerator, denominator)}?`,
      `Basta multiplicar numerador e denominador por ${factor}.`,
      buildChoices(
        fraction(numerator * factor, denominator * factor),
        [
          fraction(numerator, denominator * factor),
          fraction(numerator * factor + 1, denominator * factor),
          fraction(numerator * factor, denominator * factor + 1),
        ],
        index,
      ),
    ),
  );

  const medium = mediumSeeds.map(([numerator, denominator, targetDenominator], index) => {
    const factor = targetDenominator / denominator;
    const correctNumerator = numerator * factor;

    return buildQuestion(
      makeId("equiv", "medio", index),
      EQUIVALENT_TOPIC,
      "medio",
      `Completa a equivalência: ${fraction(numerator, denominator)} = ?/${targetDenominator}`,
      `Como ${targetDenominator} é ${factor} vezes maior do que ${denominator}, o numerador também fica ${factor} vezes maior.`,
      buildChoices(
        String(correctNumerator),
        [String(correctNumerator - numerator), String(correctNumerator + 1), String(correctNumerator + denominator)],
        index + 1,
      ),
    );
  });

  const hard = hardSeeds.map(([baseNumerator, baseDenominator, leftFactor, rightFactor], index) => {
    const leftNumerator = baseNumerator * leftFactor;
    const leftDenominator = baseDenominator * leftFactor;
    const rightNumerator = baseNumerator * rightFactor;
    const correctDenominator = baseDenominator * rightFactor;

    return buildQuestion(
      makeId("equiv", "dificil", index),
      EQUIVALENT_TOPIC,
      "dificil",
      `Completa a equivalência: ${fraction(leftNumerator, leftDenominator)} = ${rightNumerator}/?`,
      `As duas frações representam a mesma parte do todo, por isso o segundo denominador tem de acompanhar o fator ${rightFactor}.`,
      buildChoices(
        String(correctDenominator),
        [
          String(correctDenominator - baseNumerator),
          String(correctDenominator + baseDenominator),
          String(baseDenominator * (rightFactor - 1)),
        ],
        index + 2,
      ),
    );
  });

  return [...easy, ...medium, ...hard];
}

function buildSimplificationQuestions(): Question[] {
  const easySeeds = [
    [2, 4],
    [3, 6],
    [4, 8],
    [6, 9],
    [8, 10],
    [10, 20],
    [12, 18],
    [15, 20],
    [18, 24],
    [20, 25],
  ] as const;

  const mediumSeeds = [
    [12, 16],
    [14, 21],
    [16, 24],
    [20, 30],
    [24, 32],
    [35, 49],
    [48, 60],
    [54, 72],
    [63, 81],
    [72, 96],
  ] as const;

  const hardSeeds = [
    [42, 56],
    [54, 72],
    [63, 84],
    [72, 96],
    [75, 105],
    [81, 108],
    [90, 120],
    [96, 144],
    [105, 140],
    [126, 168],
  ] as const;

  const makeSimplificationQuestion = (numerator: number, denominator: number, difficulty: Difficulty, index: number) => {
    const [simpleNumerator, simpleDenominator] = simplifyFraction(numerator, denominator);
    const commonDivisor = gcd(numerator, denominator);

    return buildQuestion(
      makeId("simp", difficulty, index),
      SIMPLIFY_TOPIC,
      difficulty,
      `Qual é a forma simplificada de ${fraction(numerator, denominator)}?`,
      `Divide numerador e denominador por ${commonDivisor}.`,
      buildChoices(
        fraction(simpleNumerator, simpleDenominator),
        [
          fraction(simpleNumerator, denominator),
          fraction(numerator, simpleDenominator),
          fraction(simpleDenominator, simpleNumerator),
        ],
        index,
      ),
    );
  };

  return [
    ...easySeeds.map(([numerator, denominator], index) => makeSimplificationQuestion(numerator, denominator, "facil", index)),
    ...mediumSeeds.map(([numerator, denominator], index) => makeSimplificationQuestion(numerator, denominator, "medio", index)),
    ...hardSeeds.map(([numerator, denominator], index) => makeSimplificationQuestion(numerator, denominator, "dificil", index)),
  ];
}

function buildPercentageQuestions(): Question[] {
  const easySeeds = [
    [10, 80],
    [25, 40],
    [50, 70],
    [20, 90],
    [75, 20],
    [5, 100],
    [30, 50],
    [60, 40],
    [40, 30],
    [10, 250],
  ] as const;

  const mediumSeeds = [
    [15, 200],
    [30, 120],
    [35, 80],
    [45, 60],
    [30, 160],
    [55, 40],
    [65, 80],
    [75, 120],
    [40, 250],
    [70, 90],
  ] as const;

  const hardDirectSeeds = [
    [12, 250],
    [18, 150],
    [35, 240],
    [45, 220],
    [60, 125],
  ] as const;

  const hardReverseSeeds = [
    [24, 20],
    [36, 30],
    [45, 15],
    [54, 60],
    [72, 40],
  ] as const;

  const makeDirectQuestion = (
    percentage: number,
    total: number,
    difficulty: Difficulty,
    index: number,
  ) => {
    const correct = (percentage * total) / 100;
    const step = Math.max(1, total / 20);

    return buildQuestion(
      makeId("perc", difficulty, index),
      PERCENT_TOPIC,
      difficulty,
      `Quanto é ${percentage}% de ${total}?`,
      `${percentage}% significa ${percentage} em cada 100. Multiplicas ${total} por ${percentage} e divides por 100.`,
      buildNumericChoices(
        correct,
        [
          correct - step,
          correct + step,
          total - correct,
          (total * (percentage + 10)) / 100,
        ],
        index,
      ),
    );
  };

  const makeReverseQuestion = (part: number, percentage: number, index: number) => {
    const correct = (part * 100) / percentage;

    return buildQuestion(
      makeId("perc", "dificil", index + hardDirectSeeds.length),
      PERCENT_TOPIC,
      "dificil",
      `${part} é ${percentage}% de que número?`,
      `Se ${part} corresponde a ${percentage}%, então 100% obtém-se multiplicando por 100 e dividindo por ${percentage}.`,
      buildNumericChoices(
        correct,
        [
          correct - 20,
          correct + 20,
          part,
          correct - 10,
        ],
        index + 1,
      ),
    );
  };

  return [
    ...easySeeds.map(([percentage, total], index) => makeDirectQuestion(percentage, total, "facil", index)),
    ...mediumSeeds.map(([percentage, total], index) => makeDirectQuestion(percentage, total, "medio", index)),
    ...hardDirectSeeds.map(([percentage, total], index) => makeDirectQuestion(percentage, total, "dificil", index)),
    ...hardReverseSeeds.map(([part, percentage], index) => makeReverseQuestion(part, percentage, index)),
  ];
}

function buildDecimalComparisonQuestions(): Question[] {
  const easySeeds = [
    ["maior", ["2,4", "2,04", "2,39", "2,14"]],
    ["menor", ["5,7", "5,17", "5,71", "5,27"]],
    ["maior", ["1,8", "1,08", "1,78", "1,18"]],
    ["menor", ["3,6", "3,06", "3,16", "3,61"]],
    ["maior", ["0,9", "0,89", "0,7", "0,79"]],
    ["menor", ["4,2", "4,02", "4,12", "4,21"]],
    ["maior", ["6,5", "6,15", "6,05", "6,45"]],
    ["menor", ["7,8", "7,08", "7,18", "7,28"]],
    ["maior", ["9,4", "9,14", "9,04", "9,34"]],
    ["menor", ["8,3", "8,03", "8,13", "8,23"]],
  ] as const;

  const mediumSeeds = [
    ["maior", ["3,45", "3,54", "3,405", "3,5"]],
    ["menor", ["6,08", "6,8", "6,18", "6,108"]],
    ["maior", ["2,307", "2,37", "2,3", "2,299"]],
    ["menor", ["9,54", "9,504", "9,45", "9,405"]],
    ["maior", ["1,909", "1,99", "1,9", "1,9099"]],
    ["menor", ["4,707", "4,77", "4,7008", "4,708"]],
    ["maior", ["5,021", "5,201", "5,12", "5,102"]],
    ["menor", ["7,333", "7,303", "7,033", "7,330"]],
    ["maior", ["8,099", "8,9", "8,909", "8,19"]],
    ["menor", ["0,56", "0,506", "0,65", "0,605"]],
  ] as const;

  const hardSeeds = [
    ["maior", ["4,5001", "4,5009", "4,5003", "4,5008"]],
    ["menor", ["7,0707", "7,077", "7,0701", "7,071"]],
    ["maior", ["0,9989", "0,999", "0,9909", "0,9899"]],
    ["menor", ["2,3401", "2,3041", "2,341", "2,314"]],
    ["maior", ["6,0606", "6,606", "6,066", "6,6006"]],
    ["menor", ["9,101", "9,011", "9,110", "9,111"]],
    ["maior", ["3,141", "3,1141", "3,1415", "3,1409"]],
    ["menor", ["5,555", "5,5055", "5,5505", "5,5005"]],
    ["maior", ["8,808", "8,0888", "8,8808", "8,8008"]],
    ["menor", ["1,0101", "1,0011", "1,011", "1,1"]],
  ] as const;

  const makeComparisonQuestion = (
    type: "maior" | "menor",
    values: readonly [string, string, string, string],
    difficulty: Difficulty,
    index: number,
  ) => {
    const numericValues = values.map(parsePtNumber);
    const correctValue = type === "maior" ? Math.max(...numericValues) : Math.min(...numericValues);
    const correctIndex = numericValues.findIndex((value) => value === correctValue);

    return buildFixedOptionsQuestion(
      makeId("deccomp", difficulty, index),
      DECIMAL_COMPARE_TOPIC,
      difficulty,
      `Qual é o ${type === "maior" ? "maior" : "menor"} número decimal?`,
      "Compara primeiro a parte inteira. Se for igual, compara décimas, centésimas e milésimas pela ordem.",
      [...values] as [string, string, string, string],
      correctIndex,
    );
  };

  return [
    ...easySeeds.map(([type, values], index) => makeComparisonQuestion(type, values, "facil", index)),
    ...mediumSeeds.map(([type, values], index) => makeComparisonQuestion(type, values, "medio", index)),
    ...hardSeeds.map(([type, values], index) => makeComparisonQuestion(type, values, "dificil", index)),
  ];
}

function buildRoundingQuestions(): Question[] {
  const easySeeds: Array<[number, RoundingTarget]> = [
    [68, "dezena"],
    [143, "dezena"],
    [247, "centena"],
    [351, "centena"],
    [29, "dezena"],
    [84, "dezena"],
    [765, "centena"],
    [1249, "centena"],
    [5.6, "unidade"],
    [7.2, "unidade"],
  ];

  const mediumSeeds: Array<[number, RoundingTarget]> = [
    [3.46, "decima"],
    [8.14, "decima"],
    [1648, "centena"],
    [9751, "milhar"],
    [12.78, "unidade"],
    [0.74, "decima"],
    [4.95, "unidade"],
    [18.26, "decima"],
    [5449, "centena"],
    [2850, "centena"],
  ];

  const hardSeeds: Array<[number, RoundingTarget]> = [
    [3.476, "centesima"],
    [7.241, "centesima"],
    [12.995, "centesima"],
    [15.349, "decima"],
    [48.951, "unidade"],
    [0.986, "decima"],
    [2749, "milhar"],
    [6451, "milhar"],
    [14.444, "centesima"],
    [9.995, "unidade"],
  ];

  const makeRoundingQuestion = (value: number, target: RoundingTarget, difficulty: Difficulty, index: number) => {
    const meta = ROUNDING_META[target];
    const correct = roundNumber(Math.round(value / meta.step) * meta.step, meta.digits + 1);
    const roundedDown = roundNumber(Math.floor(value / meta.step) * meta.step, meta.digits + 1);
    const roundedUp = roundNumber(Math.ceil(value / meta.step) * meta.step, meta.digits + 1);

    return buildQuestion(
      makeId("round", difficulty, index),
      ROUNDING_TOPIC,
      difficulty,
      `Arredonda ${formatPtNumber(value)} ${meta.label}.`,
      `Observa o algarismo seguinte ao lugar pedido. Se for 5 ou mais, arredondas para cima.`,
      buildNumericChoices(
        correct,
        [
          correct - meta.step,
          correct + meta.step,
          roundedDown,
          roundedUp,
          correct + meta.step * 2,
          Math.max(0, correct - meta.step * 2),
        ],
        index,
        meta.digits,
      ),
    );
  };

  return [
    ...easySeeds.map(([value, target], index) => makeRoundingQuestion(value, target, "facil", index)),
    ...mediumSeeds.map(([value, target], index) => makeRoundingQuestion(value, target, "medio", index)),
    ...hardSeeds.map(([value, target], index) => makeRoundingQuestion(value, target, "dificil", index)),
  ];
}

function buildFractionComparisonQuestions(): Question[] {
  const easySeeds = [
    ["maior", ["1/5", "3/5", "2/5", "4/5"]],
    ["menor", ["5/6", "2/6", "4/6", "3/6"]],
    ["maior", ["3/8", "3/4", "3/5", "3/6"]],
    ["menor", ["2/3", "2/7", "2/5", "2/4"]],
    ["maior", ["5/9", "7/9", "4/9", "6/9"]],
    ["menor", ["1/2", "1/8", "1/4", "1/3"]],
    ["maior", ["4/10", "9/10", "7/10", "8/10"]],
    ["menor", ["6/7", "1/7", "3/7", "5/7"]],
    ["maior", ["5/12", "5/8", "5/6", "5/10"]],
    ["menor", ["7/9", "7/12", "7/10", "7/8"]],
  ] as const;

  const mediumSeeds = [
    ["maior", ["1/2", "3/5", "2/3", "3/4"]],
    ["menor", ["4/5", "5/6", "2/3", "3/4"]],
    ["maior", ["2/7", "3/8", "4/9", "5/12"]],
    ["menor", ["5/8", "7/10", "3/4", "4/7"]],
    ["maior", ["3/10", "2/5", "5/12", "1/2"]],
    ["menor", ["7/9", "4/5", "5/6", "3/4"]],
    ["maior", ["5/6", "7/8", "8/9", "9/10"]],
    ["menor", ["1/3", "2/7", "3/8", "4/11"]],
    ["maior", ["4/7", "5/9", "6/11", "7/13"]],
    ["menor", ["5/12", "4/9", "3/7", "2/5"]],
  ] as const;

  const hardSeeds = [
    ["maior", ["5/8", "7/12", "9/16", "11/20"]],
    ["menor", ["7/9", "11/14", "13/16", "9/11"]],
    ["maior", ["8/13", "5/8", "7/11", "9/14"]],
    ["menor", ["4/5", "9/11", "11/13", "13/15"]],
    ["maior", ["14/17", "17/21", "19/24", "21/26"]],
    ["menor", ["15/19", "11/13", "17/20", "13/16"]],
    ["maior", ["23/30", "19/25", "27/35", "31/40"]],
    ["menor", ["29/36", "17/21", "21/26", "13/16"]],
    ["maior", ["7/15", "11/24", "13/30", "15/32"]],
    ["menor", ["18/25", "23/32", "28/39", "33/46"]],
  ] as const;

  const makeFractionComparison = (
    type: "maior" | "menor",
    values: readonly [string, string, string, string],
    difficulty: Difficulty,
    index: number,
  ) => {
    const numericValues = values.map(parseFraction);
    const correctValue = type === "maior" ? Math.max(...numericValues) : Math.min(...numericValues);
    const correctIndex = numericValues.findIndex((value) => value === correctValue);

    return buildFixedOptionsQuestion(
      makeId("fraccomp", difficulty, index),
      FRACTION_COMPARE_TOPIC,
      difficulty,
      `Qual é a ${type === "maior" ? "maior" : "menor"} fração?`,
      "Quando os denominadores são diferentes, podes comparar as frações transformando-as em partes equivalentes do mesmo tamanho.",
      [...values] as [string, string, string, string],
      correctIndex,
    );
  };

  return [
    ...easySeeds.map(([type, values], index) => makeFractionComparison(type, values, "facil", index)),
    ...mediumSeeds.map(([type, values], index) => makeFractionComparison(type, values, "medio", index)),
    ...hardSeeds.map(([type, values], index) => makeFractionComparison(type, values, "dificil", index)),
  ];
}

function buildFractionOperationQuestions(): Question[] {
  const easySeeds = [
    [2, 7, 3, 7, "+"],
    [5, 9, 2, 9, "-"],
    [1, 8, 4, 8, "+"],
    [7, 10, 3, 10, "-"],
    [3, 11, 5, 11, "+"],
    [9, 12, 4, 12, "-"],
    [2, 5, 1, 5, "+"],
    [6, 13, 2, 13, "-"],
    [4, 15, 7, 15, "+"],
    [11, 20, 5, 20, "-"],
  ] as const;

  const mediumSeeds = [
    [1, 2, 1, 4, "+"],
    [5, 6, 1, 3, "-"],
    [3, 4, 1, 8, "+"],
    [7, 10, 1, 5, "-"],
    [2, 3, 1, 6, "+"],
    [11, 12, 1, 4, "-"],
    [3, 5, 1, 10, "+"],
    [5, 8, 1, 4, "-"],
    [7, 9, 1, 3, "+"],
    [13, 15, 1, 5, "-"],
  ] as const;

  const hardSeeds = [
    [1, 3, 1, 5, "+"],
    [3, 4, 1, 6, "-"],
    [2, 7, 3, 14, "+"],
    [5, 6, 1, 8, "-"],
    [4, 9, 5, 12, "+"],
    [7, 10, 1, 4, "-"],
    [5, 12, 2, 3, "+"],
    [11, 15, 1, 6, "-"],
    [3, 8, 5, 6, "+"],
    [7, 9, 5, 12, "-"],
  ] as const;

  const makeOperationQuestion = (
    firstNumerator: number,
    firstDenominator: number,
    secondNumerator: number,
    secondDenominator: number,
    operator: "+" | "-",
    difficulty: Difficulty,
    index: number,
  ) => {
    const commonDenominator = lcm(firstDenominator, secondDenominator);
    const normalizedFirst = firstNumerator * (commonDenominator / firstDenominator);
    const normalizedSecond = secondNumerator * (commonDenominator / secondDenominator);
    const resultNumerator =
      operator === "+" ? normalizedFirst + normalizedSecond : normalizedFirst - normalizedSecond;
    const correct = formatFractionOrWhole(resultNumerator, commonDenominator);
    const wrongDenominator = firstDenominator + secondDenominator;
    const mixedNumerator = operator === "+" ? firstNumerator + secondNumerator : firstNumerator - secondNumerator;
    const wrongCrossNumerator =
      operator === "+" ? normalizedFirst + normalizedSecond : Math.abs(normalizedFirst + normalizedSecond);

    return buildQuestion(
      makeId("fracop", difficulty, index),
      FRACTION_OPERATIONS_TOPIC,
      difficulty,
      `Quanto é ${fraction(firstNumerator, firstDenominator)} ${operator} ${fraction(secondNumerator, secondDenominator)}?`,
      `Primeiro coloca as frações com o mesmo denominador. Depois juntas ou retiras apenas os numeradores.`,
      buildChoices(
        correct,
        [
          mixedNumerator > 0 ? formatFractionOrWhole(mixedNumerator, wrongDenominator) : null,
          formatFractionOrWhole(wrongCrossNumerator, firstDenominator * secondDenominator),
          resultNumerator > 1 ? formatFractionOrWhole(resultNumerator - 1, commonDenominator) : null,
          formatFractionOrWhole(resultNumerator + 1, commonDenominator),
          formatFractionOrWhole(Math.abs(normalizedFirst - normalizedSecond) || 1, commonDenominator),
        ],
        index,
      ),
    );
  };

  return [
    ...easySeeds.map(([a, b, c, d, operator], index) => makeOperationQuestion(a, b, c, d, operator, "facil", index)),
    ...mediumSeeds.map(([a, b, c, d, operator], index) => makeOperationQuestion(a, b, c, d, operator, "medio", index)),
    ...hardSeeds.map(([a, b, c, d, operator], index) => makeOperationQuestion(a, b, c, d, operator, "dificil", index)),
  ];
}

function buildNaturalByFractionQuestions(): Question[] {
  const easySeeds = [
    [2, 1, 4],
    [3, 1, 3],
    [4, 2, 5],
    [5, 1, 2],
    [6, 1, 6],
    [3, 2, 7],
    [4, 3, 8],
    [2, 3, 4],
    [5, 1, 5],
    [7, 2, 3],
  ] as const;

  const mediumSeeds = [
    [6, 5, 6],
    [4, 5, 8],
    [3, 4, 9],
    [8, 3, 10],
    [5, 7, 12],
    [9, 2, 7],
    [6, 5, 9],
    [7, 4, 11],
    [8, 7, 16],
    [10, 3, 8],
  ] as const;

  const hardSeeds = [
    [12, 5, 18],
    [9, 7, 12],
    [11, 4, 15],
    [14, 3, 7],
    [15, 5, 12],
    [16, 7, 20],
    [18, 11, 27],
    [20, 9, 14],
    [24, 5, 16],
    [25, 7, 18],
  ] as const;

  const makeNaturalByFractionQuestion = (
    natural: number,
    numerator: number,
    denominator: number,
    difficulty: Difficulty,
    index: number,
  ) => {
    const correctNumerator = natural * numerator;

    return buildQuestion(
      makeId("natfrac", difficulty, index),
      NATURAL_BY_FRACTION_TOPIC,
      difficulty,
      `Quanto é ${natural} × ${fraction(numerator, denominator)}?`,
      `Multiplica o número natural pelo numerador e mantém o denominador.`,
      buildChoices(
        formatFractionOrWhole(correctNumerator, denominator),
        [
          formatFractionOrWhole(correctNumerator + denominator, denominator),
          formatFractionOrWhole(correctNumerator, denominator + 1),
          formatFractionOrWhole(natural + numerator, denominator),
        ],
        index,
      ),
    );
  };

  return [
    ...easySeeds.map(([natural, numerator, denominator], index) =>
      makeNaturalByFractionQuestion(natural, numerator, denominator, "facil", index),
    ),
    ...mediumSeeds.map(([natural, numerator, denominator], index) =>
      makeNaturalByFractionQuestion(natural, numerator, denominator, "medio", index),
    ),
    ...hardSeeds.map(([natural, numerator, denominator], index) =>
      makeNaturalByFractionQuestion(natural, numerator, denominator, "dificil", index),
    ),
  ];
}

function decimalPlaces(value: number): number {
  const stringValue = value.toString();
  const [, fractionalPart = ""] = stringValue.split(".");
  return fractionalPart.length;
}

function wholeDigitsValue(value: number): number {
  return Number(value.toString().replace(".", ""));
}

function buildDecimalMultiplicationQuestions(): Question[] {
  const easySeeds = [
    [1.2, 3],
    [0.4, 5],
    [2.5, 2],
    [0.7, 6],
    [1.5, 4],
    [0.8, 3],
    [2.4, 2],
    [3.5, 2],
    [0.25, 4],
    [1.1, 5],
  ] as const;

  const mediumSeeds = [
    [1.2, 0.4],
    [2.5, 1.2],
    [0.6, 0.7],
    [3.4, 0.5],
    [1.8, 1.5],
    [2.2, 0.3],
    [4.5, 0.2],
    [0.9, 0.8],
    [2.4, 1.1],
    [3.6, 0.4],
  ] as const;

  const hardSeeds = [
    [1.25, 0.8],
    [0.75, 1.2],
    [2.35, 0.4],
    [0.48, 2.5],
    [3.06, 0.3],
    [1.75, 1.6],
    [0.84, 0.25],
    [2.08, 1.4],
    [4.2, 0.06],
    [0.125, 8],
  ] as const;

  const makeDecimalMultiplicationQuestion = (
    first: number,
    second: number,
    difficulty: Difficulty,
    index: number,
  ) => {
    const correct = roundNumber(first * second);
    const totalDecimalPlaces = decimalPlaces(first) + decimalPlaces(second);
    const integerProduct = wholeDigitsValue(first) * wholeDigitsValue(second);

    return buildQuestion(
      makeId("decmult", difficulty, index),
      DECIMAL_MULTIPLICATION_TOPIC,
      difficulty,
      `Quanto é ${formatPtNumber(first)} × ${formatPtNumber(second)}?`,
      "Multiplica como se fossem números inteiros e depois coloca a vírgula contando o total de casas decimais dos fatores.",
      buildNumericChoices(
        correct,
        [
          integerProduct,
          integerProduct / 10 ** Math.max(0, totalDecimalPlaces - 1),
          integerProduct / 10 ** (totalDecimalPlaces + 1),
          first + second,
        ],
        index,
      ),
    );
  };

  return [
    ...easySeeds.map(([first, second], index) => makeDecimalMultiplicationQuestion(first, second, "facil", index)),
    ...mediumSeeds.map(([first, second], index) => makeDecimalMultiplicationQuestion(first, second, "medio", index)),
    ...hardSeeds.map(([first, second], index) => makeDecimalMultiplicationQuestion(first, second, "dificil", index)),
  ];
}

function buildDecimalDivisionQuestions(): Question[] {
  const easySeeds = [
    [4.8, 2],
    [7.5, 5],
    [0.9, 3],
    [6.4, 4],
    [8.4, 2],
    [5.5, 11],
    [3.6, 6],
    [9.8, 2],
    [2.4, 8],
    [1.2, 4],
  ] as const;

  const mediumSeeds = [
    [4.8, 0.6],
    [7.2, 1.2],
    [3.15, 0.5],
    [6.4, 0.8],
    [9.9, 1.1],
    [5.46, 0.7],
    [2.52, 0.9],
    [8.25, 2.5],
    [1.92, 0.3],
    [7.56, 0.6],
  ] as const;

  const hardSeeds = [
    [2.304, 0.8],
    [0.675, 0.25],
    [9.36, 1.2],
    [4.704, 0.6],
    [1.485, 0.15],
    [6.006, 0.3],
    [0.864, 0.12],
    [5.625, 0.75],
    [3.192, 0.08],
    [7.128, 0.24],
  ] as const;

  const makeDecimalDivisionQuestion = (
    dividend: number,
    divisor: number,
    difficulty: Difficulty,
    index: number,
  ) => {
    const correct = roundNumber(dividend / divisor);

    return buildQuestion(
      makeId("decdiv", difficulty, index),
      DECIMAL_DIVISION_TOPIC,
      difficulty,
      `Quanto é ${formatPtNumber(dividend)} ÷ ${formatPtNumber(divisor)}?`,
      "Podes deslocar a vírgula de ambos os números da mesma forma até o divisor ficar inteiro.",
      buildNumericChoices(
        correct,
        [
          dividend * divisor,
          correct * 10,
          correct / 10,
          dividend / Math.round(divisor),
        ],
        index,
      ),
    );
  };

  return [
    ...easySeeds.map(([dividend, divisor], index) => makeDecimalDivisionQuestion(dividend, divisor, "facil", index)),
    ...mediumSeeds.map(([dividend, divisor], index) => makeDecimalDivisionQuestion(dividend, divisor, "medio", index)),
    ...hardSeeds.map(([dividend, divisor], index) => makeDecimalDivisionQuestion(dividend, divisor, "dificil", index)),
  ];
}

function buildQuestionBank(): Question[] {
  const questions = [
    ...buildEquivalentQuestions(),
    ...buildSimplificationQuestions(),
    ...buildPercentageQuestions(),
    ...buildDecimalComparisonQuestions(),
    ...buildRoundingQuestions(),
    ...buildFractionComparisonQuestions(),
    ...buildFractionOperationQuestions(),
    ...buildNaturalByFractionQuestions(),
    ...buildDecimalMultiplicationQuestions(),
    ...buildDecimalDivisionQuestions(),
  ];

  validateQuestionBank(questions);

  return questions;
}

function validateQuestionBank(questions: Question[]): void {
  assert(questions.length === 300, `O banco deve ter 300 perguntas e tem ${questions.length}.`);

  const ids = new Set<string>();
  const difficultyCount = new Map<Difficulty, number>();
  const topicDifficultyCount = new Map<string, number>();

  for (const question of questions) {
    assert(question.options.length === 4, `A pergunta ${question.id} não tem 4 opções.`);
    assert(new Set(question.options).size === 4, `A pergunta ${question.id} tem opções repetidas.`);
    assert(question.correctIndex >= 0 && question.correctIndex < 4, `A pergunta ${question.id} tem índice inválido.`);
    assert(question.prompt.length > 0, `A pergunta ${question.id} não tem enunciado.`);
    assert(question.explanation.length > 0, `A pergunta ${question.id} não tem explicação.`);
    assert(!ids.has(question.id), `ID repetido: ${question.id}.`);

    ids.add(question.id);
    difficultyCount.set(question.difficulty, (difficultyCount.get(question.difficulty) ?? 0) + 1);

    const compositeKey = `${question.topic}-${question.difficulty}`;
    topicDifficultyCount.set(compositeKey, (topicDifficultyCount.get(compositeKey) ?? 0) + 1);
  }

  for (const difficulty of DIFFICULTIES) {
    assert(difficultyCount.get(difficulty) === 100, `A dificuldade ${difficulty} deve ter 100 perguntas.`);
  }

  for (const topic of TOPICS) {
    for (const difficulty of DIFFICULTIES) {
      const compositeKey = `${topic}-${difficulty}`;
      assert(
        topicDifficultyCount.get(compositeKey) === 10,
        `O tópico ${topic} com dificuldade ${difficulty} deve ter 10 perguntas.`,
      );
    }
  }
}

export const QUESTION_BANK = buildQuestionBank();

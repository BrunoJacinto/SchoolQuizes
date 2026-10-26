import type { Difficulty, Question } from "@/types/game";

type Seed = [Difficulty, string, string[], number, string];

const topics: Array<[string, Seed[]]> = [
  ["Decomposição em fatores primos", [
    ["facil", "Qual é a decomposição de 12 em fatores primos?", ["2² × 3", "2 × 6", "3 × 4", "2³ × 3"], 0, "12 = 2 × 2 × 3 = 2² × 3."],
    ["facil", "Qual é a decomposição de 30 em fatores primos?", ["2 × 3 × 5", "3 × 10", "2 × 15", "2 × 3² × 5"], 0, "30 = 2 × 3 × 5, e todos são primos."],
    ["facil", "Qual é a decomposição de 49 em fatores primos?", ["7²", "7 × 2", "1 × 49", "7³"], 0, "49 = 7 × 7 = 7²."],
    ["medio", "Qual é a decomposição de 84 em fatores primos?", ["2² × 3 × 7", "2 × 3 × 14", "4 × 21", "2³ × 3 × 7"], 0, "84 = 2 × 2 × 3 × 7 = 2² × 3 × 7."],
    ["medio", "Qual é a decomposição de 180 em fatores primos?", ["2² × 3² × 5", "2 × 3 × 30", "2² × 9 × 5", "2³ × 3² × 5"], 0, "180 = 2² × 3² × 5."],
    ["dificil", "Qual é a decomposição de 360 em fatores primos?", ["2³ × 3² × 5", "2² × 3³ × 5", "2³ × 3 × 5²", "2 × 3² × 60"], 0, "360 = 8 × 45 = 2³ × 3² × 5."],
    ["dificil", "Qual é a decomposição de 252 em fatores primos?", ["2² × 3² × 7", "2 × 3² × 14", "2² × 3 × 21", "2³ × 3² × 7"], 0, "252 = 4 × 63 = 2² × 3² × 7."],
  ]],
  ["Mínimo múltiplo comum", [
    ["facil", "Qual é o mínimo múltiplo comum de 4 e 6?", ["12", "24", "2", "10"], 0, "Os múltiplos comuns começam em 12; é o menor deles."],
    ["facil", "Qual é o mínimo múltiplo comum de 5 e 10?", ["10", "50", "5", "15"], 0, "10 é múltiplo de 5 e de 10."],
    ["facil", "Qual é o mínimo múltiplo comum de 3 e 8?", ["24", "11", "48", "1"], 0, "Como 3 e 8 não têm fatores primos comuns, m.m.c. = 3 × 8 = 24."],
    ["medio", "Calcula o mínimo múltiplo comum de 12 e 18.", ["36", "6", "216", "30"], 0, "12 = 2² × 3 e 18 = 2 × 3²; m.m.c. = 2² × 3² = 36."],
    ["medio", "Dois autocarros partem juntos. Um passa de 15 em 15 minutos e outro de 20 em 20. Quando voltam a coincidir?", ["60 minutos", "35 minutos", "300 minutos", "5 minutos"], 0, "m.m.c.(15,20) = 60 minutos."],
    ["dificil", "Qual é o mínimo múltiplo comum de 24 e 90?", ["360", "180", "2160", "6"], 0, "24 = 2³ × 3 e 90 = 2 × 3² × 5; m.m.c. = 2³ × 3² × 5 = 360."],
    ["dificil", "Uma luz pisca de 18 em 18 segundos e outra de 24 em 24. Se piscam agora juntas, daqui a quanto tempo voltam a piscar juntas?", ["72 segundos", "42 segundos", "432 segundos", "6 segundos"], 0, "m.m.c.(18,24) = 72 segundos."],
  ]],
  ["Máximo divisor comum", [
    ["facil", "Qual é o máximo divisor comum de 8 e 12?", ["4", "2", "24", "1"], 0, "Os divisores comuns são 1, 2 e 4; o maior é 4."],
    ["facil", "Qual é o máximo divisor comum de 9 e 15?", ["3", "5", "45", "1"], 0, "Os divisores comuns são 1 e 3; o maior é 3."],
    ["facil", "Qual é o máximo divisor comum de 7 e 10?", ["1", "70", "7", "2"], 0, "Não têm divisores comuns além de 1."],
    ["medio", "Calcula o máximo divisor comum de 24 e 36.", ["12", "6", "72", "4"], 0, "24 = 2³ × 3 e 36 = 2² × 3²; m.d.c. = 2² × 3 = 12."],
    ["medio", "Há 30 maçãs e 42 peras para fazer cabazes iguais, sem sobrar fruta. Qual é o maior número de cabazes?", ["6", "210", "12", "3"], 0, "O maior número é m.d.c.(30,42) = 6."],
    ["dificil", "Qual é o máximo divisor comum de 84 e 126?", ["42", "14", "252", "21"], 0, "84 = 2² × 3 × 7 e 126 = 2 × 3² × 7; m.d.c. = 2 × 3 × 7 = 42."],
    ["dificil", "Uma fita de 96 cm e outra de 144 cm serão cortadas em pedaços iguais, do maior comprimento possível. Qual será esse comprimento?", ["48 cm", "24 cm", "1 440 cm", "12 cm"], 0, "O maior comprimento é m.d.c.(96,144) = 48 cm."],
  ]],
  ["Multiplicação de potências com a mesma base", [
    ["facil", "Quanto é 2³ × 2²?", ["2⁵", "4⁵", "2", "2⁶"], 0, "Mantém-se a base e somam-se os expoentes: 3 + 2 = 5."],
    ["facil", "Quanto é 5² × 5³?", ["5⁵", "25⁶", "5", "5⁶"], 0, "5² × 5³ = 5²⁺³ = 5⁵."],
    ["facil", "Quanto é 10¹ × 10⁴?", ["10⁵", "100⁴", "10³", "10⁴"], 0, "Somam-se os expoentes: 1 + 4 = 5."],
    ["medio", "Escreve como uma só potência: 3⁴ × 3³.", ["3⁷", "9⁷", "3¹²", "3"], 0, "Mantém-se a base 3 e somam-se os expoentes: 4 + 3 = 7."],
    ["medio", "Calcula: 2⁴ × 2³.", ["128", "64", "32", "256"], 0, "2⁴ × 2³ = 2⁷ = 128."],
    ["dificil", "Qual é o valor de 4² × 4³?", ["1 024", "256", "4⁶", "64"], 0, "4² × 4³ = 4⁵ = 1 024."],
    ["dificil", "Simplifica: 7² × 7 × 7³.", ["7⁶", "7⁵", "49⁶", "7⁹"], 0, "7 = 7¹; somam-se os expoentes: 2 + 1 + 3 = 6."],
  ]],
  ["Divisão de potências com a mesma base", [
    ["facil", "Quanto é 2⁵ ÷ 2²?", ["2³", "2⁷", "1³", "2²"], 0, "Mantém-se a base e subtraem-se os expoentes: 5 − 2 = 3."],
    ["facil", "Quanto é 10⁴ ÷ 10²?", ["10²", "10⁶", "1²", "10³"], 0, "10⁴ ÷ 10² = 10⁴⁻² = 10²."],
    ["facil", "Quanto é 5³ ÷ 5?", ["5²", "5⁴", "1²", "5"], 0, "5 = 5¹; 5³ ÷ 5¹ = 5²."],
    ["medio", "Calcula: 3⁵ ÷ 3³.", ["9", "27", "3⁸", "3"], 0, "3⁵ ÷ 3³ = 3² = 9."],
    ["medio", "Escreve como uma só potência: 8⁶ ÷ 8⁴.", ["8²", "8¹⁰", "2²", "8³"], 0, "Subtraem-se os expoentes: 6 − 4 = 2."],
    ["dificil", "Qual é o valor de 4⁵ ÷ 4³?", ["16", "64", "4⁸", "4"], 0, "4⁵ ÷ 4³ = 4² = 16."],
    ["dificil", "Simplifica: 9⁷ ÷ 9² ÷ 9³.", ["9²", "9⁸", "9¹²", "9³"], 0, "Na divisão sucessiva, subtraem-se os expoentes: 7 − 2 − 3 = 2."],
  ]],
  ["Multiplicação de potências com o mesmo expoente", [
    ["facil", "Quanto é 2³ × 5³?", ["10³", "7³", "10⁶", "2³⁵³"], 0, "Mantém-se o expoente e multiplicam-se as bases: (2 × 5)³ = 10³."],
    ["facil", "Quanto é 3² × 4²?", ["12²", "7²", "12⁴", "3²⁴²"], 0, "(3 × 4)² = 12²."],
    ["facil", "Quanto é 2⁴ × 3⁴?", ["6⁴", "5⁴", "6⁸", "2⁷"], 0, "(2 × 3)⁴ = 6⁴."],
    ["medio", "Escreve como uma só potência: 5³ × 2³.", ["10³", "7³", "10⁶", "3¹⁰"], 0, "Multiplicam-se as bases e mantém-se o expoente: (5 × 2)³."],
    ["medio", "Calcula: 2² × 3².", ["36", "12", "144", "25"], 0, "2² × 3² = (2 × 3)² = 6² = 36."],
    ["dificil", "Qual é o valor de 2⁵ × 3⁵?", ["7 776", "777", "6¹⁰", "243"], 0, "(2 × 3)⁵ = 6⁵ = 7 776."],
    ["dificil", "Simplifica e calcula: 2³ × 5³ × 10³.", ["1 000 000", "100 000", "17³", "10⁹"], 0, "(2 × 5 × 10)³ = 100³ = 1 000 000."],
  ]],
  ["Divisão de potências com o mesmo expoente", [
    ["facil", "Quanto é 10³ ÷ 2³?", ["5³", "8³", "5", "10"], 0, "Mantém-se o expoente e dividem-se as bases: (10 ÷ 2)³ = 5³."],
    ["facil", "Quanto é 8² ÷ 4²?", ["2²", "4²", "2", "8"], 0, "(8 ÷ 4)² = 2²."],
    ["facil", "Quanto é 9² ÷ 3²?", ["3²", "6²", "3", "9"], 0, "(9 ÷ 3)² = 3²."],
    ["medio", "Calcula: 12² ÷ 3².", ["16", "4", "144", "9"], 0, "12² ÷ 3² = (12 ÷ 3)² = 4² = 16."],
    ["medio", "Escreve como uma só potência: 20³ ÷ 4³.", ["5³", "16³", "5", "4³"], 0, "Dividem-se as bases e mantém-se o expoente: (20 ÷ 4)³."],
    ["dificil", "Qual é o valor de 15² ÷ 5²?", ["9", "3", "225", "10"], 0, "(15 ÷ 5)² = 3² = 9."],
    ["dificil", "Simplifica e calcula: 24² ÷ 6² ÷ 2².", ["4", "16", "2", "36"], 0, "(24 ÷ 6 ÷ 2)² = 2² = 4."],
  ]],
  ["Polígonos côncavos e convexos", [
    ["facil", "Num polígono convexo, como são os ângulos internos?", ["Todos menores que 180°", "Pelo menos um maior que 180°", "Todos iguais a 180°", "Não tem ângulos internos"], 0, "Num polígono convexo, todos os ângulos internos são menores que 180°."],
    ["facil", "Um polígono tem uma reentrância e um ângulo interno maior que 180°. Como se classifica?", ["Côncavo", "Convexo", "Regular", "Equilátero"], 0, "A reentrância corresponde a um ângulo interno maior que 180°, logo é côncavo."],
    ["facil", "Qual destas figuras é sempre convexa?", ["Triângulo", "Polígono com reentrância", "Polígono com ângulo de 200°", "Estrela côncava"], 0, "Todos os triângulos são convexos: nenhum ângulo interno pode atingir 180°."],
    ["medio", "Ao traçar qualquer segmento entre dois pontos de um polígono, o segmento fica sempre no seu interior. Qual é a classificação?", ["Convexo", "Côncavo", "Irregular", "Aberto"], 0, "Esta é uma propriedade dos polígonos convexos."],
    ["medio", "Um polígono tem um ângulo interno de 225°. É côncavo ou convexo?", ["Côncavo", "Convexo", "Regular", "Não é um polígono"], 0, "Um ângulo interno maior que 180° indica uma reentrância: é côncavo."],
    ["dificil", "Qual afirmação é verdadeira sobre um polígono côncavo?", ["Existe um segmento entre dois pontos do polígono que sai da região interior", "Todos os ângulos internos são menores que 180°", "Todos os lados têm o mesmo comprimento", "Tem sempre 5 lados"], 0, "Num polígono côncavo, há uma reentrância; um segmento adequado pode passar pelo exterior."],
    ["dificil", "Um polígono não tem reentrâncias e todos os seus ângulos internos são menores que 180°. Como se classifica?", ["Convexo", "Côncavo", "Irregular", "Regular"], 0, "Sem reentrâncias e com todos os ângulos internos menores que 180°, é convexo."],
  ]],
  ["Polígonos regulares e irregulares", [
    ["facil", "O que têm em comum todos os lados e ângulos de um polígono regular?", ["São todos iguais", "São todos diferentes", "Só os lados são iguais", "Só os ângulos são iguais"], 0, "Num polígono regular, todos os lados e todos os ângulos internos são iguais."],
    ["facil", "Um quadrado é um polígono…", ["Regular", "Irregular", "Côncavo", "Com cinco lados"], 0, "O quadrado tem lados iguais e ângulos internos iguais; é regular."],
    ["facil", "Um polígono com lados de comprimentos diferentes é…", ["Irregular", "Regular", "Côncavo", "Equilátero"], 0, "Para ser regular, todos os lados e todos os ângulos têm de ser iguais."],
    ["medio", "Um losango que não é quadrado tem todos os lados iguais. É regular?", ["Não, porque os ângulos não são todos iguais", "Sim, porque os lados são iguais", "Sim, qualquer losango é regular", "Não, porque tem quatro lados"], 0, "Um polígono regular precisa de lados e ângulos iguais; esse losango não tem ângulos todos iguais."],
    ["medio", "Um pentágono tem todos os lados e ângulos iguais. Como se classifica?", ["Regular", "Irregular", "Côncavo", "Não é um polígono"], 0, "Tem os lados e ângulos iguais, por isso é regular."],
    ["dificil", "Qual é a condição necessária para um polígono ser regular?", ["Ser equilátero e equiângulo", "Ter pelo menos um par de lados iguais", "Ser côncavo e equilátero", "Ter todos os ângulos diferentes"], 0, "Um polígono regular é simultaneamente equilátero (lados iguais) e equiângulo (ângulos iguais)."],
    ["dificil", "Um hexágono tem seis lados iguais, mas dois ângulos diferentes dos restantes. É…", ["Irregular", "Regular", "Côncavo, necessariamente", "Um quadrilátero"], 0, "Não basta ter os lados iguais: os ângulos também têm de ser todos iguais."],
  ]],
];

export const MATH_6_QUESTION_BANK: Question[] = topics.flatMap(([topic, seeds], topicIndex) =>
  seeds.map(([difficulty, prompt, options, correctIndex, explanation], index) => ({
    id: `6ano-${topicIndex + 1}-${index + 1}`,
    topic,
    difficulty,
    prompt,
    options: options as Question["options"],
    correctIndex,
    explanation,
  })),
);

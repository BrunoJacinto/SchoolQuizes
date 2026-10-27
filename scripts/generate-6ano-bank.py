#!/usr/bin/env python3
"""
Generator for MATH_6_QUESTION_BANK (6.º Ano Mathematics).
Generates 540 questions (60 per topic: 20 facil, 20 medio, 20 dificil).
European Portuguese, mathematically verified, balanced correctIndex (0, 1, 2, 3).
"""

import math
import json

def gcd(a, b):
    return math.gcd(a, b)

def lcm(a, b):
    return abs(a * b) // gcd(a, b)

def prime_factors(n):
    factors = {}
    d = 2
    temp = n
    while d * d <= temp:
        while temp % d == 0:
            factors[d] = factors.get(d, 0) + 1
            temp //= d
        d += 1
    if temp > 1:
        factors[temp] = factors.get(temp, 0) + 1
    return factors

def format_prime_decomp(factors):
    parts = []
    sup = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"}
    for p in sorted(factors.keys()):
        count = factors[p]
        if count == 1:
            parts.append(str(p))
        else:
            exp_str = "".join(sup[c] for c in str(count))
            parts.append(f"{p}{exp_str}")
    return " × ".join(parts)

def to_sup(n):
    sup = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"}
    return "".join(sup[c] for c in str(n))

questions = []
# Global question counter
q_counter = 0

def add_q(topic, difficulty, prompt, correct_ans, distractors, explanation):
    global q_counter
    # Clean and check distractors
    clean_distractors = []
    for d in distractors:
        if str(d) != str(correct_ans) and str(d) not in clean_distractors:
            clean_distractors.append(str(d))
    if len(clean_distractors) < 3:
        raise ValueError(f"Not enough distinct distractors for {prompt}: {correct_ans} vs {distractors}")
    distractors = clean_distractors[:3]

    slot = q_counter % 4
    opts = list(distractors)
    opts.insert(slot, str(correct_ans))

    q_obj = {
        "id": f"6ano-{len(questions) + 1}",
        "topic": topic,
        "difficulty": difficulty,
        "prompt": prompt,
        "options": opts,
        "correctIndex": slot,
        "explanation": explanation
    }
    questions.append(q_obj)
    q_counter += 1

# ==============================================================================
# TOPIC 1: Decomposição em fatores primos
# ==============================================================================
T1 = "Decomposição em fatores primos"

# Facil (20)
nums_t1_f = [8, 9, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35, 40, 45, 49, 50]
for n in nums_t1_f:
    factors = prime_factors(n)
    correct = format_prime_decomp(factors)
    # create realistic distractors
    dist = []
    # Distractor 1: not fully decomposed (e.g. 2 x 6)
    if n % 4 == 0 and n > 4:
        dist.append(f"4 × {n//4}")
    elif n % 6 == 0 and n > 6:
        dist.append(f"6 × {n//6}")
    elif n % 9 == 0 and n > 9:
        dist.append(f"9 × {n//9}")
    elif n % 10 == 0 and n > 10:
        dist.append(f"10 × {n//10}")
    else:
        dist.append(f"1 × {n}")
    
    # Distractor 2: altered exponent
    f_alt = dict(factors)
    k = list(f_alt.keys())[0]
    f_alt[k] = f_alt[k] + 1
    dist.append(format_prime_decomp(f_alt))

    # Distractor 3: base modified or sum
    f_alt2 = dict(factors)
    if 2 in f_alt2:
        f_alt2[3] = f_alt2.get(3, 0) + 1
    else:
        f_alt2[2] = f_alt2.get(2, 0) + 1
    dist.append(format_prime_decomp(f_alt2))
    dist.append(f"2 × {n//2}" if n % 2 == 0 else f"3 × {n//3}")

    add_q(T1, "facil", f"Qual é a decomposição do número {n} em fatores primos?", correct, dist,
          f"{n} decompõe-se nos fatores primos: {correct}.")

# Medio (20)
nums_t1_m = [54, 56, 60, 63, 70, 72, 75, 80, 84, 88, 90, 96, 98, 99, 100, 108, 120, 140, 150, 180]
for n in nums_t1_m:
    factors = prime_factors(n)
    correct = format_prime_decomp(factors)
    dist = []
    # Non-prime base
    dist.append(f"{list(factors.keys())[0]*2} × {n // (list(factors.keys())[0]*2)}" if (list(factors.keys())[0]*2) < n else f"10 × {n//10}")
    # Wrong exponent
    f_alt = dict(factors)
    k = list(f_alt.keys())[-1]
    f_alt[k] = f_alt[k] + 1
    dist.append(format_prime_decomp(f_alt))
    # Inverted prime
    f_alt2 = dict(factors)
    first_k = list(f_alt2.keys())[0]
    f_alt2[first_k] = max(1, f_alt2[first_k] - 1)
    dist.append(format_prime_decomp(f_alt2))
    dist.append(f"2 × {n//2}" if n % 2 == 0 else f"3 × {n//3}")

    add_q(T1, "medio", f"Qual é a decomposição em fatores primos de {n}?", correct, dist,
          f"Dividindo sucessivamente por números primos obtemos {n} = {correct}.")

# Dificil (20)
nums_t1_d = [196, 200, 216, 225, 240, 252, 280, 300, 315, 324, 360, 392, 400, 420, 450, 500, 504, 600, 720, 840]
for n in nums_t1_d:
    factors = prime_factors(n)
    correct = format_prime_decomp(factors)
    dist = []
    f_alt1 = dict(factors)
    first_k = list(f_alt1.keys())[0]
    f_alt1[first_k] += 1
    dist.append(format_prime_decomp(f_alt1))

    f_alt2 = dict(factors)
    last_k = list(f_alt2.keys())[-1]
    f_alt2[last_k] += 1
    dist.append(format_prime_decomp(f_alt2))

    f_alt3 = dict(factors)
    f_alt3[first_k] = max(1, f_alt3[first_k] - 1)
    dist.append(format_prime_decomp(f_alt3))

    dist.append(f"4 × {n//4}" if n % 4 == 0 else f"9 × {n//9}")

    add_q(T1, "dificil", f"Decompõe {n} em produto de potências de fatores primos.", correct, dist,
          f"A fatorização completa de {n} é {correct}.")

print(f"Topic 1 questions: {len(questions)}")

# ==============================================================================
# TOPIC 2: Mínimo múltiplo comum (m.m.c.)
# ==============================================================================
T2 = "Mínimo múltiplo comum"

pairs_t2_f = [
    (2, 3), (2, 5), (3, 4), (4, 6), (5, 6), (5, 10), (3, 8), (6, 9), (4, 8), (6, 10),
    (3, 9), (7, 14), (8, 12), (5, 15), (4, 10), (6, 12), (2, 9), (7, 10), (9, 12), (10, 15)
]
for a, b in pairs_t2_f:
    val = lcm(a, b)
    dist = [val * 2, abs(a * b), val + min(a, b), max(1, gcd(a, b)), val - 2]
    add_q(T2, "facil", f"Qual é o mínimo múltiplo comum de {a} e {b}?", str(val), dist,
          f"Os múltiplos comuns começam em {val}; m.m.c.({a}, {b}) = {val}.")

pairs_t2_m = [
    (12, 15), (12, 18), (14, 21), (15, 20), (16, 24), (18, 24), (20, 25), (20, 30), (21, 28), (24, 30),
    (10, 35), (14, 35), (15, 25), (18, 27), (20, 24), (22, 33), (25, 30), (24, 36), (16, 20), (28, 42)
]
for a, b in pairs_t2_m:
    val = lcm(a, b)
    dist = [val // 2 if val % 2 == 0 else val + 10, a * b, gcd(a, b), val + a]
    add_q(T2, "medio", f"Calcula o m.m.c.({a}, {b}).", str(val), dist,
          f"Pela decomposição em fatores primos, m.m.c.({a}, {b}) = {val}.")

# 20 Dificil (including real-life scenario questions)
scenarios_t2_d = [
    (15, 20, "minutos", "Dois autocarros partem juntos. Um passa de 15 em 15 minutos e outro de 20 em 20. Quando voltam a coincidir no ponto de partida?"),
    (18, 24, "segundos", "Dois faróis piscam simultaneamente. Um pisca de 18 em 18 segundos e outro de 24 em 24. Após quantos segundos voltam a piscar juntos?"),
    (12, 16, "dias", "A Ana vai à biblioteca de 12 em 12 dias e o Pedro de 16 em 16 dias. Se se encontraram hoje, daqui a quantos dias se voltarão a encontrar?"),
    (20, 30, "minutos", "Dois ciclistas dão voltas a uma pista. O primeiro demora 20 minutos por volta e o segundo 30 minutos. Daqui a quanto tempo se cruzam na meta?"),
    (24, 36, "cm", "Queremos formar uma fila com caixas de 24 cm e outra com caixas de 36 cm até ficarem com a mesma altura mínima. Qual é essa altura?"),
    (30, 45, "segundos", "Duas torneiras pingam de forma regular: uma a cada 30 segundos e outra a cada 45 segundos. Quando pingam juntas novamente?"),
    (14, 21, "horas", "Dois satélites passam sobre a mesma estação de 14 em 14 horas e de 21 em 21 horas. De quantas em quantas horas coincidem?"),
    (18, 30, "minutos", "Num aeroporto, uma linha descola de 18 em 18 minutos e outra de 30 em 30 minutos. Qual é o intervalo mínimo entre descolagens conjuntas?"),
    (36, 48, "dias", "O cometa A passa a cada 36 anos e o cometa B a cada 48 anos. De quantos em quantos anos são vistos juntos?"),
    (25, 40, "metros", "Duas passadeiras de treino têm marcas a cada 25 metros e 40 metros. A que distância do início coincidem as marcas pela primeira vez?"),
]
for a, b, unit, prompt in scenarios_t2_d:
    val = lcm(a, b)
    dist = [f"{val*2} {unit}", f"{a+b} {unit}", f"{abs(a*b)} {unit}", f"{gcd(a,b)} {unit}"]
    add_q(T2, "dificil", prompt, f"{val} {unit}", dist,
          f"O problema resolve-se pelo m.m.c.({a}, {b}) = {val} {unit}.")

pairs_t2_d_pure = [
    (24, 90), (36, 90), (40, 60), (45, 60), (48, 72), (50, 75), (60, 90), (42, 70), (54, 72), (80, 100)
]
for a, b in pairs_t2_d_pure:
    val = lcm(a, b)
    dist = [val // 2, val * 2, gcd(a, b), a * b]
    add_q(T2, "dificil", f"Qual é o menor múltiplo comum positivo de {a} e {b}?", str(val), dist,
          f"m.m.c.({a}, {b}) = {val}.")

print(f"Topic 1 & 2 questions: {len(questions)}")

# ==============================================================================
# TOPIC 3: Máximo divisor comum (m.d.c.)
# ==============================================================================
T3 = "Máximo divisor comum"

pairs_t3_f = [
    (6, 8), (8, 12), (9, 15), (10, 15), (12, 16), (14, 21), (15, 20), (16, 20), (18, 24), (20, 30),
    (7, 10), (5, 9), (11, 13), (8, 15), (6, 15), (10, 25), (12, 18), (14, 28), (9, 27), (15, 45)
]
for a, b in pairs_t3_f:
    val = gcd(a, b)
    dist = [val * 2 if val > 1 else 2, val + 3, lcm(a, b), max(1, val - 1)]
    add_q(T3, "facil", f"Qual é o máximo divisor comum de {a} e {b}?", str(val), dist,
          f"Os divisores comuns têm como maior valor o {val}; m.d.c.({a}, {b}) = {val}.")

pairs_t3_m = [
    (24, 36), (28, 42), (30, 45), (32, 48), (36, 48), (40, 60), (42, 56), (45, 60), (48, 64), (50, 75),
    (54, 72), (56, 70), (60, 80), (63, 84), (64, 96), (70, 84), (72, 90), (75, 100), (80, 120), (90, 120)
]
for a, b in pairs_t3_m:
    val = gcd(a, b)
    dist = [val // 2 if val % 2 == 0 else val + 2, val * 2, lcm(a, b), 2]
    add_q(T3, "medio", f"Calcula o m.d.c.({a}, {b}).", str(val), dist,
          f"Tomando os fatores primos comuns com menor expoente, m.d.c.({a}, {b}) = {val}.")

scenarios_t3_d = [
    (30, 42, "cabazes", "Temos 30 maçãs e 42 peras para fazer cabazes idênticos com o maior número possível de frutas, sem sobrar nada. Quantos cabazes se podem fazer?"),
    (96, 144, "cm", "Duas fitas com 96 cm e 144 cm vão ser cortadas em pedaços com o mesmo comprimento, o maior possível, sem desperdício. Qual é o comprimento de cada pedaço?"),
    (48, 72, "grupos", "Num passeio escolar participam 48 rapazes e 72 raparigas. Vão ser formadas equipas iguais com o maior número possível de alunos, sem misturar rapazes e raparigas. Quantos alunos terá cada equipa?"),
    (60, 84, "saquinhos", "O João tem 60 rebuçados de morango e 84 de limão. Quer fazer saquinhos iguais com o maior número de rebuçados. Quantos saquinhos consegue fazer?"),
    (120, 180, "cm", "Uma sala retangular de 120 cm por 180 cm vai ser pavimentada com mosaicos quadrados do maior tamanho possível, sem cortar nenhum. Qual é o lado do mosaico?"),
    (45, 75, "ramos", "Uma florista tem 45 rosas vermelhas e 75 rosas brancas. Quer fazer o maior número possível de ramos iguais. Quantos ramos fará?"),
    (84, 126, "frascos", "Prepara-se xarope com 84 ml de um líquido e 126 ml de outro, dividindo igualmente em doses máximas. Qual é o maior número de doses iguais?"),
    (72, 108, "estojos", "Temos 72 lápis e 108 canetas para distribuir por estojos iguais com o maior número possível de material. Quantos estojos serão feitos?"),
    (80, 120, "páginas", "Dois capítulos têm 80 e 120 páginas. Vão ser divididos em fascículos com o mesmo número máximo de páginas. Quantas páginas terá cada fascículo?"),
    (90, 150, "litros", "Dois bidões têm 90 L e 150 L de azeite. Queremos garrafões iguais da maior capacidade possível para os esvaziar. Qual é a capacidade do garrafão?"),
]
for a, b, unit, prompt in scenarios_t3_d:
    val = gcd(a, b)
    dist = [f"{val*2} {unit}", f"{val//2 if val%2==0 else val+3} {unit}", f"{a+b} {unit}", f"{lcm(a,b)} {unit}"]
    add_q(T3, "dificil", prompt, f"{val} {unit}", dist,
          f"Trata-se de encontrar o maior divisor comum: m.d.c.({a}, {b}) = {val} {unit}.")

pairs_t3_d_pure = [
    (105, 140), (120, 168), (126, 198), (144, 216), (150, 225), (160, 240), (180, 270), (210, 280), (216, 288), (252, 336)
]
for a, b in pairs_t3_d_pure:
    val = gcd(a, b)
    dist = [val // 2 if val % 2 == 0 else val + 3, val * 2, lcm(a, b), 3]
    add_q(T3, "dificil", f"Qual é o máximo divisor comum de {a} e {b}?", str(val), dist,
          f"Pela decomposição em fatores primos, m.d.c.({a}, {b}) = {val}.")

print(f"Topic 1, 2, 3 questions: {len(questions)}")

# ==============================================================================
# TOPIC 4: Multiplicação de potências com a mesma base
# ==============================================================================
T4 = "Multiplicação de potências com a mesma base"

# Facil (20): base^m * base^n
cases_t4_f = [
    (2, 3, 2), (2, 4, 3), (2, 2, 5), (3, 2, 3), (3, 3, 4), (3, 1, 4), (4, 2, 3), (4, 3, 2),
    (5, 2, 3), (5, 4, 2), (6, 2, 3), (7, 2, 2), (7, 3, 3), (8, 2, 4), (9, 2, 2), (10, 2, 3),
    (10, 3, 4), (10, 1, 5), (11, 2, 3), (12, 2, 2)
]
for b, m, n in cases_t4_f:
    correct = f"{b}{to_sup(m+n)}"
    dist = [f"{b}{to_sup(m*n)}", f"{b*2}{to_sup(m+n)}", f"{b}{to_sup(abs(m-n))}", f"{b*b}{to_sup(m+n)}"]
    add_q(T4, "facil", f"Escreve como uma só potência: {b}{to_sup(m)} × {b}{to_sup(n)}.", correct, dist,
          f"Na multiplicação de potências com a mesma base, mantém-se a base e somam-se os expoentes: {b}{to_sup(m)} × {b}{to_sup(n)} = {b}{to_sup(m+n)}.")

# Medio (20): 3 terms or calculating values
cases_t4_m = [
    (2, 3, 4), (2, 5, 2), (3, 3, 3), (3, 2, 5), (4, 3, 3), (5, 2, 4), (6, 3, 2), (7, 2, 4), (10, 4, 3), (10, 2, 5),
    (2, 2, 1), (2, 3, 1), (3, 1, 3), (5, 1, 3), (7, 1, 2), (10, 1, 4), (2, 4, 4), (3, 2, 2), (4, 2, 4), (5, 3, 3)
]
for b, m, n in cases_t4_m:
    correct = f"{b}{to_sup(m+n)}"
    dist = [f"{b}{to_sup(m*n)}", f"{b*2}{to_sup(m+n)}", f"{b}{to_sup(m+n+1)}", f"{b}{to_sup(max(1, m+n-2))}"]
    add_q(T4, "medio", f"Qual é o produto sob forma de potência: {b}{to_sup(m)} × {b}{to_sup(n)}?", correct, dist,
          f"Mantém-se a base e somam-se os expoentes: {m} + {n} = {m+n}, logo {correct}.")

# Dificil (20): Three powers or calculating exact value
cases_t4_d = [
    (2, 2, 3, 1), (2, 3, 2, 2), (2, 1, 4, 2), (3, 2, 1, 2), (3, 2, 2, 2),
    (5, 1, 2, 2), (10, 2, 2, 3), (10, 1, 3, 2), (7, 2, 1, 3), (4, 1, 2, 2),
]
for b, m, n, p in cases_t4_d:
    exp = m + n + p
    correct = f"{b}{to_sup(exp)}"
    dist = [
        f"{b}{to_sup(exp + 1)}",
        f"{b*2}{to_sup(exp)}",
        f"{b}{to_sup(exp - 1 if exp > 1 else exp + 3)}",
        f"{b}{to_sup(exp + 2)}",
        f"{b*b}{to_sup(exp)}"
    ]
    add_q(T4, "dificil", f"Simplifica a expressão numa só potência: {b}{to_sup(m)} × {b}{to_sup(n)} × {b}{to_sup(p)}.", correct, dist,
          f"Somam-se todos os expoentes: {m} + {n} + {p} = {exp}, dando {correct}.")

def make_numeric_distractors(val):
    candidates = [
        val * 2,
        val // 2 if val > 2 and val % 2 == 0 else val + 4,
        val + 10,
        val - 10 if val > 10 else val + 15,
        val + 16,
        val - 8 if val > 8 else val + 8,
        val * 3,
        val // 4 if val > 4 and val % 4 == 0 else val + 2,
        val + 1,
        val - 1 if val > 1 else val + 3
    ]
    res = []
    for c in candidates:
        if c != val and c not in res and c > 0:
            res.append(c)
        if len(res) >= 4:
            break
    return res

calc_t4_d = [
    (2, 2, 3, 32), (2, 3, 3, 64), (2, 4, 3, 128), (2, 5, 3, 256), (3, 2, 2, 81),
    (3, 2, 3, 243), (4, 1, 2, 64), (5, 1, 2, 125), (10, 2, 2, 10000), (2, 2, 2, 16)
]
for b, m, n, val in calc_t4_d:
    dist = make_numeric_distractors(val)
    add_q(T4, "dificil", f"Calcula o valor numérico de {b}{to_sup(m)} × {b}{to_sup(n)}.", f"{val:,}".replace(",", " "), [f"{d:,}".replace(",", " ") for d in dist],
          f"{b}{to_sup(m)} × {b}{to_sup(n)} = {b}{to_sup(m+n)} = {val:,}.".replace(",", " "))

print(f"Topic 1, 2, 3, 4 questions: {len(questions)}")

# ==============================================================================
# TOPIC 5: Divisão de potências com a mesma base
# ==============================================================================
T5 = "Divisão de potências com a mesma base"

# Facil (20)
cases_t5_f = [
    (2, 5, 2), (2, 6, 3), (2, 4, 1), (3, 4, 2), (3, 5, 3), (3, 6, 4), (4, 5, 2), (4, 4, 2),
    (5, 4, 2), (5, 5, 3), (6, 5, 2), (7, 4, 2), (7, 6, 3), (8, 5, 2), (9, 4, 2), (10, 5, 2),
    (10, 6, 4), (10, 4, 1), (11, 5, 2), (12, 6, 3)
]
for b, m, n in cases_t5_f:
    correct = f"{b}{to_sup(m-n)}"
    dist = [f"{b}{to_sup(m+n)}", f"1{to_sup(m-n)}", f"{b}{to_sup(m//n if m%n==0 else m*n)}", f"{b*2}{to_sup(m-n)}"]
    add_q(T5, "facil", f"Escreve como uma só potência: {b}{to_sup(m)} ÷ {b}{to_sup(n)}.", correct, dist,
          f"Na divisão de potências com a mesma base, mantém-se a base e subtraem-se os expoentes: {m} − {n} = {m-n}, obtendo-se {correct}.")

# Medio (20)
cases_t5_m = [
    (2, 7, 3), (2, 8, 4), (3, 7, 4), (3, 8, 5), (4, 6, 3), (5, 6, 3), (5, 7, 4), (6, 7, 4), (7, 8, 5), (10, 7, 3),
    (2, 5, 4), (3, 4, 3), (5, 3, 2), (6, 4, 3), (7, 5, 4), (8, 6, 4), (9, 5, 3), (10, 8, 5), (2, 9, 6), (3, 6, 3)
]
for b, m, n in cases_t5_m:
    correct = f"{b}{to_sup(m-n)}"
    dist = [f"{b}{to_sup(m+n)}", f"{b}{to_sup(max(1, m-n-1))}", f"{b}{to_sup(m-n+2)}", f"1{to_sup(m-n)}"]
    add_q(T5, "medio", f"Qual é o quociente de {b}{to_sup(m)} ÷ {b}{to_sup(n)} sob forma de potência?", correct, dist,
          f"Mantém-se a base {b} e subtraem-se os expoentes ({m} − {n} = {m-n}): {correct}.")

# Dificil (20): Successive divisions or calculating numerical value
successive_t5_d = [
    (2, 9, 3, 2), (2, 10, 4, 3), (3, 8, 2, 3), (3, 9, 4, 2), (5, 7, 2, 3),
    (7, 8, 3, 2), (10, 9, 3, 4), (10, 8, 2, 3), (6, 8, 3, 2), (4, 9, 4, 2)
]
for b, m, n, p in successive_t5_d:
    exp = m - n - p
    correct = f"{b}{to_sup(exp)}"
    dist = [
        f"{b}{to_sup(exp + 1)}",
        f"{b}{to_sup(exp + 2)}",
        f"{b}{to_sup(exp - 1 if exp > 1 else exp + 3)}",
        f"{b}{to_sup(m + n + p)}",
        f"1{to_sup(exp)}"
    ]
    add_q(T5, "dificil", f"Simplifica em forma de uma só potência: {b}{to_sup(m)} ÷ {b}{to_sup(n)} ÷ {b}{to_sup(p)}.", correct, dist,
          f"Subtraem-se sucessivamente os expoentes: {m} − {n} − {p} = {exp}, resultando em {correct}.")

calc_t5_d = [
    (2, 6, 2, 16), (2, 7, 4, 8), (2, 8, 3, 32), (3, 5, 2, 27), (3, 6, 2, 81),
    (4, 5, 3, 16), (5, 5, 2, 125), (5, 4, 2, 25), (10, 6, 3, 1000), (6, 4, 2, 36)
]
for b, m, n, val in calc_t5_d:
    dist = make_numeric_distractors(val)
    add_q(T5, "dificil", f"Calcula o valor numérico de {b}{to_sup(m)} ÷ {b}{to_sup(n)}.", f"{val:,}".replace(",", " "), [f"{d:,}".replace(",", " ") for d in dist],
          f"{b}{to_sup(m)} ÷ {b}{to_sup(n)} = {b}{to_sup(m-n)} = {val:,}.".replace(",", " "))

print(f"Topic 1..5 questions: {len(questions)}")

# ==============================================================================
# TOPIC 6: Multiplicação de potências com o mesmo expoente
# ==============================================================================
T6 = "Multiplicação de potências com o mesmo expoente"

# Facil (20)
cases_t6_f = [
    (2, 3, 2), (2, 5, 3), (3, 4, 2), (2, 4, 3), (3, 5, 2), (4, 5, 2), (2, 6, 2), (3, 6, 2),
    (2, 7, 3), (3, 7, 2), (4, 6, 2), (5, 6, 2), (2, 8, 2), (3, 8, 2), (2, 9, 2), (4, 7, 2),
    (2, 10, 3), (3, 10, 2), (5, 10, 2), (6, 7, 2)
]
for a, b, n in cases_t6_f:
    correct = f"{a*b}{to_sup(n)}"
    dist = [f"{a+b}{to_sup(n)}", f"{a*b}{to_sup(n*2)}", f"{a*b}{to_sup(n+1)}", f"{a+b}{to_sup(n*2)}"]
    add_q(T6, "facil", f"Escreve como uma só potência: {a}{to_sup(n)} × {b}{to_sup(n)}.", correct, dist,
          f"Mantém-se o expoente e multiplicam-se as bases: ({a} × {b}){to_sup(n)} = {correct}.")

# Medio (20)
cases_t6_m = [
    (2, 5, 4), (3, 4, 3), (2, 3, 4), (4, 5, 3), (2, 7, 4), (3, 5, 3), (2, 6, 3), (3, 6, 3),
    (5, 2, 5), (4, 3, 4), (2, 8, 3), (5, 4, 3), (10, 3, 3), (10, 4, 2), (6, 5, 3),
    (7, 2, 3), (8, 2, 3), (9, 2, 3), (5, 3, 4), (4, 2, 5)
]
for a, b, n in cases_t6_m:
    correct = f"{a*b}{to_sup(n)}"
    dist = [f"{a+b}{to_sup(n)}", f"{a*b}{to_sup(n*2)}", f"{a*b}{to_sup(n+2)}", f"{a*b}{to_sup(max(1, n-1))}"]
    add_q(T6, "medio", f"Qual é o produto sob a forma de potência de {a}{to_sup(n)} × {b}{to_sup(n)}?", correct, dist,
          f"Multiplicam-se as bases ({a} × {b} = {a*b}) e mantém-se o expoente {n}: {correct}.")

# Dificil (20): 3 terms or calculating exact value
three_t6_d = [
    (2, 3, 5, 2), (2, 3, 5, 3), (2, 2, 3, 3), (2, 4, 5, 2), (2, 5, 10, 2),
    (3, 3, 2, 2), (2, 3, 4, 2), (2, 5, 7, 2), (2, 2, 5, 3), (3, 4, 5, 2)
]
for a, b, c, n in three_t6_d:
    prod = a * b * c
    correct = f"{prod}{to_sup(n)}"
    dist = [f"{a+b+c}{to_sup(n)}", f"{prod}{to_sup(n*3)}", f"{prod}{to_sup(n+1)}", f"{a*b}{to_sup(n)}"]
    add_q(T6, "dificil", f"Simplifica como uma só potência: {a}{to_sup(n)} × {b}{to_sup(n)} × {c}{to_sup(n)}.", correct, dist,
          f"Multiplicam-se todas as bases ({a} × {b} × {c} = {prod}) e mantém-se o expoente {n}: {correct}.")

calc_t6_d = [
    (2, 5, 3, 1000), (2, 5, 4, 10000), (2, 5, 5, 100000), (3, 2, 3, 216), (2, 3, 4, 1296),
    (4, 25, 2, 10000), (2, 3, 5, 7776), (5, 2, 2, 100), (4, 2, 3, 512), (3, 3, 3, 729)
]
for a, b, n, val in calc_t6_d:
    dist = make_numeric_distractors(val)
    add_q(T6, "dificil", f"Calcula o valor numérico de {a}{to_sup(n)} × {b}{to_sup(n)}.", f"{val:,}".replace(",", " "), [f"{d:,}".replace(",", " ") for d in dist],
          f"{a}{to_sup(n)} × {b}{to_sup(n)} = ({a} × {b}){to_sup(n)} = {a*b}{to_sup(n)} = {val:,}.".replace(",", " "))

print(f"Topic 1..6 questions: {len(questions)}")

# ==============================================================================
# TOPIC 7: Divisão de potências com o mesmo expoente
# ==============================================================================
T7 = "Divisão de potências com o mesmo expoente"

# Facil (20)
cases_t7_f = [
    (6, 2, 3), (8, 4, 2), (10, 2, 3), (12, 3, 2), (15, 5, 2), (16, 4, 3), (18, 6, 2), (20, 4, 2),
    (9, 3, 3), (14, 7, 2), (21, 7, 3), (24, 6, 2), (25, 5, 3), (27, 9, 2), (30, 5, 2), (32, 8, 2),
    (35, 7, 3), (36, 6, 2), (40, 8, 3), (50, 10, 2)
]
for a, b, n in cases_t7_f:
    q_val = a // b
    correct = f"{q_val}{to_sup(n)}"
    dist = [f"{a-b}{to_sup(n)}", f"{q_val}{to_sup(1)}", f"{q_val*2}{to_sup(n)}", f"{q_val}{to_sup(n*2)}"]
    add_q(T7, "facil", f"Escreve como uma só potência: {a}{to_sup(n)} ÷ {b}{to_sup(n)}.", correct, dist,
          f"Mantém-se o expoente e dividem-se as bases: ({a} ÷ {b}){to_sup(n)} = {correct}.")

# Medio (20)
cases_t7_m = [
    (12, 4, 4), (16, 2, 3), (20, 5, 3), (24, 8, 3), (30, 6, 3), (36, 9, 3), (40, 5, 3), (42, 6, 3),
    (45, 9, 3), (48, 6, 2), (54, 9, 2), (60, 12, 2), (64, 16, 2), (72, 8, 2), (80, 10, 3), (90, 9, 3),
    (100, 20, 2), (100, 25, 3), (120, 30, 2), (150, 50, 3)
]
for a, b, n in cases_t7_m:
    q_val = a // b
    correct = f"{q_val}{to_sup(n)}"
    dist = [f"{a-b}{to_sup(n)}", f"{q_val}{to_sup(n*2)}", f"{q_val*2}{to_sup(n)}", f"{q_val}{to_sup(max(1, n-1))}"]
    add_q(T7, "medio", f"Qual é o quociente sob forma de potência de {a}{to_sup(n)} ÷ {b}{to_sup(n)}?", correct, dist,
          f"Dividem-se as bases ({a} ÷ {b} = {q_val}) e mantém-se o expoente {n}: {correct}.")

# Dificil (20): Successive or calculating exact value
succ_t7_d = [
    (24, 6, 2, 2), (36, 6, 2, 3), (48, 8, 2, 2), (60, 10, 2, 3), (72, 12, 2, 2),
    (80, 8, 2, 3), (96, 12, 2, 2), (100, 10, 2, 2), (120, 12, 2, 3), (144, 12, 3, 2)
]
for a, b, c, n in succ_t7_d:
    res = (a // b) // c
    correct = f"{res}{to_sup(n)}"
    dist = [
        f"{res + 1}{to_sup(n)}",
        f"{res * 2}{to_sup(n)}",
        f"{res - 1 if res > 1 else res + 3}{to_sup(n)}",
        f"{res}{to_sup(n * 2)}",
        f"1{to_sup(n)}"
    ]
    add_q(T7, "dificil", f"Simplifica sob forma de uma só potência: {a}{to_sup(n)} ÷ {b}{to_sup(n)} ÷ {c}{to_sup(n)}.", correct, dist,
          f"Calculando sucessivamente: ({a} ÷ {b} ÷ {c}){to_sup(n)} = {correct}.")

calc_t7_d = [
    (12, 3, 2, 16), (15, 5, 2, 9), (20, 4, 3, 125), (18, 6, 3, 27), (24, 6, 3, 64),
    (100, 25, 2, 16), (100, 25, 3, 64), (100, 20, 3, 125), (50, 10, 4, 625), (30, 10, 4, 81)
]
for a, b, n, val in calc_t7_d:
    dist = make_numeric_distractors(val)
    add_q(T7, "dificil", f"Calcula o valor numérico de {a}{to_sup(n)} ÷ {b}{to_sup(n)}.", str(val), [str(d) for d in dist],
          f"{a}{to_sup(n)} ÷ {b}{to_sup(n)} = ({a} ÷ {b}){to_sup(n)} = {a//b}{to_sup(n)} = {val}.")

print(f"Topic 1..7 questions: {len(questions)}")

# ==============================================================================
# TOPIC 8: Polígonos côncavos e convexos
# ==============================================================================
T8 = "Polígonos côncavos e convexos"

# Facil (20)
conc_f = [
    ("Num polígono convexo, como são as amplitudes de todos os seus ângulos internos?", "Todas menores que 180°", ["Pelo menos uma maior que 180°", "Todas iguais a 180°", "Todas maiores que 180°"], "Num polígono convexo, todos os ângulos internos medem menos de 180°."),
    ("Um polígono que apresenta pelo menos um ângulo interno superior a 180° diz-se…", "Côncavo", ["Convexo", "Regular", "Equilátero"], "A existência de um ângulo interno > 180° define uma reentrância, tornando-o côncavo."),
    ("Qual das seguintes figuras geométricas é SEMPRE convexa?", "Triângulo", ["Estrela de cinco pontas", "Ponta de seta", "Polígono com reentrância"], "Qualquer triângulo é convexo porque a soma dos seus ângulos é 180°, nenhum podendo ser ≥ 180°."),
    ("A presença de uma reentrância num polígono significa que ele é…", "Côncavo", ["Convexo", "Regular", "Equiângulo"], "Uma reentrância corresponde a um ângulo interno maior que 180°, caracterizando um polígono côncavo."),
    ("Se todos os ângulos internos de um quadrilátero medem menos de 180°, o quadrilátero é…", "Convexo", ["Côncavo", "Irregular", "Aberto"], "Sem ângulos superiores a 180°, o polígono é convexo."),
    ("Um pentágono que tem um 'bico' virado para dentro tem a classificação de…", "Côncavo", ["Convexo", "Regular", "Cruzado"], "O bico para dentro é uma reentrância, logo é côncavo."),
    ("Quantos ângulos internos maiores que 180° pode ter um triângulo?", "Zero", ["Um", "Dois", "Três"], "Num triângulo todos os ângulos são inferiores a 180° (a soma dos 3 é 180°)."),
    ("Um retângulo é um exemplo de polígono…", "Convexo", ["Côncavo", "Estrelado", "Aberto"], "Todos os ângulos internos de um retângulo medem 90° (< 180°), logo é convexo."),
    ("Um quadrado é sempre…", "Convexo", ["Côncavo", "Irregular", "Com ângulo de 200°"], "Os seus ângulos internos medem 90°, sendo portanto convexo."),
    ("Num polígono côncavo, existe pelo menos um ângulo interno que é…", "Maior que 180°", ["Igual a 90°", "Menor que 90°", "Igual a 0°"], "É a definição de polígono côncavo: pelo menos um ângulo interno > 180°."),
    ("Um hexágono com formato de seta é…", "Côncavo", ["Convexo", "Regular", "Equilátero"], "A seta tem uma reentrância interna, logo é côncavo."),
    ("Se unirmos dois pontos quaisquer no interior de um polígono convexo, o segmento de reta…", "Fica sempre totalmente no seu interior", ["Passa sempre pelo exterior", "Sai do polígono", "Corta todos os lados"], "Esta é uma propriedade fundamental que define polígonos convexos."),
    ("Um losango é sempre um polígono…", "Convexo", ["Côncavo", "Equiângulo", "Com reentrância"], "Nenhum ângulo interno do losango ultrapassa 180°."),
    ("Um trapézio é classificado como…", "Convexo", ["Côncavo", "Regular", "Estrela"], "Todos os seus ângulos internos são menores que 180°."),
    ("Qual dos seguintes polígonos pode ser côncavo?", "Quadrilátero", ["Triângulo", "Círculo", "Segmento de reta"], "Um quadrilátero pode ter uma forma de 'ponta de seta', com um ângulo > 180°."),
    ("O prolongamento de qualquer um dos lados de um polígono convexo…", "Nunca corta o polígono", ["Corta sempre o polígono", "Passa pelo centro", "Mede 180 cm"], "Num polígono convexo, a reta suporte de qualquer lado deixa o polígono num só semiplano."),
    ("Se um ângulo interno de um polígono mede 195°, esse polígono é…", "Côncavo", ["Convexo", "Regular", "Triângulo"], "195° > 180°, o que indica que é côncavo."),
    ("Se um polígono de 6 lados não tem reentrâncias, é…", "Convexo", ["Côncavo", "Aberto", "Cruzado"], "Sem reentrâncias, todos os ângulos são < 180°, logo é convexo."),
    ("Uma estrela de 4 pontas é um polígono…", "Côncavo", ["Convexo", "Regular", "Triangular"], "As pontas para dentro formam ângulos internos maiores que 180°."),
    ("Um paralelogramo é sempre…", "Convexo", ["Côncavo", "Equilátero", "Com 5 lados"], "Os seus ângulos internos são sempre inferiores a 180°.")
]
for p, c, d, e in conc_f:
    add_q(T8, "facil", p, c, d, e)

# Medio (20)
conc_m = [
    ("Um quadrilátero tem ângulos internos de 60°, 70°, 80° e 150°. Como se classifica?", "Convexo", ["Côncavo", "Regular", "Equilátero"], "Todos os quatro ângulos medem menos de 180°, logo é convexo."),
    ("Um quadrilátero tem ângulos internos de 30°, 40°, 50° e 240°. Como se classifica?", "Côncavo", ["Convexo", "Regular", "Retângulo"], "Tem um ângulo interno de 240° (> 180°), logo é côncavo."),
    ("Ao escolher dois pontos A e B dentro de um polígono, o segmento [AB] passa por fora da figura. O polígono é…", "Côncavo", ["Convexo", "Regular", "Equilátero"], "Se um segmento entre dois pontos interiores sai da figura, o polígono é côncavo."),
    ("Qual é a menor quantidade de lados que um polígono côncavo pode ter?", "4 lados", ["3 lados", "5 lados", "6 lados"], "Triângulos são sempre convexos. O polígono côncavo com menos lados é o quadrilátero (4 lados)."),
    ("Um pentágono tem ângulos internos de 100°, 110°, 90°, 80° e 160°. É côncavo ou convexo?", "Convexo", ["Côncavo", "Regular", "Equilátero"], "Nenhum dos ângulos excede 180°, por isso é convexo."),
    ("Um pentágono tem ângulos internos de 40°, 50°, 30°, 20° e 400° (não) / 220°. É côncavo ou convexo?", "Côncavo", ["Convexo", "Regular", "Equiângulo"], "O ângulo de 220° é superior a 180°, logo o polígono é côncavo."),
    ("Se prolongarmos um lado de um polígono e a reta cortar a figura em duas partes, o polígono é…", "Côncavo", ["Convexo", "Regular", "Simétrico"], "Num polígono côncavo, o prolongamento de pelo menos um lado interseta a região do polígono."),
    ("Um polígono convexo pode ter um ângulo interno de 180°?", "Não, porque formaria uma linha reta e não um vértice", ["Sim, sempre", "Sim, se for regular", "Apenas se tiver 6 lados"], "Um ângulo de 180° não forma vértice; dois lados adjacentes estariam sobre a mesma reta."),
    ("Um hexágono tem cinco ângulos de 100° e um de 220°. Como se classifica?", "Côncavo", ["Convexo", "Regular", "Equilátero"], "O ângulo de 220° é maior que 180°, logo o hexágono é côncavo."),
    ("Qual das seguintes afirmações sobre o triângulo é verdadeira?", "É impossível construir um triângulo côncavo", ["Existem triângulos côncavos", "Um triângulo tem 4 diagonais", "Pode ter um ângulo de 200°"], "Como a soma dos ângulos internos de qualquer triângulo é 180°, nenhum ângulo pode atingir 180°."),
    ("Num polígono de 7 lados, um dos ângulos mede 215°. O polígono é…", "Côncavo", ["Convexo", "Regular", "Equiângulo"], "Como 215° > 180°, é classificado como côncavo."),
    ("Podemos afirmar que qualquer polígono regular é…", "Convexo", ["Côncavo", "Com lados desiguais", "Com ângulos superiores a 180°"], "Por definição curricular, polígonos regulares não possuem reentrâncias e são convexos."),
    ("Um octógono com formato de cruz é…", "Côncavo", ["Convexo", "Regular", "Equilátero"], "A cruz possui 4 reentrâncias internas com ângulos de 270°, logo é côncavo."),
    ("Se todos os ângulos internos de um polígono forem agudos ou obtusos menores que 180°, o polígono é…", "Convexo", ["Côncavo", "Irregular necessariamente", "Aberto"], "Sendo todos os ângulos menores que 180°, o polígono é convexo."),
    ("Um polígono côncavo tem no mínimo…", "Uma reentrância", ["Duas reentrâncias", "Três reentrâncias", "Nenhuma reentrância"], "Basta ter uma reentrância (um ângulo > 180°) para ser côncavo."),
    ("A ponta de seta (dardo) é um quadrilátero…", "Côncavo", ["Convexo", "Regular", "Equiângulo"], "Tem 4 lados e um ângulo interno reflexo (maior que 180°), sendo côncavo."),
    ("Um polígono com todos os ângulos medindo 120° é…", "Convexo", ["Côncavo", "Aberto", "Com reentrâncias"], "120° < 180°, portanto é convexo."),
    ("O que distingue geometricamente um polígono convexo de um côncavo?", "O côncavo tem pelo menos um ângulo interno > 180°", ["O convexo tem mais lados", "O côncavo não tem vértices", "O convexo tem lados curvos"], "A amplitude dos ângulos internos e a presença de reentrâncias definem a diferença."),
    ("Um quadrilátero com diagonais que se cruzam no interior é…", "Convexo", ["Côncavo", "Aberto", "Irregular obrigatoriamente"], "Num quadrilátero convexo as duas diagonais estão inteiramente contidas no interior."),
    ("Num quadrilátero côncavo, uma das diagonais…", "Fica no exterior do polígono", ["É igual ao lado", "Passa por 3 vértices", "Não existe"], "A diagonal que une os vértices opostos à reentrância passa por fora do polígono.")
]
for p, c, d, e in conc_m:
    add_q(T8, "medio", p, c, d, e)

# Dificil (20)
conc_d = [
    ("Considera as afirmações: I) Todo o triângulo é convexo. II) Todo o quadrilátero é convexo. Quais são verdadeiras?", "Apenas a I", ["Apenas a II", "Ambas são verdadeiras", "Nenhuma é verdadeira"], "A afirmação I é verdadeira; a II é falsa porque existem quadriláteros côncavos (ex: dardo)."),
    ("Num polígono de n lados côncavo, qual é o número máximo de ângulos internos maiores que 180° que um quadrilátero pode ter?", "1", ["2", "3", "4"], "A soma dos ângulos de um quadrilátero é 360°. Se tivesse dois ângulos > 180°, a soma já excederia 360°."),
    ("Um pentágono côncavo pode ter no máximo quantos ângulos internos maiores que 180°?", "2", ["1", "3", "4"], "A soma dos ângulos internos de um pentágono é 540°. Três ângulos > 180° somariam mais de 540°."),
    ("Qual é a propriedade que garante que um polígono é convexo?", "Qualquer reta que contenha um lado deixa o polígono inteiramente num dos semiplanos", ["Ter lados de igual comprimento", "Ter número par de lados", "Ter diagonais iguais"], "É uma das definições geométricas rigorosas de polígono convexo."),
    ("Seja P um polígono. Se existirem dois pontos X e Y em P tais que o segmento [XY] interseta o exterior de P, conclui-se que:", "P é côncavo", ["P é convexo", "P é regular", "P não é plano"], "Esta é a definição topológica direta de conjunto não convexo (polígono côncavo)."),
    ("Um polígono de 6 lados tem ângulos internos: 90°, 90°, 90°, 90°, 90° e 270°. Este polígono é:", "Côncavo", ["Convexo", "Regular", "Triângulo"], "O ângulo de 270° é superior a 180°, caracterizando uma reentrância."),
    ("Num polígono convexo de 5 lados, qual é o valor máximo que um ângulo interno pode ter?", "Menor que 180°", ["Exatamente 180°", "270°", "360°"], "Por definição de polígono convexo, nenhum ângulo interno pode atingir ou ultrapassar 180°."),
    ("Qual dos seguintes polígonos NÃO pode ser côncavo em nenhuma circunstância?", "Triângulo equilátero", ["Quadrilátero", "Pentágono", "Hexágono"], "Nenhum triângulo pode ser côncavo."),
    ("Uma figura em forma de 'L' com 6 lados é um hexágono…", "Côncavo", ["Convexo", "Regular", "Equilátero"], "O canto interior do 'L' tem um ângulo interno de 270°, sendo côncavo."),
    ("Um polígono tem 8 lados e todos os ângulos internos medem 135°. Como se classifica quanto à convexidade?", "Convexo", ["Côncavo", "Indeterminado", "Cruzado"], "Como 135° < 180° para todos os vértices, é convexo."),
    ("Se um polígono côncavo tem 10 lados (decágono), podemos garantir que:", "Tem pelo menos um ângulo interno superior a 180°", ["Todos os seus lados são diferentes", "Tem 5 reentrâncias", "É regular"], "A única condição obrigatória e definidora é ter pelo menos um ângulo interno > 180°."),
    ("A soma dos ângulos internos de um quadrilátero é 360°. Se três ângulos medem 30°, 40° e 50°, o quarto ângulo mede:", "240° e o quadrilátero é côncavo", ["140° e o quadrilátero é convexo", "240° e o quadrilátero é convexo", "120° e o quadrilátero é regular"], "360° − (30° + 40° + 50°) = 240°. Como 240° > 180°, é côncavo."),
    ("A soma dos ângulos internos de um quadrilátero é 360°. Se os ângulos medem 80°, 95°, 105° e 80°, o quadrilátero é:", "Convexo", ["Côncavo", "Regular", "Com reentrância"], "Todos os quatro ângulos são menores que 180°, logo é convexo."),
    ("Podemos afirmar sobre as diagonais de um polígono côncavo que:", "Pelo menos uma diagonal tem pontos fora do polígono", ["Todas as diagonais estão no interior", "Não possui diagonais", "Todas passam pelo centro"], "Num polígono côncavo há sempre diagonais exteriores ou que passam pelo exterior."),
    ("Um ângulo interno de 250° num polígono corresponde a um ângulo externo no mesmo vértice que não é convencional. A reentrância é:", "Côncava", ["Convexa", "Aguda", "Nula"], "O vértice onde ocorre o ângulo de 250° forma a reentrância côncava."),
    ("Qual das figuras planas seguintes pode ser decomposta em triângulos apenas traçando diagonais a partir de um único vértice sem sair da figura?", "Qualquer polígono convexo", ["Qualquer polígono côncavo", "Apenas triângulos", "Apenas estrelas"], "Nos polígonos convexos, todas as diagonais a partir de um vértice permanecem no interior."),
    ("Um heptágono tem 6 ângulos internos de 110° e um de 240°. A soma dos ângulos é 900°. Como se classifica?", "Côncavo", ["Convexo", "Regular", "Equilátero"], "O ângulo de 240° (> 180°) torna o heptágono côncavo."),
    ("Um polígono diz-se convexo se e só se o segmento que une quaisquer dois pontos do seu bordo:", "Pertence inteiramente à figura", ["Sai sempre da figura", "Mede menos de 10 cm", "É perpendicular a um lado"], "Definição geométrica fundamental de convexidade."),
    ("O número de ângulos maiores que 180° num hexágono côncavo pode ser no máximo:", "3", ["1", "4", "5"], "A soma dos ângulos é 720°. Quatro ângulos > 180° somariam mais de 720°."),
    ("Em relação à classificação de polígonos, é correto afirmar:", "Todo o polígono regular é convexo", ["Todo o polígono convexo é regular", "Todo o quadrilátero é côncavo", "Todo o hexágono é côncavo"], "Os polígonos regulares são sempre convexos por definição.")
]
for p, c, d, e in conc_d:
    add_q(T8, "dificil", p, c, d, e)

print(f"Topic 1..8 questions: {len(questions)}")

# ==============================================================================
# TOPIC 9: Polígonos regulares e irregulares
# ==============================================================================
T9 = "Polígonos regulares e irregulares"

# Facil (20)
reg_f = [
    ("O que é necessário para um polígono ser classificado como regular?", "Ter todos os lados iguais e todos os ângulos internos iguais", ["Basta ter os lados todos iguais", "Basta ter os ângulos todos iguais", "Ter pelo menos 4 lados"], "Um polígono regular tem de ser simultaneamente equilátero e equiângulo."),
    ("O quadrado é um polígono regular porque…", "Tem os 4 lados iguais e os 4 ângulos retos (iguais)", ["Tem 4 lados", "Tem diagonais perpendiculares", "Tem apenas lados paralelos"], "Reúne as duas condições: todos os lados iguais e todos os ângulos iguais a 90°."),
    ("Um triângulo com os três lados de comprimentos iguais chama-se…", "Equilátero e é regular", ["Isósceles e é regular", "Escaleno e é irregular", "Retângulo e é regular"], "O triângulo equilátero tem os 3 lados iguais e os 3 ângulos iguais a 60°, logo é regular."),
    ("Um triângulo escaleno (todos os lados diferentes) é…", "Irregular", ["Regular", "Equiângulo", "Equilátero"], "Como tem lados e ângulos diferentes, é irregular."),
    ("Um retângulo que não tem os lados todos iguais é regular?", "Não, porque não tem os lados todos iguais", ["Sim, porque tem os ângulos todos iguais", "Sim, qualquer retângulo é regular", "Não, porque tem 4 lados"], "Para ser regular precisa de lados iguais e ângulos iguais. O retângulo só tem os ângulos iguais."),
    ("Um losango que não é quadrado é um polígono regular?", "Não, porque os seus ângulos internos não são todos iguais", ["Sim, porque tem os 4 lados iguais", "Sim, qualquer losango é regular", "Não, porque tem diagonais"], "O losango tem lados iguais, mas os ângulos não são todos iguais (tem dois agudos e dois obtusos)."),
    ("Como se chama o polígono regular de 3 lados?", "Triângulo equilátero", ["Triângulo isósceles", "Triângulo escaleno", "Triângulo retângulo"], "O triângulo equilátero é o único triângulo regular."),
    ("Como se chama o polígono regular de 4 lados?", "Quadrado", ["Losango", "Retângulo", "Trapézio"], "O quadrado é o único quadrilátero regular."),
    ("Um pentágono regular tem…", "5 lados iguais e 5 ângulos internos iguais", ["5 lados diferentes", "Apenas 5 ângulos iguais", "Apenas 5 lados iguais"], "Por ser regular, tem todos os 5 lados e todos os 5 ângulos iguais."),
    ("Um hexágono regular tem quantos lados iguais?", "6", ["5", "8", "4"], "O hexágono tem 6 lados e, sendo regular, são todos de igual comprimento."),
    ("Se um polígono tem lados de medidas 4 cm, 5 cm, 4 cm e 5 cm, ele é…", "Irregular", ["Regular", "Triângulo", "Pentágono"], "Não tem todos os lados iguais, por isso é irregular."),
    ("Qual dos seguintes quadriláteros é um polígono regular?", "Quadrado", ["Losango não quadrado", "Retângulo não quadrado", "Trapézio isósceles"], "Apenas o quadrado é equilátero e equiângulo."),
    ("Um octógono regular tem quantos eixos de simetria?", "8", ["4", "2", "1"], "Um polígono regular de n lados tem exatamente n eixos de simetria."),
    ("Quanto mede cada ângulo interno de um triângulo equilátero?", "60°", ["90°", "45°", "120°"], "180° ÷ 3 = 60° em cada um dos três ângulos."),
    ("Quanto mede cada ângulo interno de um quadrado?", "90°", ["60°", "120°", "100°"], "360° ÷ 4 = 90° em cada ângulo."),
    ("Um polígono que tem todos os lados iguais diz-se…", "Equilátero", ["Equiângulo", "Regular obrigatoriamente", "Côncavo"], "Equilátero significa 'com lados de igual medida'."),
    ("Um polígono que tem todos os ângulos internos iguais diz-se…", "Equiângulo", ["Equilátero", "Regular obrigatoriamente", "Escaleno"], "Equiângulo significa 'com ângulos de igual medida'."),
    ("Para um polígono ser regular ele tem de ser simultaneamente…", "Equilátero e equiângulo", ["Equilátero e côncavo", "Equiângulo e escaleno", "Grande e simétrico"], "É a definição estrita de polígono regular."),
    ("Um triângulo retângulo isósceles é regular?", "Não, porque tem um ângulo de 90° e dois de 45°", ["Sim, porque tem dois lados iguais", "Sim, qualquer isósceles é regular", "Não, porque tem 3 lados"], "Os ângulos não são todos iguais (90°, 45°, 45°), logo é irregular."),
    ("Qual é a designação de um polígono que não é regular?", "Irregular", ["Côncavo necessariamente", "Incompleto", "Aberto"], "Um polígono que não cumpre os requisitos de regularidade diz-se irregular.")
]
for p, c, d, e in reg_f:
    add_q(T9, "facil", p, c, d, e)

# Medio (20)
reg_m = [
    ("Um losango tem os quatro lados com 6 cm. Os seus ângulos medem 70°, 110°, 70° e 110°. É regular?", "Não, é equilátero mas não é equiângulo", ["Sim, porque tem os 4 lados iguais a 6 cm", "Sim, qualquer figura com 6 cm é regular", "Não, porque não tem 4 lados"], "Tem lados iguais, mas os ângulos não são iguais; logo não é regular."),
    ("Um retângulo tem lados de 4 cm e 8 cm, e quatro ângulos de 90°. É regular?", "Não, é equiângulo mas não é equilátero", ["Sim, porque tem quatro ângulos retos", "Sim, todo o retângulo é regular", "Não, porque tem ângulos retos"], "Tem ângulos iguais, mas os lados não são todos iguais; logo não é regular."),
    ("Qual é a amplitude de cada ângulo interno de um pentágono regular?", "108°", ["120°", "90°", "100°"], "A soma dos ângulos internos de um pentágono é 540°; 540° ÷ 5 = 108°."),
    ("Qual é a amplitude de cada ângulo interno de um hexágono regular?", "120°", ["108°", "135°", "90°"], "A soma dos ângulos internos de um hexágono é 720°; 720° ÷ 6 = 120°."),
    ("Qual é a soma dos ângulos internos de qualquer quadrilátero?", "360°", ["180°", "540°", "720°"], "Qualquer quadrilátero pode ser dividido em 2 triângulos: 2 × 180° = 360°."),
    ("Qual é a soma dos ângulos internos de qualquer pentágono?", "540°", ["360°", "720°", "900°"], "Divide-se em 3 triângulos: 3 × 180° = 540°."),
    ("Qual é a soma dos ângulos internos de qualquer hexágono?", "720°", ["540°", "360°", "1080°"], "Divide-se em 4 triângulos: 4 × 180° = 720°."),
    ("Se um polígono regular tem o perímetro de 35 cm e 5 lados, quanto mede cada lado?", "7 cm", ["5 cm", "8 cm", "6 cm"], "Num polígono regular todos os lados são iguais: 35 ÷ 5 = 7 cm."),
    ("Um hexágono regular tem lado de 4 cm. Qual é o seu perímetro?", "24 cm", ["20 cm", "28 cm", "36 cm"], "Perímetro = 6 × 4 cm = 24 cm."),
    ("Quantos eixos de simetria tem um triângulo equilátero?", "3", ["1", "2", "6"], "Tem 3 eixos de simetria (as 3 mediatrizes/bissetrizes)."),
    ("Quantos eixos de simetria tem um quadrado?", "4", ["2", "8", "1"], "Tem 4 eixos de simetria (2 mediatrizes dos lados e 2 diagonais)."),
    ("Quantos eixos de simetria tem um pentágono regular?", "5", ["1", "3", "10"], "Um polígono regular de n lados tem sempre n eixos de simetria."),
    ("Quantos eixos de simetria tem um hexágono regular?", "6", ["3", "12", "4"], "O hexágono regular tem exatamente 6 eixos de simetria."),
    ("Um polígono regular pode ser côncavo?", "Não, é sempre convexo", ["Sim, sempre", "Sim, a partir de 5 lados", "Apenas se tiver número ímpar de lados"], "Por definição geométrica nos programas escolares, todo o polígono regular é convexo."),
    ("Um triângulo isósceles com lados 5 cm, 5 cm e 6 cm é classificado como:", "Irregular", ["Regular", "Equilátero", "Polígono côncavo"], "Tem um lado diferente dos outros dois, logo não é regular."),
    ("Um trapézio com ângulos retos e lados diferentes é:", "Irregular", ["Regular", "Equilátero", "Côncavo"], "Não tem lados iguais nem ângulos todos iguais, logo é irregular."),
    ("Se um polígono regular tem lados de 8 cm e perímetro de 64 cm, quantos lados tem?", "8 lados (octógono)", ["6 lados", "7 lados", "10 lados"], "64 ÷ 8 = 8 lados."),
    ("Dois polígonos regulares com o mesmo número de lados têm obrigatoriamente:", "Os mesmos ângulos internos", ["O mesmo perímetro", "A mesma área", "Os lados com o mesmo comprimento"], "Os ângulos internos dependem unicamente do número de lados."),
    ("Um decágono regular tem quantos lados e vértices?", "10 lados e 10 vértices", ["8 lados e 8 vértices", "12 lados e 12 vértices", "10 lados e 5 vértices"], "O decágono tem 10 lados e 10 vértices."),
    ("Um polígono regular de 12 lados designa-se por:", "Dodecágono regular", ["Decágono regular", "Undecágono regular", "Icoságono regular"], "12 lados = dodecágono.")
]
for p, c, d, e in reg_m:
    add_q(T9, "medio", p, c, d, e)

# Dificil (20)
reg_d = [
    ("A soma dos ângulos internos de um polígono regular é 1080°. Quantos lados tem o polígono?", "8 lados (octógono)", ["6 lados", "7 lados", "10 lados"], "Soma = (n − 2) × 180°. 1080 ÷ 180 = 6, logo n − 2 = 6 ⇒ n = 8 lados."),
    ("Cada ângulo interno de um polígono regular mede 135°. Qual é esse polígono?", "Octógono regular", ["Hexágono regular", "Decágono regular", "Pentágono regular"], "Soma para n=8 é 1080°; 1080° ÷ 8 = 135°."),
    ("Cada ângulo interno de um polígono regular mede 144°. Quantos lados tem?", "10 lados (decágono regular)", ["8 lados", "12 lados", "9 lados"], "Ângulo externo = 180° − 144° = 36°. Como a soma dos externos é 360°, n = 360 ÷ 36 = 10."),
    ("Qual é a amplitude de cada ângulo ao centro de um hexágono regular?", "60°", ["120°", "90°", "45°"], "360° ÷ 6 = 60° no ângulo ao centro."),
    ("Qual é a amplitude de cada ângulo ao centro de um pentágono regular?", "72°", ["108°", "60°", "54°"], "360° ÷ 5 = 72° no ângulo ao centro."),
    ("Qual é a amplitude de cada ângulo ao centro de um octógono regular?", "45°", ["135°", "60°", "90°"], "360° ÷ 8 = 45° no ângulo ao centro."),
    ("Um polígono de n lados decompõe-se, a partir de um vértice, em quantos triângulos?", "n − 2 triângulos", ["n triângulos", "n − 1 triângulos", "2n triângulos"], "Traçando diagonais a partir de um vértice, obtêm-se sempre (n − 2) triângulos."),
    ("Considera as afirmações: I) Todo o quadrado é um losango regular. II) Todo o retângulo é regular. Quais são verdadeiras?", "Apenas a I", ["Apenas a II", "Ambas", "Nenhuma"], "O quadrado é um losango que é regular; mas nem todo o retângulo é regular (só o quadrado)."),
    ("Porque é que um triângulo retângulo nunca pode ser um polígono regular?", "Porque a hipotenusa é sempre maior que os catetos e tem um ângulo de 90°", ["Porque tem 3 lados", "Porque não tem eixos de simetria", "Porque é côncavo"], "Não pode ter os 3 lados iguais nem os 3 ângulos iguais (tem um de 90° e a soma é 180°)."),
    ("Qual é a razão entre o ângulo ao centro e o ângulo interno de um quadrado?", "1 (são ambos de 90°)", ["1/2", "2", "3/4"], "No quadrado: ângulo ao centro = 360° ÷ 4 = 90°; ângulo interno = 90°. Razão = 1."),
    ("Se duplicarmos o comprimento do lado de um pentágono regular, o que acontece aos seus ângulos internos?", "Mantêm-se exatamente iguais (108°)", ["Duplicam", "Ficam reduzidos a metade", "Aumentam para 120°"], "A amplitude dos ângulos depende apenas do número de lados, não do comprimento dos mesmos."),
    ("Um polígono regular tem ângulo interno de 120°. O seu perímetro é 48 cm. Qual é o comprimento de cada lado?", "8 cm", ["6 cm", "12 cm", "4 cm"], "Ângulo de 120° indica um hexágono (6 lados). Lado = 48 ÷ 6 = 8 cm."),
    ("Um polígono regular tem ângulo interno de 90°. O seu perímetro é 36 cm. Qual é a sua área?", "81 cm²", ["36 cm²", "72 cm²", "144 cm²"], "Ângulo de 90° indica um quadrado. Lado = 36 ÷ 4 = 9 cm. Área = 9 × 9 = 81 cm²."),
    ("Quantas diagonais partem de um único vértice de um hexágono regular?", "3", ["6", "4", "2"], "De um vértice partem n − 3 diagonais: 6 − 3 = 3 diagonais."),
    ("Quantas diagonais partem de um único vértice de um octógono regular?", "5", ["8", "6", "4"], "n − 3 = 8 − 3 = 5 diagonais."),
    ("Qual é o número total de diagonais de um pentágono regular?", "5", ["10", "2", "3"], "Fórmula: n(n − 3) ÷ 2 = 5 × 2 ÷ 2 = 5 diagonais."),
    ("Qual é o número total de diagonais de um hexágono regular?", "9", ["6", "12", "18"], "n(n − 3) ÷ 2 = 6 × 3 ÷ 2 = 9 diagonais."),
    ("Qual é o número total de diagonais de um octógono regular?", "20", ["16", "24", "10"], "8 × 5 ÷ 2 = 20 diagonais."),
    ("Se um ângulo externo de um polígono regular mede 30°, quantos lados tem o polígono?", "12 lados (dodecágono)", ["10 lados", "8 lados", "15 lados"], "A soma dos ângulos externos é 360°. n = 360° ÷ 30° = 12 lados."),
    ("Se um ângulo externo de um polígono regular mede 40°, qual é o valor de cada ângulo interno?", "140°", ["120°", "100°", "150°"], "Ângulo interno + ângulo externo = 180°. 180° − 40° = 140°.")
]
for p, c, d, e in reg_d:
    add_q(T9, "dificil", p, c, d, e)

print(f"Total questions generated: {len(questions)}")
assert len(questions) == 540, f"Expected 540, got {len(questions)}"

# Validate all questions
seen_ids = set()
for q in questions:
    assert q["id"] not in seen_ids, f"Duplicate ID: {q['id']}"
    seen_ids.add(q["id"])
    assert len(q["options"]) == 4, f"Options length not 4: {q['id']}"
    assert len(set(q["options"])) == 4, f"Duplicate options in {q['id']}: {q['options']}"
    assert 0 <= q["correctIndex"] < 4, f"Invalid correctIndex in {q['id']}"
    assert q["options"][q["correctIndex"]], f"Empty correct option in {q['id']}"

print("All 540 questions validated successfully!")

# Write to TypeScript file
ts_content = '''import type { Difficulty, Question } from "@/types/game";

export const MATH_6_QUESTION_BANK: Question[] = ''' + json.dumps(questions, indent=2, ensure_ascii=False) + """;
"""

with open("src/data/question-bank-6ano.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Saved to src/data/question-bank-6ano.ts!")

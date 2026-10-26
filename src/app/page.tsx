import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      {/* Dynamic stage lighting spotlights */}
      <div className={styles.spotlightTop} aria-hidden="true" />
      <div className={styles.spotlightLeft} aria-hidden="true" />
      <div className={styles.spotlightRight} aria-hidden="true" />

      {/* Main Header with Centerpiece 3D Logo */}
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoAura} aria-hidden="true" />
          <div className={styles.logoSpotlight} aria-hidden="true" />
          <Image
            src="/quemquersemilionario.png"
            alt="Quem Quer Ser Milionário? Logótipo Oficial"
            width={200}
            height={200}
            priority
            className={styles.logo}
          />
        </div>

        <div className={styles.badgeRow}>
          <span className={styles.schoolBadge}>
            <span className={styles.badgeIcon}>🏛️</span> Escola Conde de Oeiras
          </span>
          <span className={styles.liveBadge}>
            <span className={styles.pulseDot} />
            Edição Concurso 2026
          </span>
        </div>

        <h1 className={styles.title}>Quem Quer Ser Milionário?</h1>
        <p className={styles.subtitle}>
          Treina a Matemática como num concurso de televisão: 50 perguntas, patamares e ajudas!
        </p>

        {/* Quick Highlights / Bangs Bar */}
        <div className={styles.highlightsBar}>
          <div className={styles.highlightItem}>
            <span className={styles.highlightNum}>990+</span>
            <span className={styles.highlightLabel}>Perguntas</span>
          </div>
          <div className={styles.highlightDivider} />
          <div className={styles.highlightItem}>
            <span className={styles.highlightNum}>4</span>
            <span className={styles.highlightLabel}>Modos de Jogo</span>
          </div>
          <div className={styles.highlightDivider} />
          <div className={styles.highlightItem}>
            <span className={styles.highlightNum}>50/50</span>
            <span className={styles.highlightLabel}>Ajudas &amp; Resumo</span>
          </div>
        </div>
      </header>

      {/* Quizzes Selection Area */}
      <div className={styles.container}>
        {/* ==============================================
            FEATURED SPOTLIGHT: 6.º ANO TEST (TOP BANG)
            ============================================== */}
        <section className={styles.featuredSection}>
          <Link href="/test/6ano" className={styles.cardFeatured}>
            <div className={styles.featuredGlow} aria-hidden="true" />
            
            <div className={styles.featuredHeader}>
              <div className={styles.bangPillGroup}>
                <span className={styles.bangPillHot}>
                  <span className={styles.fireIcon}>🔥</span> NOVO · 6.º ANO
                </span>
                <span className={styles.bangPillClass}>TURMA 6.º F</span>
                <span className={styles.bangPillActive}>● TESTE EM DESTAQUE</span>
              </div>
              <span className={styles.featuredMetaPill}>9 temas · 63 perguntas</span>
            </div>

            <div className={styles.featuredBody}>
              <div className={styles.featuredIconBox}>
                <span className={styles.featuredIcon}>🔢</span>
                <div className={styles.iconRing} />
              </div>

              <div className={styles.featuredContent}>
                <h2 className={styles.featuredTitle}>
                  Matemática — Números, Potências e Polígonos
                </h2>
                <p className={styles.featuredDesc}>
                  Preparação intensiva para o teste: decomposição em fatores primos, cálculo de m.m.c. e m.d.c.,
                  regras de potências e classificação rigorosa de polígonos côncavos e convexos.
                </p>

                {/* Topics Tags */}
                <div className={styles.tagList}>
                  <span className={styles.tag}>Fatores Primos</span>
                  <span className={styles.tag}>m.m.c. &amp; m.d.c.</span>
                  <span className={styles.tag}>Potências</span>
                  <span className={styles.tag}>Polígonos &amp; Ângulos</span>
                </div>
              </div>

              <div className={styles.featuredAction}>
                <div className={styles.featuredCta}>
                  <span>Jogar Teste</span>
                  <span className={styles.ctaArrow}>→</span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ==============================================
            5.º ANO TESTS TRACK
            ============================================== */}
        <section className={styles.trackSection}>
          <div className={styles.trackHeader}>
            <span className={styles.trackLine} />
            <h3 className={styles.trackTitle}>Testes do 5.º Ano</h3>
            <span className={styles.trackLine} />
          </div>

          <div className={styles.grid}>
            {/* Estatística Card */}
            <Link href="/test/estatistica" className={styles.card}>
              <div className={styles.cardIconBox}>
                <span className={styles.cardIcon}>📊</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardLabelRow}>
                  <span className={styles.cardLabelBlue}>5.º ANO · ESTATÍSTICA</span>
                  <span className={styles.cardBadge}>Gráficos SVG</span>
                </div>
                <h4 className={styles.cardTitle}>Estatística e Probabilidades</h4>
                <p className={styles.cardDesc}>
                  Frequências absoluta e relativa, leitura de gráficos de barras simples e agrupados, moda, média e cálculo de probabilidades.
                </p>
                <div className={styles.cardMeta}>7 temas · 630 perguntas</div>
              </div>
              <div className={styles.cardArrow}>→</div>
            </Link>

            {/* Frações Card */}
            <Link href="/test/fracoes" className={styles.card}>
              <div className={styles.cardIconBox}>
                <span className={styles.cardIcon}>📐</span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardLabelRow}>
                  <span className={styles.cardLabelGold}>5.º ANO · NÚMEROS</span>
                  <span className={styles.cardBadge}>Cálculo</span>
                </div>
                <h4 className={styles.cardTitle}>Frações, Decimais e Percentagens</h4>
                <p className={styles.cardDesc}>
                  Frações equivalentes, simplificação, percentagens, ordenação decimal e operações com frações e decimais.
                </p>
                <div className={styles.cardMeta}>10 temas · 300 perguntas</div>
              </div>
              <div className={styles.cardArrow}>→</div>
            </Link>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>Escola Conde de Oeiras · Plataforma de Estudo e Gamificação de Matemática</p>
        <p className={styles.footerSub}>Desenvolvido com carinho por Bruno Jacinto</p>
      </footer>
    </main>
  );
}

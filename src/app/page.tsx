import Link from "next/link";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.spotlightLeft} aria-hidden="true" />
      <div className={styles.spotlightRight} aria-hidden="true" />
      <header className={styles.header}>
        <img src="/quemquersemilionario.png" alt="Quem Quer Ser Milionário?" className={styles.logo} />
        <h1 className={styles.title}>Quem Quer Ser Milionário?</h1>
        <p className={styles.subtitle}>5.º Ano — Escolhe o teste para treinar</p>
      </header>

      <div className={styles.grid}>
        <Link href="/test/fracoes" className={styles.card}>
          <div className={styles.cardIcon}>📐</div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Teste Anterior</span>
            <h2 className={styles.cardTitle}>Frações, Decimais e Percentagens</h2>
            <p className={styles.cardDesc}>
              Frações equivalentes, simplificação, percentagens, comparação e operações com decimais.
            </p>
            <div className={styles.cardMeta}>10 temas · 300 perguntas</div>
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>

        <Link href="/test/estatistica" className={styles.card + " " + styles.cardNew}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel + " " + styles.cardLabelNew}>Novo Teste</span>
            <h2 className={styles.cardTitle}>Estatística e Probabilidades</h2>
            <p className={styles.cardDesc}>
              Valores aproximados, características, frequências, gráficos de barras, moda, média e probabilidades.
            </p>
            <div className={styles.cardMeta}>7 temas · 630 perguntas</div>
          </div>
          <span className={styles.cardArrow}>→</span>
        </Link>
      </div>

      <footer className={styles.footer}>
        <p>Escola Conde de Oeiras · Desenvolvido por Bruno Jacinto</p>
      </footer>
    </main>
  );
}

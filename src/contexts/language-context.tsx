'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    'app.title': 'Quem Quer Ser Milionário? 5.º Ano',
    'app.school': 'Escola Conde de Oeiras',
    'app.subtitle': 'Concurso de treino para Matemática do 5.º ano, com progressão em 50 perguntas e recuperação automática da sessão.',
    'app.tagline': 'Treino escolar com ambiente de concurso',
    'app.heroTitle': 'Escolhe o modo, introduz os dados e começa a tua run.',
    'app.heroText': 'As 50 perguntas são sorteadas apenas no início, ficam guardadas no navegador e o resultado final é enviado para o email do encarregado de educação.',
    'app.formHint': 'O email é obrigatório, porque o resumo final será enviado para esse endereço.',

    'form.studentName': 'Nome do aluno',
    'form.studentNamePlaceholder': 'Ex.: Mariana Silva',
    'form.guardianEmail': 'Email do pai ou encarregado de educação',
    'form.guardianEmailPlaceholder': 'encarregado@email.pt',
    'form.error.nameRequired': 'Nome do aluno é obrigatório.',
    'form.error.emailRequired': 'Email é obrigatório.',
    'form.error.emailInvalid': 'Email inválido.',

    'mode.jogo': 'Modo Jogo',
    'mode.exame': 'Modo Exame',
    'mode.treino': 'Modo Treino',
    'mode.cutthroat': 'Modo Cutthroat',
    'mode.jogo.desc': 'Progressão tipo concurso, com feedback visual e patamares de pontuação.',
    'mode.exame.desc': 'Sem explicações entre perguntas. No fim recebes apenas o resumo completo.',
    'mode.treino.desc': 'Feedback imediato e explicação pedagógica após cada resposta.',
    'mode.cutthroat.desc': 'Até 3 erros e sais do jogo. Tens 1 ajuda de 50/50 para gastar.',

    'button.start': 'Começar',
    'button.confirm': 'Confirmar resposta',
    'button.next': 'Pergunta seguinte',
    'button.use50': 'Usar 50/50',
    'button.used50': '50/50 usada',
    'button.sound.on': 'Som: ligado',
    'button.sound.off': 'Som: desligado',

    'game.explanation': 'Quando os denominadores são diferentes, podes comparar as frações transformando-as em partes equivalentes do mesmo tamanho.',

    'footer.credit': 'Desenvolvido para a família por',

    'language.pt': 'PT',
    'language.en': 'EN',

    'nav.sessionRecovered': 'Sessão recuperada a partir do navegador.',
    'nav.backWarning': 'Durante uma run não podes voltar para perguntas anteriores.',

    'email.failedToSend': 'Não foi possível enviar o email.',
    'email.sentSuccess': 'Resultado enviado por email com sucesso.',
    'email.sendFailed': 'Falhou o envio do email.',
    'email.sending': 'A enviar email final...',
    'email.sent': 'Email enviado com sucesso.',

    'form.error.nameEmpty': 'Indica o nome do aluno antes de começar.',
    'form.error.emailInvalid2': 'Indica um email válido do pai ou encarregado de educação.',
    'form.sessionInvalid': 'Sessão local inconsistente',
    'form.clearSession': 'Limpar sessão local',

    'hero.kicker': 'Treino escolar com ambiente de concurso',
    'hero.title': 'Escolhe o modo, introduz os dados e começa a tua run.',
    'hero.text': 'As 50 perguntas são sorteadas apenas no início, ficam guardadas no navegador e o resultado final é enviado para o email do encarregado de educação.',
    'hero.startButton': 'Começar run de 50 perguntas',

    'sidebar.title': 'Como funciona',
    'sidebar.item1': '50 perguntas por run: 20 fáceis, 15 médias e 15 difíceis.',
    'sidebar.item2': 'Sem repetição dentro da mesma run e sem voltar atrás durante o jogo.',
    'sidebar.item3': 'Progresso guardado em `localStorage` para recuperar após refresh ou fecho.',
    'sidebar.item4': 'Resumo final com pontos, erros por tópico e perguntas falhadas.',

    'game.questionCounter': 'Pergunta',
    'game.of': 'de',
    'game.milestones': 'Patamares',
    'game.ladder': 'Escada do concurso',
    'game.correct.lower': 'certas',
    'game.wrong.lower': 'erradas',
    'game.loading': 'A preparar o palco matemático...',
    'game.points': 'pontos',
    'game.pts': 'pts',

    'cutthroat.errorLabel': 'Erros',
    'cutthroat.errors': 'Erros: {count}/3',

    'results.runCompleted': 'Run concluída',
    'results.studentSummary': 'Resumo final do aluno',
    'results.newGame': 'Novo jogo',
    'results.score': 'Pontuação',
    'results.correctAnswers': 'Respostas certas',
    'results.wrongAnswers': 'Respostas erradas',
    'results.totalTime': 'Tempo total',
    'results.emailSection': 'Envio de resultados',
    'results.retryEmail': 'Tentar novamente',
    'results.student': 'Aluno',
    'results.mode': 'Modo',
    'results.started': 'Início',
    'results.finished': 'Fim',
    'results.topicsMistakes': 'Tópicos com mais erros',
    'results.noErrors': 'Sem erros. Excelente run.',
    'results.missedQuestions': 'Perguntas falhadas',
    'results.yourAnswer': 'Respondido',
    'results.correctAnswer': 'Correto',
    'results.noMissed': 'Nenhuma pergunta falhada nesta run.',

    'feedback.correctAnswer': 'Resposta correta.',
    'feedback.wrongAnswer': 'Resposta incorreta.',
    'feedback.examMode': 'Resposta registada. No modo exame as explicações aparecem apenas no resumo final.',

    'nextButton': 'Pergunta seguinte',
    'confirmButton': 'Confirmar resposta',
  },
  en: {
    'app.title': 'Who Wants to Be a Millionaire? 5th Grade',
    'app.school': 'Conde de Oeiras School',
    'app.subtitle': 'Training quiz for 5th grade Mathematics, with 50-question progression and automatic session recovery.',
    'app.tagline': 'School training with quiz show vibes',
    'app.heroTitle': 'Choose a mode, enter your details and start your run.',
    'app.heroText': 'The 50 questions are shuffled only at the start, saved in your browser, and the final result is sent to the guardian\'s email.',
    'app.formHint': 'Email is required because the final summary will be sent to this address.',

    'form.studentName': 'Student Name',
    'form.studentNamePlaceholder': 'Ex.: John Smith',
    'form.guardianEmail': 'Parent or Guardian Email',
    'form.guardianEmailPlaceholder': 'guardian@email.com',
    'form.error.nameRequired': 'Student name is required.',
    'form.error.emailRequired': 'Email is required.',
    'form.error.emailInvalid': 'Invalid email.',

    'mode.jogo': 'Game Mode',
    'mode.exame': 'Exam Mode',
    'mode.treino': 'Training Mode',
    'mode.cutthroat': 'Cutthroat Mode',
    'mode.jogo.desc': 'Quiz show progression with visual feedback and score milestones.',
    'mode.exame.desc': 'No explanations between questions. You only get the full summary at the end.',
    'mode.treino.desc': 'Immediate feedback and educational explanation after each answer.',
    'mode.cutthroat.desc': 'Lose after 3 wrong answers. You have 1 lifeline 50/50 to use.',

    'button.start': 'Start',
    'button.confirm': 'Confirm answer',
    'button.next': 'Next question',
    'button.use50': 'Use 50/50',
    'button.used50': '50/50 used',
    'button.sound.on': 'Sound: on',
    'button.sound.off': 'Sound: off',

    'game.explanation': 'When denominators are different, you can compare fractions by transforming them into equivalent parts of the same size.',

    'footer.credit': 'Built for family by',

    'language.pt': 'PT',
    'language.en': 'EN',

    'nav.sessionRecovered': 'Session recovered from browser.',
    'nav.backWarning': 'During a run you cannot go back to previous questions.',

    'email.failedToSend': 'Failed to send email.',
    'email.sentSuccess': 'Result sent by email successfully.',
    'email.sendFailed': 'Email sending failed.',
    'email.sending': 'Sending final email...',
    'email.sent': 'Email sent successfully.',

    'form.error.nameEmpty': 'Please enter the student name before starting.',
    'form.error.emailInvalid2': 'Please enter a valid parent or guardian email.',
    'form.sessionInvalid': 'Local session is inconsistent',
    'form.clearSession': 'Clear local session',

    'hero.kicker': 'School training with quiz show vibes',
    'hero.title': 'Choose a mode, enter your details and start your run.',
    'hero.text': 'The 50 questions are shuffled only at the start, saved in your browser, and the final result is sent to the guardian\'s email.',
    'hero.startButton': 'Start 50-question run',

    'sidebar.title': 'How it works',
    'sidebar.item1': '50 questions per run: 20 easy, 15 medium and 15 hard.',
    'sidebar.item2': 'No repetition within the same run and no going back during the game.',
    'sidebar.item3': 'Progress saved in `localStorage` to recover after refresh or close.',
    'sidebar.item4': 'Final summary with points, errors by topic and missed questions.',

    'game.questionCounter': 'Question',
    'game.of': 'of',
    'game.milestones': 'Milestones',
    'game.ladder': 'Competition Ladder',
    'game.correct.lower': 'correct',
    'game.wrong.lower': 'wrong',
    'game.loading': 'Preparing the math stage...',
    'game.points': 'points',
    'game.pts': 'pts',

    'cutthroat.errorLabel': 'Errors',
    'cutthroat.errors': 'Errors: {count}/3',

    'results.runCompleted': 'Run completed',
    'results.studentSummary': 'Student summary',
    'results.newGame': 'New game',
    'results.score': 'Score',
    'results.correctAnswers': 'Correct Answers',
    'results.wrongAnswers': 'Wrong Answers',
    'results.totalTime': 'Total Time',
    'results.emailSection': 'Results Delivery',
    'results.retryEmail': 'Try again',
    'results.student': 'Student',
    'results.mode': 'Mode',
    'results.started': 'Started',
    'results.finished': 'Finished',
    'results.topicsMistakes': 'Topics with most errors',
    'results.noErrors': 'No errors. Excellent run.',
    'results.missedQuestions': 'Missed Questions',
    'results.yourAnswer': 'Your answer',
    'results.correctAnswer': 'Correct',
    'results.noMissed': 'No missed questions in this run.',

    'feedback.correctAnswer': 'Correct answer.',
    'feedback.wrongAnswer': 'Wrong answer.',
    'feedback.examMode': 'Answer saved. In exam mode, explanations appear only in the final summary.',

    'nextButton': 'Next question',
    'confirmButton': 'Confirm answer',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

/* ==========================================================================
   itrainer — Dados do app
   ---------------------------------------------------------------
   COMO DEFINIR OS ÍCONES:
   Cada exercício tem um campo `icone` que referencia uma chave do
   objeto ICONES abaixo. O ícone é um SVG do EQUIPAMENTO usado no
   exercício — serve de referência visual de como executar o
   movimento (qual aparelho pegar), não é decoração.

   Para trocar o ícone de um exercício, basta mudar o valor do
   campo `icone` para uma das chaves existentes (ex.: "halteres",
   "barra", "kettlebell", "pesoCorporal", "chao").

   Para criar um ícone novo, adicione uma chave em ICONES com o
   SVG desenhado em stroke (contorno). Use viewBox="0 0 24 24".
   ========================================================================== */

const ICONES = {
  // Halteres (par de anilhas)
  halteres: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M4 8v8M2.5 9.5v5M17.5 6.5v11M20 8v8M21.5 9.5v5M6.5 12h11"/></svg>',

  // Barra (barra com anilhas nas pontas)
  barra: '<svg viewBox="0 0 24 24"><path d="M3 12h18M5 9v6M8 9v6M16 9v6M19 9v6"/></svg>',

  // Kettlebell (bola com alça)
  kettlebell: '<svg viewBox="0 0 24 24"><path d="M9 6a3 3 0 0 1 6 0v1h-6zM7 11a5 5 0 0 0 10 0v-1H7z"/></svg>',

  // Peso corporal (silhueta de corpo)
  pesoCorporal: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.2"/><path d="M5 21c.5-5 3-7.5 7-7.5s6.5 2.5 7 7.5"/></svg>',

  // Chão / solo (linha de base com apoio)
  chao: '<svg viewBox="0 0 24 24"><path d="M4 20h16M6 16h12M8 12h8"/></svg>',

  // Halter único (para exercícios unilaterais)
  halter: '<svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14M6 8v8M18 8v8M9 12h6"/></svg>'
};

const CONFIG = {
  nome: 'itrainer',

  perfil: {
    nome: '',
    altura: '',
    peso: '',
    objetivo: 'hipertrofia',
    diasMeta: 4
  },

  nutricao: {
    pre: {
      titulo: 'Pré-treino (40 a 60 minutos antes)',
      objetivo: 'Fornecer energia sem gerar desconforto digestivo.',
      opcoes: [
        '1 banana com farelo de aveia e mel',
        'Torradas integrais com pasta de amendoim',
        'Frutas secas com café preto para dar disposição'
      ]
    },
    pos: {
      titulo: 'Pós-treino (até 1 a 2 horas após)',
      objetivo: 'Recuperação das fibras musculares e reposição de glicogênio.',
      opcoes: [
        'Dose de whey protein batida com água ou leite e uma fruta',
        'Ovos mexidos com pão integral',
        'Refeição completa: arroz, feijão, fonte magra de proteína (frango ou peixe) e salada'
      ]
    }
  },

  treinos: {
    seg: {
      titulo: 'Peito e Tríceps',
      emoji: '🏋️',
      exercicios: [
        { nome: 'Supino no chão com halteres (Floor Press)', icone: 'halteres', equipamento: 'Halteres', series: 4, repeticoes: '10-12', descanso: 90, carga: '' },
        { nome: 'Flexão de solo', icone: 'pesoCorporal', equipamento: 'Peso corporal', series: 3, repeticoes: 'até o limite técnico', descanso: 60, carga: '' },
        { nome: 'Crucifixo no chão com halteres', icone: 'halteres', equipamento: 'Halteres', series: 3, repeticoes: '12', descanso: 60, carga: '' },
        { nome: 'Tríceps francês com halter', icone: 'halter', equipamento: 'Halter', series: 3, repeticoes: '12', descanso: 60, carga: '' },
        { nome: 'Tríceps testa no chão com a barra', icone: 'barra', equipamento: 'Barra', series: 3, repeticoes: '10-12', descanso: 60, carga: '' }
      ]
    },
    ter: {
      titulo: 'Costas e Bíceps',
      emoji: '🔥',
      exercicios: [
        { nome: 'Remada curvada com pegada pronada na barra', icone: 'barra', equipamento: 'Barra', series: 4, repeticoes: '10-12', descanso: 90, carga: '' },
        { nome: 'Remada unilateral (serrote) com halter ou kettlebell', icone: 'halter', equipamento: 'Halter/Kettlebell', series: 3, repeticoes: '12 cada lado', descanso: 60, carga: '' },
        { nome: 'Levantamento terra com a barra', icone: 'barra', equipamento: 'Barra', series: 3, repeticoes: '10', descanso: 120, carga: '' },
        { nome: 'Rosca direta com a barra', icone: 'barra', equipamento: 'Barra', series: 3, repeticoes: '10-12', descanso: 60, carga: '' },
        { nome: 'Rosca martelo com halteres', icone: 'halteres', equipamento: 'Halteres', series: 3, repeticoes: '12', descanso: 60, carga: '' }
      ]
    },
    qua: {
      titulo: 'Pernas completas',
      emoji: '🦵',
      exercicios: [
        { nome: 'Agachamento Goblet com kettlebell junto ao peito', icone: 'kettlebell', equipamento: 'Kettlebell', series: 4, repeticoes: '12', descanso: 120, carga: '' },
        { nome: 'Passada estática (afundo) com halteres', icone: 'halteres', equipamento: 'Halteres', series: 3, repeticoes: '10-12 por perna', descanso: 90, carga: '' },
        { nome: 'Stiff com halteres ou com a barra', icone: 'barra', equipamento: 'Halteres/Barra', series: 4, repeticoes: '10-12', descanso: 90, carga: '' },
        { nome: 'Elevação pélvica no chão com peso sobre o quadril', icone: 'chao', equipamento: 'Halter/Barra', series: 3, repeticoes: '15', descanso: 60, carga: '' },
        { nome: 'Elevação de panturrilha em pé (unilateral com halter)', icone: 'halter', equipamento: 'Halter', series: 4, repeticoes: '15-20', descanso: 45, carga: '' }
      ]
    },
    qui: {
      titulo: 'Ombros e Trapézio',
      emoji: '💪',
      exercicios: [
        { nome: 'Desenvolvimento de ombros com halteres', icone: 'halteres', equipamento: 'Halteres', series: 4, repeticoes: '10-12', descanso: 90, carga: '' },
        { nome: 'Elevação lateral com halteres', icone: 'halteres', equipamento: 'Halteres', series: 4, repeticoes: '12-15', descanso: 60, carga: '' },
        { nome: 'Crucifixo inverso curvado para posterior de ombro', icone: 'halteres', equipamento: 'Halteres', series: 3, repeticoes: '12-15', descanso: 60, carga: '' },
        { nome: 'Encolhimento de ombros com a barra ou kettlebell', icone: 'barra', equipamento: 'Barra/Kettlebell', series: 3, repeticoes: '15', descanso: 60, carga: '' },
        { nome: 'Rosca concentrada ou rosca inversa', icone: 'halter', equipamento: 'Halter/Barra', series: 3, repeticoes: '12', descanso: 60, carga: '' }
      ]
    },
    sex: { titulo: 'Descanso', emoji: '😴', exercicios: [] },
    sab: { titulo: 'Descanso', emoji: '😴', exercicios: [] },
    dom: { titulo: 'Descanso', emoji: '😴', exercicios: [] }
  }
};
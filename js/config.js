/* ==========================================================================
   itrainer — Treinos padrão (Treino Halteres)
   Os treinos ficam salvos no navegador quando você edita pela tela Gerenciar.
   Para restaurar o padrão, limpe os dados do site no navegador.
   ========================================================================== */

const CONFIG = {
  nome: 'itrainer',

  treinos: {
    seg: {
      titulo: 'Peito e Tríceps',
      emoji: '🏋️',
      exercicios: [
        { nome: 'Supino no chão com halteres (Floor Press)', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Flexão de solo (pode usar as pegadas como apoio)', series: 3, repeticoes: 'até o limite técnico', descanso: 60 },
        { nome: 'Crucifixo no chão com halteres', series: 3, repeticoes: '12', descanso: 60 },
        { nome: 'Tríceps francês unilateral ou bilateral com halter', series: 3, repeticoes: '12', descanso: 60 },
        { nome: 'Tríceps testa no chão com a barra montada', series: 3, repeticoes: '10-12', descanso: 60 }
      ]
    },
    ter: {
      titulo: 'Costas e Bíceps',
      emoji: '🔥',
      exercicios: [
        { nome: 'Remada curvada com pegada pronada na barra', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Remada unilateral (serrote) com halter ou kettlebell', series: 3, repeticoes: '12 cada lado', descanso: 60 },
        { nome: 'Levantamento terra com a barra', series: 3, repeticoes: '10', descanso: 120 },
        { nome: 'Rosca direta com a barra', series: 3, repeticoes: '10-12', descanso: 60 },
        { nome: 'Rosca martelo com halteres', series: 3, repeticoes: '12', descanso: 60 }
      ]
    },
    qua: {
      titulo: 'Pernas completas',
      emoji: '🦵',
      exercicios: [
        { nome: 'Agachamento Goblet segurando o kettlebell junto ao peito', series: 4, repeticoes: '12', descanso: 120 },
        { nome: 'Passada estática (afundo) com halteres nas mãos', series: 3, repeticoes: '10-12 por perna', descanso: 90 },
        { nome: 'Stiff com halteres ou com a barra', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Elevação pélvica no chão com peso sobre o quadril', series: 3, repeticoes: '15', descanso: 60 },
        { nome: 'Elevação de panturrilha em pé (unilateral segurando halter)', series: 4, repeticoes: '15-20', descanso: 45 }
      ]
    },
    qui: {
      titulo: 'Ombros e Trapézio (com finalização de braços)',
      emoji: '💪',
      exercicios: [
        { nome: 'Desenvolvimento de ombros com halteres', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Elevação lateral com halteres', series: 4, repeticoes: '12-15', descanso: 60 },
        { nome: 'Crucifixo inverso curvado para posterior de ombro', series: 3, repeticoes: '12-15', descanso: 60 },
        { nome: 'Encolhimento de ombros com a barra ou kettlebell', series: 3, repeticoes: '15', descanso: 60 },
        { nome: 'Rosca concentrada ou rosca inversa', series: 3, repeticoes: '12', descanso: 60 }
      ]
    },
    sex: { titulo: 'Descanso', emoji: '😴', exercicios: [] },
    sab: { titulo: 'Descanso', emoji: '😴', exercicios: [] },
    dom: { titulo: 'Descanso', emoji: '😴', exercicios: [] }
  }
};
/* ==========================================================================
   itrainer — Dados dos treinos
   Edite aqui seus treinos: exercícios, séries, repetições e descanso.
   ========================================================================== */

const CONFIG = {
  nome: 'itrainer',

  // Dias da semana (ordem do JS: 0=domingo ... 6=sábado)
  treinos: {
    seg: {
      titulo: 'Peito e Tríceps',
      emoji: '🏋️',
      exercicios: [
        { nome: 'Supino reto com barra', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Supino inclinado com halteres', series: 3, repeticoes: '10-12', descanso: 90 },
        { nome: 'Crucifixo', series: 3, repeticoes: '12-15', descanso: 60 },
        { nome: 'Tríceps corda', series: 3, repeticoes: '12-15', descanso: 60 },
        { nome: 'Tríceps testa', series: 3, repeticoes: '12', descanso: 60 }
      ]
    },
    ter: {
      titulo: 'Costas e Bíceps',
      emoji: '🔥',
      exercicios: [
        { nome: 'Puxada frontal', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Remada curvada', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Remada baixa', series: 3, repeticoes: '12', descanso: 60 },
        { nome: 'Rosca direta', series: 3, repeticoes: '12', descanso: 60 },
        { nome: 'Rosca martelo', series: 3, repeticoes: '12', descanso: 60 }
      ]
    },
    qua: {
      titulo: 'Pernas',
      emoji: '🦵',
      exercicios: [
        { nome: 'Agachamento livre', series: 4, repeticoes: '10-12', descanso: 120 },
        { nome: 'Leg press 45°', series: 4, repeticoes: '12', descanso: 90 },
        { nome: 'Cadeira extensora', series: 3, repeticoes: '12-15', descanso: 60 },
        { nome: 'Mesa flexora', series: 3, repeticoes: '12-15', descanso: 60 },
        { nome: 'Panturrilha em pé', series: 4, repeticoes: '15-20', descanso: 45 }
      ]
    },
    qui: {
      titulo: 'Ombros e Abdômen',
      emoji: '💪',
      exercicios: [
        { nome: 'Desenvolvimento militar', series: 4, repeticoes: '10-12', descanso: 90 },
        { nome: 'Elevação lateral', series: 3, repeticoes: '12-15', descanso: 60 },
        { nome: 'Elevação frontal', series: 3, repeticoes: '12', descanso: 60 },
        { nome: 'Prancha', series: 3, repeticoes: '45s', descanso: 45 },
        { nome: 'Abdominal infra', series: 3, repeticoes: '15-20', descanso: 45 }
      ]
    },
    sex: {
      titulo: 'Spinning / Cardio',
      emoji: '🚴',
      exercicios: [
        { nome: 'Aquecimento leve', series: 1, repeticoes: '10 min', descanso: 0 },
        { nome: 'Sprints intervalados', series: 8, repeticoes: '30s', descanso: 60 },
        { nome: 'Subida sentado', series: 4, repeticoes: '2 min', descanso: 90 },
        { nome: 'Desaceleração', series: 1, repeticoes: '5 min', descanso: 0 }
      ]
    },
    sab: {
      titulo: 'Jump / Muay Thai',
      emoji: '🥊',
      exercicios: [
        { nome: 'Jump - sequência 1', series: 3, repeticoes: '3 min', descanso: 60 },
        { nome: 'Jump - sequência 2', series: 3, repeticoes: '3 min', descanso: 60 },
        { nome: 'Muay Thai - sombra', series: 3, repeticoes: '3 min', descanso: 60 },
        { nome: 'Muay Thai - clinch e joelhadas', series: 3, repeticoes: '3 min', descanso: 60 }
      ]
    },
    dom: {
      titulo: 'Descanso ativo',
      emoji: '🧘',
      exercicios: [
        { nome: 'Alongamento geral', series: 1, repeticoes: '15 min', descanso: 0 },
        { nome: 'Caminhada leve', series: 1, repeticoes: '30 min', descanso: 0 }
      ]
    }
  }
};
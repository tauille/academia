/* ==========================================================================
   itrainer — Dados padrão
   Cada exercício:
   - icone: chave em ICONES (SVG do equipamento)
   - equipamento: nome do aparelho
   - series, repeticoes, descanso, carga
   ========================================================================== */

const ICONES = {
  halteres: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M4 8v8M2.5 9.5v5M17.5 6.5v11M20 8v8M21.5 9.5v5M6.5 12h11"/></svg>',
  barra: '<svg viewBox="0 0 24 24"><path d="M3 12h18M5 9v6M8 9v6M16 9v6M19 9v6"/></svg>',
  kettlebell: '<svg viewBox="0 0 24 24"><path d="M9 6a3 3 0 0 1 6 0v1h-6zM7 11a5 5 0 0 0 10 0v-1H7z"/></svg>',
  pesoCorporal: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.2"/><path d="M5 21c.5-5 3-7.5 7-7.5s6.5 2.5 7 7.5"/></svg>',
  chao: '<svg viewBox="0 0 24 24"><path d="M4 20h16M6 16h12M8 12h8"/></svg>',
  halter: '<svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14M6 8v8M18 8v8M9 12h6"/></svg>'
};

const CONFIG = {
  // Treinos padrão (editáveis na tela Gerenciar)
  treinos: [
    {
      id: 't1',
      nome: 'Peito e Tríceps',
      exercicios: [
        { nome: 'Supino no chão com halteres', icone: 'halteres', equipamento: 'Halteres', series: 4, repeticoes: '10-12', descanso: 90, carga: '' },
        { nome: 'Flexão de solo', icone: 'pesoCorporal', equipamento: 'Peso corporal', series: 3, repeticoes: 'até o limite', descanso: 60, carga: '' },
        { nome: 'Tríceps testa com a barra', icone: 'barra', equipamento: 'Barra', series: 3, repeticoes: '10-12', descanso: 60, carga: '' }
      ]
    },
    {
      id: 't2',
      nome: 'Costas e Bíceps',
      exercicios: [
        { nome: 'Remada curvada na barra', icone: 'barra', equipamento: 'Barra', series: 4, repeticoes: '10-12', descanso: 90, carga: '' },
        { nome: 'Rosca direta com a barra', icone: 'barra', equipamento: 'Barra', series: 3, repeticoes: '10-12', descanso: 60, carga: '' },
        { nome: 'Rosca martelo com halteres', icone: 'halteres', equipamento: 'Halteres', series: 3, repeticoes: '12', descanso: 60, carga: '' }
      ]
    }
  ]
};
/* ==========================================================================
   itrainer — Lógica do app
   1. Estado e dados
   2. Navegação entre telas
   3. Tela Início
   4. Tela Treinos (marcar séries + timer)
   5. Tela Progresso
   6. Inicialização
   ========================================================================== */

// ---------- 1. ESTADO E DADOS ----------
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const DIAS_LABEL = { dom: 'Dom', seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb' };

// Estado salvo no navegador (localStorage)
let estado = {
  concluidos: {},   // { "seg-0": [true, true, true, false], ... }
  historico: {}     // { "2026-09-20": "seg", ... }
};

function carregarEstado() {
  try {
    const salvo = localStorage.getItem('itrainer-estado');
    if (salvo) estado = JSON.parse(saldo);
  } catch (e) { /* ignora erros de leitura */ }
}

function salvarEstado() {
  localStorage.setItem('itrainer-estado', JSON.stringify(estado));
}

function hoje() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function diaAtual() {
  return DIAS[new Date().getDay()];
}

// ---------- 2. NAVEGAÇÃO ENTRE TELAS ----------
function navegar(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === viewId);
  });

  if (viewId === 'inicio') renderInicio();
  if (viewId === 'treinos') renderTreinos(diaAtual());
  if (viewId === 'progresso') renderProgresso();
}

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => navegar(el.dataset.view));
});

// ---------- 3. TELA INÍCIO ----------
function renderInicio() {
  const dia = diaAtual();
  const treino = CONFIG.treinos[dia];
  const hora = new Date().getHours();

  let saudacao = 'Boa noite';
  if (hora < 12) saudacao = 'Bom dia';
  else if (hora < 18) saudacao = 'Boa tarde';
  document.getElementById('saudacao').textContent = saudacao;

  document.getElementById('headerDay').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const frases = [
    'Hoje é dia de evoluir. Bora!',
    'Disciplina hoje, resultado amanhã.',
    'Seu corpo agradece cada repetição.',
    'Um treino de cada vez.'
  ];
  document.getElementById('fraseDia').textContent =
    frases[Math.floor(Math.random() * frases.length)];

  // Card do treino de hoje
  const concluidos = estado.concluidos[dia] || [];
  const total = treino.exercicios.length;
  const feitos = concluidos.filter(c => c).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;

  const card = document.getElementById('cardHoje');
  const treinoConcluido = feitos === total && total > 0;

  card.innerHTML = `
    <div class="card-treino-hoje">
      <div class="card-topo">
        <h3>${treino.emoji} ${treino.titulo}</h3>
        <span class="dia-tag">${DIAS_LABEL[dia]}</span>
      </div>
      <div class="progresso-barra">
        <div class="preenchimento" style="width:${pct}%"></div>
      </div>
      <div class="progresso-texto">${feitos} de ${total} exercícios concluídos</div>
      <button class="btn ${treinoConcluido ? 'btn-outline' : 'btn-primary'}" data-view="treinos">
        ${treinoConcluido ? '✅ Treino concluído — rever' : 'Começar treino →'}
      </button>
    </div>
  `;

  card.querySelector('button').addEventListener('click', () => navegar('treinos'));

  // Estatísticas
  const semana = Object.keys(estado.historico).filter(data => {
    const d = new Date(data);
    const diff = (new Date() - d) / 86400000;
    return diff < 7 && diff >= 0;
  }).length;

  let sequencia = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const chave = d.toISOString().split('T')[0];
    if (estado.historico[chave]) sequencia++;
    else break;
  }

  let totalExercicios = 0;
  Object.values(estado.concluidos).forEach(arr => {
    totalExercicios += arr.filter(c => c).length;
  });

  document.getElementById('statSemana').textContent = semana;
  document.getElementById('statSequencia').textContent = sequencia;
  document.getElementById('statExercicios').textContent = totalExercicios;
}

// ---------- 4. TELA TREINOS ----------
function renderTreinos(diaSelecionado) {
  // Abas dos dias
  const tabs = document.getElementById('diasTabs');
  tabs.innerHTML = DIAS.map(dia => `
    <button class="dia-tab ${dia === diaSelecionado ? 'active' : ''}" data-dia="${dia}">
      ${DIAS_LABEL[dia]}
    </button>
  `).join('');

  tabs.querySelectorAll('.dia-tab').forEach(tab => {
    tab.addEventListener('click', () => renderTreinos(tab.dataset.dia));
  });

  // Lista de exercícios
  const treino = CONFIG.treinos[diaSelecionado];
  const concluidos = estado.concluidos[diaSelecionado] || {};
  const lista = document.getElementById('listaExercicios');

  lista.innerHTML = `
    <div class="welcome">
      <h1>${treino.emoji} ${treino.titulo}</h1>
      <p>Toque nas séries para marcar como concluídas.</p>
    </div>
  `;

  treino.exercicios.forEach((ex, i) => {
    const seriesFeitas = (concluidos[i] || []).filter(Boolean).length;
    const concluido = seriesFeitas === ex.series;

    const card = document.createElement('div');
    card.className = 'exercicio' + (concluido ? ' concluido' : '');
    card.innerHTML = `
      <div class="exercicio-topo">
        <div>
          <h3>${i + 1}. ${ex.nome}</h3>
          <div class="exercicio-meta">
            <strong>${ex.series} séries</strong> × ${ex.repeticoes} reps · descanso ${ex.descanso}s
          </div>
        </div>
      </div>
      <div class="series">
        ${Array.from({ length: ex.series }, (_, s) => `
          <button class="serie ${(concluidos[i] || [])[s] ? 'concluida' : ''}" data-ex="${i}" data-serie="${s}">
            <span class="serie-num">${s + 1}ª</span>
            série
          </button>
        `).join('')}
      </div>
    `;

    card.querySelectorAll('.serie').forEach(btn => {
      btn.addEventListener('click', () => marcarSerie(diaSelecionado, i, Number(btn.dataset.serie), ex.descanso));
    });

    lista.appendChild(card);
  });
}

function marcarSerie(dia, exIndex, serieIndex, descanso) {
  if (!estado.concluidos[dia]) estado.concluidos[dia] = {};
  if (!estado.concluidos[dia][exIndex]) estado.concluidos[dia][exIndex] = [];

  const arr = estado.concluidos[dia][exIndex];
  arr[serieIndex] = !arr[serieIndex]; // alterna marcado/desmarcado
  salvarEstado();

  // Verifica se o exercício inteiro foi concluído
  const ex = CONFIG.treinos[dia].exercicios[exIndex];
  const completo = arr.filter(Boolean).length === ex.series;

  // Se marcou (não desmarcou) e tem descanso, abre o timer
  if (arr[serieIndex] && completo && descanso > 0) {
    abrirTimer(descanso);
  } else if (arr[serieIndex] && descanso > 0) {
    abrirTimer(descanso);
  }

  renderTreinos(dia);
  registrarHistorico(dia);
}

function registrarHistorico(dia) {
  const treino = CONFIG.treinos[dia];
  const concluidos = estado.concluidos[dia] || {};
  const completo = treino.exercicios.every((ex, i) =>
    (concluidos[i] || []).filter(Boolean).length === ex.series
  );

  if (completo) {
    estado.historico[hoje()] = dia;
    salvarEstado();
  }
}

// ---------- TIMER DE DESCANSO ----------
let timerInterval = null;

function abrirTimer(segundos) {
  const modal = document.getElementById('modalTimer');
  const numero = document.getElementById('timerNumero');
  let restante = segundos;

  modal.classList.add('aberto');
  numero.textContent = restante;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    restante--;
    numero.textContent = restante;
    if (restante <= 0) {
      clearInterval(timerInterval);
      modal.classList.remove('aberto');
    }
  }, 1000);
}

document.getElementById('timerFechar').addEventListener('click', () => {
  clearInterval(timerInterval);
  document.getElementById('modalTimer').classList.remove('aberto');
});

document.getElementById('timerPausar').addEventListener('click', () => {
  // Pausa/retoma de forma simples
  clearInterval(timerInterval);
  timerInterval = null;
});

// ---------- 5. TELA PROGRESSO ----------
function renderProgresso() {
  const barra = document.getElementById('barraSemana');
  const resumo = document.getElementById('resumoProgresso');

  // Últimos 7 dias
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(d);
  }

  barra.innerHTML = dias.map(d => {
    const chave = d.toISOString().split('T')[0];
    const dia = DIAS[d.getDay()];
    const treino = CONFIG.treinos[dia];
    const concluidos = estado.concluidos[dia] || {};
    const total = treino.exercicios.length;
    const feitos = treino.exercicios.filter((ex, i) =>
      (concluidos[i] || []).filter(Boolean).length === ex.series
    ).length;
    const pct = total ? (feitos / total) * 100 : 0;
    const completo = feitos === total && total > 0;

    return `
      <div class="barra-dia">
        <div class="barra ${pct > 0 ? 'preenchida' : ''}" style="height:${Math.max(pct, 4)}%"></div>
        <span>${DIAS_LABEL[dia]}</span>
      </div>
    `;
  }).join('');

  // Resumo
  const totalSemana = dias.filter(d => estado.historico[d.toISOString().split('T')[0]]).length;
  resumo.innerHTML = `
    <h4>Resumo da semana</h4>
    <ul class="resumo-lista">
      <li><span>Treinos concluídos</span><span class="ok">${totalSemana} de 7</span></li>
      <li><span>Objetivo semanal</span><span class="${totalSemana >= 5 ? 'ok' : 'pendente'}">${totalSemana >= 5 ? 'Meta atingida 🎉' : 'Faltam ' + (5 - totalSemana)}</span></li>
    </ul>
  `;
}

// ---------- 6. INICIALIZAÇÃO ----------
carregarEstado();
navegar('inicio');
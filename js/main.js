/* ==========================================================================
   itrainer — Lógica do app
   1. Estado e dados
   2. Navegação entre telas
   3. Tela Início
   4. Tela Treinos (marcar séries + timer)
   5. Tela Progresso
   6. Tela Gerenciar (cadastrar e alterar treinos)
   7. Inicialização
   ========================================================================== */

// ---------- 1. ESTADO E DADOS ----------
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const DIAS_LABEL = { dom: 'Dom', seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb' };

let estado = {
  concluidos: {},   // { "seg-0": [true, true, ...], ... }
  historico: {}     // { "2026-09-20": "seg", ... }
};

let treinos = null; // treinos em uso (padrão ou personalizados)

function treinosAtuais() {
  if (treinos) return treinos;
  try {
    treinos = JSON.parse(localStorage.getItem('itrainer-treinos')) || null;
  } catch (e) { treinos = null; }
  if (!treinos) treinos = CONFIG.treinos;
  return treinos;
}

function salvarTreinos() {
  localStorage.setItem('itrainer-treinos', JSON.stringify(treinos));
}

function carregarEstado() {
  try {
    const salvo = localStorage.getItem('itrainer-estado');
    if (salvo) estado = JSON.parse(saldo);
  } catch (e) { /* ignora */ }
}

function salvarEstado() {
  localStorage.setItem('itrainer-estado', JSON.stringify(estado));
}

function hoje() {
  return new Date().toISOString().split('T')[0];
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
  if (viewId === 'gerenciar') renderGerenciar();
}

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => navegar(el.dataset.view));
});

// ---------- 3. TELA INÍCIO ----------
function renderInicio() {
  const dia = diaAtual();
  const treino = treinosAtuais()[dia];
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

  const card = document.getElementById('cardHoje');
  const concluidos = estado.concluidos[dia] || {};
  const total = (treino.exercicios || []).length;
  const feitos = treino.exercicios.filter((ex, i) =>
    (concluidos[i] || []).filter(Boolean).length === ex.series
  ).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  const treinoConcluido = total > 0 && feitos === total;

  if (total === 0) {
    card.innerHTML = `
      <div class="card-treino-hoje">
        <div class="card-topo">
          <h3>${treino.emoji} ${treino.titulo}</h3>
          <span class="dia-tag">${DIAS_LABEL[dia]}</span>
        </div>
        <div class="progresso-texto">Hoje é dia de descanso. Recuperação também é treino! 🧘</div>
        <button class="btn btn-outline" data-view="treinos">Ver treinos da semana</button>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => navegar('treinos'));
  } else {
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
  }

  // Estatísticas
  const semana = Object.keys(estado.historico).filter(data => {
    const diff = (new Date() - new Date(data)) / 86400000;
    return diff < 7 && diff >= 0;
  }).length;

  let sequencia = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (estado.historico[d.toISOString().split('T')[0]]) sequencia++;
    else break;
  }

  let totalExercicios = 0;
  Object.values(estado.concluidos).forEach(arr => {
    Object.values(arr).forEach(series => {
      totalExercicios += series.filter(Boolean).length;
    });
  });

  document.getElementById('statSemana').textContent = semana;
  document.getElementById('statSequencia').textContent = sequencia;
  document.getElementById('statExercicios').textContent = totalExercicios;
}

// ---------- 4. TELA TREINOS ----------
function renderTreinos(diaSelecionado) {
  const tabs = document.getElementById('diasTabs');
  tabs.innerHTML = DIAS.map(dia => `
    <button class="dia-tab ${dia === diaSelecionado ? 'active' : ''}" data-dia="${dia}">
      ${DIAS_LABEL[dia]}
    </button>
  `).join('');

  tabs.querySelectorAll('.dia-tab').forEach(tab => {
    tab.addEventListener('click', () => renderTreinos(tab.dataset.dia));
  });

  const treino = treinosAtuais()[diaSelecionado];
  const lista = document.getElementById('listaExercicios');

  if (!treino || !treino.exercicios || treino.exercicios.length === 0) {
    lista.innerHTML = `
      <div class="welcome">
        <h1>${(treino && treino.emoji) || '😴'} ${(treino && treino.titulo) || 'Descanso'}</h1>
        <p>Dia de descanso. Aproveite para recuperar! 🧘</p>
      </div>
    `;
    return;
  }

  const concluidos = estado.concluidos[diaSelecionado] || {};
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
  const marcou = !arr[serieIndex];
  arr[serieIndex] = marcou;
  salvarEstado();

  if (marcou && descanso > 0) abrirTimer(descanso);

  renderTreinos(dia);
  registrarHistorico(dia);
}

function registrarHistorico(dia) {
  const treino = treinosAtuais()[dia];
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
let timerRestante = 0;
let timerRodando = false;

function abrirTimer(segundos) {
  const modal = document.getElementById('modalTimer');
  const numero = document.getElementById('timerNumero');
  timerRestante = segundos;
  timerRodando = true;
  modal.classList.add('aberto');
  numero.textContent = timerRestante;
  document.getElementById('timerPausar').textContent = 'Pausar';

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!timerRodando) return;
    timerRestante--;
    numero.textContent = timerRestante;
    if (timerRestante <= 0) {
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
  timerRodando = !timerRodando;
  document.getElementById('timerPausar').textContent = timerRodando ? 'Pausar' : 'Continuar';
});

// ---------- 5. TELA PROGRESSO ----------
function renderProgresso() {
  const barra = document.getElementById('barraSemana');
  const resumo = document.getElementById('resumoProgresso');

  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(d);
  }

  barra.innerHTML = dias.map(d => {
    const chave = d.toISOString().split('T')[0];
    const dia = DIAS[d.getDay()];
    const treino = treinosAtuais()[dia];
    const concluidos = estado.concluidos[dia] || {};
    const total = (treino.exercicios || []).length;
    const feitos = treino.exercicios.filter((ex, i) =>
      (concluidos[i] || []).filter(Boolean).length === ex.series
    ).length;
    const pct = total ? (feitos / total) * 100 : 0;

    return `
      <div class="barra-dia">
        <div class="barra ${pct > 0 ? 'preenchida' : ''}" style="height:${Math.max(pct, 4)}%"></div>
        <span>${DIAS_LABEL[dia]}</span>
      </div>
    `;
  }).join('');

  const totalSemana = dias.filter(d => estado.historico[d.toISOString().split('T')[0]]).length;
  resumo.innerHTML = `
    <h4>Resumo da semana</h4>
    <ul class="resumo-lista">
      <li><span>Treinos concluídos</span><span class="ok">${totalSemana} de 7</span></li>
      <li><span>Objetivo semanal</span><span class="${totalSemana >= 4 ? 'ok' : 'pendente'}">${totalSemana >= 4 ? 'Meta atingida 🎉' : 'Faltam ' + (4 - totalSemana)}</span></li>
    </ul>
  `;
}

// ---------- 6. TELA GERENCIAR (CADASTRAR E ALTERAR TREINOS) ----------
function renderGerenciar() {
  const lista = document.getElementById('listaGerenciar');
  const t = treinosAtuais();

  lista.innerHTML = DIAS.map(dia => {
    const treino = t[dia] || { titulo: 'Descanso', emoji: '😴', exercicios: [] };
    const qtd = (treino.exercicios || []).length;
    return `
      <div class="dia-gerenciar">
        <div class="dia-gerenciar-info">
          <strong>${DIAS_LABEL[dia]}</strong>
          <span>${treino.emoji} ${treino.titulo} · ${qtd} exercícios</span>
        </div>
        <button class="btn btn-outline btn-pequeno" data-editar="${dia}">Editar</button>
      </div>
    `;
  }).join('');

  lista.querySelectorAll('[data-editar]').forEach(btn => {
    btn.addEventListener('click', () => abrirEditor(btn.dataset.editar));
  });
}

function abrirEditor(dia) {
  const t = treinosAtuais();
  const treino = t[dia] || { titulo: 'Descanso', emoji: '😴', exercicios: [] };
  const modal = document.getElementById('modalEditor');
  const corpo = document.getElementById('editorCorpo');

  corpo.innerHTML = `
    <div class="editor-cabecalho">
      <h3>${DIAS_LABEL[dia]}</h3>
      <button class="btn btn-outline btn-pequeno" id="editorFechar">✕</button>
    </div>
    <label class="campo">
      <span>Nome do treino</span>
      <input type="text" id="edTitulo" value="${treino.titulo}">
    </label>
    <label class="campo">
      <span>Emoji</span>
      <input type="text" id="edEmoji" value="${treino.emoji}" maxlength="4">
    </label>
    <div id="edExercicios"></div>
    <button class="btn btn-outline" id="edAdicionar" style="width:100%;">+ Adicionar exercício</button>
    <div class="editor-acoes">
      <button class="btn btn-primary" id="edSalvar">Salvar treino</button>
      <button class="btn btn-outline" id="edDescanso">Definir como descanso</button>
    </div>
  `;

  const cont = corpo.querySelector('#edExercicios');

  // Lê os valores digitados nas linhas e grava no objeto treino
  const coletarLinhas = () => {
    treino.exercicios = Array.from(cont.querySelectorAll('.ed-exercicio')).map(row => ({
      nome: row.querySelector('.ed-nome').value.trim(),
      series: Number(row.querySelector('.ed-series').value) || 3,
      repeticoes: row.querySelector('.ed-reps').value.trim() || '12',
      descanso: Number(row.querySelector('.ed-descanso').value) || 60
    }));
  };

  const renderRows = () => {
    cont.innerHTML = '';
    treino.exercicios.forEach((ex, i) => {
      const row = document.createElement('div');
      row.className = 'ed-exercicio';
      row.innerHTML = `
        <input type="text" class="ed-nome" value="${ex.nome}" placeholder="Nome do exercício">
        <div class="ed-linha">
          <input type="number" class="ed-series" value="${ex.series}" min="1" placeholder="Séries">
          <input type="text" class="ed-reps" value="${ex.repeticoes}" placeholder="Repetições">
          <input type="number" class="ed-descanso" value="${ex.descanso}" min="0" placeholder="Descanso (s)">
        </div>
        <button class="btn btn-outline btn-pequeno ed-remover">Remover</button>
      `;
      row.querySelector('.ed-remover').addEventListener('click', () => {
        coletarLinhas();
        treino.exercicios.splice(i, 1);
        renderRows();
      });
      cont.appendChild(row);
    });
  };
  renderRows();

  corpo.querySelector('#edAdicionar').addEventListener('click', () => {
    coletarLinhas();
    treino.exercicios.push({ nome: '', series: 3, repeticoes: '12', descanso: 60 });
    renderRows();
  });

  corpo.querySelector('#edSalvar').addEventListener('click', () => {
    coletarLinhas();
    treino.exercicios = treino.exercicios.filter(ex => ex.nome !== '');
    treino.titulo = corpo.querySelector('#edTitulo').value.trim() || 'Treino';
    treino.emoji = corpo.querySelector('#edEmoji').value.trim() || '🏋️';
    t[dia] = treino;
    treinos = t;
    salvarTreinos();
    delete estado.concluidos[dia]; // limpa marcações antigas do dia
    salvarEstado();
    modal.classList.remove('aberto');
    renderGerenciar();
  });

  corpo.querySelector('#edDescanso').addEventListener('click', () => {
    t[dia] = { titulo: 'Descanso', emoji: '😴', exercicios: [] };
    treinos = t;
    salvarTreinos();
    delete estado.concluidos[dia];
    salvarEstado();
    modal.classList.remove('aberto');
    renderGerenciar();
  });

  corpo.querySelector('#editorFechar').addEventListener('click', () => {
    modal.classList.remove('aberto');
  });

  modal.classList.add('aberto');
}

// ---------- 7. INICIALIZAÇÃO ----------
carregarEstado();
navegar('inicio');
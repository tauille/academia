/* ==========================================================================
   itrainer — Lógica do app
   1. Estado e dados
   2. Navegação entre telas
   3. Tela Início (anel de progresso)
   4. Tela Treinos (séries + timers)
   5. Tela Progresso
   6. Tela Nutrição
   7. Tela Perfil
   8. Tela Gerenciar
   9. Inicialização
   ========================================================================== */

// ---------- 1. ESTADO E DADOS ----------
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const DIAS_LABEL = { dom: 'Dom', seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb' };
const OBJETIVOS = {
  hipertrofia: '🎯 Hipertrofia',
  emagrecimento: '⚖️ Emagrecimento',
  condicionamento: '💨 Condicionamento',
  forca: '🏋️ Força'
};

let estado = { concluidos: {}, historico: {}, cargas: {} };
let treinos = null;

// Retorna o SVG do ícone pelo nome; fallback para halteres
function iconeSvg(nome) {
  return ICONES[nome] || ICONES.halteres;
}

function treinosAtuais() {
  if (treinos) return treinos;
  try { treinos = JSON.parse(localStorage.getItem('itrainer-treinos')) || null; }
  catch (e) { treinos = null; }
  if (!treinos) treinos = CONFIG.treinos;
  return treinos;
}

function salvarTreinos() { localStorage.setItem('itrainer-treinos', JSON.stringify(treinos)); }

function carregarEstado() {
  try {
    const salvo = localStorage.getItem('itrainer-estado');
    if (salvo) estado = JSON.parse(saldo);
  } catch (e) { /* ignora */ }
}

function salvarEstado() { localStorage.setItem('itrainer-estado', JSON.stringify(estado)); }

function perfilAtual() {
  try {
    const p = JSON.parse(localStorage.getItem('itrainer-perfil'));
    if (p) return Object.assign({}, CONFIG.perfil, p);
  } catch (e) { /* ignora */ }
  return Object.assign({}, CONFIG.perfil);
}

function salvarPerfil(p) { localStorage.setItem('itrainer-perfil', JSON.stringify(p)); }

function hoje() { return new Date().toISOString().split('T')[0]; }
function diaAtual() { return DIAS[new Date().getDay()]; }

// Converte "45s", "3 min", "10 min" em segundos. Retorna 0 se não for tempo.
function tempoEmSegundos(texto) {
  if (!texto) return 0;
  const t = String(texto).toLowerCase();
  if (!/\d/.test(t)) return 0;
  if (t.includes('min')) {
    const m = t.match(/([\d.,]+)\s*min/);
    return m ? Math.round(parseFloat(m[1].replace(',', '.')) * 60) : 0;
  }
  if (t.includes('seg') || /(\d)\s*s\b/.test(t)) {
    const s = t.match(/([\d.,]+)\s*(seg|s)/);
    return s ? Math.round(parseFloat(s[1].replace(',', '.'))) : 0;
  }
  return 0;
}

// ---------- 2. NAVEGAÇÃO ----------
function navegar(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.view === viewId);
  });

  if (viewId === 'inicio') renderInicio();
  if (viewId === 'treinos') renderTreinos(diaAtual());
  if (viewId === 'progresso') renderProgresso();
  if (viewId === 'nutricao') renderNutricao();
  if (viewId === 'perfil') renderPerfil();
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
  const perfil = perfilAtual();

  let saudacao = 'Boa noite';
  if (hora < 12) saudacao = 'Bom dia';
  else if (hora < 18) saudacao = 'Boa tarde';

  const nome = (perfil.nome || '').trim();
  document.getElementById('saudacao').textContent = nome ? `${saudacao}, ${nome}!` : `${saudacao}!`;

  const chip = document.getElementById('chipObjetivo');
  chip.textContent = OBJETIVOS[perfil.objetivo] || OBJETIVOS.hipertrofia;

  document.getElementById('headerDay').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const frases = [
    'Hoje é dia de evoluir. Bora!',
    'Disciplina hoje, resultado amanhã.',
    'Seu corpo agradece cada repetição.',
    'Um treino de cada vez.'
  ];
  document.getElementById('fraseDia').textContent = frases[Math.floor(Math.random() * frases.length)];

  const card = document.getElementById('cardHoje');
  const concluidos = estado.concluidos[dia] || {};
  const total = (treino.exercicios || []).length;
  const feitos = treino.exercicios.filter((ex, i) =>
    (concluidos[i] || []).filter(Boolean).length === ex.series
  ).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  const treinoConcluido = total > 0 && feitos === total;
  const C = 2 * Math.PI * 52;
  const offset = C * (1 - pct / 100);

  if (total === 0) {
    card.innerHTML = `
      <div class="card-treino-hoje">
        <div class="card-topo">
          <div class="card-titulo">
            <span class="treino-emoji">${treino.emoji}</span>
            <div>
              <h3>${treino.titulo}</h3>
              <span class="dia-tag">${DIAS_LABEL[dia]}</span>
            </div>
          </div>
        </div>
        <div class="progresso-texto">Hoje é dia de descanso. Recuperação também é treino! 🧘</div>
        <button class="btn btn-outline" data-view="treinos" style="width:100%;margin-top:1rem;">Ver treinos da semana</button>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => navegar('treinos'));
  } else {
    card.innerHTML = `
      <div class="card-treino-hoje">
        <div class="card-topo">
          <div class="card-titulo">
            <span class="treino-emoji">${treino.emoji}</span>
            <div>
              <h3>${treino.titulo}</h3>
              <span class="dia-tag">${DIAS_LABEL[dia]}</span>
            </div>
          </div>
        </div>
        <div class="card-corpo">
          <div class="ring-wrap">
            <svg class="ring" viewBox="0 0 120 120">
              <circle class="ring-bg" cx="60" cy="60" r="52"/>
              <circle class="ring-fill" cx="60" cy="60" r="52" stroke-dasharray="${C}" stroke-dashoffset="${offset}"/>
            </svg>
            <div class="ring-texto">
              <strong>${pct}%</strong>
              <span>concluído</span>
            </div>
          </div>
          <div class="card-info">
            <p class="progresso-texto"><strong>${feitos}</strong> de ${total} exercícios concluídos</p>
            <button class="btn ${treinoConcluido ? 'btn-outline' : 'btn-primary'}" data-view="treinos">
              ${treinoConcluido ? '✅ Treino concluído — rever' : 'Começar treino →'}
            </button>
          </div>
        </div>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => navegar('treinos'));
  }

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
    Object.values(arr).forEach(series => { totalExercicios += series.filter(Boolean).length; });
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
      <div class="treino-cabecalho">
        <span class="treino-emoji">${(treino && treino.emoji) || '😴'}</span>
        <div>
          <h1>${(treino && treino.titulo) || 'Descanso'}</h1>
          <p>Dia de descanso. Aproveite para recuperar! 🧘</p>
        </div>
      </div>
    `;
    return;
  }

  const concluidos = estado.concluidos[diaSelecionado] || {};
  lista.innerHTML = `
    <div class="treino-cabecalho">
      <span class="treino-emoji">${treino.emoji}</span>
      <div>
        <h1>${treino.titulo}</h1>
        <p>Toque nas séries para marcar como concluídas.</p>
      </div>
    </div>
  `;

  treino.exercicios.forEach((ex, i) => {
    const seriesFeitas = (concluidos[i] || []).filter(Boolean).length;
    const concluido = seriesFeitas === ex.series;
    const tempo = tempoEmSegundos(ex.repeticoes);
    const metaTempo = tempo > 0
      ? `<span class="chip">⏱️ <strong>${ex.repeticoes}</strong></span>`
      : `<span class="chip">🔁 <strong>${ex.repeticoes}</strong> reps</span>`;

    const card = document.createElement('div');
    card.className = 'exercicio' + (concluido ? ' concluido' : '');
    card.innerHTML = `
      <div class="exercicio-topo">
        <div class="icon-badge" title="${ex.equipamento}">${iconeSvg(ex.icone)}</div>
        <div>
          <h3>${i + 1}. ${ex.nome}</h3>
          <div class="exercicio-meta">
            <span class="chip equipamento">${ex.equipamento || 'Equipamento'}</span>
            <span class="chip">📦 <strong>${ex.series}</strong> séries</span>
            ${metaTempo}
            <span class="chip">⏳ descanso <strong>${ex.descanso}s</strong></span>
            ${ex.carga ? `<span class="chip">⚖️ <strong>${ex.carga}kg</strong></span>` : ''}
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
      btn.addEventListener('click', () => marcarSerie(diaSelecionado, i, Number(btn.dataset.serie), ex));
    });

    lista.appendChild(card);
  });
}

function marcarSerie(dia, exIndex, serieIndex, ex) {
  if (!estado.concluidos[dia]) estado.concluidos[dia] = {};
  if (!estado.concluidos[dia][exIndex]) estado.concluidos[dia][exIndex] = [];

  const arr = estado.concluidos[dia][exIndex];
  const marcou = !arr[serieIndex];
  arr[serieIndex] = marcou;
  salvarEstado();

  if (marcou) {
    const tempo = tempoEmSegundos(ex.repeticoes);
    if (tempo > 0) {
      // Exercício por tempo: cronometra a duração do exercício
      abrirTimer(tempo, 'Tempo do exercício', ex.nome);
    } else if (ex.descanso > 0) {
      // Exercício normal: cronometra o descanso
      abrirTimer(ex.descanso, 'Descanso', ex.nome);
    }
  }

  if (arr.filter(Boolean).length === ex.series) registrarCarga(dia, exIndex);

  renderTreinos(dia);
  registrarHistorico(dia);
}

function registrarCarga(dia, exIndex) {
  const ex = treinosAtuais()[dia].exercicios[exIndex];
  const carga = Number(ex.carga) || 0;
  if (carga <= 0) return;

  if (!estado.cargas) estado.cargas = {};
  const chave = dia + '-' + exIndex;
  if (!estado.cargas[chave]) estado.cargas[chave] = [];

  const historico = estado.cargas[chave];
  const ultimo = historico[historico.length - 1];
  if (ultimo && ultimo.data === hoje()) return;

  historico.push({ data: hoje(), carga });
  salvarEstado();
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

// ---------- TIMER (TEMPO DE EXERCÍCIO E DESCANSO) ----------
let timerInterval = null;
let timerRestante = 0;
let timerTotal = 1;
let timerRodando = false;

function abrirTimer(segundos, titulo, nomeExercicio) {
  const modal = document.getElementById('modalTimer');
  const numero = document.getElementById('timerNumero');
  const ring = document.getElementById('timerRing');
  const C = 2 * Math.PI * 52;

  timerRestante = segundos;
  timerTotal = segundos;
  timerRodando = true;

  document.getElementById('timerTitulo').textContent = titulo;
  document.getElementById('timerExercicio').textContent = nomeExercicio || '';
  document.getElementById('timerPausar').textContent = 'Pausar';
  numero.textContent = timerRestante;
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = 0;

  modal.classList.add('aberto');

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!timerRodando) return;
    timerRestante--;
    numero.textContent = timerRestante;
    ring.style.strokeDashoffset = C * (1 - timerRestante / timerTotal);
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
  const perfil = perfilAtual();
  const meta = perfil.diasMeta || 4;

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
    <h4>📊 Resumo da semana</h4>
    <ul class="resumo-lista">
      <li><span>Treinos concluídos</span><span class="ok">${totalSemana} de 7</span></li>
      <li><span>Meta semanal (${meta} treinos)</span><span class="${totalSemana >= meta ? 'ok' : 'pendente'}">${totalSemana >= meta ? 'Meta atingida 🎉' : 'Faltam ' + (meta - totalSemana)}</span></li>
    </ul>
  `;

  renderEvolucao();
}

function renderEvolucao() {
  const container = document.getElementById('evolucaoCargas');
  if (!container) return;

  const t = treinosAtuais();
  const itens = [];

  Object.keys(estado.cargas || {}).forEach(chave => {
    const partes = chave.split('-');
    const dia = partes[0];
    const exIndex = Number(partes[1]);
    const ex = t[dia] && t[dia].exercicios
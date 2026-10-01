/* ==========================================================================
   itrainer — Lógica (versão enxuta)
   1. Estado e dados
   2. Navegação
   3. Tela Treinos (execução)
   4. Controle de séries + timer
   5. Tela Gerenciar (cadastro)
   6. Timer
   7. Inicialização
   ========================================================================== */

// ---------- 1. ESTADO E DADOS ----------
let treinos = null;
let treinoAtivo = null;   // treino em execução
let estado = {};          // { treinoId: { exIndex: [bool,...] } }

function iconeSvg(nome) { return ICONES[nome] || ICONES.halteres; }

function carregarTreinos() {
  try { treinos = JSON.parse(localStorage.getItem('itrainer-treinos')) || null; }
  catch (e) { treinos = null; }
  if (!treinos) treinos = JSON.parse(JSON.stringify(CONFIG.treinos));
}
function salvarTreinos() { localStorage.setItem('itrainer-treinos', JSON.stringify(treinos)); }

function carregarEstado() {
  try { estado = JSON.parse(localStorage.getItem('itrainer-estado')) || {}; }
  catch (e) { estado = {}; }
}
function salvarEstado() { localStorage.setItem('itrainer-estado', JSON.stringify(estado)); }

// ---------- 2. NAVEGAÇÃO ----------
function navegar(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  document.getElementById('appMain').scrollTop = 0;

  if (viewId === 'treinos') renderTreinos();
  if (viewId === 'gerenciar') renderGerenciar();
}

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => navegar(el.dataset.view));
});

// ---------- 3. TELA TREINOS ----------
function renderTreinos() {
  const lista = document.getElementById('listaTreinos');

  // Se um treino está em execução, mostra a execução
  if (treinoAtivo) { renderExecucao(); return; }

  if (!treinos.length) {
    lista.innerHTML = '<p style="color:var(--muted);text-align:center;margin-top:2rem;">Nenhum treino cadastrado. Vá em Gerenciar para criar um.</p>';
    return;
  }

  lista.innerHTML = treinos.map(t => {
    const ex = estado[t.id] || {};
    const total = t.exercicios.length;
    const feitos = t.exercicios.filter((_, i) => (ex[i] || []).filter(Boolean).length === t.exercicios[i].series).length;
    const pct = total ? Math.round((feitos / total) * 100) : 0;
    const concluido = total > 0 && feitos === total;

    return `
      <div class="treino-card ${concluido ? 'concluido' : ''}" data-abrir="${t.id}">
        <div class="treino-topo">
          <h3>${t.nome}</h3>
          <span class="chip">${feitos}/${total} ${concluido ? '✓' : ''}</span>
        </div>
        <div class="treino-meta">${t.exercicios.length} exercícios</div>
        <div class="treino-progresso"><div class="fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');

  lista.querySelectorAll('[data-abrir]').forEach(card => {
    card.addEventListener('click', () => {
      treinoAtivo = treinos.find(t => t.id === card.dataset.abrir);
      renderExecucao();
    });
  });
}

// ---------- EXECUÇÃO DO TREINO ----------
function renderExecucao() {
  const lista = document.getElementById('listaTreinos');
  const t = treinoAtivo;
  const ex = estado[t.id] || {};

  const total = t.exercicios.length;
  const feitos = t.exercicios.filter((_, i) => (ex[i] || []).filter(Boolean).length === t.exercicios[i].series).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;

  let html = `
    <div class="exec-cabecalho">
      <button class="voltar" id="voltarTreinos">←</button>
      <div>
        <h1>${t.nome}</h1>
        <div class="treino-progresso" style="margin-top:0.4rem;"><div class="fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;

  t.exercicios.forEach((exer, i) => {
    const seriesFeitas = (ex[i] || []).filter(Boolean).length;
    const concluido = seriesFeitas === exer.series;
    const tempo = tempoEmSegundos(exer.repeticoes);
    const metaTempo = tempo > 0
      ? `<span class="chip">⏱️ <strong>${exer.repeticoes}</strong></span>`
      : `<span class="chip">🔁 <strong>${exer.repeticoes}</strong> reps</span>`;

    html += `
      <div class="exercicio ${concluido ? 'concluido' : ''}">
        <div class="exercicio-topo">
          <div class="icon-badge">${iconeSvg(exer.icone)}</div>
          <div>
            <h3>${i + 1}. ${exer.nome}</h3>
            <div class="exercicio-meta">
              <span class="chip">${exer.equipamento || ''}</span>
              <span class="chip">📦 <strong>${exer.series}</strong> séries</span>
              ${metaTempo}
              <span class="chip">⏳ <strong>${exer.descanso}s</strong></span>
              ${exer.carga ? `<span class="chip">⚖️ <strong>${exer.carga}kg</strong></span>` : ''}
            </div>
          </div>
        </div>
        <div class="series">
          ${Array.from({ length: exer.series }, (_, s) => `
            <button class="serie ${(ex[i] || [])[s] ? 'concluida' : ''}" data-ex="${i}" data-serie="${s}">
              <span class="serie-num">${s + 1}ª</span> série
            </button>`).join('')}
        </div>
      </div>`;
  });

  html += `
    <button class="btn ${feitos === total ? 'btn-outline' : 'btn-primary'} btn-bloco" id="btnConcluirTreino">
      ${feitos === total ? '✓ Treino concluído' : 'Concluir treino'}
    </button>`;

  lista.innerHTML = html;

  document.getElementById('voltarTreinos').addEventListener('click', () => { treinoAtivo = null; renderTreinos(); });

  lista.querySelectorAll('.serie').forEach(btn => {
    btn.addEventListener('click', () => marcarSerie(Number(btn.dataset.ex), Number(btn.dataset.serie)));
  });

  document.getElementById('btnConcluirTreino').addEventListener('click', () => {
    marcarTreinoConcluido();
  });
}

// ---------- 4. CONTROLE DE SÉRIES ----------
function marcarSerie(exIndex, serieIndex) {
  const t = treinoAtivo;
  const ex = t.exercicios[exIndex];
  if (!estado[t.id]) estado[t.id] = {};
  if (!estado[t.id][exIndex]) estado[t.id][exIndex] = [];

  const arr = estado[t.id][exIndex];
  const marcou = !arr[serieIndex];
  arr[serieIndex] = marcou;
  salvarEstado();

  if (marcou) {
    const tempo = tempoEmSegundos(ex.repeticoes);
    if (tempo > 0) abrirTimer(tempo, 'Tempo do exercício', ex.nome);
    else if (ex.descanso > 0) abrirTimer(ex.descanso, 'Descanso', ex.nome);
  }

  renderExecucao();
}

function marcarTreinoConcluido() {
  const t = treinoAtivo;
  const ex = estado[t.id] || {};
  t.exercicios.forEach((exer, i) => {
    if (!ex[i]) ex[i] = [];
    for (let s = 0; s < exer.series; s++) ex[i][s] = true;
  });
  estado[t.id] = ex;
  salvarEstado();
  renderExecucao();
}

// ---------- 5. TELA GERENCIAR ----------
function renderGerenciar() {
  const lista = document.getElementById('listaGerenciar');

  if (!treinos.length) {
    lista.innerHTML = '<p style="color:var(--muted);text-align:center;margin-top:1rem;">Nenhum treino cadastrado.</p>';
    return;
  }

  lista.innerHTML = treinos.map(t => `
    <div class="dia-gerenciar">
      <div class="dia-gerenciar-info">
        <strong>${t.nome}</strong>
        <span>${t.exercicios.length} exercícios</span>
      </div>
      <button class="btn btn-outline btn-pequeno" data-editar="${t.id}">Editar</button>
    </div>`).join('');

  lista.querySelectorAll('[data-editar]').forEach(btn => {
    btn.addEventListener('click', () => abrirEditor(btn.dataset.editar));
  });
}

document.getElementById('btnNovoTreino').addEventListener('click', () => {
  abrirEditor(null);
});

// ---------- EDITOR ----------
function abrirEditor(treinoId) {
  const modal = document.getElementById('modalEditor');
  const corpo = document.getElementById('editorCorpo');

  let treino;
  let novo = false;
  if (treinoId) {
    treino = treinos.find(t => t.id === treinoId);
  } else {
    treino = { id: 't' + Date.now(), nome: '', exercicios: [{ nome: '', icone: 'halteres', equipamento: '', series: 3, repeticoes: '12', descanso: 60, carga: '' }] };
    novo = true;
  }

  corpo.innerHTML = `
    <div class="editor-cabecalho">
      <h3>${novo ? 'Novo treino' : 'Editar treino'}</h3>
      <button class="btn btn-outline btn-pequeno" id="editorFechar">✕</button>
    </div>
    <label class="campo">
      <span>Nome do treino</span>
      <input type="text" id="edNome" value="${treino.nome}" placeholder="Ex.: Peito e Tríceps">
    </label>
    <div id="edExercicios"></div>
    <button class="btn btn-outline btn-bloco" id="edAdicionar">+ Adicionar exercício</button>
    <div class="editor-acoes">
      <button class="btn btn-primary" id="edSalvar">Salvar treino</button>
      ${novo ? '' : '<button class="btn btn-danger" id="edExcluir">Excluir treino</button>'}
    </div>`;

  const cont = corpo.querySelector('#edExercicios');

  const coletar = () => {
    treino.exercicios = Array.from(cont.querySelectorAll('.ed-exercicio')).map(row => ({
      nome: row.querySelector('.ed-nome').value.trim(),
      icone: row.querySelector('.ed-icone').value.trim() || 'halteres',
      equipamento: row.querySelector('.ed-equipamento').value.trim(),
      series: Number(row.querySelector('.ed-series').value) || 3,
      repeticoes: row.querySelector('.ed-reps').value.trim() || '12',
      descanso: Number(row.querySelector('.ed-descanso').value) || 60,
      carga: row.querySelector('.ed-carga').value.trim()
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
          <input type="text" class="ed-icone" value="${ex.icone}" placeholder="Ícone">
          <input type="text" class="ed-equipamento" value="${ex.equipamento}" placeholder="Equip.">
          <input type="number" class="ed-series" value="${ex.series}" min="1" placeholder="Séries">
          <input type="text" class="ed-reps" value="${ex.repeticoes}" placeholder="Reps/45s">
        </div>
        <div class="ed-linha">
          <input type="number" class="ed-descanso" value="${ex.descanso}" min="0" placeholder="Descanso (s)">
          <input type="text" class="ed-carga" value="${ex.carga}" placeholder="Carga (kg)">
        </div>
        <button class="btn btn-outline btn-pequeno ed-remover">Remover</button>`;
      row.querySelector('.ed-remover').addEventListener('click', () => {
        coletar();
        treino.exercicios.splice(i, 1);
        renderRows();
      });
      cont.appendChild(row);
    });
  };
  renderRows();

  corpo.querySelector('#edAdicionar').addEventListener('click', () => {
    coletar();
    treino.exercicios.push({ nome: '', icone: 'halteres', equipamento: '', series: 3, repeticoes: '12', descanso: 60, carga: '' });
    renderRows();
  });

  corpo.querySelector('#edSalvar').addEventListener('click', () => {
    coletar();
    treino.exercicios = treino.exercicios.filter(e => e.nome !== '');
    treino.nome = corpo.querySelector('#edNome').value.trim() || 'Treino';
    if (novo) treinos.push(treino);
    else {
      const idx = treinos.findIndex(t => t.id === treino.id);
      treinos[idx] = treino;
    }
    salvarTreinos();
    modal.classList.remove('aberto');
    renderGerenciar();
    renderTreinos();
  });

  const btnExcluir = corpo.querySelector('#edExcluir');
  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => {
      treinos = treinos.filter(t => t.id !== treino.id);
      delete estado[treino.id];
      salvarTreinos();
      salvarEstado();
      modal.classList.remove('aberto');
      renderGerenciar();
      renderTreinos();
    });
  }

  corpo.querySelector('#editorFechar').addEventListener('click', () => modal.classList.remove('aberto'));

  modal.classList.add('aberto');
}

// ---------- 6. TIMER ----------
let timerInterval = null;
let timerRestante = 0;
let timerTotal = 1;
let timerRodando = false;

function tempoEmSegundos(texto) {
  if (!texto) return 0;
  const t = String(texto).toLowerCase();
  if (!/\d/.test(t)) return 0;
  if (t.includes('min')) { const m = t.match(/([\d.,]+)\s*min/); return m ? Math.round(parseFloat(m[1].replace(',', '.')) * 60) : 0; }
  if (t.includes('seg') || /(\d)\s*s\b/.test(t)) { const s = t.match(/([\d.,]+)\s*(seg|s)/); return s ? Math.round(parseFloat(s[1].replace(',', '.'))) : 0; }
  return 0;
}

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

// ---------- 7. INICIALIZAÇÃO ----------
carregarTreinos();
carregarEstado();
navegar('treinos');
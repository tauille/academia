/* ==========================================================================
   itrainer — Lógica do app (CRUD + execução + timer)
   1. Armazenamento (com validação — corrige tela vazia)
   2. Navegação
   3. Listar treinos
   4. Executar treino (séries + timer)
   5. Gerenciar (listar / criar / editar / excluir)
   6. Timer (descanso e exercício por tempo)
   7. Toast
   8. Inicialização
   ========================================================================== */

// ---------- 1. ARMAZENAMENTO ----------
// Chaves novas (-v3): dados antigos de versões anteriores ficam ignorados,
// impedindo que formato incompatível trave a renderização (tela vazia).
const STORAGE_TREINOS = 'itrainer-treinos-v3';
const STORAGE_ESTADO = 'itrainer-estado-v3';

let treinos = null;      // lista de treinos
let estado = {};         // { treinoId: { exIndex: [bool, ...] } }
let treinoAtivo = null;  // treino em execução

function iconeSvg(nome) { return ICONES[nome] || ICONES.halteres; }

function carregarTreinos() {
  try {
    const raw = localStorage.getItem(STORAGE_TREINOS);
    if (raw) {
      const dados = JSON.parse(raw);
      // Só aceita se for lista válida (evita dado corrompido de versão antiga)
      if (Array.isArray(dados) && dados.length >= 0 &&
          dados.every(t => t && t.id && Array.isArray(t.exercicios))) {
        treinos = dados;
        return;
      }
    }
  } catch (e) { /* ignora e recria */ }
  treinos = JSON.parse(JSON.stringify(CONFIG.treinos));
  salvarTreinos();
}

function salvarTreinos() { localStorage.setItem(STORAGE_TREINOS, JSON.stringify(treinos)); }

function carregarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_ESTADO);
    if (raw) {
      const dados = JSON.parse(raw);
      if (dados && typeof dados === 'object' && !Array.isArray(dados)) {
        estado = dados;
        return;
      }
    }
  } catch (e) { /* ignora */ }
  estado = {};
}

function salvarEstado() { localStorage.setItem(STORAGE_ESTADO, JSON.stringify(estado)); }

function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('mostrar');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('mostrar'), 2200);
}

// ---------- 2. NAVEGAÇÃO ----------
function navegar(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  document.getElementById('appMain').scrollTop = 0;

  if (viewId === 'treinos') renderTreinos();
  if (viewId === 'gerenciar') renderGerenciar();
}

// ---------- 3. LISTAR TREINOS ----------
function renderTreinos() {
  const lista = document.getElementById('listaTreinos');

  if (treinoAtivo) { renderExecucao(); return; }

  if (!treinos.length) {
    lista.innerHTML = '<div class="vazio">Nenhum treino cadastrado.<br>Toque em <b>Gerenciar</b> e crie o primeiro.</div>';
    return;
  }

  lista.innerHTML = treinos.map(t => {
    const ex = estado[t.id] || {};
    const total = t.exercicios.length;
    const feitos = t.exercicios.filter((_, i) => (ex[i] || []).filter(Boolean).length >= t.exercicios[i].series).length;
    const pct = total ? Math.round((feitos / total) * 100) : 0;
    const concluido = total > 0 && feitos === total;

    return `
      <div class="treino-card ${concluido ? 'concluido' : ''}" data-abrir="${t.id}">
        <div class="treino-topo">
          <h3>${t.nome}</h3>
          <span class="chip">${feitos}/${total} ${concluido ? '✓' : ''}</span>
        </div>
        <div class="treino-meta">${total} exercício(s)</div>
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

// ---------- 4. EXECUTAR TREINO ----------
function renderExecucao() {
  const lista = document.getElementById('listaTreinos');
  const t = treinoAtivo;
  if (!t) { renderTreinos(); return; }

  const ex = estado[t.id] || {};
  const total = t.exercicios.length;
  const feitos = t.exercicios.filter((_, i) => (ex[i] || []).filter(Boolean).length >= t.exercicios[i].series).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  const concluido = total > 0 && feitos === total;

  let html = `
    <div class="exec-cabecalho">
      <button class="voltar" id="voltarTreinos">←</button>
      <div>
        <h1>${t.nome}</h1>
        <div class="treino-progresso"><div class="fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;

  if (!total) {
    html += '<div class="vazio">Este treino não tem exercícios.<br>Edite em Gerenciar para adicionar.</div>';
  }

  t.exercicios.forEach((exer, i) => {
    const feitas = (ex[i] || []).filter(Boolean).length;
    const exConcluido = feitas >= exer.series;
    const tempo = tempoEmSegundos(exer.repeticoes);
    const metaTempo = tempo > 0
      ? `<span class="chip">⏱️ <strong>${exer.repeticoes}</strong></span>`
      : `<span class="chip">🔁 <strong>${exer.repeticoes}</strong> reps</span>`;

    html += `
      <div class="exercicio ${exConcluido ? 'concluido' : ''}">
        <div class="exercicio-topo">
          <div class="icon-badge" title="${exer.equipamento}">${iconeSvg(exer.icone)}</div>
          <div>
            <h3>${i + 1}. ${exer.nome}</h3>
            <div class="exercicio-meta">
              <span class="chip">${exer.equipamento || '—'}</span>
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

  if (total) {
    html += `<button class="btn ${concluido ? 'btn-outline' : 'btn-primary'} btn-bloco" id="btnConcluir">
      ${concluido ? 'Desmarcar treino' : 'Concluir treino'}
    </button>`;
  }

  lista.innerHTML = html;

  document.getElementById('voltarTreinos').addEventListener('click', () => {
    treinoAtivo = null;
    renderTreinos();
  });

  lista.querySelectorAll('.serie').forEach(btn => {
    btn.addEventListener('click', () => marcarSerie(Number(btn.dataset.ex), Number(btn.dataset.serie)));
  });

  const btnConcluir = document.getElementById('btnConcluir');
  if (btnConcluir) btnConcluir.addEventListener('click', concluirTreino);
}

function marcarSerie(exIndex, serieIndex) {
  const t = treinoAtivo;
  if (!t) return;
  const exer = t.exercicios[exIndex];
  if (!estado[t.id]) estado[t.id] = {};
  if (!estado[t.id][exIndex]) estado[t.id][exIndex] = [];

  const arr = estado[t.id][exIndex];
  const marcou = !arr[serieIndex];
  arr[serieIndex] = marcou;
  salvarEstado();

  if (marcou) {
    const tempo = tempoEmSegundos(exer.repeticoes);
    if (tempo > 0) abrirTimer(tempo, 'Tempo do exercício', exer.nome);
    else if (exer.descanso > 0) abrirTimer(exer.descanso, 'Descanso', exer.nome);

    if (arr.filter(Boolean).length >= exer.series) mostrarToast('✅ Exercício concluído!');
  }

  renderExecucao();
}

function concluirTreino() {
  const t = treinoAtivo;
  if (!t || !t.exercicios.length) return;
  const ex = estado[t.id] || {};
  const feitos = t.exercicios.filter((_, i) => (ex[i] || []).filter(Boolean).length >= t.exercicios[i].series).length;
  const tudoFeito = feitos === t.exercicios.length;

  t.exercicios.forEach((e, i) => {
    ex[i] = tudoFeito ? Array(e.series).fill(false) : Array(e.series).fill(true);
  });
  estado[t.id] = ex;
  salvarEstado();
  mostrarToast(tudoFeito ? 'Treino desmarcado' : '✅ Treino concluído!');
  renderExecucao();
}

// ---------- 5. GERENCIAR (CRUD) ----------
function renderGerenciar() {
  const lista = document.getElementById('listaGerenciar');

  if (!treinos.length) {
    lista.innerHTML = '<div class="vazio">Nenhum treino cadastrado.<br>Toque em <b>+ Novo treino</b>.</div>';
    return;
  }

  lista.innerHTML = treinos.map(t => `
    <div class="dia-gerenciar">
      <div class="dia-gerenciar-info">
        <strong>${t.nome}</strong>
        <span>${t.exercicios.length} exercício(s)</span>
      </div>
      <div class="dia-gerenciar-acoes">
        <button class="btn btn-outline btn-pequeno" data-editar="${t.id}">Editar</button>
        <button class="btn btn-danger btn-pequeno" data-excluir="${t.id}">Excluir</button>
      </div>
    </div>`).join('');

  lista.querySelectorAll('[data-editar]').forEach(btn => {
    btn.addEventListener('click', () => abrirEditor(btn.dataset.editar));
  });

  lista.querySelectorAll('[data-excluir]').forEach(btn => {
    btn.addEventListener('click', () => excluirTreino(btn.dataset.excluir));
  });
}

function excluirTreino(id) {
  const t = treinos.find(x => x.id === id);
  if (!t) return;
  const confirmou = confirm(`Excluir o treino "${t.nome}"?`);
  if (!confirmou) return;
  treinos = treinos.filter(x => x.id !== id);
  delete estado[id];
  salvarTreinos();
  salvarEstado();
  mostrarToast('Treino excluído');
  renderGerenciar();
  if (treinoAtivo && treinoAtivo.id === id) { treinoAtivo = null; renderTreinos(); }
}

// ---------- EDITOR ----------
function abrirEditor(treinoId) {
  const modal = document.getElementById('modalEditor');
  const corpo = document.getElementById('editorCorpo');

  let treino;
  let novo = false;

  if (treinoId) {
    treino = treinos.find(t => t.id === treinoId);
    if (!treino) return;
  } else {
    treino = {
      id: 't' + Date.now(),
      nome: '',
      exercicios: [{ nome: '', icone: 'halteres', equipamento: '', series: 3, repeticoes: '12', descanso: 60, carga: '' }]
    };
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
    <button class="btn btn-outline btn-bloco" id="edAdicionar" style="margin-top:0;">+ Adicionar exercício</button>
    <div class="editor-acoes">
      <button class="btn btn-primary" id="edSalvar">Salvar treino</button>
      ${novo ? '' : '<button class="btn btn-danger" id="edExcluir">Excluir treino</button>'}
    </div>`;

  const cont = corpo.querySelector('#edExercicios');

  const coletar = () => {
    treino.exercicios = Array.from(cont.querySelectorAll('.ed-exercicio')).map(row => ({
      nome: row.querySelector('.ed-nome').value.trim(),
      icone: row.querySelector('.ed-icone').value || 'halteres',
      equipamento: row.querySelector('.ed-equipamento').value.trim(),
      series: Number(row.querySelector('.ed-series').value) || 3,
      repeticoes: row.querySelector('.ed-reps').value.trim() || '12',
      descanso: Number(row.querySelector('.ed-descanso').value) || 60,
      carga: row.querySelector('.ed-carga').value.trim()
    }));
  };

  const opcoesIcone = Object.keys(ICONES)
    .map(k => `<option value="${k}">${k}</option>`).join('');

  const renderRows = () => {
    cont.innerHTML = '';
    treino.exercicios.forEach((ex, i) => {
      const sel = Object.keys(ICONES)
        .map(k => `<option value="${k}" ${ex.icone === k ? 'selected' : ''}>${k}</option>`).join('');

      const row = document.createElement('div');
      row.className = 'ed-exercicio';
      row.innerHTML = `
        <input type="text" class="ed-nome" value="${ex.nome}" placeholder="Nome do exercício">
        <div class="ed-dupla">
          <select class="ed-icone">${sel}</select>
          <input type="text" class="ed-equipamento" value="${ex.equipamento}" placeholder="Equipamento">
        </div>
        <div class="ed-linha">
          <input type="number" class="ed-series" value="${ex.series}" min="1" placeholder="Séries">
          <input type="text" class="ed-reps" value="${ex.repeticoes}" placeholder="Reps/45s">
          <input type="number" class="ed-descanso" value="${ex.descanso}" min="0" placeholder="Desc(s)">
          <input type="text" class="ed-carga" value="${ex.carga}" placeholder="Carga">
        </div>
        <button class="btn btn-outline btn-pequeno ed-remover">Remover exercício</button>`;

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

    if (novo) {
      treinos.push(treino);
    } else {
      const idx = treinos.findIndex(t => t.id === treino.id);
      if (idx !== -1) treinos[idx] = treino;
    }
    salvarTreinos();
    modal.classList.remove('aberto');
    mostrarToast(novo ? '✅ Treino criado!' : 'Treino atualizado');
    renderGerenciar();
    renderTreinos();
  });

  const btnExcluir = corpo.querySelector('#edExcluir');
  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => {
      modal.classList.remove('aberto');
      excluirTreino(treino.id);
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

// Converte "45s", "3 min" em segundos. Retorna 0 se não for tempo.
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
      mostrarToast('⏰ Tempo encerrado!');
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
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => navegar(el.dataset.view));
});

document.getElementById('btnNovoTreino').addEventListener('click', () => abrirEditor(null));

carregarTreinos();
carregarEstado();
navegar('treinos');
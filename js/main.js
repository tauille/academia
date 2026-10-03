/* ==========================================================================
   itrainer — Lógica do app (CRUD + execução + timer com som + histórico)
   v5: banco de dados IndexedDB + migração automática do localStorage
       + editor com rótulos claros (séries / tempo / descanso)
   ========================================================================== */

const STORAGE_TREINOS = 'itrainer-treinos-v3';
const STORAGE_ESTADO = 'itrainer-estado-v3';
const STORAGE_HISTORICO = 'itrainer-historico-v3';

const DB_NOME = 'itrainer-db';
const DB_VERSAO = 1;

let treinos = null;
let estado = {};
let treinoAtivo = null;
let historico = [];
let db = null;

function iconeSvg(nome) { return ICONES[nome] || ICONES.halteres; }
function hoje() { return new Date().toISOString().split('T')[0]; }

/* ---------- 1. BANCO DE DADOS (IndexedDB) ---------- */
function abrirBanco() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('sem-indexeddb')); return; }
    try {
      const req = indexedDB.open(DB_NOME, DB_VERSAO);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('treinos')) d.createObjectStore('treinos');
        if (!d.objectStoreNames.contains('estado')) d.createObjectStore('estado');
        if (!d.objectStoreNames.contains('historico')) d.createObjectStore('historico');
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    } catch (e) { reject(e); }
  });
}

function dbPut(store, valor) {
  return new Promise((resolve) => {
    if (!db) { resolve(false); return; }
    try {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(valor, 'dados');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) { resolve(false); }
  });
}

function dbGet(store) {
  return new Promise((resolve) => {
    if (!db) { resolve(undefined); return; }
    try {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get('dados');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    } catch (e) { resolve(undefined); }
  });
}

// Copia os dados do localStorage para o banco apenas na primeira carga
async function migrarSeNecessario() {
  if (!db) return;
  const jaTem = await dbGet('treinos');
  if (jaTem !== undefined) return;

  const t = lerTreinosDoLocalStorage();
  const e = lerEstadoDoLocalStorage();
  const h = lerHistoricoDoLocalStorage();

  await dbPut('treinos', t || JSON.parse(JSON.stringify(CONFIG.treinos)));
  await dbPut('estado', e);
  await dbPut('historico', h);
}

/* ---------- 2. LEITURA LOCALSTORAGE (fallback) ---------- */
function lerTreinosDoLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_TREINOS);
    if (raw) {
      const d = JSON.parse(raw);
      if (Array.isArray(d) && d.every(t => t && t.id && Array.isArray(t.exercicios))) return d;
    }
  } catch (e) {}
  return null;
}
function lerEstadoDoLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_ESTADO);
    if (raw) { const d = JSON.parse(raw); if (d && typeof d === 'object' && !Array.isArray(d)) return d; }
  } catch (e) {}
  return {};
}
function lerHistoricoDoLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORICO);
    if (raw) { const d = JSON.parse(raw); if (Array.isArray(d)) return d; }
  } catch (e) {}
  return [];
}

function carregarTreinos() {
  const d = lerTreinosDoLocalStorage();
  treinos = d || JSON.parse(JSON.stringify(CONFIG.treinos));
  salvarTreinos();
}
function carregarEstado() { estado = lerEstadoDoLocalStorage(); }
function carregarHistorico() { historico = lerHistoricoDoLocalStorage(); }

/* Escrita dupla: banco + espelho no localStorage */
function salvarTreinos() {
  localStorage.setItem(STORAGE_TREINOS, JSON.stringify(treinos));
  if (db) dbPut('treinos', treinos);
}
function salvarEstado() {
  localStorage.setItem(STORAGE_ESTADO, JSON.stringify(estado));
  if (db) dbPut('estado', estado);
}
function salvarHistorico() {
  localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(historico));
  if (db) dbPut('historico', historico);
}

function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('mostrar');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('mostrar'), 2200);
}

/* ---------- 3. NAVEGAÇÃO ---------- */
function navegar(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  document.getElementById('appMain').scrollTop = 0;
  if (viewId === 'treinos') renderTreinos();
  if (viewId === 'historico') renderHistorico();
  if (viewId === 'gerenciar') renderGerenciar();
}

/* ---------- 4. LISTAR TREINOS ---------- */
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

/* ---------- 5. EXECUTAR TREINO ---------- */
function tempoDoExercicio(ex) {
  if (!ex) return 0;
  if (ex.tipo === 'tempo') {
    const n = parseFloat(String(ex.repeticoes).replace(',', '.'));
    return isNaN(n) || n <= 0 ? 0 : Math.round(n);
  }
  return tempoEmSegundos(ex.repeticoes);
}

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

  if (!total) html += '<div class="vazio">Este treino não tem exercícios.<br>Edite em Gerenciar para adicionar.</div>';

  t.exercicios.forEach((exer, i) => {
    const feitas = (ex[i] || []).filter(Boolean).length;
    const exConcluido = feitas >= exer.series;
    const tempo = tempoDoExercicio(exer);
    const metaTempo = tempo > 0
      ? `<span class="chip">⏱️ <strong>${tempo}s</strong> execução</span>`
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
              <span class="chip">⏳ descanso <strong>${exer.descanso}s</strong></span>
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

  document.getElementById('voltarTreinos').addEventListener('click', () => { treinoAtivo = null; renderTreinos(); });
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
    desbloquearAudio();
    const tempo = tempoDoExercicio(exer);
    if (tempo > 0) {
      abrirTimer(tempo, 'Tempo de execução', exer.nome, () => {
        if (exer.descanso > 0) abrirTimer(exer.descanso, 'Descanso', exer.nome);
      });
    } else if (exer.descanso > 0) {
      abrirTimer(exer.descanso, 'Descanso', exer.nome);
    }
    if (arr.filter(Boolean).length >= exer.series) mostrarToast('✅ Exercício concluído!');

    const completo = t.exercicios.every((e, i) =>
      (estado[t.id][i] || []).filter(Boolean).length >= e.series);
    if (completo) registrarHistorico(t);
  }

  renderExecucao();
}

function concluirTreino() {
  const t = treinoAtivo;
  if (!t || !t.exercicios.length) return;
  const ex = estado[t.id] || {};
  const feitos = t.exercicios.filter((_, i) => (ex[i] || []).filter(Boolean).length >= t.exercicios[i].series).length;
  const tudoFeito = feitos === t.exercicios.length;
  t.exercicios.forEach((e, i) => { ex[i] = tudoFeito ? Array(e.series).fill(false) : Array(e.series).fill(true); });
  estado[t.id] = ex;
  salvarEstado();
  if (!tudoFeito) registrarHistorico(t);
  mostrarToast(tudoFeito ? 'Treino desmarcado' : '✅ Treino concluído!');
  renderExecucao();
}

/* ---------- 6. GERENCIAR (CRUD) ---------- */
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
  lista.querySelectorAll('[data-editar]').forEach(btn => btn.addEventListener('click', () => abrirEditor(btn.dataset.editar)));
  lista.querySelectorAll('[data-excluir]').forEach(btn => btn.addEventListener('click', () => excluirTreino(btn.dataset.excluir)));
}

function excluirTreino(id) {
  const t = treinos.find(x => x.id === id);
  if (!t) return;
  if (!confirm(`Excluir o treino "${t.nome}"?`)) return;
  treinos = treinos.filter(x => x.id !== id);
  delete estado[id];
  salvarTreinos();
  salvarEstado();
  mostrarToast('Treino excluído');
  renderGerenciar();
  if (treinoAtivo && treinoAtivo.id === id) { treinoAtivo = null; renderTreinos(); }
}

/* ---------- 7. EDITOR (rótulos claros: séries / tempo / descanso) ---------- */
const LBL = 'font-size:0.62rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
const CAMPO = 'display:flex;flex-direction:column;gap:0.2rem;min-width:0;';

function abrirEditor(treinoId) {
  const modal = document.getElementById('modalEditor');
  const corpo = document.getElementById('editorCorpo');
  let treino;
  let novo = false;

  if (treinoId) {
    treino = treinos.find(t => t.id === treinoId);
    if (!treino) return;
  } else {
    treino = { id: 't' + Date.now(), nome: '', exercicios: [{ nome: '', icone: 'halteres', equipamento: '', tipo: 'reps', series: 3, repeticoes: '12', descanso: 60, carga: '' }] };
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
      tipo: row.querySelector('.ed-tipo-select').value || 'reps',
      series: Number(row.querySelector('.ed-series').value) || 3,
      repeticoes: row.querySelector('.ed-reps').value.trim() || '12',
      descanso: Number(row.querySelector('.ed-descanso').value) || 60,
      carga: row.querySelector('.ed-carga').value.trim()
    }));
  };

  const renderRows = () => {
    cont.innerHTML = '';
    treino.exercicios.forEach((ex, i) => {
      const tipo = ex.tipo === 'tempo' ? 'tempo' : 'reps';
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
        <div class="ed-tipo" style="display:grid;grid-template-columns:1fr auto;gap:0.4rem;align-items:end;margin-bottom:0.5rem;">
          <label style="${CAMPO}">
            <span style="${LBL}">Tipo de medição</span>
            <select class="ed-tipo-select" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:0.5rem 0.6rem;font-size:0.8rem;">
              <option value="reps" ${tipo === 'reps' ? 'selected' : ''}>Repetições</option>
              <option value="tempo" ${tipo === 'tempo' ? 'selected' : ''}>Tempo (segundos)</option>
            </select>
          </label>
          <span class="ed-tipo-rotulo" style="font-size:0.75rem;font-weight:800;color:var(--accent);padding:0.45rem 0.5rem;white-space:nowrap;">${tipo === 'tempo' ? '⏱️ Cronômetro' : '🔁 Repetições'}</span>
        </div>
        <div class="ed-linha">
          <label style="${CAMPO}">
            <span style="${LBL}">Séries</span>
            <input type="number" class="ed-series" value="${ex.series}" min="1" placeholder="3">
          </label>
          <label style="${CAMPO}">
            <span class="ed-rotulo-reps" style="${LBL}">${tipo === 'tempo' ? 'Tempo (s)' : 'Reps'}</span>
            <input type="text" class="ed-reps" value="${ex.repeticoes}" placeholder="${tipo === 'tempo' ? 'Ex.: 45' : 'Ex.: 12'}">
          </label>
          <label style="${CAMPO}">
            <span style="${LBL}">Descanso (s)</span>
            <input type="number" class="ed-descanso" value="${ex.descanso}" min="0" placeholder="60">
          </label>
          <label style="${CAMPO}">
            <span style="${LBL}">Carga (kg)</span>
            <input type="text" class="ed-carga" value="${ex.carga}" placeholder="—">
          </label>
        </div>
        <button class="btn btn-outline btn-pequeno ed-remover">Remover exercício</button>`;

      const selTipo = row.querySelector('.ed-tipo-select');
      const reps = row.querySelector('.ed-reps');
      const rotuloReps = row.querySelector('.ed-rotulo-reps');
      const rotuloTipo = row.querySelector('.ed-tipo-rotulo');
      selTipo.addEventListener('change', () => {
        const tempo = selTipo.value === 'tempo';
        rotuloReps.textContent = tempo ? 'Tempo (s)' : 'Reps';
        rotuloTipo.textContent = tempo ? '⏱️ Cronômetro' : '🔁 Repetições';
        reps.placeholder = tempo ? 'Ex.: 45' : 'Ex.: 12';
      });

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
    treino.exercicios.push({ nome: '', icone: 'halteres', equipamento: '', tipo: 'reps', series: 3, repeticoes: '12', descanso: 60, carga: '' });
    renderRows();
  });

  corpo.querySelector('#edSalvar').addEventListener('click', () => {
    coletar();
    treino.exercicios = treino.exercicios.filter(e => e.nome !== '');
    treino.nome = corpo.querySelector('#edNome').value.trim() || 'Treino';
    if (novo) treinos.push(treino);
    else {
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
  if (btnExcluir) btnExcluir.addEventListener('click', () => { modal.classList.remove('aberto'); excluirTreino(treino.id); });

  corpo.querySelector('#editorFechar').addEventListener('click', () => modal.classList.remove('aberto'));
  modal.classList.add('aberto');
}

/* ---------- 8. HISTÓRICO ---------- */
function registrarHistorico(t) {
  if (!t || !t.exercicios.length) return;
  const data = hoje();
  if (historico.some(h => h.treinoId === t.id && h.data === data)) return;
  const ex = estado[t.id] || {};
  const exercicios = t.exercicios.map((e, i) => ({
    nome: e.nome,
    series: (ex[i] || []).filter(Boolean).length,
    carga: e.carga || ''
  }));
  historico.unshift({
    data: data,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    treinoId: t.id,
    treinoNome: t.nome,
    exercicios: exercicios
  });
  salvarHistorico();
}

function capitalizar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function renderHistorico() {
  const lista = document.getElementById('listaHistorico');
  if (!historico.length) {
    lista.innerHTML = '<div class="vazio">Nenhum treino concluído ainda.<br>Complete um treino para registrar aqui.</div>';
    return;
  }
  const grupos = {};
  historico.forEach(h => {
    if (!grupos[h.data]) grupos[h.data] = [];
    grupos[h.data].push(h);
  });
  const datas = Object.keys(grupos).sort((a, b) => b.localeCompare(a));
  lista.innerHTML = datas.map(data => {
    const titulo = capitalizar(
      new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    );
    return `
      <div class="hist-dia">
        <div class="hist-dia-cabecalho">
          <strong>${titulo}</strong>
          <span>${grupos[data].length} treino(s)</span>
        </div>
        ${grupos[data].map(h => `
          <div class="hist-item">
            <div class="hist-item-topo">
              <strong>${h.treinoNome}</strong>
              <span>🕐 ${h.hora}</span>
            </div>
            <div class="hist-exercicios">${h.exercicios.map(e => `${e.series}× ${e.nome}${e.carga ? ' · ' + e.carga + 'kg' : ''}`).join('<br>')}</div>
          </div>`).join('')}
      </div>`;
  }).join('');
}

/* ---------- 9. SOM (Web Audio API) ---------- */
let audioCtx = null;

function desbloquearAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  } catch (e) {}
}

function beep(freq, dur, vol, atraso) {
  if (!audioCtx) return;
  try {
    const t0 = audioCtx.currentTime + (atraso || 0);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch (e) {}
}

function tocarSom(tipo) {
  if (!audioCtx) return;
  if (tipo === 'tick') {
    beep(1200, 0.14, 0.35);
  } else if (tipo === 'exec') {
    beep(880, 0.35, 0.45);
    beep(880, 0.35, 0.45, 0.45);
  } else if (tipo === 'descanso') {
    beep(660, 0.35, 0.45);
    beep(660, 0.35, 0.45, 0.45);
  }
}

/* ---------- 10. TIMER (contagem por tempo real + bipes) ---------- */
let timerInterval = null;
let timerRestante = 0;
let timerTotal = 1;
let timerRodando = false;
let timerEnd = 0;
let timerFinalTipo = 'descanso';
let ultimoTick = -1;
let aoTerminarCallback = null;

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

function abrirTimer(segundos, titulo, nomeExercicio, aoTerminar) {
  const modal = document.getElementById('modalTimer');
  const numero = document.getElementById('timerNumero');
  const ring = document.getElementById('timerRing');
  const C = 2 * Math.PI * 52;

  timerRestante = segundos;
  timerTotal = segundos;
  timerRodando = true;
  timerEnd = Date.now() + segundos * 1000;
  timerFinalTipo = titulo === 'Tempo de execução' ? 'exec' : 'descanso';
  ultimoTick = -1;
  aoTerminarCallback = (typeof aoTerminar === 'function') ? aoTerminar : null;

  document.getElementById('timerTitulo').textContent = titulo;
  document.getElementById('timerExercicio').textContent = nomeExercicio || '';
  document.getElementById('timerPausar').textContent = 'Pausar';
  numero.textContent = timerRestante;
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = 0;

  modal.classList.add('aberto');

  clearInterval(timerInterval);
  timerInterval = setInterval(stepTimer, 250);
}

function stepTimer() {
  if (!timerRodando) return;
  const restante = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
  timerRestante = restante;

  document.getElementById('timerNumero').textContent = restante;
  const ring = document.getElementById('timerRing');
  const C = 2 * Math.PI * 52;
  ring.style.strokeDashoffset = C * (1 - restante / timerTotal);

  if (restante <= 10 && restante > 0 && restante !== ultimoTick) {
    ultimoTick = restante;
    tocarSom('tick');
  }

  if (restante <= 0) {
    clearInterval(timerInterval);
    document.getElementById('modalTimer').classList.remove('aberto');
    tocarSom(timerFinalTipo);
    const cb = aoTerminarCallback;
    aoTerminarCallback = null;
    if (cb) cb();
  }
}

document.getElementById('timerFechar').addEventListener('click', () => {
  clearInterval(timerInterval);
  document.getElementById('modalTimer').classList.remove('aberto');
});

document.getElementById('timerPausar').addEventListener('click', () => {
  timerRodando = !timerRodando;
  document.getElementById('timerPausar').textContent = timerRodando ? 'Pausar' : 'Continuar';
});

/* ---------- 11. INICIALIZAÇÃO ---------- */
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => navegar(el.dataset.view));
});
document.getElementById('btnNovoTreino').addEventListener('click', () => abrirEditor(null));

async function iniciarApp() {
  try {
    await abrirBanco();
    await migrarSeNecessario();

    const t = await dbGet('treinos');
    const e = await dbGet('estado');
    const h = await dbGet('historico');
    if (t !== undefined) treinos = t;
    if (e !== undefined) estado = e;
    if (h !== undefined) historico = h;
  } catch (err) {
    // Banco indisponível: usa localStorage como fallback
    carregarTreinos();
    carregarEstado();
    carregarHistorico();
  }

  // Garantias de formato (sem sobrescrever lista vazia intencional)
  if (!Array.isArray(treinos)) {
    const d = lerTreinosDoLocalStorage();
    treinos = d !== null ? d : JSON.parse(JSON.stringify(CONFIG.treinos));
    if (d === null) salvarTreinos();
  }
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)) estado = lerEstadoDoLocalStorage();
  if (!Array.isArray(historico)) historico = lerHistoricoDoLocalStorage();
  if (!Array.isArray(historico)) historico = [];

  navegar('treinos');
}

iniciarApp();
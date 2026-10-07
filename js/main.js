/* ==========================================================================
   itrainer — Lógica do app (CRUD + execução + timer + histórico + nutrição)
   v9: + Banco de dados na versão 3 (compatível com o módulo Nutrição)
       + Botão "Limpar treino" antes de "Concluir treino"
       + Conclusão válida apenas no dia do treino (reset automático no dia seguinte)
       + Integração com o módulo Nutrição mantida (init + ver + backup)
       + Áudio do cronômetro destravado no 1º toque (iPhone/Safari)
   ========================================================================== */
const STORAGE_TREINOS = 'itrainer-treinos-v3';
const STORAGE_ESTADO = 'itrainer-estado-v3';
const STORAGE_HISTORICO = 'itrainer-historico-v3';
const DB_NOME = 'itrainer-db';
const DB_VERSAO = 3;
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
async function migrarSeNecessario() {
  if (!db) return;
  const jaTem = await dbGet('treinos');
  if (jaTem !== undefined) return;
  await dbPut('treinos', lerTreinosDoLocalStorage() || JSON.parse(JSON.stringify(CONFIG.treinos)));
  await dbPut('estado', lerEstadoDoLocalStorage());
  await dbPut('historico', lerHistoricoDoLocalStorage());
}
/* ---------- 2. LOCALSTORAGE (fallback) ---------- */
function lerTreinosDoLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_TREINOS);
    if (raw) { const d = JSON.parse(raw); if (Array.isArray(d) && d.every(t => t && t.id && Array.isArray(t.exercicios))) return d; }
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
function carregarTreinos() { treinos = lerTreinosDoLocalStorage() || JSON.parse(JSON.stringify(CONFIG.treinos)); salvarTreinos(); }
function carregarEstado() { estado = lerEstadoDoLocalStorage(); }
function carregarHistorico() { historico = lerHistoricoDoLocalStorage(); }
function salvarTreinos() { localStorage.setItem(STORAGE_TREINOS, JSON.stringify(treinos)); if (db) dbPut('treinos', treinos); }
function salvarEstado() { localStorage.setItem(STORAGE_ESTADO, JSON.stringify(estado)); if (db) dbPut('estado', estado); }
function salvarHistorico() { localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(historico)); if (db) dbPut('historico', historico); }
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
  if (viewId === 'nutricao') { if (window.Nutricao) window.Nutricao.ver('diario'); }
}
/* ---------- 3.1 RESET DIÁRIO (conclusão vale só no dia) ---------- */
function resetarTreinosDoDiaAnterior() {
  const hojeStr = hoje();
  let mudou = false;
  Object.keys(estado).forEach(id => {
    const ex = estado[id];
    if (ex && ex.dataConclusao && ex.dataConclusao !== hojeStr) {
      const t = treinos.find(x => x.id === id);
      if (t) t.exercicios.forEach((e, i) => { ex[i] = Array(e.series).fill(false); });
      delete ex.dataConclusao;
      mudou = true;
    }
  });
  if (mudou) salvarEstado();
}
/* ---------- 4. LISTAR TREINOS ---------- */
function renderTreinos() {
  resetarTreinosDoDiaAnterior();
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
  resetarTreinosDoDiaAnterior();
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
    html += `
      <div class="exec-acoes" style="display:flex;flex-direction:column;gap:0.6rem;margin-top:1rem;">
        <button class="btn btn-primary btn-bloco" id="btnConcluir">Concluir treino</button>
        <button class="btn btn-outline btn-bloco" id="btnLimpar">Limpar treino</button>
      </div>`;
  }
  lista.innerHTML = html;
  document.getElementById('voltarTreinos').addEventListener('click', () => { treinoAtivo = null; renderTreinos(); });
  lista.querySelectorAll('.serie').forEach(btn => {
    btn.addEventListener('click', () => marcarSerie(Number(btn.dataset.ex), Number(btn.dataset.serie)));
  });
  const btnLimpar = document.getElementById('btnLimpar');
  if (btnLimpar) btnLimpar.addEventListener('click', limparTreino);
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
    if (completo) {
      estado[t.id].dataConclusao = hoje();
      salvarEstado();
      registrarHistorico(t);
    }
  }
  renderExecucao();
}
/* Limpa as marcações do treino, sem encerrar nem sair da página */
function limparTreino() {
  const t = treinoAtivo;
  if (!t) return;
  if (!confirm('Limpar as marcações deste treino?')) return;
  const ex = {};
  t.exercicios.forEach((e, i) => { ex[i] = Array(e.series).fill(false); });
  estado[t.id] = ex;
  salvarEstado();
  mostrarToast('Treino limpo');
  renderExecucao();
}
/* Conclui o treino e volta à tela principal */
function concluirTreino() {
  const t = treinoAtivo;
  if (!t || !t.exercicios.length) return;
  const ex = estado[t.id] || {};
  const feitos = t.exercicios.filter((_, i) => (ex[i] || []).filter(Boolean).length >= t.exercicios[i].series).length;
  const tudoFeito = feitos === t.exercicios.length;
  t.exercicios.forEach((e, i) => { ex[i] = tudoFeito ? Array(e.series).fill(false) : Array(e.series).fill(true); });
  estado[t.id] = ex;
  estado[t.id].dataConclusao = hoje();
  salvarEstado();
  if (!tudoFeito) registrarHistorico(t);
  mostrarToast(tudoFeito ? 'Treino desmarcado' : '✅ Treino concluído!');
  treinoAtivo = null;
  renderTreinos();
}
/* ---------- 6. GERENCIAR (CRUD + BACKUP) ---------- */
function renderGerenciar() {
  const lista = document.getElementById('listaGerenciar');
  const backupHtml = `
    <div class="backup-box" style="margin-bottom:1rem;padding:0.9rem;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);">
      <strong style="display:block;margin-bottom:0.5rem;font-size:0.85rem;">💾 Backup dos dados</strong>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="btn btn-outline btn-pequeno" id="btnExportar">Exportar (salvar arquivo)</button>
        <button class="btn btn-outline btn-pequeno" id="btnImportar">Importar</button>
        <input type="file" id="fileImportar" accept="application/json,.json" style="display:none;">
      </div>
      <p style="margin:0.5rem 0 0;font-size:0.72rem;color:var(--muted);">Exportar baixa um arquivo JSON com treinos, progresso, histórico e nutrição. Importar restaura de um arquivo de backup.</p>
    </div>`;
  if (!treinos.length) {
    lista.innerHTML = backupHtml + '<div class="vazio">Nenhum treino cadastrado.<br>Toque em <b>+ Novo treino</b>.</div>';
  } else {
    lista.innerHTML = backupHtml + treinos.map(t => `
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
  }
  lista.querySelectorAll('[data-editar]').forEach(btn => btn.addEventListener('click', () => abrirEditor(btn.dataset.editar)));
  lista.querySelectorAll('[data-excluir]').forEach(btn => btn.addEventListener('click', () => excluirTreino(btn.dataset.excluir)));
  const btnExportar = document.getElementById('btnExportar');
  if (btnExportar) btnExportar.addEventListener('click', exportarDados);
  const btnImportar = document.getElementById('btnImportar');
  const fileImportar = document.getElementById('fileImportar');
  if (btnImportar) btnImportar.addEventListener('click', () => fileImportar.click());
  if (fileImportar) fileImportar.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importarDados(e.target.files[0]);
    e.target.value = '';
  });
}
function exportarDados() {
  const dados = {
    app: 'itrainer', versao: 9, exportadoEm: new Date().toISOString(),
    treinos, estado, historico
  };
  if (window.Nutricao && window.Nutricao.backupExtrair) {
    dados.nutricao = window.Nutricao.backupExtrair();
  }
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'itrainer-backup-' + hoje() + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  mostrarToast('✅ Backup exportado');
}
function importarDados(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      if (!dados || !Array.isArray(dados.treinos)) throw new Error('formato-invalido');
      treinos = dados.treinos;
      estado = (dados.estado && typeof dados.estado === 'object' && !Array.isArray(dados.estado)) ? dados.estado : {};
      historico = Array.isArray(dados.historico) ? dados.historico : [];
      salvarTreinos(); salvarEstado(); salvarHistorico();
      if (window.Nutricao && window.Nutricao.backupAplicar && dados.nutricao) {
        window.Nutricao.backupAplicar(dados.nutricao);
      }
      mostrarToast('✅ Dados importados');
      renderGerenciar(); renderTreinos(); renderHistorico();
    } catch (err) {
      mostrarToast('❌ Arquivo de backup inválido');
    }
  };
  reader.readAsText(file);
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
/* ---------- 7. EDITOR ---------- */
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
      icone: row.dataset.icone || 'halteres',
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
      const row = document.createElement('div');
      row.className = 'ed-exercicio';
      row.dataset.icone = ex.icone;
      row.innerHTML = `
        <input type="text" class="ed-nome" value="${ex.nome}" placeholder="Nome do exercício">
        <label class="campo">
          <span>Equipamento/Aparelho</span>
          <input type="text" class="ed-equipamento" value="${ex.equipamento}" placeholder="Digite ou escolha">
        </label>
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
      if (window.iniciarAutocompleteEquipamento) {
        iniciarAutocompleteEquipamento(row.querySelector('.ed-equipamento'));
      }
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
/* ---------- 8. HISTÓRICO + ESTATÍSTICAS ---------- */
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
function calcularEstatisticas() {
  const stats = { total: historico.length, ultimos7: 0, mediaSemana: 0, maisFrequente: null, volume: 0, streak: 0 };
  if (!historico.length) return stats;
  const hojeMs = new Date(hoje() + 'T00:00:00').getTime();
  const diaMs = 86400000;
  const freq = {};
  let volume = 0;
  historico.forEach(h => {
    const t = new Date(h.data + 'T00:00:00').getTime();
    if (hojeMs - t <= 7 * diaMs) stats.ultimos7++;
    (h.exercicios || []).forEach(e => {
      freq[e.nome] = (freq[e.nome] || 0) + 1;
      const carga = parseFloat(String(e.carga).replace(',', '.'));
      if (!isNaN(carga) && carga > 0) volume += (e.series || 0) * carga;
    });
  });
  const datasUnicas = [...new Set(historico.map(h => h.data))].sort();
  const inicio = datasUnicas.length ? new Date(datasUnicas[0] + 'T00:00:00').getTime() : hojeMs;
  const semanas = Math.max(1, Math.ceil((hojeMs - inicio) / (7 * diaMs)));
  stats.mediaSemana = Math.round((historico.length / semanas) * 10) / 10;
  let max = 0;
  Object.keys(freq).forEach(k => { if (freq[k] > max) { max = freq[k]; stats.maisFrequente = k; } });
  const set = new Set(historico.map(h => h.data));
  let streak = 0;
  let d = new Date(hojeMs);
  while (set.has(d.toISOString().split('T')[0])) { streak++; d = new Date(d.getTime() - diaMs); }
  stats.volume = volume;
  stats.streak = streak;
  return stats;
}
function renderHistorico() {
  const lista = document.getElementById('listaHistorico');
  const stats = calcularEstatisticas();
  const statsHtml = `
    <div class="stats-box" style="margin-bottom:1rem;padding:0.9rem;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);">
      <strong style="display:block;margin-bottom:0.6rem;font-size:0.85rem;">📊 Suas estatísticas</strong>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;">
        <div style="background:var(--surface);border-radius:8px;padding:0.6rem;"><div style="font-size:1.3rem;font-weight:800;color:var(--accent);">${stats.total}</div><div style="font-size:0.68rem;color:var(--muted);">Treinos totais</div></div>
        <div style="background:var(--surface);border-radius:8px;padding:0.6rem;"><div style="font-size:1.3rem;font-weight:800;color:var(--accent);">${stats.ultimos7}</div><div style="font-size:0.68rem;color:var(--muted);">Últimos 7 dias</div></div>
        <div style="background:var(--surface);border-radius:8px;padding:0.6rem;"><div style="font-size:1.3rem;font-weight:800;color:var(--accent);">${stats.mediaSemana}</div><div style="font-size:0.68rem;color:var(--muted);">Média/semana</div></div>
        <div style="background:var(--surface);border-radius:8px;padding:0.6rem;"><div style="font-size:1.3rem;font-weight:800;color:var(--accent);">${stats.streak} 🔥</div><div style="font-size:0.68rem;color:var(--muted);">Dias seguidos</div></div>
        <div style="background:var(--surface);border-radius:8px;padding:0.6rem;grid-column:1/-1;"><div style="font-size:1.1rem;font-weight:800;color:var(--accent);">${stats.volume > 0 ? stats.volume + ' kg' : '—'}</div><div style="font-size:0.68rem;color:var(--muted);">Volume total (séries × carga)</div></div>
        <div style="background:var(--surface);border-radius:8px;padding:0.6rem;grid-column:1/-1;"><div style="font-size:1rem;font-weight:800;color:var(--text);">${stats.maisFrequente || '—'}</div><div style="font-size:0.68rem;color:var(--muted);">Exercício mais frequente</div></div>
      </div>
    </div>`;
  if (!historico.length) {
    lista.innerHTML = statsHtml + '<div class="vazio">Nenhum treino concluído ainda.<br>Complete um treino para registrar aqui.</div>';
    return;
  }
  const grupos = {};
  historico.forEach(h => {
    if (!grupos[h.data]) grupos[h.data] = [];
    grupos[h.data].push(h);
  });
  const datas = Object.keys(grupos).sort((a, b) => b.localeCompare(a));
  lista.innerHTML = statsHtml + datas.map(data => {
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
/* ---------- 9. SOM (Web Audio API) — corrigido para iPhone/Safari ---------- */
let audioCtx = null;
function desbloquearAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  } catch (e) {}
}
document.addEventListener('pointerdown', function destravarAudio() {
  desbloquearAudio();
  document.removeEventListener('pointerdown', destravarAudio);
});
function beep(freq, dur, vol, atraso) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
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
/* ---------- 10. TELA SEMPRE ATIVA (Wake Lock) ---------- */
let wakeLock = null;
let wakeLockAtivo = false;
async function solicitarWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLockAtivo = true;
    wakeLock.addEventListener('release', () => { wakeLockAtivo = false; });
  } catch (e) { wakeLockAtivo = false; }
}
function liberarWakeLock() {
  if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
  wakeLockAtivo = false;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wakeLockAtivo) solicitarWakeLock();
});
/* ---------- 11. TIMER (contagem por tempo real + bipes) ---------- */
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
  solicitarWakeLock();
  clearInterval(timerInterval);
  timerInterval = setInterval(stepTimer, 250);
}
function fecharTimerModal() {
  clearInterval(timerInterval);
  document.getElementById('modalTimer').classList.remove('aberto');
  liberarWakeLock();
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
    liberarWakeLock();
    tocarSom(timerFinalTipo);
    const cb = aoTerminarCallback;
    aoTerminarCallback = null;
    if (cb) cb();
  }
}
document.getElementById('timerFechar').addEventListener('click', fecharTimerModal);
document.getElementById('timerPausar').addEventListener('click', () => {
  timerRodando = !timerRodando;
  document.getElementById('timerPausar').textContent = timerRodando ? 'Pausar' : 'Continuar';
});
/* ---------- 12. INICIALIZAÇÃO ---------- */
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => navegar(el.dataset.view));
});
document.getElementById('btnNovoTreino').addEventListener('click', () => abrirEditor(null));
['pointerdown', 'touchstart', 'click', 'keydown'].forEach(ev =>
  document.addEventListener(ev, desbloquearAudio, { capture: true, passive: true })
);
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
    carregarTreinos();
    carregarEstado();
    carregarHistorico();
  }
  if (!Array.isArray(treinos)) {
    const d = lerTreinosDoLocalStorage();
    treinos = d !== null ? d : JSON.parse(JSON.stringify(CONFIG.treinos));
    if (d === null) salvarTreinos();
  }
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)) estado = lerEstadoDoLocalStorage();
  if (!Array.isArray(historico)) historico = lerHistoricoDoLocalStorage();
  if (!Array.isArray(historico)) historico = [];
  navegar('treinos');
  if (window.Nutricao && window.Nutricao.init) window.Nutricao.init();
}
iniciarApp();
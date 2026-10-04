/* ============================================================
   iTrainer — Nutrição · Dados, banco e utilitários
   ============================================================ */
'use strict';
/* ---------- Configuração ---------- */
const NUT_BANCO = { nome: 'itrainer-db', versao: 3, stores: ['perfil', 'metas', 'alimentos', 'registros', 'agua'] };
const NUT_PREFIXO = 'itrainer-nut-';
const NUT_VIEW_ID = 'view-nutricao';
const REFEICOES = [
  { chave: 'cafe',   rotulo: 'Café' },
  { chave: 'almoco', rotulo: 'Almoço' },
  { chave: 'lanche', rotulo: 'Lanche' },
  { chave: 'jantar', rotulo: 'Jantar' },
];
const MACROS = [
  { chave: 'kcal', rotulo: 'Calorias', unidade: 'kcal' },
  { chave: 'prot', rotulo: 'Proteína', unidade: 'g' },
  { chave: 'carb', rotulo: 'Carboidrato', unidade: 'g' },
  { chave: 'gord', rotulo: 'Gordura', unidade: 'g' },
];
const METAS_PADRAO = { kcal: 2000, prot: 120, carb: 250, gord: 60 };
const AGUA_REFERENCIA_ML = 2000;
const LIMITES = {
  qtd:         { min: 0.1, max: 99 },
  kcalPorcao:  { min: 0,   max: 5000 },
  macroPorcao: { min: 0,   max: 1000 },
  metaKcal:    { min: 0,   max: 20000 },
  metaMacro:   { min: 0,   max: 2000 },
  agua:        { min: 0,   max: 15000 },
};
const DIAS_ROTULO = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
/* ---------- Estado ---------- */
let nutPronto = false;
let nutView = 'diario';
let nutHistAba = 'dias';
let nutBusca = '';
let nutAlimentos = {};
let nutMetas = Object.assign({}, METAS_PADRAO);
let nutRegistros = {};
let nutAgua = {};
let nutPerfil = {};
let nutOverlayBusca = null;
/* ---------- Persistência local (espelho rápido) ---------- */
function nutLsGet(store) {
  try { return JSON.parse(localStorage.getItem(NUT_PREFIXO + store)); } catch (e) { return null; }
}
function nutLsPut(store, valor) {
  try { localStorage.setItem(NUT_PREFIXO + store, JSON.stringify(valor)); } catch (e) {}
}
/* ---------- IndexedDB com tempo limite (nunca trava) ---------- */
function nutAbrirBanco() {
  return new Promise(function (resolve, reject) {
    if (typeof indexedDB === 'undefined') { reject(new Error('sem-idb')); return; }
    var req;
    try { req = indexedDB.open(NUT_BANCO.nome, NUT_BANCO.versao); }
    catch (e) { reject(e); return; }
    var feito = false;
    var timer = setTimeout(function () {
      if (!feito) { feito = true; reject(new Error('timeout-idb')); }
    }, 2500);
    function ok(db) { if (!feito) { feito = true; clearTimeout(timer); resolve(db); } }
    function err(e) { if (!feito) { feito = true; clearTimeout(timer); reject(e); } }
    req.onupgradeneeded = function (ev) {
      var db = ev.target.result;
      NUT_BANCO.stores.forEach(function (nome) {
        if (!db.objectStoreNames.contains(nome)) db.createObjectStore(nome, { keyPath: 'chave' });
      });
    };
    req.onsuccess = function () { ok(req.result); };
    req.onerror = function () { err(req.error); };
    req.onblocked = function () { err(new Error('bloqueado')); };
  });
}
function nutDbGet(store) {
  return nutAbrirBanco().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(store, 'readonly');
      var r = tx.objectStore(store).get('dados');
      r.onsuccess = function () { resolve(r.result ? r.result.valor : null); };
      r.onerror = function () { reject(r.error); };
    });
  }).catch(function () { return nutLsGet(store); });
}
function nutDbPut(store, valor) {
  nutLsPut(store, valor);
  return nutAbrirBanco().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put({ chave: 'dados', valor: valor });
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  }).catch(function () {});
}
/* ---------- Carga: localStorage na hora, IDB em segundo plano ---------- */
function nutCarregarDados() {
  var dados = [
    nutLsGet('alimentos'), nutLsGet('metas'),
    nutLsGet('registros'), nutLsGet('agua'), nutLsGet('perfil'),
  ];
  nutAlimentos = {};
  ALIMENTOS_PADRAO.forEach(function (a) { nutAlimentos[a.id] = a; });
  if (dados[0] && typeof dados[0] === 'object') Object.assign(nutAlimentos, dados[0]);
  nutMetas = Object.assign({}, METAS_PADRAO, dados[1] || {});
  nutRegistros = (dados[2] && typeof dados[2] === 'object') ? dados[2] : {};
  nutAgua = (dados[3] && typeof dados[3] === 'object') ? dados[3] : {};
  nutPerfil = (dados[4] && typeof dados[4] === 'object') ? dados[4] : {};
  nutPronto = true;
  Promise.all([
    nutDbGet('alimentos'), nutDbGet('metas'),
    nutDbGet('registros'), nutDbGet('agua'), nutDbGet('perfil'),
  ]).then(function (bd) {
    if (bd[0] && typeof bd[0] === 'object') Object.assign(nutAlimentos, bd[0]);
    if (bd[1] && typeof bd[1] === 'object') nutMetas = Object.assign({}, METAS_PADRAO, bd[1]);
    if (bd[2] && typeof bd[2] === 'object') nutRegistros = bd[2];
    if (bd[3] && typeof bd[3] === 'object') nutAgua = bd[3];
    if (bd[4] && typeof bd[4] === 'object') nutPerfil = bd[4];
    if (typeof nutRender === 'function') nutRender();
  }).catch(function () {});
}
function nutGarantirEstado() {
  if (!nutPronto) nutCarregarDados();
  return Promise.resolve();
}
function nutAlimentosPessoais() {
  var out = {};
  Object.keys(nutAlimentos).forEach(function (id) {
    if (id.indexOf('user-') === 0 || id.indexOf('import-') === 0) out[id] = nutAlimentos[id];
  });
  return out;
}
async function nutSalvarRegistros() { await nutDbPut('registros', nutRegistros); }
async function nutSalvarMetas()     { await nutDbPut('metas', nutMetas); }
async function nutSalvarAlimentos() { await nutDbPut('alimentos', nutAlimentosPessoais()); }
async function nutSalvarAgua()      { await nutDbPut('agua', nutAgua); }
/* ---------- Utilitários ---------- */
function nutHoje() {
  var d = new Date();
  var p = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function nutDataUtf(data) {
  var partes = data.split('-');
  return partes[2] + '/' + partes[1];
}
function nutDiaSemana(data) {
  var partes = data.split('-').map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2]).getDay();
}
function nutNum(v, min, max) {
  var n = parseFloat(String(v).replace(',', '.'));
  if (isNaN(n)) return null;
  if (min !== undefined && n < min) return null;
  if (max !== undefined && n > max) return null;
  return Math.round(n * 100) / 100;
}
function nutClamp(v, min, max) { return Math.min(Math.max(v, min), max); }
function nutFmt(n) {
  var v = Number(n) || 0;
  return Number.isInteger(v) ? String(v) : String(v.toFixed(1)).replace('.', ',');
}
function nutEsc(t) {
  return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function nutRefeicoesVazias() { return { cafe: [], almoco: [], lanche: [], jantar: [] }; }
function nutTotaisRefeicao(refeicao) {
  var total = { kcal: 0, prot: 0, carb: 0, gord: 0 };
  var reg = nutRegistros[nutHoje()] || {};
  (reg[refeicao] || []).forEach(function (item) {
    var a = nutAlimentos[item.id];
    if (!a) return;
    total.kcal += a.kcal * item.qtd;
    total.prot += a.prot * item.qtd;
    total.carb += a.carb * item.qtd;
    total.gord += a.gord * item.qtd;
  });
  return total;
}
function nutTotaisDia(data) {
  var total = { kcal: 0, prot: 0, carb: 0, gord: 0 };
  var reg = nutRegistros[data] || {};
  REFEICOES.forEach(function (r) {
    (reg[r.chave] || []).forEach(function (item) {
      var a = nutAlimentos[item.id];
      if (!a) return;
      total.kcal += a.kcal * item.qtd;
      total.prot += a.prot * item.qtd;
      total.carb += a.carb * item.qtd;
      total.gord += a.gord * item.qtd;
    });
  });
  return total;
}
function nutListaDias(n) {
  var dias = [];
  var d, i;
  for (i = n - 1; i >= 0; i--) {
    d = new Date();
    d.setDate(d.getDate() - i);
    var p = function (x) { return String(x).padStart(2, '0'); };
    dias.push(d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()));
  }
  return dias;
}
function nutSemanaAtual() {
  var hoje = new Date();
  var offset = (hoje.getDay() + 6) % 7;
  var seg = new Date(hoje);
  seg.setDate(hoje.getDate() - offset);
  var dias = [];
  var p = function (x) { return String(x).padStart(2, '0'); };
  for (var i = 0; i < 7; i++) {
    var d = new Date(seg);
    d.setDate(seg.getDate() + i);
    dias.push(d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()));
  }
  return dias;
}
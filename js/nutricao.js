/* ============================================================
   iTrainer — Módulo Nutrição  (js/nutricao.js)
   Diário alimentar · Banco de alimentos · Metas · Água · Histórico
   Dados 100% locais (IndexedDB + espelho localStorage).
   Valores são ESTIMATIVAS e não substituem nutricionista.
   ============================================================ */
'use strict';
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
const ALIMENTOS_PADRAO = [
  { id: 'padrao-arroz-branco',   nome: 'Arroz branco cozido',     porcao: '100 g',         kcal: 128, prot: 2.5, carb: 28,  gord: 0.3 },
  { id: 'padrao-arroz-integral', nome: 'Arroz integral cozido',   porcao: '100 g',         kcal: 124, prot: 2.6, carb: 26,  gord: 1.0 },
  { id: 'padrao-feijao',         nome: 'Feijão carioca cozido',   porcao: '1 concha (86 g)',kcal: 76,  prot: 4.8, carb: 13.6, gord: 0.5 },
  { id: 'padrao-lentilha',       nome: 'Lentilha cozida',         porcao: '100 g',         kcal: 116, prot: 8.9, carb: 18,  gord: 0.5 },
  { id: 'padrao-grao-de-bico',   nome: 'Grão-de-bico cozido',     porcao: '100 g',         kcal: 139, prot: 7.6, carb: 22,  gord: 2.2 },
  { id: 'padrao-batata',         nome: 'Batata cozida',           porcao: '100 g',         kcal: 80,  prot: 1.9, carb: 18,  gord: 0.1 },
  { id: 'padrao-batata-doce',    nome: 'Batata doce cozida',      porcao: '100 g',         kcal: 86,  prot: 1.6, carb: 20,  gord: 0.1 },
  { id: 'padrao-macarrao',       nome: 'Macarrão cozido',         porcao: '100 g',         kcal: 131, prot: 5.0, carb: 26,  gord: 0.5 },
  { id: 'padrao-tapioca',        nome: 'Tapioca',                 porcao: '100 g',         kcal: 130, prot: 0.2, carb: 31,  gord: 0.4 },
  { id: 'padrao-aveia',          nome: 'Aveia em flocos',         porcao: '3 col. sopa (30 g)', kcal: 117, prot: 4.5, carb: 19, gord: 2.1 },
  { id: 'padrao-pao-frances',    nome: 'Pão francês',             porcao: '1 unid (50 g)',  kcal: 137, prot: 4.5, carb: 26,  gord: 1.6 },
  { id: 'padrao-pao-integral',   nome: 'Pão de forma integral',   porcao: '1 fatia (25 g)', kcal: 60,  prot: 3.0, carb: 10,  gord: 1.2 },
  { id: 'padrao-pao-queijo',     nome: 'Pão de queijo',           porcao: '1 unid (25 g)',  kcal: 79,  prot: 1.9, carb: 8.6, gord: 4.0 },
  { id: 'padrao-frango',         nome: 'Peito de frango grelhado',porcao: '100 g',         kcal: 165, prot: 31,  carb: 0,   gord: 3.6 },
  { id: 'padrao-bife',           nome: 'Bife bovino grelhado',    porcao: '100 g',         kcal: 219, prot: 26,  carb: 0,   gord: 12 },
  { id: 'padrao-carne-moida',    nome: 'Carne moída refogada',    porcao: '100 g',         kcal: 205, prot: 22,  carb: 0,   gord: 12 },
  { id: 'padrao-ovo',            nome: 'Ovo cozido',              porcao: '1 unid (50 g)',  kcal: 78,  prot: 6.3, carb: 0.6, gord: 5.3 },
  { id: 'padrao-omelete',        nome: 'Omelete (1 ovo)',         porcao: '1 unid',        kcal: 98,  prot: 6.8, carb: 0.7, gord: 7.5 },
  { id: 'padrao-salmao',         nome: 'Salmão grelhado',         porcao: '100 g',         kcal: 176, prot: 25,  carb: 0,   gord: 8.2 },
  { id: 'padrao-atum',           nome: 'Atum em lata (drenado)',  porcao: '1 lata (120 g)', kcal: 120, prot: 27,  carb: 0,   gord: 1.2 },
  { id: 'padrao-camarao',        nome: 'Camarão cozido',          porcao: '100 g',         kcal: 81,  prot: 17,  carb: 0.2, gord: 0.9 },
  { id: 'padrao-tofu',           nome: 'Tofu',                    porcao: '100 g',         kcal: 76,  prot: 8.0, carb: 1.9, gord: 4.2 },
  { id: 'padrao-leite-integral', nome: 'Leite integral',          porcao: '1 copo (200 ml)',kcal: 122, prot: 6.2, carb: 9.4, gord: 6.6 },
  { id: 'padrao-leite-desn',     nome: 'Leite desnatado',         porcao: '1 copo (200 ml)',kcal: 70,  prot: 6.4, carb: 10,  gord: 0.4 },
  { id: 'padrao-iogurte',        nome: 'Iogurte natural',         porcao: '1 pote (170 g)', kcal: 105, prot: 5.7, carb: 9.5, gord: 4.6 },
  { id: 'padrao-minas',          nome: 'Queijo minas frescal',    porcao: '1 fatia (30 g)', kcal: 76,  prot: 5.4, carb: 1.0, gord: 5.8 },
  { id: 'padrao-mussarela',      nome: 'Queijo mussarela',        porcao: '1 fatia (30 g)', kcal: 90,  prot: 6.6, carb: 0.8, gord: 6.7 },
  { id: 'padrao-peru',           nome: 'Peito de peru fatiado',   porcao: '1 fatia (15 g)', kcal: 25,  prot: 4.6, carb: 0.4, gord: 0.5 },
  { id: 'padrao-whey',           nome: 'Whey protein',            porcao: '1 scoop (30 g)', kcal: 120, prot: 24,  carb: 3.0, gord: 1.5 },
  { id: 'padrao-banana',         nome: 'Banana',                  porcao: '1 unid (100 g)', kcal: 92,  prot: 1.4, carb: 21,  gord: 0.3 },
  { id: 'padrao-maca',           nome: 'Maçã',                    porcao: '1 unid (130 g)', kcal: 68,  prot: 0.3, carb: 18,  gord: 0.1 },
  { id: 'padrao-pera',           nome: 'Pêra',                    porcao: '1 unid (130 g)', kcal: 74,  prot: 0.6, carb: 20,  gord: 0.2 },
  { id: 'padrao-mamao',          nome: 'Mamão',                   porcao: '1 fatia (150 g)',kcal: 65,  prot: 0.8, carb: 17,  gord: 0.3 },
  { id: 'padrao-abacaxi',        nome: 'Abacaxi',                 porcao: '1 fatia (100 g)',kcal: 48,  prot: 0.5, carb: 12,  gord: 0.1 },
  { id: 'padrao-manga',          nome: 'Manga',                   porcao: '1 unid (150 g)', kcal: 89,  prot: 1.2, carb: 21,  gord: 0.5 },
  { id: 'padrao-melancia',       nome: 'Melancia',                porcao: '1 fatia (200 g)',kcal: 60,  prot: 1.2, carb: 15,  gord: 0.4 },
  { id: 'padrao-morango',        nome: 'Morango',                 porcao: '100 g',         kcal: 30,  prot: 0.9, carb: 6.9, gord: 0.3 },
  { id: 'padrao-uva',            nome: 'Uva',                     porcao: '100 g',         kcal: 53,  prot: 0.6, carb: 13,  gord: 0.3 },
  { id: 'padrao-abacate',        nome: 'Abacate',                 porcao: '1/2 unid (85 g)',kcal: 82,  prot: 1.0, carb: 5.0, gord: 7.1 },
  { id: 'padrao-azeite',         nome: 'Azeite de oliva',         porcao: '1 col. sopa (13 g)', kcal: 108, prot: 0, carb: 0, gord: 12 },
  { id: 'padrao-amendoim',       nome: 'Amendoim torrado',        porcao: '30 g',          kcal: 170, prot: 7.6, carb: 5.0, gord: 14.4 },
  { id: 'padrao-castanha',       nome: 'Castanha-do-pará',        porcao: '1 unid (5 g)',   kcal: 33,  prot: 0.7, carb: 0.6, gord: 3.3 },
  { id: 'padrao-pasta-amendoim', nome: 'Pasta de amendoim',       porcao: '1 col. sopa (20 g)', kcal: 119, prot: 5.4, carb: 4.4, gord: 9.4 },
  { id: 'padrao-granola',        nome: 'Granola',                 porcao: '30 g',          kcal: 120, prot: 3.0, carb: 18,  gord: 4.0 },
  { id: 'padrao-mel',            nome: 'Mel',                     porcao: '1 col. sopa (20 g)', kcal: 61, prot: 0, carb: 17, gord: 0 },
  { id: 'padrao-brocolis',       nome: 'Brócolis cozido',         porcao: '100 g',         kcal: 31,  prot: 2.6, carb: 5.0, gord: 0.3 },
  { id: 'padrao-cenoura',        nome: 'Cenoura cozida',          porcao: '100 g',         kcal: 33,  prot: 0.8, carb: 7.2, gord: 0.2 },
  { id: 'padrao-couve',          nome: 'Couve refogada',          porcao: '100 g',         kcal: 60,  prot: 2.6, carb: 5.0, gord: 3.5 },
  { id: 'padrao-tomate',         nome: 'Tomate',                  porcao: '1 unid (120 g)', kcal: 22,  prot: 1.1, carb: 4.7, gord: 0.2 },
  { id: 'padrao-alface',         nome: 'Alface',                  porcao: '100 g',         kcal: 15,  prot: 1.3, carb: 2.4, gord: 0.2 },
  { id: 'padrao-suco-laranja',   nome: 'Suco de laranja',         porcao: '1 copo (200 ml)',kcal: 88,  prot: 1.7, carb: 20,  gord: 0.4 },
  { id: 'padrao-acai',           nome: 'Açaí (polpa)',            porcao: '100 g',         kcal: 62,  prot: 0.9, carb: 13,  gord: 0.6 },
  { id: 'padrao-chocolate',      nome: 'Chocolate 70%',           porcao: '2 quadrados (20 g)', kcal: 108, prot: 1.8, carb: 7.2, gord: 8.4 },
  { id: 'padrao-sorvete',        nome: 'Sorvete de creme',        porcao: '1 bola (60 g)',  kcal: 126, prot: 2.1, carb: 14,  gord: 7.0 },
];
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
function nutLsGet(store) {
  try { return JSON.parse(localStorage.getItem(NUT_PREFIXO + store)); } catch (e) { return null; }
}
function nutLsPut(store, valor) {
  try { localStorage.setItem(NUT_PREFIXO + store, JSON.stringify(valor)); } catch (e) {}
}
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
async function nutCarregarDados() {
  var dados = await Promise.all([
    nutDbGet('alimentos'), nutDbGet('metas'),
    nutDbGet('registros'), nutDbGet('agua'), nutDbGet('perfil'),
  ]);
  nutAlimentos = {};
  ALIMENTOS_PADRAO.forEach(function (a) { nutAlimentos[a.id] = a; });
  if (dados[0] && typeof dados[0] === 'object') Object.assign(nutAlimentos, dados[0]);
  nutMetas = Object.assign({}, METAS_PADRAO, dados[1] || {});
  nutRegistros = (dados[2] && typeof dados[2] === 'object') ? dados[2] : {};
  nutAgua = (dados[3] && typeof dados[3] === 'object') ? dados[3] : {};
  nutPerfil = (dados[4] && typeof dados[4] === 'object') ? dados[4] : {};
  nutPronto = true;
}
function nutGarantirEstado() {
  return nutPronto ? Promise.resolve() : nutCarregarDados();
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
function nutHoje() {
  var d = new Date();
  var p = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function nutDataUtf(data) {
  var partes = data.split('-');
  return partes[2] + '/' + partes[1];
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
var DIAS_ROTULO = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
/* ================= UI (design system do app) ================= */
function nutToast(msg, erro) {
  var t = document.createElement('div');
  t.className = 'toast';
  t.style.cssText =
    'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:3000;' +
    'background:#1b1f17;color:#e8f6d8;border:1px solid ' + (erro ? '#ff5c5c' : '#c8f31d') + ';' +
    'padding:10px 18px;border-radius:12px;font:400 14px/1.4 Inter,sans-serif;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.45);max-width:90vw;opacity:0;transition:opacity .25s;';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.style.opacity = '1'; });
  setTimeout(function () {
    t.style.opacity = '0';
    setTimeout(function () { t.remove(); }, 300);
  }, 2600);
}
function nutCampo(o) {
  var tipo = o.tipo || 'number';
  var sufixo = o.sufixo ? '<span style="font:400 11px Inter,sans-serif;color:#9db38c;margin-left:8px">' + nutEsc(o.sufixo) + '</span>' : '';
  var ph = o.placeholder ? ' placeholder="' + nutEsc(o.placeholder) + '"' : '';
  return (
    '<label style="display:block;margin-bottom:12px">' +
      '<span style="display:block;font:600 11px Inter,sans-serif;text-transform:uppercase;letter-spacing:1px;color:#9db38c;margin-bottom:6px">' + nutEsc(o.rotulo) + '</span>' +
      '<div style="display:flex;align-items:center">' +
        '<input id="' + o.id + '" type="' + tipo + '" value="' + nutEsc(o.valor == null ? '' : o.valor) + '"' + ph +
        (tipo === 'number' ? ' min="0" step="0.1" inputmode="decimal"' : ' autocomplete="off"') +
        ' style="width:100%;background:#0e120a;border:1px solid #2c3422;border-radius:10px;padding:10px 12px;color:#edf7dc;font:400 15px Inter,sans-serif">' +
        sufixo +
      '</div>' +
    '</label>'
  );
}
function nutAbrirModal(opcoes) {
  var overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.style.cssText =
    'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,.68);z-index:2000;padding:16px;';
  overlay.innerHTML =
    '<div class="modal-content" style="background:#161a12;border:1px solid rgba(200,243,29,.35);border-radius:20px;' +
    'padding:22px;width:min(94vw,440px);max-height:88vh;overflow:auto;color:#edf7dc">' +
      '<h3 style="font:700 22px \'Bebas Neue\',sans-serif;letter-spacing:1.5px;margin:0 0 16px;color:#c8f31d">' + nutEsc(opcoes.titulo) + '</h3>' +
      opcoes.corpo +
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap">' +
        '<button class="btn btn-outline" data-acao="fechar" style="background:transparent;border:1px solid #3a442c;color:#c6d4b4;border-radius:10px;padding:9px 16px;font:600 13px Inter,sans-serif;cursor:pointer">Cancelar</button>' +
        (opcoes.rotuloOk ? '<button class="btn btn-primary" data-acao="ok" style="background:#c8f31d;color:#141807;border:none;border-radius:10px;padding:9px 18px;font:700 13px Inter,sans-serif;cursor:pointer">' + nutEsc(opcoes.rotuloOk) + '</button>' : '') +
      '</div>' +
    '</div>';
  function fechar() { overlay.remove(); if (overlay._onFechar) overlay._onFechar(); }
  overlay.querySelector('[data-acao="fechar"]').onclick = fechar;
  overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) fechar(); });
  if (opcoes.rotuloOk) {
    overlay.querySelector('[data-acao="ok"]').onclick = function () { opcoes.onOk(); fechar(); };
  }
  document.body.appendChild(overlay);
  return overlay;
}
/* ================= BARRAS DE PROGRESSO ================= */
function nutHtmlBarra(m, consumido, meta) {
  var acima = meta > 0 && consumido > meta;
  var pct = meta > 0 ? Math.min((consumido / meta) * 100, 100) : (consumido > 0 ? 100 : 0);
  var cor = acima ? '#ff5c5c' : '#c8f31d';
  return (
    '<div style="margin-top:14px">' +
      '<div style="display:flex;justify-content:space-between;font:500 13px Inter,sans-serif;margin-bottom:6px">' +
        '<span style="color:#c6d4b4">' + m.rotulo + '</span>' +
        '<span style="color:' + (acima ? '#ff5c5c' : '#edf7dc') + '">' +
          nutFmt(consumido) + ' / ' + nutFmt(meta) +
          (m.unidade === 'kcal' ? ' kcal' : ' g') +
        '</span>' +
      '</div>' +
      '<div style="height:10px;background:#1c2313;border-radius:6px;overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:' + cor + ';border-radius:6px;transition:width .3s"></div>' +
      '</div>' +
    '</div>'
  );
}
/* ================= VIEW: DIÁRIO ================= */
function nutBanner() {
  return (
    '<div style="background:rgba(200,243,29,.08);border:1px solid rgba(200,243,29,.25);border-radius:14px;padding:10px 14px;' +
    'font:400 12px/1.5 Inter,sans-serif;color:#c9d8b4">' +
      '🔒 Seus dados de saúde ficam <b>só neste aparelho</b>. Valores são <b>estimativas</b> e não substituem orientação de nutricionista.' +
    '</div>'
  );
}
function nutChip(view, rotulo) {
  var ativo = nutView === view;
  return (
    '<button data-nut="ver" data-view="' + view + '" class="chip" style="' +
    'border:' + (ativo ? '1px solid transparent' : '1px solid #3a442c') + ';' +
    'background:' + (ativo ? '#c8f31d' : 'transparent') + ';' +
    'color:' + (ativo ? '#141807' : '#c6d4b4') + ';' +
    'border-radius:999px;padding:7px 14px;font:600 13px Inter,sans-serif;cursor:pointer">' +
    rotulo + '</button>'
  );
}
function nutMiniNav() {
  return (
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' +
      nutChip('diario', 'Diário') + nutChip('historico', 'Histórico') + nutChip('alimentos', 'Alimentos') +
      '<button data-nut="abrir-metas" class="btn btn-outline" style="background:transparent;border:1px solid #3a442c;color:#c6d4b4;border-radius:999px;padding:7px 14px;font:600 13px Inter,sans-serif;cursor:pointer">Metas</button>' +
    '</div>'
  );
}
function nutHtmlResumo(total) {
  return (
    '<div style="background:#0e120a;border:1px solid #232b19;border-radius:16px;padding:16px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
        '<h2 style="font:700 18px \'Bebas Neue\',sans-serif;letter-spacing:1.5px;color:#edf7dc;margin:0">Resumo do dia</h2>' +
        '<span style="font:400 12px Inter,sans-serif;color:#9db38c">' + nutDataUtf(nutHoje()) + '</span>' +
      '</div>' +
      MACROS.map(function (m) { return nutHtmlBarra(m, total[m.chave], nutMetas[m.chave]); }).join('') +
    '</div>'
  );
}
function nutHtmlItem(refeicao, item) {
  var a = nutAlimentos[item.id];
  var estiloBotao =
    'background:transparent;border:1px solid #333c26;color:#c8f31d;border-radius:8px;' +
    'width:30px;height:30px;font:700 15px Inter,sans-serif;cursor:pointer;flex:none';
  if (!a) {
    return (
      '<div style="display:flex;align-items:center;gap:8px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
        '<div style="flex:1;font:400 13px Inter,sans-serif;color:#ff5c5c">Alimento removido</div>' +
        '<button data-nut="remover-item" data-refeicao="' + refeicao + '" data-id="' + item.id + '" style="' + estiloBotao + '">×</button>' +
      '</div>'
    );
  }
  return (
    '<div style="display:flex;align-items:center;gap:8px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font:500 14px Inter,sans-serif;color:#edf7dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + nutEsc(a.nome) + '</div>' +
        '<button data-nut="editar-qtd" data-refeicao="' + refeicao + '" data-id="' + item.id + '" ' +
        'style="background:none;border:none;padding:0;cursor:pointer;font:400 12px Inter,sans-serif;color:#9db38c;text-decoration:underline dotted">' +
          nutFmt(item.qtd) + ' × ' + nutEsc(a.porcao) +
        '</button>' +
      '</div>' +
      '<button data-nut="qtd-menos" data-refeicao="' + refeicao + '" data-id="' + item.id + '" style="' + estiloBotao + '">−</button>' +
      '<button data-nut="qtd-mais" data-refeicao="' + refeicao + '" data-id="' + item.id + '" style="' + estiloBotao + '">+</button>' +
      '<span style="font:600 13px Inter,sans-serif;color:#edf7dc;min-width:56px;text-align:right">' + nutFmt(a.kcal * item.qtd) + ' kcal</span>' +
      '<button data-nut="remover-item" data-refeicao="' + refeicao + '" data-id="' + item.id + '" ' +
      'style="background:transparent;border:1px solid #3a2b28;color:#ff5c5c;border-radius:8px;width:30px;height:30px;font:700 15px Inter,sans-serif;cursor:pointer;flex:none" aria-label="Remover">×</button>' +
    '</div>'
  );
}
function nutHtmlRefeicoes() {
  var reg = nutRegistros[nutHoje()] || nutRefeicoesVazias();
  return REFEICOES.map(function (r) {
    var itens = reg[r.chave] || [];
    var tot = nutTotaisRefeicao(r.chave);
    return (
      '<div style="background:#0e120a;border:1px solid #232b19;border-radius:16px;padding:16px;margin-top:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<h3 style="font:700 16px \'Bebas Neue\',sans-serif;letter-spacing:1.5px;color:#c8f31d;margin:0">' + r.rotulo + '</h3>' +
          '<span style="font:500 13px Inter,sans-serif;color:#9db38c">' + nutFmt(tot.kcal) + ' kcal</span>' +
        '</div>' +
        (itens.length
          ? itens.map(function (i) { return nutHtmlItem(r.chave, i); }).join('')
          : '<div style="font:400 13px Inter,sans-serif;color:#5f6b52;padding:14px 0 4px">Nenhum alimento registrado.</div>') +
        '<button data-nut="add-refeicao" data-refeicao="' + r.chave + '" class="btn btn-outline" ' +
        'style="width:100%;margin-top:12px;background:transparent;border:1px dashed #3a442c;border-radius:10px;padding:9px;color:#c8f31d;font:600 13px Inter,sans-serif;cursor:pointer">+ Adicionar alimento</button>' +
      '</div>'
    );
  }).join('');
}
function nutHtmlAgua() {
  var dia = nutHoje();
  var ml = nutAgua[dia] || 0;
  var pct = Math.min((ml / AGUA_REFERENCIA_ML) * 100, 100);
  var estiloBtn =
    'background:transparent;border:1px solid #333c26;color:#c8f31d;border-radius:10px;' +
    'padding:9px 12px;font:600 13px Inter,sans-serif;cursor:pointer';
  return (
    '<div style="background:#0e120a;border:1px solid #232b19;border-radius:16px;padding:16px;margin-top:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
        '<h3 style="font:700 16px \'Bebas Neue\',sans-serif;letter-spacing:1.5px;color:#c8f31d;margin:0">💧 Água</h3>' +
        '<span style="font:500 13px Inter,sans-serif;color:#edf7dc">' + nutFmt(ml) + ' / ' + AGUA_REFERENCIA_ML + ' ml</span>' +
      '</div>' +
      '<div style="height:10px;background:#1c2313;border-radius:6px;overflow:hidden;margin-top:10px">' +
        '<div style="height:100%;width:' + pct + '%;background:#4aa8ff;border-radius:6px;transition:width .3s"></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
        '<button data-nut="agua-menos" style="' + estiloBtn + '">−200</button>' +
        '<button data-nut="agua-mais-200" style="' + estiloBtn + '">+200</button>' +
        '<button data-nut="agua-mais-500" style="' + estiloBtn + '">+500</button>' +
        '<input id="nut-agua-input" type="number" min="0" max="15000" step="50" placeholder="ml" inputmode="numeric" ' +
        'style="width:86px;background:#0e120a;border:1px solid #2c3422;border-radius:10px;padding:8px 10px;color:#edf7dc;font:400 14px Inter,sans-serif">' +
        '<button data-nut="agua-ok" class="btn btn-pequeno" style="background:#c8f31d;color:#141807;border:none;border-radius:10px;padding:8px 14px;font:700 13px Inter,sans-serif;cursor:pointer">+</button>' +
      '</div>' +
      '<div style="font:400 11px Inter,sans-serif;color:#5f6b52;margin-top:8px">' + AGUA_REFERENCIA_ML + ' ml é uma referência comum — ajuste à sua necessidade.</div>' +
    '</div>'
  );
}
/* ================= VIEW: HISTÓRICO ================= */
function nutTabelaHistorico(linhas, rodape) {
  var th = ['Dia', 'Kcal', 'Prot', 'Carb', 'Gord', 'Água'].map(function (h) {
    return '<th style="text-align:left;padding:8px 6px;border-bottom:1px solid #2c3422;color:#9db38c;font-weight:600;font-size:12px">' + h + '</th>';
  }).join('');
  return (
    '<div style="background:#0e120a;border:1px solid #232b19;border-radius:16px;padding:16px;margin-top:12px;overflow-x:auto">' +
      '<table style="width:100%;border-collapse:collapse;font:400 12px Inter,sans-serif;color:#c6d4b4">' +
        '<thead><tr>' + th + '</tr></thead>' +
        '<tbody>' + linhas + '</tbody>' +
        (rodape ? '<tfoot>' + rodape + '</tfoot>' : '') +
      '</table>' +
    '</div>'
  );
}
function nutLinhaHistorico(rotulo, data, destaque) {
  var t = nutTotaisDia(data);
  var agua = nutAgua[data] || 0;
  var td = function (v, cor) {
    return '<td style="padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.05);' + (cor ? 'color:' + cor + ';' : '') + '">' + v + '</td>';
  };
  return (
    '<tr>' +
      td('<b style="font-weight:600;color:' + (destaque ? '#c8f31d' : '#edf7dc') + '">' + rotulo + '</b>') +
      td(nutFmt(t.kcal)) + td(nutFmt(t.prot)) + td(nutFmt(t.carb)) + td(nutFmt(t.gord)) +
      td(nutFmt(agua) + ' ml') +
    '</tr>'
  );
}
function nutHtmlHistorico() {
  var linhas = '';
  var rodape = '';
  if (nutHistAba === 'semana') {
    var dias = nutSemanaAtual();
    var soma = { kcal: 0, prot: 0, carb: 0, gord: 0, agua: 0 };
    linhas = dias.map(function (data, idx) {
      var t = nutTotaisDia(data);
      var agua = nutAgua[data] || 0;
      soma.kcal += t.kcal; soma.prot += t.prot; soma.carb += t.carb; soma.gord += t.gord; soma.agua += agua;
      return nutLinhaHistorico(DIAS_ROTULO[idx] + ' ' + nutDataUtf(data), data, data === nutHoje());
    }).join('');
    rodape =
      '<tr>' +
        '<td style="padding:8px 6px;color:#c8f31d;font-weight:600">Média/dia</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.kcal / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.prot / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.carb / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.gord / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.agua / 7) + ' ml</td>' +
      '</tr>';
  } else {
    var ultimos = nutListaDias(7);
    var somaD = { kcal: 0, prot: 0, carb: 0, gord: 0, agua: 0 };
    linhas = ultimos.map(function (data) {
      var t = nutTotaisDia(data);
      var agua = nutAgua[data] || 0;
      somaD.kcal += t.kcal; somaD.prot += t.prot; somaD.carb += t.carb; somaD.gord += t.gord; somaD.agua += agua;
      var rotulo = data === nutHoje() ? 'Hoje' : nutDataUtf(data);
      return nutLinhaHistorico(rotulo, data, data === nutHoje());
    }).join('');
    rodape =
      '<tr>' +
        '<td style="padding:8px 6px;color:#c8f31d;font-weight:600">Média 7 dias</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(somaD.kcal / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(somaD.prot / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(somaD.carb / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(somaD.gord / 7) + '</td>' +
        '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(somaD.agua / 7) + ' ml</td>' +
      '</tr>';
  }
  var chip = function (aba, rotulo) {
    var ativo = nutHistAba === aba;
    return '<button data-nut="hist-aba" data-aba="' + aba + '" class="chip" style="' +
      'border:' + (ativo ? '1px solid transparent' : '1px solid #3a442c') + ';' +
      'background:' + (ativo ? '#c8f31d' : 'transparent') + ';' +
      'color:' + (ativo ? '#141807' : '#c6d4b4') + ';' +
      'border-radius:999px;padding:7px 14px;font:600 13px Inter,sans-serif;cursor:pointer">' + rotulo + '</button>';
  };
  return (
    '<div style="padding:16px;max-width:520px;margin:0 auto">' +
      nutBanner() + nutMiniNav() +
      '<div style="display:flex;gap:8px;margin-top:14px">' + chip('dias', 'Últimos 7 dias') + chip('semana', 'Semana atual') + '</div>' +
      nutTabelaHistorico(linhas, rodape) +
    '</div>'
  );
}
/* ================= VIEW: ALIMENTOS ================= */
function nutHtmlAlimentos() {
  var termo = nutBusca.toLowerCase();
  var lista = Object.keys(nutAlimentos)
    .map(function (id) { return nutAlimentos[id]; })
    .filter(function (a) { return !termo || a.nome.toLowerCase().indexOf(termo) !== -1; })
    .sort(function (a, b) { return a.nome.localeCompare(b.nome); });
  var linhas = lista.map(function (a) {
    var pessoal = a.id.indexOf('user-') === 0 || a.id.indexOf('import-') === 0;
    var badge = pessoal
      ? '<span style="font:600 10px Inter,sans-serif;color:#141807;background:#c8f31d;border-radius:999px;padding:2px 8px;margin-left:6px">pessoal</span>'
      : '';
    var botoes = pessoal
      ? '<button data-nut="editar-alimento" data-id="' + a.id + '" style="background:transparent;border:1px solid #333c26;color:#c8f31d;border-radius:8px;padding:6px 10px;font:600 12px Inter,sans-serif;cursor:pointer">Editar</button>' +
        '<button data-nut="excluir-alimento" data-id="' + a.id + '" style="background:transparent;border:1px solid #3a2b28;color:#ff5c5c;border-radius:8px;padding:6px 10px;font:600 12px Inter,sans-serif;cursor:pointer">Excluir</button>'
      : '';
    return (
      '<div style="display:flex;align-items:center;gap:8px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font:500 14px Inter,sans-serif;color:#edf7dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + nutEsc(a.nome) + badge + '</div>' +
          '<div style="font:400 12px Inter,sans-serif;color:#9db38c">' + nutEsc(a.porcao) + ' · ' + nutFmt(a.kcal) + ' kcal · P ' + nutFmt(a.prot) + ' · C ' + nutFmt(a.carb) + ' · G ' + nutFmt(a.gord) + '</div>' +
        '</div>' +
        botoes +
      '</div>'
    );
  }).join('');
  return (
    '<div style="padding:16px;max-width:520px;margin:0 auto">' +
      nutBanner() + nutMiniNav() +
      '<div style="display:flex;gap:8px;margin-top:14px">' +
        '<input id="nut-busca-alimentos" type="text" placeholder="Buscar alimento..." autocomplete="off" value="' + nutEsc(nutBusca) + '" ' +
        'style="flex:1;background:#0e120a;border:1px solid #2c3422;border-radius:10px;padding:10px 12px;color:#edf7dc;font:400 15px Inter,sans-serif">' +
        '<button data-nut="novo-alimento" class="btn btn-primary" style="background:#c8f31d;color:#141807;border:none;border-radius:10px;padding:10px 14px;font:700 13px Inter,sans-serif;cursor:pointer;white-space:nowrap">+ Cadastrar</button>' +
      '</div>' +
      '<div style="background:#0e120a;border:1px solid #232b19;border-radius:16px;padding:4px 16px;margin-top:12px">' + linhas + '</div>' +
    '</div>'
  );
}
/* ================= MODAIS ================= */
function nutModalAdicionar(refeicao) {
  var rotulo = REFEICOES.filter(function (r) { return r.chave === refeicao; })[0].rotulo;
  var overlay = nutAbrirModal({
    titulo: 'Adicionar — ' + rotulo,
    corpo:
      '<input id="nut-busca-input" type="text" placeholder="Digite para buscar..." autocomplete="off" ' +
      'style="width:100%;background:#0e120a;border:1px solid #2c3422;border-radius:10px;padding:10px 12px;color:#edf7dc;font:400 15px Inter,sans-serif">' +
      '<div id="nut-busca-resultados" style="margin-top:8px;max-height:260px;overflow:auto"></div>',
    rotuloOk: null,
  });
  nutOverlayBusca = overlay;
  overlay.addEventListener('click', nutCliqueView);
  document.getElementById('nut-busca-input').addEventListener('input', function () {
    nutRenderResultados(refeicao);
  });
  nutRenderResultados(refeicao);
}
function nutRenderResultados(refeicao) {
  var caixa = document.getElementById('nut-busca-resultados');
  if (!caixa) return;
  var termo = (document.getElementById('nut-busca-input').value || '').toLowerCase();
  var lista = Object.keys(nutAlimentos)
    .map(function (id) { return nutAlimentos[id]; })
    .filter(function (a) { return !termo || a.nome.toLowerCase().indexOf(termo) !== -1; })
    .sort(function (a, b) { return a.nome.localeCompare(b.nome); })
    .slice(0, 30);
  caixa.innerHTML = lista.map(function (a) {
    return (
      '<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font:500 13px Inter,sans-serif;color:#edf7dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + nutEsc(a.nome) + '</div>' +
          '<div style="font:400 11px Inter,sans-serif;color:#9db38c">' + nutEsc(a.porcao) + ' · ' + nutFmt(a.kcal) + ' kcal · P ' + nutFmt(a.prot) + ' · C ' + nutFmt(a.carb) + ' · G ' + nutFmt(a.gord) + '</div>' +
        '</div>' +
        '<input id="nut-qtd-' + a.id + '" type="number" min="0.1" max="99" step="0.5" value="1" inputmode="decimal" ' +
        'style="width:62px;background:#0e120a;border:1px solid #2c3422;border-radius:8px;padding:6px 6px;color:#edf7dc;font:400 14px Inter,sans-serif;text-align:center">' +
        '<button data-nut="add-alimento" data-refeicao="' + refeicao + '" data-id="' + a.id + '" ' +
        'style="background:#c8f31d;color:#141807;border:none;border-radius:8px;padding:7px 12px;font:700 12px Inter,sans-serif;cursor:pointer">+</button>' +
      '</div>'
    );
  }).join('') || '<div style="font:400 13px Inter,sans-serif;color:#5f6b52;padding:12px 0">Nenhum alimento encontrado.</div>';
}
function nutModalQuantidade(refeicao, id) {
  var item = ((nutRegistros[nutHoje()] || {})[refeicao] || []).filter(function (i) { return i.id === id; })[0];
  if (!item) return;
  var a = nutAlimentos[id];
  nutAbrirModal({
    titulo: 'Quantidade',
    corpo: nutCampo({ rotulo: 'Porções de ' + a.nome, id: 'nut-qtd-modal', valor: item.qtd, sufixo: '1 porção = ' + a.porcao }),
    rotuloOk: 'Salvar',
    onOk: function () {
      var qtd = nutNum(document.getElementById('nut-qtd-modal').value, LIMITES.qtd.min, LIMITES.qtd.max);
      if (qtd === null) return nutToast('Quantidade inválida.', true);
      item.qtd = qtd;
      nutSalvarRegistros();
      nutRender();
    },
  });
}
function nutModalMetas() {
  nutAbrirModal({
    titulo: 'Metas diárias',
    corpo:
      nutCampo({ rotulo: 'Calorias',        id: 'nut-meta-kcal', valor: nutMetas.kcal, sufixo: 'kcal/dia' }) +
      nutCampo({ rotulo: 'Proteína',        id: 'nut-meta-prot', valor: nutMetas.prot, sufixo: 'g/dia' }) +
      nutCampo({ rotulo: 'Carboidrato',     id: 'nut-meta-carb', valor: nutMetas.carb, sufixo: 'g/dia' }) +
      nutCampo({ rotulo: 'Gordura',         id: 'nut-meta-gord', valor: nutMetas.gord, sufixo: 'g/dia' }) +
      '<div style="font:400 11px/1.5 Inter,sans-serif;color:#5f6b52">Ajuste com orientação profissional. Referência: ' +
      METAS_PADRAO.kcal + ' kcal, ' + METAS_PADRAO.prot + ' g proteína, ' + METAS_PADRAO.carb + ' g carboidrato, ' + METAS_PADRAO.gord + ' g gordura.</div>',
    rotuloOk: 'Salvar',
    onOk: function () {
      var kcal = nutNum(document.getElementById('nut-meta-kcal').value, LIMITES.metaKcal.min, LIMITES.metaKcal.max);
      var prot = nutNum(document.getElementById('nut-meta-prot').value, LIMITES.metaMacro.min, LIMITES.metaMacro.max);
      var carb = nutNum(document.getElementById('nut-meta-carb').value, LIMITES.metaMacro.min, LIMITES.metaMacro.max);
      var gord = nutNum(document.getElementById('nut-meta-gord').value, LIMITES.metaMacro.min, LIMITES.metaMacro.max);
      if (kcal === null || prot === null || carb === null || gord === null) {
        return nutToast('Valores inválidos — use números dentro dos limites.', true);
      }
      nutMetas = { kcal: kcal, prot: prot, carb: carb, gord: gord };
      nutSalvarMetas();
      nutToast('Metas atualizadas.');
      nutRender();
    },
  });
}
function nutModalAlimento(id) {
  var a = id ? nutAlimentos[id] : null;
  var corpo;
  if (a) {
    corpo =
      nutCampo({ rotulo: 'Nome', id: 'nut-f-nome', valor: a.nome, tipo: 'text' }) +
      nutCampo({ rotulo: 'Porção', id: 'nut-f-porcao', valor: a.porcao, tipo: 'text', placeholder: 'ex.: 1 unid (50 g)' }) +
      nutCampo({ rotulo: 'Calorias', id: 'nut-f-kcal', valor: a.kcal, sufixo: 'kcal por porção' }) +
      nutCampo({ rotulo: 'Proteína', id: 'nut-f-prot', valor: a.prot, sufixo: 'g por porção' }) +
      nutCampo({ rotulo: 'Carboidrato', id: 'nut-f-carb', valor: a.carb, sufixo: 'g por porção' }) +
      nutCampo({ rotulo: 'Gordura', id: 'nut-f-gord', valor: a.gord, sufixo: 'g por porção' });
  } else {
    corpo =
      nutCampo({ rotulo: 'Nome', id: 'nut-f-nome', valor: '', tipo: 'text', placeholder: 'ex.: Arroz integral' }) +
      nutCampo({ rotulo: 'Porção', id: 'nut-f-porcao', valor: '', tipo: 'text', placeholder: 'ex.: 1 unid (50 g)' }) +
      nutCampo({ rotulo: 'Calorias', id: 'nut-f-kcal', valor: '', sufixo: 'kcal por porção' }) +
      nutCampo({ rotulo: 'Proteína', id: 'nut-f-prot', valor: '', sufixo: 'g por porção' }) +
      nutCampo({ rotulo: 'Carboidrato', id: 'nut-f-carb', valor: '', sufixo: 'g por porção' }) +
      nutCampo({ rotulo: 'Gordura', id: 'nut-f-gord', valor: '', sufixo: 'g por porção' });
  }
  nutAbrirModal({
    titulo: a ? 'Editar alimento' : 'Cadastrar alimento',
    corpo: corpo,
    rotuloOk: 'Salvar',
    onOk: function () { nutSalvarAlimentoModal(a ? a.id : null); },
  });
}
function nutSalvarAlimentoModal(id) {
  var nome = (document.getElementById('nut-f-nome').value || '').trim();
  var porcao = (document.getElementById('nut-f-porcao').value || '').trim();
  var kcal = nutNum(document.getElementById('nut-f-kcal').value, LIMITES.kcalPorcao.min, LIMITES.kcalPorcao.max);
  var prot = nutNum(document.getElementById('nut-f-prot').value, LIMITES.macroPorcao.min, LIMITES.macroPorcao.max);
  var carb = nutNum(document.getElementById('nut-f-carb').value, LIMITES.macroPorcao.min, LIMITES.macroPorcao.max);
  var gord = nutNum(document.getElementById('nut-f-gord').value, LIMITES.macroPorcao.min, LIMITES.macroPorcao.max);
  if (!nome || !porcao || kcal === null || prot === null || carb === null || gord === null) {
    nutToast('Preencha nome, porção e valores válidos.', true);
    return;
  }
  if (id && nutAlimentos[id]) {
    var a = nutAlimentos[id];
    a.nome = nome; a.porcao = porcao; a.kcal = kcal; a.prot = prot; a.carb = carb; a.gord = gord;
  } else {
    var novoId = 'user-' + Date.now();
    nutAlimentos[novoId] = { id: novoId, nome: nome, porcao: porcao, kcal: kcal, prot: prot, carb: carb, gord: gord };
  }
  nutSalvarAlimentos();
  nutToast(id ? 'Alimento atualizado.' : 'Alimento cadastrado.');
  nutRender();
}
/* ================= VIEW: DIÁRIO (montagem) ================= */
function nutHtmlDiario() {
  var total = nutTotaisDia(nutHoje());
  return (
    '<div style="padding:16px;max-width:520px;margin:0 auto">' +
      nutBanner() + nutMiniNav() +
      nutHtmlResumo(total) +
      nutHtmlRefeicoes() +
      nutHtmlAgua() +
    '</div>'
  );
}
/* ================= RENDERIZAÇÃO ================= */
function nutRender() {
  var view = document.getElementById(NUT_VIEW_ID);
  if (!view) return;
  if (nutView === 'diario') view.innerHTML = nutHtmlDiario();
  else if (nutView === 'historico') view.innerHTML = nutHtmlHistorico();
  else if (nutView === 'alimentos') view.innerHTML = nutHtmlAlimentos();
}
/* ================= AÇÕES ================= */
function nutAdicionarAlimento(refeicao, id) {
  var caixa = document.getElementById('nut-qtd-' + id);
  var qtd = nutNum(caixa ? caixa.value : '1', LIMITES.qtd.min, LIMITES.qtd.max);
  if (qtd === null) { nutToast('Quantidade inválida.', true); return; }
  var hoje = nutHoje();
  if (!nutRegistros[hoje]) nutRegistros[hoje] = nutRefeicoesVazias();
  var lista = nutRegistros[hoje][refeicao];
  var existente = null;
  for (var i = 0; i < lista.length; i++) { if (lista[i].id === id) { existente = lista[i]; break; } }
  if (existente) existente.qtd = Math.round((existente.qtd + qtd) * 100) / 100;
  else lista.push({ id: id, qtd: qtd });
  nutSalvarRegistros();
  if (nutOverlayBusca) { nutOverlayBusca.remove(); nutOverlayBusca = null; }
  nutRender();
  var rotulo = '';
  REFEICOES.forEach(function (r) { if (r.chave === refeicao) rotulo = r.rotulo; });
  nutToast('Adicionado ao ' + rotulo + '.');
}
function nutMudarQtd(refeicao, id, delta) {
  var hoje = nutHoje();
  var lista = (nutRegistros[hoje] || {})[refeicao] || [];
  var item = null;
  for (var i = 0; i < lista.length; i++) { if (lista[i].id === id) { item = lista[i]; break; } }
  if (!item) return;
  item.qtd = Math.round((item.qtd + delta) * 100) / 100;
  if (item.qtd <= 0) {
    if (!nutRegistros[hoje]) nutRegistros[hoje] = nutRefeicoesVazias();
    nutRegistros[hoje][refeicao] = lista.filter(function (x) { return x.id !== id; });
  }
  nutSalvarRegistros();
  nutRender();
}
function nutRemoverItem(refeicao, id) {
  var hoje = nutHoje();
  if (!nutRegistros[hoje] || !nutRegistros[hoje][refeicao]) return;
  nutRegistros[hoje][refeicao] = nutRegistros[hoje][refeicao].filter(function (x) { return x.id !== id; });
  nutSalvarRegistros();
  nutRender();
}
function nutMudarAgua(delta) {
  var hoje = nutHoje();
  nutAgua[hoje] = nutClamp((nutAgua[hoje] || 0) + delta, LIMITES.agua.min, LIMITES.agua.max);
  nutSalvarAgua();
  nutRender();
}
function nutSetarAgua() {
  var input = document.getElementById('nut-agua-input');
  if (!input) return;
  var v = nutNum(input.value, LIMITES.agua.min, LIMITES.agua.max);
  if (v === null) { nutToast('Valor de água inválido.', true); return; }
  nutAgua[nutHoje()] = v;
  nutSalvarAgua();
  nutRender();
}
function nutExcluirAlimento(id) {
  if (!nutAlimentos[id]) return;
  delete nutAlimentos[id];
  nutSalvarAlimentos();
  nutToast('Alimento excluído.');
  nutRender();
}
/* ================= CLIQUE (delegação) ================= */
function nutCliqueView(ev) {
  var alvo = ev.target && ev.target.closest ? ev.target.closest('[data-nut]') : null;
  if (!alvo) return;
  var acao = alvo.getAttribute('data-nut');
  var refeicao = alvo.getAttribute('data-refeicao');
  var id = alvo.getAttribute('data-id');
  var view = alvo.getAttribute('data-view');
  var aba = alvo.getAttribute('data-aba');
  switch (acao) {
    case 'ver': ver(view); break;
    case 'abrir-metas': nutModalMetas(); break;
    case 'add-refeicao': nutModalAdicionar(refeicao); break;
    case 'add-alimento': nutAdicionarAlimento(refeicao, id); break;
    case 'qtd-mais': nutMudarQtd(refeicao, id, 1); break;
    case 'qtd-menos': nutMudarQtd(refeicao, id, -1); break;
    case 'editar-qtd': nutModalQuantidade(refeicao, id); break;
    case 'remover-item': nutRemoverItem(refeicao, id); break;
    case 'agua-mais-200': nutMudarAgua(200); break;
    case 'agua-mais-500': nutMudarAgua(500); break;
    case 'agua-menos': nutMudarAgua(-200); break;
    case 'agua-ok': nutSetarAgua(); break;
    case 'hist-aba': nutHistAba = aba; nutRender(); break;
    case 'novo-alimento': nutModalAlimento(null); break;
    case 'editar-alimento': nutModalAlimento(id); break;
    case 'excluir-alimento': nutExcluirAlimento(id); break;
  }
}
/* ================= BACKUP ================= */
function nutBackupExtrair() {
  return {
    versao: 1,
    geradoEm: new Date().toISOString(),
    alimentos: nutAlimentosPessoais(),
    metas: nutMetas,
    registros: nutRegistros,
    agua: nutAgua,
    perfil: nutPerfil,
  };
}
function nutBackupAplicar(dados) {
  if (!dados || typeof dados !== 'object') throw new Error('backup-invalido');
  if (dados.metas && typeof dados.metas === 'object') {
    nutMetas = Object.assign({}, METAS_PADRAO, dados.metas);
    nutSalvarMetas();
  }
  if (dados.alimentos && typeof dados.alimentos === 'object') {
    Object.keys(dados.alimentos).forEach(function (id) {
      if (id.indexOf('user-') === 0 || id.indexOf('import-') === 0) {
        nutAlimentos[id] = dados.alimentos[id];
      }
    });
    nutSalvarAlimentos();
  }
  if (dados.registros && typeof dados.registros === 'object') { nutRegistros = dados.registros; nutSalvarRegistros(); }
  if (dados.agua && typeof dados.agua === 'object') { nutAgua = dados.agua; nutSalvarAgua(); }
  if (dados.perfil && typeof dados.perfil === 'object') { nutPerfil = dados.perfil; }
  nutPronto = true;
  nutRender();
}
function ver(nome) {
  nutView = ['diario', 'historico', 'alimentos'].indexOf(nome) !== -1 ? nome : 'diario';
  nutGarantirEstado().then(nutRender);
}
/* ================= INICIALIZAÇÃO ================= */
function nutInit() {
  var view = document.getElementById(NUT_VIEW_ID);
  if (!view) return;
  view.addEventListener('click', nutCliqueView);
  nutGarantirEstado().then(function () {
    nutRender();
  }).catch(function () {
    nutPronto = true;
    nutRender();
  });
}
/* ================= EXPORTAÇÃO (main.js usa este objeto) ================= */
window.Nutricao = {
  init: nutInit,
  ver: ver,
  backupExtrair: nutBackupExtrair,
  backupAplicar: nutBackupAplicar,
};
/* ============================================================
   iTrainer — Nutrição · Lógica, clique e inicialização
   ============================================================ */
'use strict';
/* ---------- Renderização ---------- */
function nutRender() {
  var view = document.getElementById(NUT_VIEW_ID);
  if (!view) return;
  if (nutView === 'diario') view.innerHTML = nutHtmlDiario();
  else if (nutView === 'historico') view.innerHTML = nutHtmlHistorico();
  else if (nutView === 'alimentos') view.innerHTML = nutHtmlAlimentos();
}
function ver(nome) {
  nutView = ['diario', 'historico', 'alimentos'].indexOf(nome) !== -1 ? nome : 'diario';
  nutGarantirEstado().then(nutRender);
}
/* ---------- Ações ---------- */
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
/* ---------- Clique (delegação) ---------- */
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
/* ---------- Backup ---------- */
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
/* ---------- Inicialização ---------- */
function nutInit() {
  var view = document.getElementById(NUT_VIEW_ID);
  if (!view) return;
  view.addEventListener('click', nutCliqueView);
  nutGarantirEstado().then(nutRender);
}
/* ---------- Exportação (main.js usa este objeto) ---------- */
window.Nutricao = {
  init: nutInit,
  ver: ver,
  backupExtrair: nutBackupExtrair,
  backupAplicar: nutBackupAplicar,
};
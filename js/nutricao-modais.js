/* ============================================================
   iTrainer — Nutrição · Modais (adicionar, editar, metas)
   ============================================================ */
'use strict';
/* ---------- Modal: adicionar alimento a uma refeição ---------- */
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
/* ---------- Modal: quantidade ---------- */
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
/* ---------- Modal: metas ---------- */
function nutModalMetas() {
  nutAbrirModal({
    titulo: 'Metas diárias',
    corpo:
      nutCampo({ rotulo: 'Calorias',    id: 'nut-meta-kcal', valor: nutMetas.kcal, sufixo: 'kcal/dia' }) +
      nutCampo({ rotulo: 'Proteína',    id: 'nut-meta-prot', valor: nutMetas.prot, sufixo: 'g/dia' }) +
      nutCampo({ rotulo: 'Carboidrato', id: 'nut-meta-carb', valor: nutMetas.carb, sufixo: 'g/dia' }) +
      nutCampo({ rotulo: 'Gordura',     id: 'nut-meta-gord', valor: nutMetas.gord, sufixo: 'g/dia' }) +
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
/* ---------- Modal: cadastrar/editar alimento ---------- */
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
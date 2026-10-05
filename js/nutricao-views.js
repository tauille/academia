/* ============================================================
   iTrainer — Nutrição · Telas (Diário, Histórico, Alimentos)
   ============================================================ */
'use strict';
/* ---------- Resumo do dia ---------- */
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
/* ---------- Item de alimento ---------- */
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
/* ---------- Refeições ---------- */
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
/* ---------- Água ---------- */
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
/* ---------- Tela Diário ---------- */
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
/* ---------- Histórico ---------- */
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
/* ---------- Dias do mês atual ---------- */
function nutDiasDoMes() {
  var partes = nutHoje().split('-');
  var ano = parseInt(partes[0], 10);
  var mes = parseInt(partes[1], 10);
  var total = new Date(ano, mes, 0).getDate();
  var mm = mes < 10 ? '0' + mes : mes;
  var out = [];
  for (var d = 1; d <= total; d++) {
    out.push(ano + '-' + mm + '-' + (d < 10 ? '0' + d : d));
  }
  return out;
}
function nutHtmlHistorico() {
  var linhas = '';
  var rodape = '';
  var chip = function (aba, rotulo) {
    var ativo = nutHistAba === aba;
    return '<button data-nut="hist-aba" data-aba="' + aba + '" class="chip" style="' +
      'border:' + (ativo ? '1px solid transparent' : '1px solid #3a442c') + ';' +
      'background:' + (ativo ? '#c8f31d' : 'transparent') + ';' +
      'color:' + (ativo ? '#141807' : '#c6d4b4') + ';' +
      'border-radius:999px;padding:7px 14px;font:600 13px Inter,sans-serif;cursor:pointer">' + rotulo + '</button>';
  };
  var soma = { kcal: 0, prot: 0, carb: 0, gord: 0, agua: 0 };
  var divisor = 1;
  if (nutHistAba === 'semana') {
    var dias = nutSemanaAtual();
    divisor = 7;
    linhas = dias.map(function (data, idx) {
      var t = nutTotaisDia(data);
      var agua = nutAgua[data] || 0;
      soma.kcal += t.kcal; soma.prot += t.prot; soma.carb += t.carb; soma.gord += t.gord; soma.agua += agua;
      return nutLinhaHistorico(DIAS_ROTULO[idx] + ' ' + nutDataUtf(data), data, data === nutHoje());
    }).join('');
  } else if (nutHistAba === 'mes') {
    var diasMes = nutDiasDoMes();
    divisor = diasMes.length;
    linhas = diasMes.map(function (data) {
      var t = nutTotaisDia(data);
      var agua = nutAgua[data] || 0;
      soma.kcal += t.kcal; soma.prot += t.prot; soma.carb += t.carb; soma.gord += t.gord; soma.agua += agua;
      return nutLinhaHistorico(nutDataUtf(data), data, data === nutHoje());
    }).join('');
  } else {
    var ultimos = nutListaDias(7);
    divisor = 7;
    linhas = ultimos.map(function (data) {
      var t = nutTotaisDia(data);
      var agua = nutAgua[data] || 0;
      soma.kcal += t.kcal; soma.prot += t.prot; soma.carb += t.carb; soma.gord += t.gord; soma.agua += agua;
      var rotulo = data === nutHoje() ? 'Hoje' : nutDataUtf(data);
      return nutLinhaHistorico(rotulo, data, data === nutHoje());
    }).join('');
  }
  var rotuloMedia = nutHistAba === 'mes' ? 'Média/dia do mês' : (nutHistAba === 'semana' ? 'Média/dia da semana' : 'Média 7 dias');
  rodape =
    '<tr>' +
      '<td style="padding:8px 6px;color:#c8f31d;font-weight:600">' + rotuloMedia + '</td>' +
      '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.kcal / divisor) + '</td>' +
      '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.prot / divisor) + '</td>' +
      '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.carb / divisor) + '</td>' +
      '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.gord / divisor) + '</td>' +
      '<td style="padding:8px 6px;color:#edf7dc;font-weight:600">' + nutFmt(soma.agua / divisor) + ' ml</td>' +
    '</tr>';
  return (
    '<div style="padding:16px;max-width:520px;margin:0 auto">' +
      nutBanner() + nutMiniNav() +
      '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
        chip('dias', 'Últimos 7 dias') + chip('semana', 'Semana atual') + chip('mes', 'Mês atual') +
      '</div>' +
      nutTabelaHistorico(linhas, rodape) +
    '</div>'
  );
}
/* ---------- Alimentos ---------- */
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
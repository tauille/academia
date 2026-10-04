/* ============================================================
   iTrainer — Nutrição · Componentes de interface
   ============================================================ */
'use strict';
/* ---------- Toast ---------- */
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
/* ---------- Campo de formulário ---------- */
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
/* ---------- Modal ---------- */
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
  function fechar() { overlay.remove(); }
  overlay.querySelector('[data-acao="fechar"]').onclick = fechar;
  overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) fechar(); });
  if (opcoes.rotuloOk) {
    overlay.querySelector('[data-acao="ok"]').onclick = function () { opcoes.onOk(); fechar(); };
  }
  document.body.appendChild(overlay);
  return overlay;
}
/* ---------- Barra de progresso ---------- */
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
/* ---------- Banner e navegação ---------- */
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
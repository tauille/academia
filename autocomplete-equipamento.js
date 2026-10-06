/* ============================================================
   autocomplete-equipamento.js
   Autocomplete de equipamentos + botão de cadastro novo.
   Depende de: equipamentos.js (carregar ANTES deste).
   Uso:
     iniciarAutocompleteEquipamento(document.getElementById('idDoCampo'), {
       onSelecionar: function (nome) { /* opcional */ }
     });
   ============================================================ */

(function () {
  'use strict';

  var estiloInjetado = false;

  function injetarEstilo() {
    if (estiloInjetado) return;
    estiloInjetado = true;
    var style = document.createElement('style');
    style.textContent = [
      '.eqa-wrapper{position:relative;width:100%}',
      '.eqa-input{padding-right:46px!important}',
      '.eqa-btn-novo{position:absolute;top:50%;right:6px;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:50%;background:#2f9e44;color:#fff;font-size:20px;line-height:1;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.25);z-index:5}',
      '.eqa-btn-novo:active{transform:translateY(-50%) scale(.94)}',
      '.eqa-sugestoes{position:absolute;left:0;right:0;top:calc(100% + 4px);margin:0;padding:4px;list-style:none;background:#fff;border:1px solid #ddd;border-radius:10px;max-height:260px;overflow-y:auto;box-shadow:0 6px 18px rgba(0,0,0,.15);z-index:999}',
      '.eqa-sugestoes li{padding:9px 10px;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px}',
      '.eqa-sugestoes li:hover,.eqa-sugestoes li.eqa-ativo{background:#e9f7ee}',
      '.eqa-cat{font-size:11px;color:#2f9e44;background:#e9f7ee;border-radius:99px;padding:2px 8px;white-space:nowrap}',
      '.eqa-novo-item{color:#2f9e44;font-weight:600}',
      '.eqa-sem-resultado{color:#888;font-size:13px;text-align:center;padding:10px!important;cursor:default!important}',
      '.eqa-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}',
      '.eqa-modal{background:#fff;border-radius:14px;padding:18px;width:100%;max-width:360px;box-shadow:0 10px 30px rgba(0,0,0,.3);box-sizing:border-box}',
      '.eqa-modal h3{margin:0 0 12px;font-size:17px}',
      '.eqa-modal label{display:block;font-size:13px;margin:10px 0 4px}',
      '.eqa-modal input,.eqa-modal select{width:100%;padding:9px 10px;border:1px solid #ccc;border-radius:8px;font-size:14px;box-sizing:border-box;background:#fff}',
      '.eqa-erro{color:#c0392b;font-size:13px;margin-top:8px;display:none}',
      '.eqa-modal-acoes{display:flex;gap:8px;margin-top:16px}',
      '.eqa-modal-acoes button{flex:1;padding:10px;border:none;border-radius:8px;font-size:14px;cursor:pointer}',
      '.eqa-btn-salvar{background:#2f9e44;color:#fff}',
      '.eqa-btn-cancelar{background:#eee;color:#333}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function categoriasDisponiveis() {
    var lista = ['Pesos Livres', 'Máquinas', 'Cardio', 'Funcional', 'Acessórios', 'Outros'];
    if (window.listarEquipamentos) {
      window.listarEquipamentos().forEach(function (e) {
        if (e.categoria && lista.indexOf(e.categoria) === -1) lista.push(e.categoria);
      });
    }
    return lista;
  }

  function escaparHtml(t) {
    return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function abrirModal(aoSalvar, prefillNome) {
    var overlay = document.createElement('div');
    overlay.className = 'eqa-overlay';

    var options = categoriasDisponiveis().map(function (c) {
      return '<option>' + escaparHtml(c) + '</option>';
    }).join('');

    overlay.innerHTML =
      '<div class="eqa-modal">' +
        '<h3>Cadastrar equipamento</h3>' +
        '<label>Nome do equipamento</label>' +
        '<input id="eqa-nome" type="text" placeholder="Ex.: Cadeira extensora" value="' + escaparHtml(prefillNome || '') + '" autofocus>' +
        '<label>Categoria</label>' +
        '<select id="eqa-categoria">' + options + '</select>' +
        '<div class="eqa-erro" id="eqa-erro"></div>' +
        '<div class="eqa-modal-acoes">' +
          '<button type="button" class="eqa-btn-cancelar" id="eqa-cancelar">Cancelar</button>' +
          '<button type="button" class="eqa-btn-salvar" id="eqa-salvar">Salvar</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    function fechar() {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', aoTeclado);
    }

    function salvar() {
      var nome = document.getElementById('eqa-nome').value.trim();
      var categoria = document.getElementById('eqa-categoria').value;
      var erro = document.getElementById('eqa-erro');
      if (!nome) {
        erro.textContent = 'Informe o nome do equipamento.';
        erro.style.display = 'block';
        return;
      }
      var res;
      if (window.cadastrarEquipamento) {
        res = window.cadastrarEquipamento(nome, categoria);
      } else {
        res = { ok: false, erro: 'equipamentos.js não está carregado.' };
      }
      if (!res.ok) {
        erro.textContent = res.erro || 'Não foi possível salvar.';
        erro.style.display = 'block';
        return;
      }
      fechar();
      aoSalvar(res.equipamento || { nome: nome, categoria: categoria });
    }

    function aoTeclado(e) {
      if (e.key === 'Escape') { e.preventDefault(); fechar(); }
      if (e.key === 'Enter') { e.preventDefault(); salvar(); }
    }

    document.getElementById('eqa-cancelar').addEventListener('click', fechar);
    document.getElementById('eqa-salvar').addEventListener('click', salvar);
    document.addEventListener('keydown', aoTeclado);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) fechar();
    });
  }

  function iniciarAutocompleteEquipamento(input, opcoes) {
    if (!input) return null;
    if (input.getAttribute('data-eqa-ativo')) return input;
    input.setAttribute('data-eqa-ativo', '1');

    var opts = opcoes || {};
    injetarEstilo();

    var wrapper = document.createElement('div');
    wrapper.className = 'eqa-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    input.classList.add('eqa-input');

    var botaoNovo = document.createElement('button');
    botaoNovo.type = 'button';
    botaoNovo.className = 'eqa-btn-novo';
    botaoNovo.title = 'Cadastrar novo equipamento';
    botaoNovo.textContent = '+';
    wrapper.appendChild(botaoNovo);

    var lista = document.createElement('ul');
    lista.className = 'eqa-sugestoes';
    lista.style.display = 'none';
    wrapper.appendChild(lista);

    var indiceAtivo = -1;
    var itensAtuais = [];

    function ocultar() {
      lista.style.display = 'none';
      indiceAtivo = -1;
      itensAtuais = [];
    }

    function selecionar(nome) {
      input.value = nome;
      try {
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {}
      ocultar();
      if (opts.onSelecionar) opts.onSelecionar(nome);
      input.focus();
    }

    function renderizar(termo) {
      var encontrados = [];
      if (termo && window.buscarEquipamentos) {
        encontrados = window.buscarEquipamentos(termo, 10);
      } else if (!termo && window.listarEquipamentos) {
        encontrados = window.listarEquipamentos().slice(0, 10);
      }
      var html = '';
      if (termo && encontrados.length === 0) {
        html = '<li class="eqa-sem-resultado">Nenhum equipamento encontrado.</li>';
      }
      encontrados.forEach(function (e) {
        html += '<li data-indice="' + encontrados.indexOf(e) + '"><span>' + escaparHtml(e.nome) +
          '</span><span class="eqa-cat">' + escaparHtml(e.categoria || 'Outros') + '</span></li>';
      });
      if (termo) {
        html += '<li data-indice="novo" class="eqa-novo-item"><span>+ Cadastrar "' +
          escaparHtml(termo) + '"</span></li>';
      }
      lista.innerHTML = html;
      itensAtuais = [].slice.call(lista.querySelectorAll('li'));
      lista.style.display = 'block';
      indiceAtivo = -1;
    }

    input.addEventListener('input', function () {
      var termo = input.value.trim();
      if (!termo) {
        if (window.listarEquipamentos) renderizar('');
        else ocultar();
        return;
      }
      renderizar(termo);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) renderizar(input.value.trim());
    });

    input.addEventListener('blur', function () {
      setTimeout(ocultar, 150);
    });

    input.addEventListener('keydown', function (e) {
      if (lista.style.display === 'none') return;
      var total = itensAtuais.length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        indiceAtivo = (indiceAtivo + 1) % total;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        indiceAtivo = (indiceAtivo - 1 + total) % total;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var item = itensAtuais[indiceAtivo >= 0 ? indiceAtivo : 0];
        if (item) {
          var alvo = item.getAttribute('data-indice');
          if (alvo === 'novo') {
            abrirModal(selecionar, input.value.trim());
            return;
          }
          if (!item.classList.contains('eqa-sem-resultado')) {
            selecionar(item.querySelector('span').textContent);
          }
        }
        return;
      } else if (e.key === 'Escape') {
        ocultar();
        return;
      }
      itensAtuais.forEach(function (li, i) {
        li.classList.toggle('eqa-ativo', i === indiceAtivo);
      });
      if (indiceAtivo >= 0 && itensAtuais[indiceAtivo]) {
        itensAtuais[indiceAtivo].scrollIntoView({ block: 'nearest' });
      }
    });

    lista.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var li = e.target.closest('li');
      if (!li || li.classList.contains('eqa-sem-resultado')) return;
      var alvo = li.getAttribute('data-indice');
      if (alvo === 'novo') {
        abrirModal(selecionar, input.value.trim());
        return;
      }
      selecionar(li.querySelector('span').textContent);
    });

    botaoNovo.addEventListener('click', function () {
      abrirModal(selecionar, input.value.trim());
    });

    return input;
  }

  window.iniciarAutocompleteEquipamento = iniciarAutocompleteEquipamento;
})();
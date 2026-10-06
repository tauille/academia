/* ============================================================
   equipamentos.js — Catálogo completo de equipamentos de academia
   Arquivo separado para manter o código principal leve e escalável.
   Expõe: CATALOGO_EQUIPAMENTOS, buscarEquipamentos(termo),
   cadastrarEquipamento(nome, categoria), listarEquipamentos().
   ============================================================ */

const CATALOGO_EQUIPAMENTOS = [
  // ---- PESOS LIVRES ----
  { id: 'halter', nome: 'Halter', categoria: 'Pesos Livres', aliases: ['halteres', 'dumbbell', 'db'] },
  { id: 'barra_reta', nome: 'Barra reta', categoria: 'Pesos Livres', aliases: ['barra'] },
  { id: 'barra_w', nome: 'Barra W (serpentina)', categoria: 'Pesos Livres', aliases: ['ez bar', 'barra ez', 'barra serpentina'] },
  { id: 'barra_hexagonal', nome: 'Barra hexagonal (trap bar)', categoria: 'Pesos Livres', aliases: ['trap bar', 'barra hex'] },
  { id: 'barra_olimpica', nome: 'Barra olímpica', categoria: 'Pesos Livres', aliases: ['barra olimpica'] },
  { id: 'anilhas', nome: 'Anilhas (discos)', categoria: 'Pesos Livres', aliases: ['disco', 'anilha', 'peso'] },
  { id: 'kettlebell', nome: 'Kettlebell', categoria: 'Pesos Livres', aliases: ['kb'] },
  { id: 'peso_corporal', nome: 'Peso corporal', categoria: 'Pesos Livres', aliases: ['bodyweight', 'calistenia', 'livre'] },
  { id: 'bola_medicinal', nome: 'Bola medicinal', categoria: 'Pesos Livres', aliases: ['medicine ball'] },
  { id: 'powerbag', nome: 'Powerbag (saco de areia)', categoria: 'Pesos Livres', aliases: ['sandbag', 'saco de areia'] },

  // ---- MÁQUINAS ----
  { id: 'supino_reto', nome: 'Supino reto', categoria: 'Máquinas', aliases: ['supino', 'peito'] },
  { id: 'supino_inclinado', nome: 'Supino inclinado', categoria: 'Máquinas', aliases: ['supino inclinado'] },
  { id: 'supino_declinado', nome: 'Supino declinado', categoria: 'Máquinas', aliases: ['supino declinado'] },
  { id: 'smith', nome: 'Smith machine (agachamento guiado)', categoria: 'Máquinas', aliases: ['smith', 'agachamento guiado'] },
  { id: 'leg_press_45', nome: 'Leg press 45', categoria: 'Máquinas', aliases: ['leg press', 'leg45'] },
  { id: 'leg_press_horizontal', nome: 'Leg press horizontal', categoria: 'Máquinas', aliases: ['leg horizontal'] },
  { id: 'leg_press_vertical', nome: 'Leg press vertical', categoria: 'Máquinas', aliases: ['leg vertical'] },
  { id: 'hack', nome: 'Agachamento hack', categoria: 'Máquinas', aliases: ['hack squat', 'hack'] },
  { id: 'cadeira_adutora', nome: 'Cadeira adutora', categoria: 'Máquinas', aliases: ['adutora', 'aducao'] },
  { id: 'cadeira_abdutora', nome: 'Cadeira abdutora', categoria: 'Máquinas', aliases: ['abdutora', 'abducao'] },
  { id: 'cadeira_extensora', nome: 'Cadeira extensora', categoria: 'Máquinas', aliases: ['extensora', 'extensao de pernas'] },
  { id: 'cadeira_flexora', nome: 'Cadeira flexora (mesa flexora)', categoria: 'Máquinas', aliases: ['flexora', 'mesa flexora', 'flexao de pernas'] },
  { id: 'banco_romano', nome: 'Banco romano (hiperextensão)', categoria: 'Máquinas', aliases: ['hiperextensao', 'banco romano'] },
  { id: 'cadeira_lombar', nome: 'Cadeira de lombar', categoria: 'Máquinas', aliases: ['lombar'] },
  { id: 'gluteo_coice', nome: 'Máquina de glúteos (coice)', categoria: 'Máquinas', aliases: ['coice', 'gluteo'] },
  { id: 'panturrilha_em_pe', nome: 'Máquina de panturrilha em pé', categoria: 'Máquinas', aliases: ['panturrilha em pe', 'panturrilha'] },
  { id: 'panturrilha_sentado', nome: 'Máquina de panturrilha sentado', categoria: 'Máquinas', aliases: ['panturrilha sentado'] },
  { id: 'voador', nome: 'Voador (peck deck)', categoria: 'Máquinas', aliases: ['peck deck', 'voador peito'] },
  { id: 'crossover', nome: 'Crossover (polia)', categoria: 'Máquinas', aliases: ['cross over', 'polia'] },
  { id: 'pulley_alto', nome: 'Pulley alto', categoria: 'Máquinas', aliases: ['puxada alta', 'pulley'] },
  { id: 'pulley_baixo', nome: 'Pulley baixo', categoria: 'Máquinas', aliases: ['puxada baixa'] },
  { id: 'remada_baixa', nome: 'Remada baixa', categoria: 'Máquinas', aliases: ['remada'] },
  { id: 'remada_alta', nome: 'Remada alta', categoria: 'Máquinas', aliases: ['remada alta'] },
  { id: 'remada_t', nome: 'Remada T (cavalinho)', categoria: 'Máquinas', aliases: ['cavalinho', 'remada t'] },
  { id: 'remada_sentado', nome: 'Máquina de remada sentado', categoria: 'Máquinas', aliases: ['remada sentado', 'remo'] },
  { id: 'pulldown', nome: 'Máquina de puxada frente (pulldown)', categoria: 'Máquinas', aliases: ['pulldown', 'puxada frente'] },
  { id: 'desenvolvimento_maquina', nome: 'Máquina de desenvolvimento (ombro)', categoria: 'Máquinas', aliases: ['desenvolvimento', 'ombro'] },
  { id: 'voador_invertido', nome: 'Voador invertido (ombro posterior)', categoria: 'Máquinas', aliases: ['posterior de ombro', 'voador invertido'] },
  { id: 'rosca_maquina', nome: 'Máquina de rosca (bíceps)', categoria: 'Máquinas', aliases: ['rosca', 'biceps'] },
  { id: 'triceps_maquina', nome: 'Máquina de tríceps (mergulho)', categoria: 'Máquinas', aliases: ['triceps', 'mergulho'] },
  { id: 'graviton', nome: 'Graviton (mergulho assistido)', categoria: 'Máquinas', aliases: ['graviton'] },
  { id: 'gabinete', nome: 'Máquina multifuncional (gabinete)', categoria: 'Máquinas', aliases: ['gabinete', 'multifuncional'] },
  { id: 'torre', nome: 'Torre de musculação', categoria: 'Máquinas', aliases: ['torre', 'estacao'] },
  { id: 'estacao_funcional', nome: 'Estação funcional', categoria: 'Máquinas', aliases: ['estacao funcional'] },
  { id: 'giro_tronco', nome: 'Giro de tronco (rotação)', categoria: 'Máquinas', aliases: ['rotacao de tronco', 'giro'] },

  // ---- CARDIO ----
  { id: 'esteira', nome: 'Esteira', categoria: 'Cardio', aliases: ['esteira'] },
  { id: 'bike_vertical', nome: 'Bicicleta ergométrica vertical', categoria: 'Cardio', aliases: ['bike', 'bicicleta'] },
  { id: 'bike_horizontal', nome: 'Bicicleta ergométrica horizontal', categoria: 'Cardio', aliases: ['bike horizontal'] },
  { id: 'spinning', nome: 'Bicicleta spinning', categoria: 'Cardio', aliases: ['spin', 'spinning'] },
  { id: 'eliptico', nome: 'Elíptico', categoria: 'Cardio', aliases: ['eliptico'] },
  { id: 'escada', nome: 'Escada (stepper)', categoria: 'Cardio', aliases: ['stepper', 'escada rolante'] },
  { id: 'remo_cardio', nome: 'Remo ergométrico', categoria: 'Cardio', aliases: ['remador', 'remo'] },
  { id: 'air_bike', nome: 'Air bike (bike de ar)', categoria: 'Cardio', aliases: ['airbike', 'bike de ar'] },
  { id: 'corda_pular', nome: 'Corda de pular', categoria: 'Cardio', aliases: ['pular corda', 'corda'] },
  { id: 'step', nome: 'Step (jump)', categoria: 'Cardio', aliases: ['jump', 'step'] },

  // ---- FUNCIONAL ----
  { id: 'trx', nome: 'TRX (treino suspenso)', categoria: 'Funcional', aliases: ['trx', 'suspensao'] },
  { id: 'corda_naval', nome: 'Corda naval (battle rope)', categoria: 'Funcional', aliases: ['battle rope', 'corda naval'] },
  { id: 'caixa_pliometrica', nome: 'Caixa pliométrica (box jump)', categoria: 'Funcional', aliases: ['box jump', 'caixa'] },
  { id: 'bosu', nome: 'Bosu', categoria: 'Funcional', aliases: ['bosu'] },
  { id: 'bola_suica', nome: 'Bola suíça (estabilidade)', categoria: 'Funcional', aliases: ['bola de estabilidade', 'bola suiça'] },
  { id: 'slamball', nome: 'Slamball', categoria: 'Funcional', aliases: ['bola de parede'] },
  { id: 'elastico', nome: 'Faixa elástica (elástico)', categoria: 'Funcional', aliases: ['elastico', 'faixa de resistencia'] },
  { id: 'mini_band', nome: 'Mini band', categoria: 'Funcional', aliases: ['miniband', 'faixa curta'] },
  { id: 'pneu_crossfit', nome: 'Pneu de crossfit', categoria: 'Funcional', aliases: ['pneu'] },
  { id: 'martelo', nome: 'Martelo (sledgehammer)', categoria: 'Funcional', aliases: ['sledgehammer', 'martelo'] },
  { id: 'escada_agilidade', nome: 'Escada de agilidade', categoria: 'Funcional', aliases: ['escada de agilidade'] },
  { id: 'cones', nome: 'Cones', categoria: 'Funcional', aliases: ['cone'] },
  { id: 'wall_ball', nome: 'Wall ball (bola de parede)', categoria: 'Funcional', aliases: ['wall ball'] },

  // ---- ACESSÓRIOS ----
  { id: 'banco_reto', nome: 'Banco reto', categoria: 'Acessórios', aliases: ['banco'] },
  { id: 'banco_inclinado', nome: 'Banco inclinado', categoria: 'Acessórios', aliases: ['banco inclinado'] },
  { id: 'banco_declinado', nome: 'Banco declinado', categoria: 'Acessórios', aliases: ['banco declinado'] },
  { id: 'banco_scott', nome: 'Banco Scott', categoria: 'Acessórios', aliases: ['scott'] },
  { id: 'banco_step', nome: 'Banco de step', categoria: 'Acessórios', aliases: ['step'] },
  { id: 'colchonete', nome: 'Colchonete', categoria: 'Acessórios', aliases: ['tapete', 'mat'] },
  { id: 'barra_fixa', nome: 'Barra fixa', categoria: 'Acessórios', aliases: ['barra fixa', 'pull up'] },
  { id: 'paralelas', nome: 'Barras paralelas', categoria: 'Acessórios', aliases: ['paralelas'] },
  { id: 'argolas', nome: 'Argolas olímpicas', categoria: 'Acessórios', aliases: ['argolas'] },
  { id: 'straps', nome: 'Straps (alças de puxada)', categoria: 'Acessórios', aliases: ['strap', 'alças'] },
  { id: 'luvas', nome: 'Luvas de academia', categoria: 'Acessórios', aliases: ['luva'] },
  { id: 'cinto', nome: 'Cinto de peso', categoria: 'Acessórios', aliases: ['cinto'] },
  { id: 'caneleira', nome: 'Caneleira', categoria: 'Acessórios', aliases: ['caneleira'] },
  { id: 'foam_roller', nome: 'Foam roller (autoliberação)', categoria: 'Acessórios', aliases: ['foam roller', 'liberacao'] },
  { id: 'plataforma_salto', nome: 'Plataforma de salto', categoria: 'Acessórios', aliases: ['plataforma'] }
];

function normalizarTexto(t) {
  return String(t || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getEquipamentosCustomizados() {
  try {
    return JSON.parse(localStorage.getItem('itrainer_equipamentos') || '[]');
  } catch (e) {
    return [];
  }
}

function salvarEquipamentosCustomizados(lista) {
  try {
    localStorage.setItem('itrainer_equipamentos', JSON.stringify(lista));
  } catch (e) {
    console.warn('Não foi possível salvar os equipamentos.');
  }
}

/* Busca no catálogo + nos cadastrados, com prioridade para nomes que começam com o termo */
function buscarEquipamentos(termo, limite) {
  var t = normalizarTexto(termo);
  limite = limite || 12;
  if (!t) return [];
  var custom = getEquipamentosCustomizados().filter(function (e) {
    return normalizarTexto(e.nome).includes(t) ||
      (e.aliases || []).some(function (a) { return normalizarTexto(a).includes(t); });
  });
  var oficiais = CATALOGO_EQUIPAMENTOS
    .filter(function (e) {
      return normalizarTexto(e.nome).includes(t) ||
        (e.aliases || []).some(function (a) { return normalizarTexto(a).includes(t); });
    })
    .sort(function (a, b) {
      var pa = normalizarTexto(a.nome).startsWith(t) ? 0 : 1;
      var pb = normalizarTexto(b.nome).startsWith(t) ? 0 : 1;
      return pa - pb;
    });
  var vistos = {};
  oficiais.forEach(function (e) { vistos[normalizarTexto(e.nome)] = true; });
  var resultado = custom.filter(function (e) { return !vistos[normalizarTexto(e.nome)]; });
  return resultado.concat(oficiais).slice(0, limite);
}

/* Lista tudo: personalizados primeiro, depois catálogo */
function listarEquipamentos() {
  return getEquipamentosCustomizados().concat(CATALOGO_EQUIPAMENTOS);
}

/* Cadastra equipamento novo (fica salvo no aparelho) */
function cadastrarEquipamento(nome, categoria) {
  var limpo = String(nome || '').trim();
  if (!limpo) return { ok: false, erro: 'Informe o nome do equipamento.' };
  var base = normalizarTexto(limpo);
  var jaExiste = getEquipamentosCustomizados().concat(CATALOGO_EQUIPAMENTOS)
    .some(function (e) { return normalizarTexto(e.nome) === base; });
  if (jaExiste) return { ok: false, erro: 'Este equipamento já está cadastrado.' };
  var novo = { id: 'custom_' + Date.now(), nome: limpo, categoria: categoria || 'Outros', aliases: [] };
  var lista = getEquipamentosCustomizados();
  lista.push(novo);
  salvarEquipamentosCustomizados(lista);
  return { ok: true, equipamento: novo };
}

window.CATALOGO_EQUIPAMENTOS = CATALOGO_EQUIPAMENTOS;
window.buscarEquipamentos = buscarEquipamentos;
window.cadastrarEquipamento = cadastrarEquipamento;
window.listarEquipamentos = listarEquipamentos;
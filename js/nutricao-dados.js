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
/* ---------- Banco de alimentos (padrão) ---------- */
const ALIMENTOS_PADRAO = [
  /* Frutas */
  { id: 'banana',      nome: 'Banana',            porcao: '1 unidade (100g)', kcal: 89,  prot: 1.1, carb: 22.8, gord: 0.3 },
  { id: 'maca',        nome: 'Maçã',              porcao: '1 unidade (130g)', kcal: 72,  prot: 0.4, carb: 19,   gord: 0.2 },
  { id: 'laranja',     nome: 'Laranja',           porcao: '1 unidade (130g)', kcal: 62,  prot: 1.2, carb: 15.4, gord: 0.2 },
  { id: 'mamao',       nome: 'Mamão',             porcao: '1 fatia (100g)',   kcal: 43,  prot: 0.5, carb: 10.8, gord: 0.3 },
  { id: 'melancia',    nome: 'Melancia',          porcao: '1 fatia (200g)',   kcal: 60,  prot: 1.2, carb: 15,   gord: 0.3 },
  { id: 'abacaxi',     nome: 'Abacaxi',           porcao: '1 fatia (100g)',   kcal: 50,  prot: 0.5, carb: 13.1, gord: 0.1 },
  { id: 'uva',         nome: 'Uva',               porcao: '1 xícara (150g)',  kcal: 104, prot: 1.1, carb: 27,   gord: 0.2 },
  { id: 'morango',     nome: 'Morango',           porcao: '1 xícara (150g)',  kcal: 49,  prot: 1,   carb: 11.7, gord: 0.5 },
  { id: 'manga',       nome: 'Manga',             porcao: '1 unidade (200g)', kcal: 120, prot: 1.6, carb: 30,   gord: 0.6 },
  { id: 'pera',        nome: 'Pera',              porcao: '1 unidade (150g)', kcal: 86,  prot: 0.6, carb: 23,   gord: 0.2 },
  { id: 'kiwi',        nome: 'Kiwi',              porcao: '1 unidade (75g)',  kcal: 46,  prot: 0.9, carb: 11,   gord: 0.4 },
  { id: 'abacate',     nome: 'Abacate',           porcao: '1/2 unidade (100g)', kcal: 160, prot: 2,  carb: 8.5,  gord: 14.7 },
  { id: 'limao',       nome: 'Limão',             porcao: '1 unidade (60g)',  kcal: 17,  prot: 0.6, carb: 5.4,  gord: 0.2 },
  { id: 'tangerina',   nome: 'Tangerina',         porcao: '1 unidade (100g)', kcal: 53,  prot: 0.8, carb: 13.3, gord: 0.3 },
  { id: 'goiaba',      nome: 'Goiaba',            porcao: '1 unidade (100g)', kcal: 68,  prot: 2.6, carb: 14.3, gord: 1 },
  { id: 'coco',        nome: 'Coco fresco',       porcao: '1 fatia (50g)',    kcal: 177, prot: 1.7, carb: 7.6,  gord: 16.5 },
  /* Legumes e verduras */
  { id: 'brocolis',    nome: 'Brócolis',          porcao: '1 xícara (90g)',   kcal: 31,  prot: 2.5, carb: 6,    gord: 0.4 },
  { id: 'cenoura',     nome: 'Cenoura',           porcao: '1 unidade (60g)',  kcal: 25,  prot: 0.6, carb: 6,    gord: 0.1 },
  { id: 'tomate',      nome: 'Tomate',            porcao: '1 unidade (120g)', kcal: 22,  prot: 1.1, carb: 4.8,  gord: 0.2 },
  { id: 'alface',      nome: 'Alface',            porcao: '1 prato (50g)',    kcal: 8,   prot: 0.7, carb: 1.5,  gord: 0.1 },
  { id: 'espinafre',   nome: 'Espinafre',         porcao: '1 xícara (30g)',   kcal: 7,   prot: 0.9, carb: 1.1,  gord: 0.1 },
  { id: 'couve',       nome: 'Couve',             porcao: '1 xícara (30g)',   kcal: 10,  prot: 1,   carb: 1.8,  gord: 0.1 },
  { id: 'abobrinha',   nome: 'Abobrinha',         porcao: '1 xícara (120g)',  kcal: 20,  prot: 1.4, carb: 3.9,  gord: 0.3 },
  { id: 'berinjela',   nome: 'Berinjela',         porcao: '1 xícara (100g)',  kcal: 25,  prot: 1,   carb: 6,    gord: 0.2 },
  { id: 'chuchu',      nome: 'Chuchu',            porcao: '1 xícara (100g)',  kcal: 19,  prot: 0.8, carb: 4.5,  gord: 0.1 },
  { id: 'pepino',      nome: 'Pepino',            porcao: '1 unidade (100g)', kcal: 15,  prot: 0.7, carb: 3.6,  gord: 0.1 },
  { id: 'pimentao',    nome: 'Pimentão',          porcao: '1 unidade (120g)', kcal: 31,  prot: 1.2, carb: 7.2,  gord: 0.3 },
  { id: 'cebola',      nome: 'Cebola',            porcao: '1 unidade (100g)', kcal: 40,  prot: 1.1, carb: 9.3,  gord: 0.1 },
  { id: 'batata',      nome: 'Batata',            porcao: '1 unidade (150g)', kcal: 116, prot: 3,   carb: 26,   gord: 0.2 },
  { id: 'batata-doce', nome: 'Batata-doce',       porcao: '1 unidade (150g)', kcal: 129, prot: 2.4, carb: 30,   gord: 0.2 },
  { id: 'mandioca',    nome: 'Mandioca',          porcao: '1 porção (100g)',  kcal: 160, prot: 1.4, carb: 38,   gord: 0.3 },
  { id: 'milho',       nome: 'Milho cozido',      porcao: '1 espiga (100g)',  kcal: 96,  prot: 3.4, carb: 21,   gord: 1.5 },
  { id: 'ervilha',     nome: 'Ervilha',           porcao: '1/2 xícara (80g)', kcal: 62,  prot: 4.1, carb: 11,   gord: 0.3 },
  { id: 'vagem',       nome: 'Vagem',             porcao: '1 xícara (100g)',  kcal: 31,  prot: 1.8, carb: 7,    gord: 0.2 },
  /* Proteínas */
  { id: 'frango-grelhado', nome: 'Frango grelhado', porcao: '1 filé (100g)', kcal: 165, prot: 31, carb: 0, gord: 3.6 },
  { id: 'peito-frango', nome: 'Peito de frango', porcao: '1 filé (100g)', kcal: 165, prot: 31, carb: 0, gord: 3.6 },
  { id: 'carne-bovina', nome: 'Carne bovina (patinho)', porcao: '1 bife (100g)', kcal: 187, prot: 26, carb: 0, gord: 8 },
  { id: 'carne-moida', nome: 'Carne moída', porcao: '1 porção (100g)', kcal: 200, prot: 24, carb: 0, gord: 11 },
  { id: 'porco',       nome: 'Carne de porco',   porcao: '1 bife (100g)',    kcal: 242, prot: 27, carb: 0, gord: 14 },
  { id: 'peixe',       nome: 'Peixe (tilápia)',  porcao: '1 filé (100g)',    kcal: 128, prot: 26, carb: 0, gord: 2.7 },
  { id: 'sardinha',    nome: 'Sardinha',         porcao: '1 lata (80g)',     kcal: 160, prot: 18, carb: 0, gord: 9 },
  { id: 'atum',        nome: 'Atum em lata',     porcao: '1 lata (100g)',    kcal: 132, prot: 28, carb: 0, gord: 1 },
  { id: 'salmao',      nome: 'Salmão',           porcao: '1 filé (100g)',    kcal: 208, prot: 20, carb: 0, gord: 13 },
  { id: 'camarao',     nome: 'Camarão',          porcao: '1 porção (100g)',  kcal: 99,  prot: 24, carb: 0.2, gord: 0.3 },
  { id: 'ovo',         nome: 'Ovo',              porcao: '1 unidade (50g)',  kcal: 72,  prot: 6.3, carb: 0.4, gord: 4.8 },
  { id: 'clara-ovo',   nome: 'Clara de ovo',     porcao: '1 unidade (33g)',  kcal: 17,  prot: 3.6, carb: 0.2, gord: 0.1 },
  { id: 'peru',        nome: 'Peito de peru',    porcao: '3 fatias (50g)',   kcal: 52,  prot: 10,  carb: 1,   gord: 1 },
  /* Laticínios */
  { id: 'leite',       nome: 'Leite integral',   porcao: '1 copo (200ml)',   kcal: 122, prot: 6.4, carb: 9.6,  gord: 6.6 },
  { id: 'leite-desnatado', nome: 'Leite desnatado', porcao: '1 copo (200ml)', kcal: 70, prot: 6.8, carb: 10, gord: 0.4 },
  { id: 'iogurte',     nome: 'Iogurte natural',  porcao: '1 pote (170g)',    kcal: 104, prot: 5.9, carb: 7.8,  gord: 5.6 },
  { id: 'iogurte-desnatado', nome: 'Iogurte desnatado', porcao: '1 pote (170g)', kcal: 90, prot: 8, carb: 12, gord: 0.5 },
  { id: 'queijo-muçarela', nome: 'Queijo muçarela', porcao: '2 fatias (30g)', kcal: 90, prot: 6.6, carb: 0.6, gord: 6.9 },
  { id: 'queijo-minas', nome: 'Queijo minas',    porcao: '1 fatia (30g)',    kcal: 80,  prot: 5.5, carb: 0.7, gord: 6 },
  { id: 'queijo-branco', nome: 'Queijo branco',  porcao: '1 fatia (30g)',    kcal: 75,  prot: 5.5, carb: 0.7, gord: 5.5 },
  { id: 'requeijao',   nome: 'Requeijão',        porcao: '1 colher (20g)',   kcal: 53,  prot: 1.2, carb: 0.4, gord: 5 },
  { id: 'manteiga',    nome: 'Manteiga',         porcao: '1 colher (10g)',   kcal: 72,  prot: 0.1, carb: 0,   gord: 8 },
  { id: 'coalhada',    nome: 'Coalhada',         porcao: '1 pote (170g)',    kcal: 140, prot: 8,   carb: 8,   gord: 8 },
  /* Grãos e cereais */
  { id: 'arroz',       nome: 'Arroz branco',     porcao: '1 colher (30g)',   kcal: 39,  prot: 0.8, carb: 8.5,  gord: 0.1 },
  { id: 'arroz-integral', nome: 'Arroz integral', porcao: '1 colher (30g)',  kcal: 37,  prot: 0.8, carb: 7.7,  gord: 0.3 },
  { id: 'feijao',      nome: 'Feijão',           porcao: '1 concha (80g)',   kcal: 76,  prot: 4.8, carb: 13.6, gord: 0.3 },
  { id: 'feijao-preto', nome: 'Feijão preto',    porcao: '1 concha (80g)',   kcal: 77,  prot: 5,   carb: 14,   gord: 0.3 },
  { id: 'lentilha',    nome: 'Lentilha',         porcao: '1/2 xícara (100g)', kcal: 116, prot: 9,  carb: 20,   gord: 0.4 },
  { id: 'grao-de-bico', nome: 'Grão-de-bico',    porcao: '1/2 xícara (100g)', kcal: 164, prot: 8.9, carb: 27,   gord: 2.6 },
  { id: 'macarrao',    nome: 'Macarrão',         porcao: '1 prato (200g)',   kcal: 262, prot: 9,   carb: 52,   gord: 1.3 },
  { id: 'macarrao-integral', nome: 'Macarrão integral', porcao: '1 prato (200g)', kcal: 248, prot: 10, carb: 50, gord: 1.8 },
  { id: 'aveia',       nome: 'Aveia em flocos',  porcao: '2 colheres (30g)', kcal: 117, prot: 4,   carb: 20,   gord: 2.1 },
  { id: 'pao-frances', nome: 'Pão francês',      porcao: '1 unidade (50g)',  kcal: 137, prot: 4.5, carb: 26,   gord: 1 },
  { id: 'pao-integral', nome: 'Pão integral',    porcao: '1 fatia (30g)',    kcal: 74,  prot: 3.4, carb: 13,   gord: 1 },
  { id: 'pao-forma',   nome: 'Pão de forma',     porcao: '1 fatia (25g)',    kcal: 64,  prot: 2,   carb: 12,   gord: 0.8 },
  { id: 'cuscuz',      nome: 'Cuscuz',           porcao: '1 porção (100g)',  kcal: 112, prot: 2.2, carb: 23,   gord: 0.5 },
  { id: 'tapioca',     nome: 'Tapioca',          porcao: '1 unidade (70g)',  kcal: 190, prot: 0.5, carb: 46,   gord: 0.2 },
  { id: 'granola',     nome: 'Granola',          porcao: '2 colheres (30g)', kcal: 130, prot: 3,   carb: 20,   gord: 4 },
  { id: 'cereal',      nome: 'Cereal matinal',   porcao: '1 xícara (30g)',   kcal: 110, prot: 2,   carb: 24,   gord: 0.5 },
  /* Oleaginosas e sementes */
  { id: 'amendoim',    nome: 'Amendoim',         porcao: '1 punhado (30g)',  kcal: 170, prot: 7.6, carb: 5,    gord: 14 },
  { id: 'castanha',    nome: 'Castanha de caju', porcao: '1 punhado (30g)',  kcal: 166, prot: 5.2, carb: 9,    gord: 13 },
  { id: 'nozes',       nome: 'Nozes',            porcao: '1 punhado (30g)',  kcal: 196, prot: 4.6, carb: 4,    gord: 19 },
  { id: 'amendoa',     nome: 'Amêndoa',          porcao: '1 punhado (30g)',  kcal: 174, prot: 6.4, carb: 6,    gord: 15 },
  { id: 'chia',        nome: 'Chia',             porcao: '1 colher (10g)',   kcal: 49,  prot: 1.7, carb: 4.2,  gord: 3.1 },
  { id: 'linhaca',     nome: 'Linhaça',          porcao: '1 colher (10g)',   kcal: 53,  prot: 1.8, carb: 2.9,  gord: 4.2 },
  { id: 'pasta-amendoim', nome: 'Pasta de amendoim', porcao: '1 colher (15g)', kcal: 90, prot: 4, carb: 3, gord: 7 },
  /* Preparações e pratos */
  { id: 'arroz-feijao', nome: 'Arroz + feijão',  porcao: '1 prato (250g)',   kcal: 280, prot: 12, carb: 50,   gord: 3 },
  { id: 'strogonoff',  nome: 'Strogonoff de frango', porcao: '1 porção (200g)', kcal: 350, prot: 25, carb: 25, gord: 16 },
  { id: 'lasanha',     nome: 'Lasanha',          porcao: '1 pedaço (200g)',  kcal: 360, prot: 18, carb: 35,   gord: 17 },
  { id: 'pizza',       nome: 'Pizza',            porcao: '1 fatia (120g)',   kcal: 270, prot: 12, carb: 32,   gord: 10 },
  { id: 'hamburguer',  nome: 'Hambúrguer',       porcao: '1 unidade (150g)', kcal: 350, prot: 20, carb: 30,   gord: 17 },
  { id: 'sopa',        nome: 'Sopa de legumes',  porcao: '1 prato (300ml)',  kcal: 120, prot: 5,   carb: 18,   gord: 3 },
  { id: 'omelete',     nome: 'Omelete',          porcao: '1 unidade (100g)', kcal: 154, prot: 11, carb: 1,    gord: 12 },
  { id: 'farofa',      nome: 'Farofa',           porcao: '1 colher (30g)',   kcal: 120, prot: 2,   carb: 15,   gord: 6 },
  { id: 'pure',        nome: 'Purê de batata',   porcao: '1 porção (150g)',  kcal: 160, prot: 3,   carb: 28,   gord: 4 },
  { id: 'salada',      nome: 'Salada verde',     porcao: '1 prato (100g)',   kcal: 25,  prot: 1.5, carb: 4,    gord: 0.3 },
  { id: 'yakisoba',    nome: 'Yakisoba',         porcao: '1 porção (250g)',  kcal: 320, prot: 14, carb: 45,   gord: 10 },
  { id: 'sushi',       nome: 'Sushi',            porcao: '1 unidade (30g)',  kcal: 40,  prot: 1.5, carb: 7,    gord: 0.5 },
  /* Lanches e acompanhamentos */
  { id: 'pao-queijo',  nome: 'Pão de queijo',    porcao: '1 unidade (40g)',  kcal: 120, prot: 3,   carb: 14,   gord: 6 },
  { id: 'coxinha',     nome: 'Coxinha',          porcao: '1 unidade (80g)',  kcal: 220, prot: 8,   carb: 22,   gord: 12 },
  { id: 'pastel',      nome: 'Pastel',           porcao: '1 unidade (60g)',  kcal: 180, prot: 5,   carb: 20,   gord: 9 },
  { id: 'empada',      nome: 'Empada',           porcao: '1 unidade (70g)',  kcal: 200, prot: 5,   carb: 20,   gord: 11 },
  { id: 'sanduiche',   nome: 'Sanduíche natural', porcao: '1 unidade (150g)', kcal: 250, prot: 12, carb: 30, gord: 9 },
  { id: 'biscoito',    nome: 'Biscoito',         porcao: '4 unidades (30g)', kcal: 140, prot: 2,   carb: 20,   gord: 6 },
  { id: 'biscoito-integral', nome: 'Biscoito integral', porcao: '4 unidades (30g)', kcal: 130, prot: 3, carb: 20, gord: 4 },
  { id: 'bolacha-agua', nome: 'Bolacha de água e sal', porcao: '4 unidades (30g)', kcal: 130, prot: 2.5, carb: 22, gord: 3.5 },
  { id: 'barra-cereal', nome: 'Barra de cereal', porcao: '1 unidade (25g)',  kcal: 90,  prot: 1.5, carb: 16,   gord: 2.5 },
  { id: 'barrinha-proteica', nome: 'Barrinha proteica', porcao: '1 unidade (40g)', kcal: 160, prot: 15, carb: 15, gord: 5 },
  { id: 'whey',        nome: 'Whey protein',     porcao: '1 scoop (30g)',    kcal: 120, prot: 24, carb: 3,    gord: 1.5 },
  { id: 'pao-de-queijo-minas', nome: 'Pão de queijo (minas)', porcao: '1 unidade (40g)', kcal: 115, prot: 3, carb: 13, gord: 5.5 },
  /* Bebidas */
  { id: 'cafe',        nome: 'Café',             porcao: '1 xícara (50ml)',  kcal: 2,   prot: 0.3, carb: 0,   gord: 0 },
  { id: 'cafe-leite',  nome: 'Café com leite',   porcao: '1 xícara (150ml)', kcal: 80,  prot: 4,   carb: 8,    gord: 3.5 },
  { id: 'suco-laranja', nome: 'Suco de laranja', porcao: '1 copo (200ml)',  kcal: 90,  prot: 1.5, carb: 21,   gord: 0.3 },
  { id: 'suco-uva',    nome: 'Suco de uva',      porcao: '1 copo (200ml)',  kcal: 120, prot: 0.5, carb: 30,   gord: 0.2 },
  { id: 'refrigerante', nome: 'Refrigerante',    porcao: '1 lata (350ml)',  kcal: 140, prot: 0,   carb: 37,   gord: 0 },
  { id: 'refri-diet',  nome: 'Refrigerante diet', porcao: '1 lata (350ml)', kcal: 0,   prot: 0,   carb: 0,    gord: 0 },
  { id: 'agua-coco',   nome: 'Água de coco',     porcao: '1 copo (200ml)',  kcal: 46,  prot: 0.7, carb: 9,    gord: 0.2 },
  { id: 'cerveja',     nome: 'Cerveja',          porcao: '1 lata (350ml)',  kcal: 150, prot: 1.5, carb: 13,   gord: 0 },
  { id: 'vinho',       nome: 'Vinho tinto',      porcao: '1 taça (150ml)',   kcal: 125, prot: 0.1, carb: 4,    gord: 0 },
  { id: 'suco-detox',  nome: 'Suco detox',       porcao: '1 copo (200ml)',  kcal: 70,  prot: 1,   carb: 16,   gord: 0.3 },
  /* Doces */
  { id: 'chocolate',   nome: 'Chocolate',        porcao: '1 barra (30g)',   kcal: 160, prot: 2,   carb: 17,   gord: 9 },
  { id: 'chocolate-amargo', nome: 'Chocolate 70%', porcao: '2 quadradinhos (30g)', kcal: 170, prot: 2.5, carb: 12, gord: 12 },
  { id: 'sorvete',     nome: 'Sorvete',          porcao: '1 bola (60g)',     kcal: 130, prot: 2,   carb: 18,   gord: 6 },
  { id: 'bolo',        nome: 'Bolo',             porcao: '1 fatia (80g)',    kcal: 250, prot: 4,   carb: 40,   gord: 9 },
  { id: 'brigadeiro',  nome: 'Brigadeiro',       porcao: '1 unidade (20g)',  kcal: 70,  prot: 1,   carb: 9,    gord: 3.5 },
  { id: 'mel',         nome: 'Mel',              porcao: '1 colher (15g)',   kcal: 46,  prot: 0,   carb: 12,   gord: 0 },
  { id: 'geleia',      nome: 'Geleia',           porcao: '1 colher (20g)',   kcal: 50,  prot: 0,   carb: 13,   gord: 0 },
  { id: 'doce-leite',  nome: 'Doce de leite',    porcao: '1 colher (20g)',   kcal: 65,  prot: 1.5, carb: 11,   gord: 1.5 },
  /* Outros */
  { id: 'azeite',      nome: 'Azeite de oliva',  porcao: '1 colher (10ml)',  kcal: 88,  prot: 0,   carb: 0,    gord: 10 },
  { id: 'oleo',        nome: 'Óleo vegetal',     porcao: '1 colher (10ml)',  kcal: 88,  prot: 0,   carb: 0,    gord: 10 },
  { id: 'maionese',    nome: 'Maionese',         porcao: '1 colher (15g)',   kcal: 100, prot: 0.3, carb: 0.5,  gord: 11 },
  { id: 'ketchup',     nome: 'Ketchup',          porcao: '1 colher (15g)',   kcal: 15,  prot: 0.2, carb: 4,    gord: 0 },
  { id: 'mostarda',    nome: 'Mostarda',         porcao: '1 colher (15g)',   kcal: 10,  prot: 0.5, carb: 1,    gord: 0.5 },
  { id: 'molho-tomate', nome: 'Molho de tomate', porcao: '1 colher (30g)',   kcal: 20,  prot: 0.8, carb: 4,    gord: 0.2 },
  { id: 'sal',         nome: 'Sal',              porcao: '1 pitada (1g)',    kcal: 0,   prot: 0,   carb: 0,    gord: 0 },
  { id: 'acucar',      nome: 'Açúcar',           porcao: '1 colher (10g)',   kcal: 40,  prot: 0,   carb: 10,   gord: 0 },
  { id: 'proteina-vegetal', nome: 'Proteína de soja', porcao: '1 porção (30g)', kcal: 110, prot: 15, carb: 8, gord: 1.5 },
  { id: 'tofu',        nome: 'Tofu',             porcao: '1 porção (100g)',  kcal: 76,  prot: 8,   carb: 2,    gord: 4.8 },
  { id: 'tempeh',      nome: 'Tempeh',           porcao: '1 porção (100g)',  kcal: 193, prot: 19, carb: 9,    gord: 11 },
];
/* ---------- Estado ---------- */
let nutPronto = false;
let nutView = 'diario';
let nutHistAba = 'diario';
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
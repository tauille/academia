/* ==========================================================================
   itrainer — Lógica da página
   1. Menu mobile
   2. Ano automático no rodapé
   3. Dados do config.js
   4. Animação de entrada ao rolar
   5. Formulário de contato
   ========================================================================== */

// ---------- 1. MENU MOBILE ----------
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ---------- 2. ANO AUTOMÁTICO NO RODAPÉ ----------
document.getElementById('ano').textContent = new Date().getFullYear();

// ---------- 3. DADOS DO CONFIG.JS ----------
if (typeof CONFIG !== 'undefined') {
  // Preenche os dados de contato
  const preencher = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  };

  preencher('infoEndereco', CONFIG.contato.endereco);
  preencher('infoCidade', CONFIG.contato.cidade);
  preencher('infoTelefone', CONFIG.contato.telefone);
  preencher('infoEmail', CONFIG.contato.email);
  preencher('infoHorarioSemana', CONFIG.horarios.semana);
  preencher('infoHorarioSabado', CONFIG.horarios.sabado);

  // Preenche os links das redes sociais
  document.querySelectorAll('#socialLinks a[data-rede]').forEach((link) => {
    const rede = link.dataset.rede;
    if (CONFIG.redes[rede]) link.href = CONFIG.redes[rede];
  });
}

// ---------- 4. ANIMAÇÃO DE ENTRADA AO ROLAR ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

const revealElements = document.querySelectorAll(
  '.card, .beneficio, .depoimento, .info-item, .galeria-grid img'
);

revealElements.forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ---------- 5. FORMULÁRIO DE CONTATO ----------
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
    contactForm.reset();
  });
}
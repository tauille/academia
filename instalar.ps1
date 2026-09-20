# ==========================================================================
#  itrainer - Instalador do projeto
#  Cria as pastas e todos os arquivos automaticamente.
#  Execute pelo instalar.bat (ou: powershell -ExecutionPolicy Bypass -File instalar.ps1)
# ==========================================================================

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "============================================"
Write-Host "  Instalador do projeto itrainer"
Write-Host "============================================"
Write-Host ""

# ---------- 1. CRIAR PASTAS ----------
$pastas = @('css', 'js', 'assets', 'assets/images')
foreach ($pasta in $pastas) {
    $caminho = Join-Path $raiz $pasta
    if (-not (Test-Path $caminho)) {
        New-Item -ItemType Directory -Path $caminho -Force | Out-Null
        Write-Host "  [OK] Pasta criada: $pasta/"
    } else {
        Write-Host "  [--] Pasta ja existe: $pasta/"
    }
}
Write-Host ""

# ---------- 2. FUNCAO AUXILIAR PARA CRIAR ARQUIVOS ----------
function Criar-Arquivo {
    param([string]$Nome, [string]$Conteudo)
    $caminho = Join-Path $raiz $Nome
    [System.IO.File]::WriteAllText($caminho, $Conteudo, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [OK] Arquivo criado: $Nome"
}

# ---------- 3. CONTEUDO DOS ARQUIVOS ----------

$indexHtml = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="itrainer - Treinos de musculação, spinning, jump e muay thai. Estrutura completa, professores qualificados e resultados de verdade.">
  <meta name="theme-color" content="#121214">
  <title>itrainer - Treine com Força</title>
  <link rel="icon" type="image/svg+xml" href="assets/icon.svg">
  <link rel="manifest" href="manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>

  <!-- ===== CABEÇALHO ===== -->
  <header>
    <div class="container nav">
      <a href="#inicio" class="logo">i<span>trainer</span></a>
      <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="navLinks">
        <li><a href="#inicio">Início</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#modalidades">Modalidades</a></li>
        <li><a href="#beneficios">Benefícios</a></li>
        <li><a href="#galeria">Galeria</a></li>
        <li><a href="#depoimentos">Depoimentos</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
      <a href="#contato" class="nav-cta">Comece agora</a>
    </div>
  </header>

  <!-- ===== APRESENTAÇÃO / HERO ===== -->
  <section class="hero" id="inicio">
    <div class="container">
      <div class="hero-content">
        <span class="hero-tag">💪 Treine com propósito</span>
        <h1>Força, <span>disciplina</span> e <span>resultados</span></h1>
        <p>Estrutura completa, professores qualificados e um ambiente que motiva. Aqui você encontra musculação, spinning, jump e muay thai — do iniciante ao avançado.</p>
        <div class="hero-buttons">
          <a href="#contato" class="btn btn-primary">Matricule-se agora</a>
          <a href="#modalidades" class="btn btn-outline">Conheça as modalidades</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><h3>+500</h3><p>Alunos ativos</p></div>
          <div class="stat"><h3>12</h3><p>Anos de experiência</p></div>
          <div class="stat"><h3>4</h3><p>Modalidades</p></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== SOBRE ===== -->
  <section id="sobre">
    <div class="container">
      <div class="sobre-grid">
        <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop" alt="Estrutura da academia">
        <div class="sobre-text">
          <span class="kicker">Quem somos</span>
          <h3>Mais que uma academia, um estilo de vida</h3>
          <p>A itrainer nasceu com um propósito: tornar o treino acessível, acolhedor e eficiente. Nossa estrutura foi pensada para quem busca saúde, estética ou performance — sempre com acompanhamento próximo e de qualidade.</p>
          <p>Contamos com equipamentos modernos, aulas em grupo com energia e um time de professores que conhece cada aluno pelo nome.</p>
          <ul>
            <li>Equipamentos modernos e manutenção constante</li>
            <li>Acompanhamento individualizado de professores</li>
            <li>Ambiente limpo, seguro e climatizado</li>
            <li>Horários flexíveis, inclusive aos sábados</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== MODALIDADES ===== -->
  <section class="modalidades" id="modalidades">
    <div class="container">
      <div class="section-head">
        <span class="kicker">Nossas modalidades</span>
        <h2>Escolha o seu treino</h2>
        <p>Modalidades para todos os objetivos e níveis, com turmas em horários variados.</p>
      </div>
      <div class="cards">
        <div class="card">
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop" alt="Musculação">
          <div class="card-body">
            <h3>Musculação</h3>
            <p>Treinos de força e hipertrofia com acompanhamento de professores e planos individualizados.</p>
            <span class="tag">Força e hipertrofia</span>
          </div>
        </div>
        <div class="card">
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop" alt="Spinning">
          <div class="card-body">
            <h3>Spinning</h3>
            <p>Aulas de bike com alta energia, música e treinos que queimam muitas calorias.</p>
            <span class="tag">Cardio e resistência</span>
          </div>
        </div>
        <div class="card">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop" alt="Jump">
          <div class="card-body">
            <h3>Jump</h3>
            <p>Aula aeróbica sobre mini trampolins: diversão, coordenação e condicionamento.</p>
            <span class="tag">Aeróbico</span>
          </div>
        </div>
        <div class="card">
          <img src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=800&auto=format&fit=crop" alt="Muay Thai">
          <div class="card-body">
            <h3>Muay Thai</h3>
            <p>Arte marcial completa: defesa pessoal, condicionamento físico e disciplina.</p>
            <span class="tag">Luta e defesa pessoal</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== BENEFÍCIOS ===== -->
  <section id="beneficios">
    <div class="container">
      <div class="section-head">
        <span class="kicker">Por que treinar aqui</span>
        <h2>Benefícios para você</h2>
      </div>
      <div class="beneficios-grid">
        <div class="beneficio">
          <div class="icon">🏋️</div>
          <h3>Estrutura completa</h3>
          <p>Área de musculação, estúdio de aulas e espaço para treinos funcionais.</p>
        </div>
        <div class="beneficio">
          <div class="icon">👨‍🏫</div>
          <h3>Professores qualificados</h3>
          <p>Time formado e em constante atualização para orientar cada treino.</p>
        </div>
        <div class="beneficio">
          <div class="icon">📅</div>
          <h3>Horários flexíveis</h3>
          <p>Funcionamento amplo, com turmas de manhã, tarde, noite e sábado.</p>
        </div>
        <div class="beneficio">
          <div class="icon">❤️</div>
          <h3>Saúde e bem-estar</h3>
          <p>Treinos que melhoram condicionamento, postura, sono e disposição.</p>
        </div>
        <div class="beneficio">
          <div class="icon">🤝</div>
          <h3>Comunidade acolhedora</h3>
          <p>Ambiente motivador, onde todos se conhecem e se apoiam.</p>
        </div>
        <div class="beneficio">
          <div class="icon">📊</div>
          <h3>Avaliação periódica</h3>
          <p>Acompanhamento de evolução com avaliações físicas regulares.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== GALERIA ===== -->
  <section class="galeria" id="galeria">
    <div class="container">
      <div class="section-head">
        <span class="kicker">Galeria</span>
        <h2>Nosso ambiente</h2>
        <p>Um pouco do dia a dia da nossa estrutura e das nossas turmas.</p>
      </div>
      <div class="galeria-grid">
        <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop" alt="Treino funcional">
        <img src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop" alt="Musculação">
        <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop" alt="Treino de força">
        <img src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=800&auto=format&fit=crop" alt="Treino com pesos">
        <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop" alt="Personal trainer">
        <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop" alt="Treino feminino">
      </div>
    </div>
  </section>

  <!-- ===== DEPOIMENTOS ===== -->
  <section id="depoimentos">
    <div class="container">
      <div class="section-head">
        <span class="kicker">Depoimentos</span>
        <h2>Quem treina, recomenda</h2>
      </div>
      <div class="depoimentos-grid">
        <div class="depoimento">
          <div class="stars">★★★★★</div>
          <p>"Comecei há 8 meses e já perdi 12kg. Os professores acompanham de perto e o ambiente me motiva todos os dias."</p>
          <div class="autor">
            <div class="avatar">MA</div>
            <div><h4>Mariana Alves</h4><span>Aluna de musculação</span></div>
          </div>
        </div>
        <div class="depoimento">
          <div class="stars">★★★★★</div>
          <p>"As aulas de spinning são incríveis! Energia do início ao fim. Melhor custo-benefício da região, sem dúvida."</p>
          <div class="autor">
            <div class="avatar">CP</div>
            <div><h4>Carlos Pereira</h4><span>Aluno de spinning</span></div>
          </div>
        </div>
        <div class="depoimento">
          <div class="stars">★★★★★</div>
          <p>"Treino muay thai há 2 anos. Evoluí na defesa pessoal e no condicionamento. A equipe é excepcional."</p>
          <div class="autor">
            <div class="avatar">JS</div>
            <div><h4>Juliana Souza</h4><span>Aluna de muay thai</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== CONTATO ===== -->
  <section class="modalidades" id="contato">
    <div class="container">
      <div class="section-head">
        <span class="kicker">Fale conosco</span>
        <h2>Comece hoje mesmo</h2>
        <p>Preencha o formulário ou visite a academia. Nossa equipe responde rápido.</p>
      </div>
      <div class="contato-grid">
        <form class="contato-form" id="contactForm">
          <label for="nome">Nome</label>
          <input type="text" id="nome" name="nome" placeholder="Seu nome completo" required>

          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" placeholder="seuemail@exemplo.com" required>

          <label for="telefone">Telefone / WhatsApp</label>
          <input type="tel" id="telefone" name="telefone" placeholder="(00) 00000-0000">

          <label for="mensagem">Mensagem</label>
          <textarea id="mensagem" name="mensagem" placeholder="Conte o que você procura: modalidade, horários, planos..."></textarea>

          <button type="submit" class="btn btn-primary btn-submit">Enviar mensagem</button>
        </form>
        <div class="contato-info">
          <div class="info-item">
            <div class="icon">📍</div>
            <div>
              <h4>Endereço</h4>
              <p id="infoEndereco"></p>
              <p id="infoCidade"></p>
            </div>
          </div>
          <div class="info-item">
            <div class="icon">📞</div>
            <div>
              <h4>Telefone / WhatsApp</h4>
              <p id="infoTelefone"></p>
            </div>
          </div>
          <div class="info-item">
            <div class="icon">🕐</div>
            <div>
              <h4>Horários</h4>
              <p id="infoHorarioSemana"></p>
              <p id="infoHorarioSabado"></p>
            </div>
          </div>
          <div class="info-item">
            <div class="icon">✉️</div>
            <div>
              <h4>E-mail</h4>
              <p id="infoEmail"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== RODAPÉ ===== -->
  <footer>
    <div class="container">
      <div class="logo">i<span>trainer</span></div>
      <div class="social" id="socialLinks">
        <a href="#" data-rede="instagram" aria-label="Instagram">📷</a>
        <a href="#" data-rede="facebook" aria-label="Facebook">👍</a>
        <a href="#" data-rede="whatsapp" aria-label="WhatsApp">💬</a>
      </div>
      <p>© <span id="ano"></span> itrainer — Todos os direitos reservados.</p>
    </div>
  </footer>

  <script src="js/config.js" defer></script>
  <script src="js/main.js" defer></script>
</body>
</html>
'@

$stylesCss = @'
/* ==========================================================================
   itrainer — Folha de estilos principal
   Índice:
   1. Variáveis e reset
   2. Base
   3. Navegação
   4. Hero
   5. Seções (padrão)
   6. Sobre
   7. Modalidades
   8. Benefícios
   9. Galeria
   10. Depoimentos
   11. Contato
   12. Rodapé
   13. Animações
   14. Responsivo
   ========================================================================== */

/* ---------- 1. VARIÁVEIS E RESET ---------- */
:root {
  --bg: #121214;
  --surface: #1a1a1e;
  --surface-2: #222226;
  --accent: #c8f31d;
  --accent-dark: #a8d112;
  --text: #f5f5f5;
  --muted: #a1a1a6;
  --border: #2a2a30;
  --radius: 14px;
  --font-display: 'Bebas Neue', 'Arial Narrow', sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
  overflow-x: hidden;
}

img { max-width: 100%; display: block; }

a { text-decoration: none; color: inherit; }

.container { width: min(1140px, 92%); margin: 0 auto; }

/* ---------- 2. BASE ---------- */
section { padding: 6rem 0; }

/* ---------- 3. NAVEGAÇÃO ---------- */
header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(18, 18, 20, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.logo {
  font-family: var(--font-display);
  font-size: 1.9rem;
  letter-spacing: 2px;
  color: var(--text);
  text-transform: uppercase;
}

.logo span { color: var(--accent); }

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-links a {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--muted);
  transition: color 0.2s;
}

.nav-links a:hover { color: var(--accent); }

.nav-cta {
  background: var(--accent);
  color: #121214;
  font-weight: 700;
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: background 0.2s, transform 0.2s;
}

.nav-cta:hover { background: var(--accent-dark); transform: translateY(-2px); }

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 40px; height: 40px;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.menu-toggle span {
  display: block;
  width: 26px; height: 2px;
  background: var(--text);
  transition: 0.3s;
}

.menu-toggle.open span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
.menu-toggle.open span:nth-child(2) { opacity: 0; }
.menu-toggle.open span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

/* ---------- 4. HERO ---------- */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background:
    linear-gradient(120deg, rgba(18,18,20,0.94) 0%, rgba(18,18,20,0.55) 55%, rgba(18,18,20,0.75) 100%),
    url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1740&auto=format&fit=crop') center/cover no-repeat;
  padding-top: 72px;
}

.hero-content { max-width: 640px; padding: 4rem 0; }

.hero-tag {
  display: inline-block;
  background: rgba(200, 243, 29, 0.12);
  color: var(--accent);
  border: 1px solid rgba(200, 243, 29, 0.35);
  padding: 0.35rem 1rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 1.4rem;
}

.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 1.2rem;
}

.hero h1 span { color: var(--accent); }

.hero p {
  font-size: 1.1rem;
  color: var(--muted);
  margin-bottom: 2.2rem;
  max-width: 520px;
}

.hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn {
  display: inline-block;
  padding: 0.9rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: 0.2s;
}

.btn-primary { background: var(--accent); color: #121214; }
.btn-primary:hover { background: var(--accent-dark); transform: translateY(-2px); }

.btn-outline { border: 2px solid var(--text); color: var(--text); }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }

.hero-stats {
  display: flex;
  gap: 3rem;
  margin-top: 3.5rem;
  flex-wrap: wrap;
}

.hero-stats .stat h3 {
  font-family: var(--font-display);
  font-size: 2.6rem;
  color: var(--accent);
  letter-spacing: 1px;
}

.hero-stats .stat p { font-size: 0.85rem; color: var(--muted); margin: 0; }

/* ---------- 5. SEÇÕES (PADRÃO) ---------- */
.section-head { text-align: center; max-width: 640px; margin: 0 auto 3.5rem; }

.section-head .kicker {
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
}

.section-head h2 {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 0.8rem;
}

.section-head p { color: var(--muted); }

/* ---------- 6. SOBRE ---------- */
.sobre-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.sobre-grid img {
  border-radius: var(--radius);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  height: 100%;
  object-fit: cover;
}

.sobre-text h3 {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.sobre-text p { color: var(--muted); margin-bottom: 1.2rem; }

.sobre-text ul { list-style: none; margin-top: 1.5rem; }

.sobre-text li {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 500;
}

.sobre-text li::before {
  content: '✓';
  color: var(--accent);
  font-weight: 700;
}

/* ---------- 7. MODALIDADES ---------- */
.modalidades { background: var(--surface); }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.3s, border-color 0.3s;
}

.card:hover { transform: translateY(-8px); border-color: var(--accent); }

.card img { height: 190px; width: 100%; object-fit: cover; }

.card-body { padding: 1.5rem; }

.card-body h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.card-body p { color: var(--muted); font-size: 0.92rem; }

.card-body .tag {
  display: inline-block;
  margin-top: 1rem;
  background: rgba(200,243,29,0.1);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.8rem;
  border-radius: 100px;
}

/* ---------- 8. BENEFÍCIOS ---------- */
.beneficios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.beneficio {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem 1.6rem;
  transition: border-color 0.3s;
}

.beneficio:hover { border-color: var(--accent); }

.beneficio .icon {
  width: 52px; height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200,243,29,0.12);
  color: var(--accent);
  border-radius: 12px;
  font-size: 1.5rem;
  margin-bottom: 1.2rem;
}

.beneficio h3 { font-size: 1.05rem; margin-bottom: 0.5rem; }

.beneficio p { color: var(--muted); font-size: 0.9rem; }

/* ---------- 9. GALERIA ---------- */
.galeria { background: var(--surface); }

.galeria-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.galeria-grid img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.4s, filter 0.4s;
  cursor: pointer;
}

.galeria-grid img:hover { transform: scale(1.04); filter: brightness(1.15); }

/* ---------- 10. DEPOIMENTOS ---------- */
.depoimentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.depoimento {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.depoimento .stars { color: var(--accent); letter-spacing: 3px; }

.depoimento p { color: var(--muted); font-size: 0.95rem; font-style: italic; }

.depoimento .autor {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: auto;
}

.depoimento .avatar {
  width: 46px; height: 46px;
  border-radius: 50%;
  background: var(--accent);
  color: #121214;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.depoimento .autor h4 { font-size: 0.95rem; }
.depoimento .autor span { font-size: 0.8rem; color: var(--muted); }

/* ---------- 11. CONTATO ---------- */
.contato-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
}

.contato-form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
}

.contato-form label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text);
}

.contato-form input,
.contato-form textarea {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: 0.85rem 1rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  margin-bottom: 1.2rem;
  transition: border-color 0.2s;
}

.contato-form input:focus,
.contato-form textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.contato-form textarea { min-height: 130px; resize: vertical; }

.btn-submit {
  border: none;
  cursor: pointer;
  width: 100%;
}

.contato-info { display: flex; flex-direction: column; gap: 1.2rem; }

.info-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.4rem 1.6rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-item .icon {
  width: 44px; height: 44px;
  flex-shrink: 0;
  background: rgba(200,243,29,0.12);
  color: var(--accent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.info-item h4 { font-size: 0.95rem; margin-bottom: 0.2rem; }
.info-item p { color: var(--muted); font-size: 0.88rem; }

/* ---------- 12. RODAPÉ ---------- */
footer {
  background: #0a0a0c;
  border-top: 1px solid var(--border);
  padding: 2.5rem 0;
  text-align: center;
}

footer .logo { font-size: 1.5rem; margin-bottom: 0.6rem; }

footer p { color: var(--muted); font-size: 0.85rem; }

footer .social { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem; }

footer .social a {
  width: 40px; height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border-radius: 50%;
  font-size: 1rem;
  transition: background 0.2s;
}

footer .social a:hover { background: var(--accent); color: #121214; }

/* ---------- 13. ANIMAÇÕES ---------- */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.reveal.visible { opacity: 1; transform: translateY(0); }

/* ---------- 14. RESPONSIVO ---------- */
@media (max-width: 900px) {
  .sobre-grid, .contato-grid { grid-template-columns: 1fr; }
  .galeria-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .menu-toggle { display: flex; }

  .nav-links {
    position: fixed;
    top: 72px; left: 0; right: 0;
    flex-direction: column;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    padding: 1.5rem 8%;
    gap: 1.2rem;
    transform: translateY(-120%);
    transition: transform 0.3s;
  }

  .nav-links.open { transform: translateY(0); }

  .nav-cta { display: none; }

  .galeria-grid { grid-template-columns: 1fr; }
  .hero-stats { gap: 1.5rem; }
}
'@

$configJs = @'
/* ==========================================================================
   itrainer — Central de dados editáveis
   Altere aqui os dados da academia sem precisar mexer no HTML.
   ========================================================================== */

const CONFIG = {
  // Nome do app
  nome: 'itrainer',

  // Dados de contato
  contato: {
    endereco: 'Rua da Academia, 123 — Centro',
    cidade: '[Cidade / Estado]',
    telefone: '(00) 00000-0000',
    email: 'contato@itrainer.com.br'
  },

  // Horários de funcionamento
  horarios: {
    semana: 'Segunda a sexta: 06h às 22h',
    sabado: 'Sábado: 08h às 14h'
  },

  // Redes sociais (use links completos, ex.: https://instagram.com/suaacademia)
  redes: {
    instagram: '#',
    facebook: '#',
    whatsapp: '#'
  }
};
'@

$mainJs = @'
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
'@

$manifestJson = @'
{
  "name": "itrainer",
  "short_name": "itrainer",
  "description": "Treinos de musculação, spinning, jump e muay thai.",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#121214",
  "theme_color": "#121214",
  "lang": "pt-BR",
  "icons": [
    {
      "src": "assets/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ]
}
'@

$iconSvg = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#121214"/>
  <text x="256" y="350" font-family="Arial, Helvetica, sans-serif" font-size="300" font-weight="bold" fill="#c8f31d" text-anchor="middle">i</text>
</svg>
'@

$leiaMe = @'
COMO USAR IMAGENS LOCAIS
========================

Esta pasta e para as fotos da academia (fotos reais, logo, etc.).

Como fazer:
1. Coloque suas fotos aqui (ex.: hero.jpg, musculacao.jpg, galeria-1.jpg)
2. No arquivo index.html, troque o endereco https://images.unsplash.com/... pelo caminho local:
   - Antes: src="https://images.unsplash.com/photo-xxx..."
   - Depois: src="assets/images/hero.jpg"
3. Salve, faca commit e push. O site passa a usar suas fotos.

Dica: use imagens .jpg ou .webp com tamanho razoavel (max. ~300 KB cada)
para o site carregar rapido.
'@

$readme = @'
# itrainer

Página institucional da academia, com identidade visual escura e moderna.

## Estrutura do projeto

| Arquivo               | Responsabilidade                                   |
| --------------------- | -------------------------------------------------- |
| `index.html`          | Estrutura e conteúdo da página                     |
| `css/styles.css`      | Estilos e identidade visual                        |
| `js/config.js`        | Dados editáveis (contato, horários, redes sociais) |
| `js/main.js`          | Interações (menu, animações, formulário, dados)    |
| `manifest.json`       | Torna o app instalável (PWA)                       |
| `assets/icon.svg`     | Ícone do app                                       |
| `assets/images/`      | Fotos locais da academia (opcional)                |

## Como executar

Abra o `index.html` no navegador ou publique no GitHub Pages.

## Como publicar no GitHub Pages

1. `git add .`
2. `git commit -m "Página itrainer com arquivos separados"`
3. `git push`
4. No GitHub: Settings → Pages → Deploy from branch `main` / pasta `(root)`

## Como editar os dados

Todos os dados de contato, horários e redes sociais ficam em `js/config.js`.
Altere lá e o site atualiza sozinho.
'@

# ---------- 4. GRAVAR ARQUIVOS ----------
Write-Host "Criando arquivos..."
Write-Host ""
Criar-Arquivo 'index.html' $indexHtml
Criar-Arquivo 'css/styles.css' $stylesCss
Criar-Arquivo 'js/config.js' $configJs
Criar-Arquivo 'js/main.js' $mainJs
Criar-Arquivo 'manifest.json' $manifestJson
Criar-Arquivo 'assets/icon.svg' $iconSvg
Criar-Arquivo 'assets/images/LEIA-ME.txt' $leiaMe
Criar-Arquivo 'README.md' $readme

Write-Host ""
Write-Host "Estrutura criada com sucesso!"
Write-Host ""

# ---------- 5. GIT (OPCIONAL) ----------
$gitDisponivel = Get-Command git -ErrorAction SilentlyContinue
if ($gitDisponivel) {
    $resposta = Read-Host "Deseja iniciar o Git e fazer o primeiro commit? (S/N)"
    if ($resposta -match '^[Ss]') {
        if (-not (Test-Path (Join-Path $raiz '.git'))) {
            git init | Out-Null
            Write-Host "  [OK] git init"
        }

        $nomeGit = git config user.name
        if (-not $nomeGit) {
            $nomeGit = Read-Host "Git nao configurado. Digite seu nome"
            $emailGit = Read-Host "Digite seu e-mail (o mesmo do GitHub)"
            git config --global user.name $nomeGit
            git config --global user.email $emailGit
            Write-Host "  [OK] Identidade do Git configurada"
        }

        git add .
        git commit -m "Projeto itrainer - estrutura inicial"

        Write-Host ""
        Write-Host "Commit criado! Para enviar ao GitHub, rode:"
        Write-Host "  git remote add origin https://github.com/SEU-USUARIO/itrainer.git"
        Write-Host "  git push -u origin main"
        Write-Host ""
        Write-Host "Depois ative o GitHub Pages em: Settings > Pages > Deploy from branch (main / root)"
    }
} else {
    Write-Host "Git nao encontrado no computador. Instale em https://git-scm.com ou use o GitHub Codespaces."
}

Write-Host ""
Write-Host "Pronto! Abra a pasta e execute o index.html no navegador."
Write-Host ""
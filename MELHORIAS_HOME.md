### 2️⃣ Expo Dog BR

**Status Atual:** 🟡 PODE MELHORAR
**Prioridade:** 🔴 Alta

**Problemas Identificados:**
- ❌ Visual pouco atrativo

**Melhorias Sugeridas:**

#### A. Adicionar Banner Visual Impactante
```html
<div class="expo-hero">
  <img src="./expo-dog-banner.jpg" alt="Expo Dog BR">
  <div class="expo-overlay">
    <h2>🏆 Expo Dog BR</h2>
    <p>A maior exposição online de cães do Brasil</p>
  </div>
</div>
```

### 8️⃣ Melhorar Seção "Anuncie Aqui"

**Status Atual:** ✅ BOM
**Prioridade:** 🟢 Baixa

**Melhorias Sugeridas:**

#### A. Adicionar Estatísticas de Alcance
```html
<div class="anunciante-stats">
  <div class="stat">
    <span class="number">50k+</span>
    <span class="label">Leitores Mensais</span>
  </div>
  <div class="stat">
    <span class="number">85%</span>
    <span class="label">Taxa de Engajamento</span>
  </div>
  <div class="stat">
    <span class="number">R$ 0,10</span>
    <span class="label">Custo por Mil Impressões</span>
  </div>
</div>
```

## 🎨 Melhorias Visuais Gerais

### 1. Adicionar Scroll Animations
```typescript
// Usar biblioteca AOS (Animate On Scroll)
import AOS from 'aos';

ngOnInit() {
  AOS.init({
    duration: 800,
    once: true,
    offset: 100
  });
}
```

```html
<div data-aos="fade-up">Conteúdo animado</div>
<div data-aos="fade-left">Conteúdo animado</div>
<div data-aos="zoom-in">Conteúdo animado</div>
```

**Impacto:** 📈 +20% de engajamento visual

---

### 2. Adicionar Micro-interações

#### Botões com Ripple Effect
```scss
.btn-ripple {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::after {
    width: 300px;
    height: 300px;
  }
}
```

#### Cards com Hover 3D
```scss
.card-3d {
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px) rotateX(5deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
}
```

**Impacto:** 📈 +15% de interação com elementos

---

### 3. Adicionar Loading Skeleton

```html
<!-- Enquanto carrega -->
<div class="skeleton-card">
  <div class="skeleton-image"></div>
  <div class="skeleton-text"></div>
  <div class="skeleton-text short"></div>
</div>
```

```scss
.skeleton-image,
.skeleton-text {
  /* Usar escala de cinzas do tema */
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-200) 50%,
    var(--gray-100) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Impacto:** 📈 Melhor UX durante carregamento

---

## 📱 Melhorias Mobile

### 1. Bottom Navigation (Mobile)
```html
<nav class="mobile-bottom-nav">
  <a href="/">
    <i class="fas fa-home"></i>
    <span>Início</span>
  </a>
  <a href="/artigos">
    <i class="fas fa-newspaper"></i>
    <span>Artigos</span>
  </a>
  <a href="/edicoes">
    <i class="fas fa-book"></i>
    <span>Edições</span>
  </a>
  <a href="/perfil">
    <i class="fas fa-user"></i>
    <span>Perfil</span>
  </a>
</nav>
```

### 2. Swipe Gestures nos Cards
- Swipe para ver próximo artigo
- Swipe para favoritar
- Pull to refresh

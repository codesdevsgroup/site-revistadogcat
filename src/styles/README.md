# Sistema de Design - SCSS

## 📁 Estrutura dos Arquivos

```
src/styles/
├── _variables.scss    # Tokens de design (cores, espaçamentos, etc)
├── _mixins.scss      # Mixins reutilizáveis
├── _buttons.scss     # Sistema de botões
└── styles.scss       # Arquivo principal
```

## 🎨 Variáveis CSS

### Cores Principais
```scss
--primaryColor: #1a3d1e;
--secondaryColor: #baeb6c;
--tertiaryColor: #f8f9fa;
--goldenColor: #f59e0b;
```

### Cores Semânticas
```scss
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
--whatsapp: #25d366;
```

### Cores de Texto
```scss
--text-primary: var(--gray-900);
--text-secondary: var(--gray-600);
--text-muted: var(--gray-500);
--text-disabled: var(--gray-400);
--text-inverse: var(--white);
```

### Backgrounds
```scss
--bg-primary: var(--gray-50);
--bg-secondary: var(--gray-100);
--bg-card: var(--white);
--bg-overlay: rgba(0, 0, 0, 0.5);
```

### Espaçamentos
```scss
--space-1: 0.25rem;  // 4px
--space-2: 0.5rem;   // 8px
--space-3: 0.75rem;  // 12px
--space-4: 1rem;     // 16px
--space-6: 1.5rem;   // 24px
--space-8: 2rem;     // 32px
```

## 🔧 Mixins Úteis

### Layout
```scss
@include flex-center;        // display: flex + center
@include flex-between;       // display: flex + space-between
@include flex-column;        // flex-direction: column
```

### Transições
```scss
@include transition();       // transição padrão
@include transition-fast();  // transição rápida
@include hover-lift;         // efeito hover com elevação
```

### Cards
```scss
@include card-base;          // card básico
@include card-hover;         // card com hover
```

### Formulários
```scss
@include input-base;         // input básico
@include input-error;        // input com erro
@include input-success;      // input com sucesso
```

## 🔘 Sistema de Botões

### Botões Básicos
```html
<button class="btn btn-primary">Primário</button>
<button class="btn btn-secondary">Secundário</button>
<button class="btn btn-success">Sucesso</button>
<button class="btn btn-warning">Aviso</button>
<button class="btn btn-error">Erro</button>
```

### Tamanhos
```html
<button class="btn btn-primary btn-sm">Pequeno</button>
<button class="btn btn-primary">Normal</button>
<button class="btn btn-primary btn-lg">Grande</button>
<button class="btn btn-primary btn-xl">Extra Grande</button>
```

### Variantes Outline
```html
<button class="btn btn-outline-primary">Outline Primário</button>
<button class="btn btn-outline-secondary">Outline Secundário</button>
```

### Variantes Ghost
```html
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-ghost-primary">Ghost Primário</button>
```

### Botões Especiais
```html
<button class="btn btn-whatsapp">WhatsApp</button>
<button class="btn btn-gradient">Gradiente</button>
<button class="btn btn-primary btn-rounded">Arredondado</button>
```

### Botão com Ícone
```html
<button class="btn btn-primary">
  <i class="icon fas fa-save"></i>
  Salvar
</button>
```

### Estado de Loading
```html
<button class="btn btn-primary loading">Carregando...</button>
```

### Botão Flutuante (FAB)
```html
<button class="btn-fab">
  <i class="icon fas fa-plus"></i>
</button>
```

### Botão Apenas Ícone
```html
<button class="btn btn-icon btn-primary">
  <i class="icon fas fa-edit"></i>
</button>
```

## 📱 Responsividade

### Mixins Responsivos
```scss
@include mobile-only {
  // Estilos apenas para mobile
}

@include tablet-up {
  // Estilos para tablet e desktop
}

@include desktop-up {
  // Estilos apenas para desktop
}
```

### Botões Responsivos
```html
<button class="btn btn-primary btn-mobile-block">Full width no mobile</button>
```

## 🌙 Tema Escuro

O sistema suporta automaticamente tema escuro através do atributo `data-theme="dark"`:

```html
<html data-theme="dark">
```

Todas as variáveis CSS são automaticamente ajustadas para o tema escuro.

## ✨ Animações

### Keyframes Disponíveis
- `fadeIn` - Fade in suave
- `slideUp` - Deslizar para cima
- `bounceIn` - Entrada com bounce
- `pulse` - Pulsação
- `rotate` - Rotação
- `loading` - Skeleton loading
- `spin` - Spinner

### Mixins de Animação
```scss
@include fade-in(0.3s);
@include slide-up(0.4s);
@include bounce-in(0.6s);
@include pulse(2s);
```

## 🚀 Como Usar

1. **Importe os arquivos necessários:**
```scss
@import 'styles/variables';
@import 'styles/mixins';
```

2. **Use as variáveis CSS:**
```scss
.meu-componente {
  background: var(--bg-card);
  color: var(--text-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}
```

3. **Use os mixins:**
```scss
.meu-botao {
  @include button-base;
  @include hover-lift;
  @include transition-fast;
}
```

4. **Use as classes de botão:**
```html
<button class="btn btn-primary btn-lg">Meu Botão</button>
```

## 🎯 Boas Práticas

1. **Sempre use variáveis CSS** ao invés de valores hardcoded
2. **Evite !important** - use especificidade adequada
3. **Use mixins** para funcionalidades repetitivas
4. **Mantenha consistência** com o sistema de design
5. **Teste em ambos os temas** (claro e escuro)
6. **Use classes semânticas** para botões e componentes

## 🔄 Migração de Código Legado

### Antes (❌)
```scss
.meu-componente {
  background: #ffffff !important;
  color: #333333;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}
```

### Depois (✅)
```scss
.meu-componente {
  @include card-base;
  @include transition-fast;
}
```
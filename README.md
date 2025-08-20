# Revista Dog & Cat BR - Website

Este é o repositório oficial do site da **Revista Dog & Cat BR**, uma plataforma de conteúdo dedicada a apaixonados por cães e gatos. O site oferece acesso às edições digitais da revista, informações sobre eventos, e um espaço para criadores e anunciantes.

Este projeto foi gerado com [Angular CLI](https://github.com/angular/angular-cli) versão 19.2.13.

## ✨ Funcionalidades

- **Leitor de Revistas Interativo:** Visualize as edições da revista com um efeito de virar a página (flipbook) em 3D.
- **Expo Dog BR:** Participe da primeira mostra de cães 100% online do Brasil, com um formulário de cadastro completo.
- **Anuncie Conosco:** Uma seção dedicada para empresas e marcas que desejam anunciar na revista.
- **Design Moderno e Responsivo:** Interface amigável e adaptada para todos os dispositivos.

## 🚀 Tecnologias Utilizadas

- **[Angular](https://angular.io/):** Framework principal para a construção da interface.
- **[Bootstrap](https://getbootstrap.com/):** Para a criação de layouts responsivos.
- **[Font Awesome](https://fontawesome.com/):** Biblioteca de ícones.
- **[DearFlip.js](https://dearflip.com/):** Para o leitor de revistas com efeito flipbook 3D.
- **[Bun](https://bun.sh/):** Usado como um runtime JavaScript alternativo e rápido.

## ⚙️ Como Começar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Angular CLI](https://angular.io/cli)
- [Bun](https://bun.sh/) (opcional, para usar os scripts `bun:*`)

### Instalação e Execução

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/site-revistadogcat.git
    cd site-revistadogcat
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Inicie o servidor de desenvolvimento:
    ```bash
    ng serve
    ```
    ou com Bun:
    ```bash
    bun run ng serve
    ```

4.  Abra seu navegador e acesse `http://localhost:4200/`.

## 📂 Estrutura do Projeto

O projeto segue a estrutura padrão do Angular, com as seguintes pastas principais dentro de `src/app`:

-   `components/`: Componentes reutilizáveis (navbar, footer, etc.).
-   `pages/`: Componentes que representam as páginas principais do site (home, edições, etc.).
-   `services/`: Serviços para lógica de negócio e comunicação com APIs.

## 🔗 Dependências Externas (CDN)

Algumas bibliotecas são carregadas via CDN no arquivo `src/index.html` para otimizar o build inicial:

-   **jQuery:** Dependência para a biblioteca DearFlip.js.
-   **DearFlip.js (CSS e JS):** Biblioteca que renderiza o leitor de revistas interativo.
-   **Font Awesome:** Para a utilização de ícones em toda a aplicação.

## 🛠️ Comandos Úteis do Angular CLI

-   **Gerar um novo componente:**
    ```bash
    ng generate component nome-do-componente
    ```
-   **Build para produção:**
    ```bash
    ng build
    ```
-   **Executar testes unitários:**
    ```bash
    ng test
    ```

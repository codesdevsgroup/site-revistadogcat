// JS do tema DogCat
// Coloque aqui interações simples de UI (ex.: toggle de menus, etc.)
(function(){
  // Exemplo: fechar navbar ao clicar em item (para mobile)
  document.addEventListener('click', function(e){
    const nav = document.querySelector('.navbar-collapse');
    if (!nav) return;
    if (e.target.matches('.navbar-collapse .nav-link') && nav.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(nav) || new bootstrap.Collapse(nav);
      bsCollapse.hide();
    }
  });
})();
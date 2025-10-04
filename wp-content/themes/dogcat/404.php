<?php
/**
 * Template para página 404 (não encontrado)
 */
get_header();
?>

<main class="container my-5 text-center">
  <h1 class="display-5">Página não encontrada</h1>
  <p class="lead">Ops! O conteúdo que você procura não existe ou foi movido.</p>
  <a href="<?php echo esc_url( home_url('/') ); ?>" class="btn btn-primary mt-3">Voltar para a Home</a>
  <?php get_search_form(); ?>
  
</main>

<?php get_footer(); ?>
<?php
/**
 * Template para exibição de um Artigo (CPT: artigo)
 */
get_header();
?>

<main class="container my-4">
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
    <article <?php post_class('single-artigo'); ?>>
      <h1 class="mb-2"><?php the_title(); ?></h1>
      <div class="text-muted mb-3"><?php echo get_the_date(); ?> • <?php the_author(); ?></div>
      <?php if ( has_post_thumbnail() ) : ?>
        <div class="mb-3">
          <?php the_post_thumbnail('large', ['class' => 'img-fluid rounded']); ?>
        </div>
      <?php endif; ?>
      <div class="content">
        <?php the_content(); ?>
      </div>
      <div class="mt-4">
        <?php
          // Ajuste o slug da taxonomia conforme o registrado em functions.php
          the_terms( get_the_ID(), 'categoria-artigos', '<span class="badge text-bg-secondary me-1">', '</span><span class="badge text-bg-secondary me-1">', '</span>' );
        ?>
      </div>
    </article>
    <?php comments_template(); ?>
  <?php endwhile; else : ?>
    <p>Artigo não encontrado.</p>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
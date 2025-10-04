<?php
/**
 * Template base do tema (fallback)
 */
get_header();
?>

<main class="container my-4">
  <?php if ( have_posts() ) : ?>
    <div class="row">
      <?php while ( have_posts() ) : the_post(); ?>
        <article <?php post_class('col-12 col-md-6 col-lg-4 mb-4'); ?>>
          <div class="card h-100">
            <?php if ( has_post_thumbnail() ) : ?>
              <a href="<?php the_permalink(); ?>"><?php the_post_thumbnail('medium', ['class' => 'card-img-top']); ?></a>
            <?php endif; ?>
            <div class="card-body">
              <h2 class="h5 card-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
              <p class="card-text"><?php echo wp_trim_words( get_the_excerpt(), 20, '...' ); ?></p>
            </div>
            <div class="card-footer bg-transparent">
              <a href="<?php the_permalink(); ?>" class="btn btn-primary btn-sm">Ler mais</a>
            </div>
          </div>
        </article>
      <?php endwhile; ?>
    </div>
    <nav>
      <?php the_posts_pagination([
        'prev_text' => '«',
        'next_text' => '»',
      ]); ?>
    </nav>
  <?php else : ?>
    <p>Nenhum conteúdo encontrado.</p>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
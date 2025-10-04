<?php
/**
 * Template para páginas estáticas
 */
get_header();
?>

<main class="container my-4">
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
    <article <?php post_class('page'); ?>>
      <h1 class="mb-3"><?php the_title(); ?></h1>
      <?php if ( has_post_thumbnail() ) : ?>
        <div class="mb-3">
          <?php the_post_thumbnail('large', ['class' => 'img-fluid rounded']); ?>
        </div>
      <?php endif; ?>
      <div class="content">
        <?php the_content(); ?>
      </div>
    </article>
    <?php comments_template(); ?>
  <?php endwhile; endif; ?>
</main>

<?php get_footer(); ?>
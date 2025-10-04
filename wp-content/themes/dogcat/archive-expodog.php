<?php /* Arquivo de listagem de ExpoDog */
get_header(); ?>

<main class="container my-4">
  <h1 class="mb-4"><?php post_type_archive_title(); ?></h1>

  <?php if ( have_posts() ) : ?>
    <div class="row">
      <?php while ( have_posts() ) : the_post(); ?>
        <article <?php post_class('col-12 col-md-4 col-lg-3 mb-4'); ?>>
          <div class="card h-100">
            <?php if ( has_post_thumbnail() ) : ?>
              <a href="<?php the_permalink(); ?>" class="ratio ratio-1x1">
                <?php the_post_thumbnail('medium', ['class' => 'card-img-top object-fit-cover']); ?>
              </a>
            <?php endif; ?>
            <div class="card-body">
              <h2 class="h6 card-title"><a href="<?php the_permalink(); ?>" class="stretched-link text-decoration-none"><?php the_title(); ?></a></h2>
              <?php if ( has_excerpt() ) : ?>
                <p class="card-text text-muted"><?php echo wp_trim_words( get_the_excerpt(), 16, '...' ); ?></p>
              <?php endif; ?>
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
    <p>Nenhum item encontrado.</p>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
<?php /* Arquivo de listagem de Artigos */
get_header(); ?>

<main class="container my-4">
  <h1 class="mb-4"><?php post_type_archive_title(); ?></h1>

  <?php if ( have_posts() ) : ?>
    <div class="row">
      <?php while ( have_posts() ) : the_post(); ?>
        <article <?php post_class('col-12 col-md-6 col-lg-4 mb-4'); ?>>
          <div class="card h-100">
            <?php if ( has_post_thumbnail() ) : ?>
              <a href="<?php the_permalink(); ?>"><?php the_post_thumbnail('medium', ['class' => 'card-img-top']); ?></a>
            <?php endif; ?>
            <div class="card-body">
              <h2 class="h6 card-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
              <p class="card-text"><?php echo wp_trim_words( get_the_excerpt(), 18, '...' ); ?></p>
            </div>
            <div class="card-footer bg-transparent">
              <a href="<?php the_permalink(); ?>" class="btn btn-outline-primary btn-sm">Ler mais</a>
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
    <p>Nenhum artigo encontrado.</p>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
<?php get_header(); ?>

<main class="container py-4">
  <h1 class="h3 mb-4">Artigos</h1>

  <?php if (have_posts()) : ?>
    <div class="row g-3">
      <?php while (have_posts()) : the_post(); ?>
        <div class="col-12 col-md-4">
          <article class="card h-100">
            <?php if (has_post_thumbnail()) : ?>
              <a href="<?php the_permalink(); ?>" class="ratio ratio-16x9">
                <?php the_post_thumbnail('medium_large', ['class' => 'card-img-top object-fit-cover']); ?>
              </a>
            <?php endif; ?>
            <div class="card-body">
              <h2 class="h6 card-title"><a href="<?php the_permalink(); ?>" class="stretched-link text-decoration-none"><?php the_title(); ?></a></h2>
              <p class="card-text text-muted"><?php echo wp_trim_words( get_the_excerpt(), 20 ); ?></p>
            </div>
          </article>
        </div>
      <?php endwhile; ?>
    </div>

    <div class="mt-4">
      <?php the_posts_pagination(['mid_size' => 2]); ?>
    </div>
  <?php else : ?>
    <p>Nenhum artigo encontrado.</p>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
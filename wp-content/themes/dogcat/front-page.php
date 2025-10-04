<?php /* Página inicial do tema DogCat */ ?>
<?php get_header(); ?>

<main class="home-container">
  <!-- Hero section portado do Angular -->
  <header class="hero-section">
    <div class="container">
      <div class="row align-items-center min-vh-100">
        <div class="col-lg-6 col-md-12">
          <div class="hero-content">
            <div class="welcome-badge">
              <span>🐾</span>
              Seja bem-vindo
            </div>

            <h1 class="hero-title">
              Seu portal de conteúdo para
              <span class="highlight-text">cães e gatos</span>
            </h1>

            <p class="hero-description">
              A Revista Dog & Cat BR é sua fonte confiável de informações sobre cuidados,
              saúde e bem-estar dos seus pets. Conteúdo especializado feito por quem ama animais.
            </p>

            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">132M</span>
                <span class="stat-label">Pets no Brasil</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">40%</span>
                <span class="stat-label">Lares com pets</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">15+</span>
                <span class="stat-label">Anos de experiência</span>
              </div>
            </div>

            <div class="hero-actions">
              <a class="btn btn-primary-hero" href="#assinaturas">
                <span class="btn-icon">📖</span>
                Seja um Assinante
              </a>
              <a class="btn btn-secondary-hero" href="#edicoes">
                <span class="btn-icon">👁️</span>
                Ver Edições
              </a>
            </div>
          </div>
        </div>

        <div class="col-lg-6 col-md-12">
          <div class="hero-visual">
            <div class="magazine-showcase">
              <div class="magazine-cover">
                <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/capa.png' ); ?>" alt="Capa da Revista Dog & Cat" class="img-fluid">
                <div class="magazine-badge">Nova Edição</div>
              </div>

              <div class="floating-elements">
                <div class="floating-card card-1">
                  <span class="card-icon">🏆</span>
                  <span class="card-text">Expo Dog BR</span>
                </div>
                <div class="floating-card card-2">
                  <span class="card-icon">⭐</span>
                  <span class="card-text">Top Canis</span>
                </div>
                <div class="floating-card card-3">
                  <span class="card-icon">🐱</span>
                  <span class="card-text">Top Gatis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hero-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
  </header>

  <!-- Conteúdo da página (editável no painel) -->
  <?php if (have_posts()) : ?>
    <section class="page-content mb-4">
      <?php while (have_posts()) : the_post(); ?>
        <div class="content">
          <?php the_content(); ?>
        </div>
      <?php endwhile; ?>
    </section>
  <?php endif; ?>

  <!-- Destaques de Artigos -->
  <section class="mb-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="h4 mb-0">Artigos Recentes</h2>
      <a href="<?php echo esc_url( get_post_type_archive_link('artigo') ); ?>" class="btn btn-sm btn-outline-primary">Ver todos</a>
    </div>
    <div class="row g-3">
      <?php
        $artigos = new WP_Query([
          'post_type'      => 'artigo',
          'posts_per_page' => 6,
        ]);
        if ($artigos->have_posts()) :
          while ($artigos->have_posts()) : $artigos->the_post(); ?>
            <div class="col-12 col-md-4">
              <article class="card h-100">
                <?php if (has_post_thumbnail()) : ?>
                  <a href="<?php the_permalink(); ?>" class="ratio ratio-16x9">
                    <?php the_post_thumbnail('medium_large', ['class' => 'card-img-top object-fit-cover']); ?>
                  </a>
                <?php endif; ?>
                <div class="card-body">
                  <h3 class="h6 card-title"><a href="<?php the_permalink(); ?>" class="stretched-link text-decoration-none"><?php the_title(); ?></a></h3>
                  <p class="card-text text-muted"><?php echo wp_trim_words( get_the_excerpt(), 20 ); ?></p>
                </div>
              </article>
            </div>
          <?php endwhile; wp_reset_postdata();
        else : ?>
          <p>Nenhum artigo encontrado.</p>
        <?php endif; ?>
    </div>
  </section>

  <!-- Destaques ExpoDog -->
  <section>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="h4 mb-0">ExpoDog</h2>
      <a href="<?php echo esc_url( get_post_type_archive_link('expodog') ); ?>" class="btn btn-sm btn-outline-primary">Ver todos</a>
    </div>
    <div class="row g-3">
      <?php
        $expo = new WP_Query([
          'post_type'      => 'expodog',
          'posts_per_page' => 6,
        ]);
        if ($expo->have_posts()) :
          while ($expo->have_posts()) : $expo->the_post(); ?>
            <div class="col-12 col-md-3">
              <article class="card h-100">
                <?php if (has_post_thumbnail()) : ?>
                  <a href="<?php the_permalink(); ?>" class="ratio ratio-1x1">
                    <?php the_post_thumbnail('medium', ['class' => 'card-img-top object-fit-cover']); ?>
                  </a>
                <?php endif; ?>
                <div class="card-body">
                  <h3 class="h6 card-title"><a href="<?php the_permalink(); ?>" class="stretched-link text-decoration-none"><?php the_title(); ?></a></h3>
                </div>
              </article>
            </div>
          <?php endwhile; wp_reset_postdata();
        else : ?>
          <p>Nenhum item encontrado.</p>
        <?php endif; ?>
    </div>
  </section>
</main>

<?php get_footer(); ?>
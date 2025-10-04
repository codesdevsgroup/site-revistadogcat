<?php /* Cabeçalho do tema DogCat */ ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
  <link rel="icon" href="<?php echo esc_url( get_site_icon_url() ); ?>">
  <title><?php bloginfo('name'); ?></title>
</head>
<body <?php body_class(); ?>>

<nav class="navbar navbar-expand-lg shadow-sm fixed-top">
  <div class="container">
    <!-- Brand -->
    <a class="navbar-brand d-flex align-items-center" href="<?php echo esc_url(home_url('/')); ?>">
      <?php
        // Se você tiver um logo, pode usar the_custom_logo();
        if ( function_exists('the_custom_logo') && has_custom_logo() ) {
          the_custom_logo();
        } else {
          echo esc_html( get_bloginfo('name') );
        }
      ?>
    </a>

    <!-- Mobile Toggle Button -->
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#primaryNav" aria-controls="primaryNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Navigation Menu -->
    <div class="navbar-collapse collapse" id="primaryNav">
      <?php
        wp_nav_menu([
          'theme_location' => 'primary',
          'container'      => false,
          'menu_class'     => 'navbar-nav ms-auto align-items-center',
          'fallback_cb'    => false,
          'depth'          => 2,
        ]);
      ?>

      <!-- Botão de Login (quando não autenticado no WP) -->
      <?php if ( ! is_user_logged_in() ) : ?>
        <a class="btn btn-login ms-lg-3" href="<?php echo esc_url( wp_login_url() ); ?>">
          <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
          Login
        </a>
      <?php else : ?>
        <div class="menu-user ms-lg-3">
          <a class="btn btn-outline-secondary" href="<?php echo esc_url( admin_url('profile.php') ); ?>">
            <i class="fas fa-user-circle"></i>
            <span><?php echo esc_html( wp_get_current_user()->display_name ); ?></span>
          </a>
        </div>
      <?php endif; ?>
    </div>
  </div>
</nav>
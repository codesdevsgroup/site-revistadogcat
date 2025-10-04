<?php /* Rodapé do tema DogCat */ ?>

<footer class="border-top mt-5 py-4">
  <div class="container d-flex justify-content-between align-items-center">
    <div class="text-muted">&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?></div>
    <?php
      wp_nav_menu([
        'theme_location' => 'footer',
        'container'      => false,
        'menu_class'     => 'nav',
        'fallback_cb'    => false,
      ]);
    ?>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
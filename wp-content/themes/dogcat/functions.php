<?php
// Enfileira Bootstrap e estilos do tema
function dogcat_enqueue_assets() {
  // Bootstrap 5 CSS via CDN
  wp_enqueue_style(
    'bootstrap',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css',
    [],
    '5.3.6'
  );

  // Estilo principal do tema (compilado de SCSS)
  $theme_version = wp_get_theme()->get('Version');
  wp_enqueue_style(
    'dogcat-main',
    get_template_directory_uri() . '/assets/css/main.css',
    ['bootstrap'],
    $theme_version
  );

  // Bootstrap JS (bundle)
  wp_enqueue_script(
    'bootstrap',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js',
    [],
    '5.3.6',
    true
  );

  // JS do tema
  wp_enqueue_script(
    'dogcat-main',
    get_template_directory_uri() . '/assets/js/main.js',
    ['bootstrap'],
    $theme_version,
    true
  );
}
add_action('wp_enqueue_scripts', 'dogcat_enqueue_assets');

// Registra menus
function dogcat_register_menus() {
  register_nav_menus([
    'primary' => __('Menu Principal', 'dogcat'),
    'footer'  => __('Menu Rodapé', 'dogcat'),
  ]);
}
add_action('after_setup_theme', 'dogcat_register_menus');

// Suportes do tema
function dogcat_theme_supports() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
  add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
}
add_action('after_setup_theme', 'dogcat_theme_supports');

// Registra Custom Post Types: Artigo e ExpoDog
function dogcat_register_cpts() {
  // CPT Artigo
  register_post_type('artigo', [
    'labels' => [
      'name'               => __('Artigos', 'dogcat'),
      'singular_name'      => __('Artigo', 'dogcat'),
      'add_new'            => __('Adicionar Novo', 'dogcat'),
      'add_new_item'       => __('Adicionar Novo Artigo', 'dogcat'),
      'edit_item'          => __('Editar Artigo', 'dogcat'),
      'new_item'           => __('Novo Artigo', 'dogcat'),
      'view_item'          => __('Ver Artigo', 'dogcat'),
      'search_items'       => __('Buscar Artigos', 'dogcat'),
      'not_found'          => __('Nenhum artigo encontrado', 'dogcat'),
      'not_found_in_trash' => __('Nenhum artigo na lixeira', 'dogcat'),
    ],
    'public'       => true,
    'show_in_rest' => true, // Gutenberg
    'menu_icon'    => 'dashicons-media-document',
    'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'author', 'revisions'],
    'has_archive'  => true,
    'rewrite'      => ['slug' => 'artigos'],
  ]);

  // CPT ExpoDog
  register_post_type('expodog', [
    'labels' => [
      'name'               => __('ExpoDog', 'dogcat'),
      'singular_name'      => __('Item ExpoDog', 'dogcat'),
      'add_new_item'       => __('Adicionar Item ExpoDog', 'dogcat'),
      'edit_item'          => __('Editar Item ExpoDog', 'dogcat'),
      'new_item'           => __('Novo Item ExpoDog', 'dogcat'),
      'view_item'          => __('Ver Item ExpoDog', 'dogcat'),
      'search_items'       => __('Buscar ExpoDog', 'dogcat'),
      'not_found'          => __('Nenhum item encontrado', 'dogcat'),
    ],
    'public'       => true,
    'show_in_rest' => true,
    'menu_icon'    => 'dashicons-pets',
    'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'author', 'revisions'],
    'has_archive'  => true,
    'rewrite'      => ['slug' => 'expo-dog'],
  ]);
}
add_action('init', 'dogcat_register_cpts');

// Registra taxonomias para Artigo e ExpoDog
function dogcat_register_taxonomies() {
  // Categoria para Artigos
  register_taxonomy('categoria_artigo', 'artigo', [
    'labels' => [
      'name'          => __('Categorias de Artigo', 'dogcat'),
      'singular_name' => __('Categoria de Artigo', 'dogcat'),
    ],
    'public'       => true,
    'show_in_rest' => true,
    'hierarchical' => true,
    'rewrite'      => ['slug' => 'categoria-artigo'],
  ]);

  // Categoria para ExpoDog
  register_taxonomy('categoria_expodog', 'expodog', [
    'labels' => [
      'name'          => __('Categorias ExpoDog', 'dogcat'),
      'singular_name' => __('Categoria ExpoDog', 'dogcat'),
    ],
    'public'       => true,
    'show_in_rest' => true,
    'hierarchical' => true,
    'rewrite'      => ['slug' => 'categoria-expodog'],
  ]);
}
add_action('init', 'dogcat_register_taxonomies');
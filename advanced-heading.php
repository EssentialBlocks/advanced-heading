<?php

/**
 * Plugin Name:     Advanced Heading
 * Description:     Create Advanced Heading with Title, Subtitle and Separator Controls. Rebuilt from the Essential Blocks codebase as a standalone, FREE-only block.
 * Version:         2.0.0
 * Author:          WPDeveloper
 * Author URI:      https://wpdeveloper.net
 * License:         GPL-3.0-or-later
 * License URI:     https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:     advanced-heading
 * Requires at least: 6.6
 * Requires PHP:    7.4
 *
 * @package         advanced-heading
 *
 * ---------------------------------------------------------------------------
 *  ABOUT THIS PLUGIN
 * ---------------------------------------------------------------------------
 *  This is the standalone "Advanced Heading" block. The same block also ships
 *  inside Essential Blocks (as `essential-blocks/advanced-heading`). This
 *  standalone plugin intentionally keeps its own legacy block name
 *  `advanced-heading/advanced-heading` so that content created by existing
 *  users keeps validating and rendering exactly as before.
 *
 *  Design goals (see readme.txt → Upgrade Notice for the full story):
 *   1. Existing content must NEVER break.
 *   2. If anything goes wrong, fail softly with a friendly notice — never a
 *      fatal error / white screen.
 *   3. FREE-only. No PRO code paths are bundled or required.
 *   4. When Essential Blocks is active, defer to it gracefully.
 * ---------------------------------------------------------------------------
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! defined( 'ADVANCEDHEADING_BLOCK_VERSION' ) ) {
    define( 'ADVANCEDHEADING_BLOCK_VERSION', '2.0.0' );
}
if ( ! defined( 'ADVANCEDHEADING_BLOCK_ADMIN_URL' ) ) {
    define( 'ADVANCEDHEADING_BLOCK_ADMIN_URL', plugin_dir_url( __FILE__ ) );
}
if ( ! defined( 'ADVANCEDHEADING_BLOCK_ADMIN_PATH' ) ) {
    define( 'ADVANCEDHEADING_BLOCK_ADMIN_PATH', dirname( __FILE__ ) );
}

/**
 * Show a friendly, dismissible admin notice instead of throwing a fatal error.
 *
 * @param string $message Already-translated message.
 * @param string $type    info|success|warning|error. Defaults to info (positive tone).
 */
function advanced_heading_admin_notice( $message, $type = 'info' ) {
    add_action( 'admin_notices', function () use ( $message, $type ) {
        printf(
            '<div class="notice notice-%1$s is-dismissible"><p><strong>%2$s</strong> %3$s</p></div>',
            esc_attr( $type ),
            esc_html__( 'Advanced Heading:', 'advanced-heading' ),
            wp_kses_post( $message )
        );
    } );
}

/**
 * Is Essential Blocks active on this site?
 *
 * The same Advanced Heading block ships inside Essential Blocks under the
 * `essential-blocks/advanced-heading` name. When EB is present we defer to it
 * to avoid a duplicate block in the inserter. Existing content created by THIS
 * plugin (`advanced-heading/advanced-heading`) keeps rendering either way:
 * it is a static block, so its saved HTML is output on the frontend regardless
 * of which plugin is active, and EB's own style handler regenerates its CSS.
 *
 * @return bool
 */
function advanced_heading_is_essential_blocks_active() {
    return (
        class_exists( 'EssentialBlocks\\Plugin' )
        || defined( 'ESSENTIAL_BLOCKS_VERSION' )
        || function_exists( 'wpdev_essential_blocks' )
    );
}

/**
 * Decide whether to boot the standalone block, or defer to Essential Blocks.
 *
 * Runs late on `plugins_loaded` so every other plugin (including Essential
 * Blocks) has had a chance to load and declare itself.
 */
function advanced_heading_bootstrap() {
    if ( advanced_heading_is_essential_blocks_active() ) {
        // Defer to Essential Blocks. Stay dormant — but reassure the user that
        // nothing is broken and their existing headings keep working.
        advanced_heading_admin_notice(
            sprintf(
                /* translators: %s: Essential Blocks plugin name. */
                esc_html__( 'Advanced Heading is now part of %s, which is active on your site. Your existing headings keep working — you can safely keep this plugin or deactivate it.', 'advanced-heading' ),
                '<a href="https://essential-blocks.com" target="_blank" rel="noopener">Essential Blocks</a>'
            ),
            'info'
        );
        return;
    }

    // Standalone mode: load our self-contained, FREE-only support layer.
    $support_files = [
        ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/includes/font-loader.php',
        ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/includes/post-meta.php',
        ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/includes/helpers.php',
        ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/includes/render.php',
        ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/lib/style-handler/style-handler.php',
    ];

    foreach ( $support_files as $file ) {
        if ( file_exists( $file ) ) {
            require_once $file;
        }
    }

    add_action( 'init', 'create_block_advanced_heading_block_init', 99 );
    add_action( 'enqueue_block_editor_assets', 'advanced_heading_hide_pro_panels' );
}
add_action( 'plugins_loaded', 'advanced_heading_bootstrap', 20 );

/**
 * FREE-only: hide every PRO upsell panel in the block's "Advanced" tab.
 *
 * The shared controls bundle always renders the PRO panel wrappers (Transform,
 * Interactive Animation, Conditional Display, Protected Content) — the PRO
 * plugin fills them in. Their child content is already removed via the
 * `eb_advanced_controls_*` filters (see registration), and here we hide the
 * panel wrappers themselves so no PRO feature is shown or offered at all.
 *
 * The "Liquid Glass Effect" panel is also hidden here (a marker class is added
 * to it in the controls bundle) per the FREE-only requirement.
 */
function advanced_heading_hide_pro_panels() {
    $css = '.components-panel__body.eb-transform-animation,'
        . '.components-panel__body.eb-interactive-animation,'
        . '.components-panel__body.eb-condition-display,'
        . '.components-panel__body.eb-protected-content,'
        . '.components-panel__body.eb-liquid-glass-panel'
        . '{display:none !important;}';

    wp_register_style( 'advanced-heading-hide-pro', false );
    wp_enqueue_style( 'advanced-heading-hide-pro' );
    wp_add_inline_style( 'advanced-heading-hide-pro', $css );
}

/**
 * Data exposed to the editor controls bundle as `EssentialBlocksLocalize`.
 *
 * The controls bundle (shared with Essential Blocks) expects a number of
 * fields — most importantly the global color / gradient palettes and the
 * responsive breakpoints. If they are missing, some inspector controls throw
 * while rendering (e.g. a color palette calling `.forEach` on undefined). We
 * provide the same defaults Essential Blocks ships, so every control works.
 *
 * @return array
 */
function advanced_heading_localize_data() {
    $global_colors = [
        [ 'color' => '#101828', 'name' => 'Primary Color', 'slug' => 'primary', 'var' => '--eb-global-primary-color' ],
        [ 'color' => '#475467', 'name' => 'Secondary Color', 'slug' => 'secondary', 'var' => '--eb-global-secondary-color' ],
        [ 'color' => '#98A2B3', 'name' => 'Tertiary Color', 'slug' => 'tertiary', 'var' => '--eb-global-tertiary-color' ],
        [ 'color' => '#475467', 'name' => 'Text Color', 'slug' => 'text', 'var' => '--eb-global-text-color' ],
        [ 'color' => '#1D2939', 'name' => 'Heading Color', 'slug' => 'heading', 'var' => '--eb-global-heading-color' ],
        [ 'color' => '#444CE7', 'name' => 'Link Color', 'slug' => 'link', 'var' => '--eb-global-link-color' ],
        [ 'color' => '#F9FAFB', 'name' => 'Background Color', 'slug' => 'background', 'var' => '--eb-global-background-color' ],
        [ 'color' => '#FFFFFF', 'name' => 'Button Text Color', 'slug' => 'buttonText', 'var' => '--eb-global-button-text-color' ],
        [ 'color' => '#101828', 'name' => 'Button Background Color', 'slug' => 'buttonBackground', 'var' => '--eb-global-button-background-color' ],
    ];

    $gradient_colors = [
        [ 'color' => 'linear-gradient(90deg, hsla(259, 84%, 78%, 1) 0%, hsla(206, 67%, 75%, 1) 100%)', 'name' => 'Primary Color', 'slug' => 'gradientPrimary', 'var' => '--eb-gradient-primary-color' ],
        [ 'color' => 'linear-gradient(90deg, hsla(18, 76%, 85%, 1) 0%, hsla(203, 69%, 84%, 1) 100%)', 'name' => 'Secondary Color', 'slug' => 'gradientSecondary', 'var' => '--eb-gradient-secondary-color' ],
        [ 'color' => 'linear-gradient(90deg, hsla(248, 21%, 15%, 1) 0%, hsla(250, 14%, 61%, 1) 100%)', 'name' => 'Tertiary Color', 'slug' => 'gradientTertiary', 'var' => '--eb-gradient-tertiary-color' ],
        [ 'color' => 'linear-gradient(90deg, rgb(250, 250, 250) 0%, rgb(233, 233, 233) 49%, rgb(244, 243, 243) 100%)', 'name' => 'Background Color', 'slug' => 'gradientBackground', 'var' => '--eb-gradient-background-color' ],
    ];

    return [
        'eb_plugins_url'        => ADVANCEDHEADING_BLOCK_ADMIN_URL,
        'image_url'             => ADVANCEDHEADING_BLOCK_ADMIN_URL . 'lib/resources',
        'eb_wp_version'         => (float) get_bloginfo( 'version' ),
        'eb_version'            => ADVANCEDHEADING_BLOCK_VERSION,
        'eb_admin_url'          => get_admin_url(),
        'rest_rootURL'          => get_rest_url(),
        'ajax_url'              => admin_url( 'admin-ajax.php' ),
        'admin_nonce'           => wp_create_nonce( 'admin-nonce' ),
        'is_pro_active'         => 'false',
        'fontAwesome'           => 'true',
        'googleFont'            => 'true',
        'quickToolbar'          => false,
        'responsiveBreakpoints' => [ 'tablet' => 1024, 'mobile' => 767 ],
        'globalColors'          => $global_colors,
        'gradientColors'        => $gradient_colors,
        // Block enable/disable maps are EB-only concepts; empty objects keep the
        // controls happy without gating our standalone block.
        'all_blocks'            => (object) [],
        'all_blocks_default'    => (object) [],
        'quick_toolbar_blocks'  => [],
        'unfilter_capability'   => current_user_can( 'unfiltered_html' ) ? 'true' : 'false',
        'is_admin_user'         => current_user_can( 'manage_options' ) ? 'true' : 'false',
    ];
}

/**
 * Registers all block assets and the block type itself.
 *
 * Wrapped so that a missing build artifact (or any unexpected condition) shows
 * a friendly admin notice instead of crashing the site — the old version threw
 * a fatal `Error` here.
 */
function create_block_advanced_heading_block_init() {
    $script_asset_path = ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/dist/index.asset.php';

    if ( ! file_exists( $script_asset_path ) ) {
        advanced_heading_admin_notice(
            esc_html__( 'The block assets are missing. Please reinstall the plugin or run the build step. Your existing content is unaffected.', 'advanced-heading' ),
            'warning'
        );
        return;
    }

    // Already registered (e.g. by another copy / Essential Blocks)? Bail safely.
    if ( WP_Block_Type_Registry::get_instance()->is_registered( 'advanced-heading/advanced-heading' )
        || WP_Block_Type_Registry::get_instance()->is_registered( 'essential-blocks/advanced-heading' ) ) {
        return;
    }

    $index_js     = ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/index.js';
    $script_asset = require $script_asset_path;

    /**
     * Register the shared controls bundle (modules.js) UNCONDITIONALLY here.
     *
     * The editor script depends on this handle. If it were only registered on a
     * narrow set of admin pages (as in older versions), any editor screen that
     * didn't match would cause WordPress to silently drop the editor script —
     * and the block would show as an "unsupported block". Registering it on
     * `init` guarantees the dependency always resolves. The bundle only actually
     * loads when the editor script is enqueued (i.e. inside the block editor),
     * so there is no frontend cost.
     */
    $modules_asset_path = ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/dist/modules.asset.php';
    if ( file_exists( $modules_asset_path ) && ! wp_script_is( 'advancedheading-block-controls-util', 'registered' ) ) {
        $modules_asset = require $modules_asset_path;
        $modules_deps  = ( isset( $modules_asset['dependencies'] ) && is_array( $modules_asset['dependencies'] ) ) ? $modules_asset['dependencies'] : [];

        // The controls bundle uses Babel's async/generator transform, which
        // relies on the global `regeneratorRuntime`. That is NOT listed in the
        // build's .asset.php, so it must be added explicitly (Essential Blocks
        // does the same) — otherwise modules.js throws on load and the block's
        // controls global never gets defined.
        $modules_deps = array_merge( $modules_deps, [ 'regenerator-runtime', 'wp-polyfill', 'lodash' ] );

        wp_register_script(
            'advancedheading-block-controls-util',
            ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/modules.js',
            array_unique( $modules_deps ),
            // Suffix with the plugin version so the (FREE-only patched) bundle
            // is re-fetched whenever we ship a new build.
            $modules_asset['version'] . '-' . ADVANCEDHEADING_BLOCK_VERSION,
            true
        );

        wp_localize_script( 'advancedheading-block-controls-util', 'EssentialBlocksLocalize', advanced_heading_localize_data() );

        // edit-site vs edit-post is only used for the (optional) quick toolbar.
        $editor_type = ( isset( $GLOBALS['pagenow'] ) && in_array( $GLOBALS['pagenow'], [ 'site-editor.php', 'themes.php' ], true ) ) ? 'edit-site' : 'edit-post';
        wp_localize_script( 'advancedheading-block-controls-util', 'eb_conditional_localize', [
            'editor_type' => $editor_type,
        ] );

        /**
         * FREE-only: remove every PRO upsell panel from the block's "Advanced" tab.
         *
         * The shared controls bundle renders each PRO panel through an
         * `applyFilters()` hook whose default value is the upsell panel (the PRO
         * plugin normally hooks in to replace it with the real control). Since
         * this is a FREE-only plugin, we register filters that return `null`,
         * which removes those panels entirely — no PRO features are offered.
         */
        $pro_panel_hooks = [
            'eb_advanced_controls_transform_animation',   // Transform
            'eb_advanced_controls_interactive_animation', // Interactive Animation
            'eb_advanced_controls_conditional_display',   // Conditional Display
            'eb_advanced_controls_protected_content',     // Protected Content
        ];
        $hooks_json = wp_json_encode( $pro_panel_hooks );
        $inline_js  = '( function ( wp ) {'
            . 'if ( ! wp || ! wp.hooks || ! wp.hooks.addFilter ) { return; }'
            . 'var hooks = ' . $hooks_json . ';'
            . 'hooks.forEach( function ( hook ) {'
            . 'wp.hooks.addFilter( hook, "advanced-heading/free-only", function () { return null; } );'
            . '} );'
            . '} )( window.wp );';
        wp_add_inline_script( 'advancedheading-block-controls-util', $inline_js, 'after' );
    }

    // Editor control styling (icon picker + controls UI). Registered here so it
    // can be attached to the block's editor_style and load in every editor.
    if ( file_exists( ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/dist/style-modules.css' ) ) {
        wp_register_style(
            'essential-blocks-iconpicker-css',
            ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/style-modules.css',
            [],
            ADVANCEDHEADING_BLOCK_VERSION,
            'all'
        );
    }
    if ( file_exists( ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/dist/modules.css' ) ) {
        wp_register_style(
            'essential-blocks-editor-css',
            ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/modules.css',
            array_filter( [ wp_style_is( 'essential-blocks-iconpicker-css', 'registered' ) ? 'essential-blocks-iconpicker-css' : null ] ),
            ADVANCEDHEADING_BLOCK_VERSION,
            'all'
        );
    }

    $all_dependencies = array_merge(
        ( isset( $script_asset['dependencies'] ) && is_array( $script_asset['dependencies'] ) ) ? $script_asset['dependencies'] : [],
        [
            'wp-blocks',
            'wp-i18n',
            'wp-element',
            'wp-block-editor',
            'lodash',
            'advancedheading-block-controls-util',
            'essential-blocks-eb-animation',
        ]
    );

    wp_register_script(
        'create-block-advancedheading-block-editor-script',
        $index_js,
        $all_dependencies,
        $script_asset['version'],
        true
    );

    wp_register_script(
        'essential-blocks-eb-animation',
        ADVANCEDHEADING_BLOCK_ADMIN_URL . 'lib/resources/js/eb-animation-load.js',
        [],
        ADVANCEDHEADING_BLOCK_VERSION,
        true
    );

    wp_register_style(
        'fontawesome-frontend-css',
        ADVANCEDHEADING_BLOCK_ADMIN_URL . 'lib/resources/css/font-awesome5.css',
        [],
        ADVANCEDHEADING_BLOCK_VERSION
    );

    wp_register_style(
        'fontpicker-default-theme',
        ADVANCEDHEADING_BLOCK_ADMIN_URL . 'lib/resources/css/fonticonpicker.base-theme.react.css',
        [],
        ADVANCEDHEADING_BLOCK_VERSION,
        'all'
    );

    wp_register_style(
        'fontpicker-material-theme',
        ADVANCEDHEADING_BLOCK_ADMIN_URL . 'lib/resources/css/fonticonpicker.material-theme.react.css',
        [],
        ADVANCEDHEADING_BLOCK_VERSION,
        'all'
    );

    wp_register_style(
        'essential-blocks-animation',
        ADVANCEDHEADING_BLOCK_ADMIN_URL . 'lib/resources/css/animate.min.css',
        [],
        ADVANCEDHEADING_BLOCK_VERSION
    );

    $style_css = ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/style.css';

    // Editor-only block styles (compiled from editor.scss). Optional.
    if ( file_exists( ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/dist/editor.css' ) ) {
        wp_register_style(
            'create-block-advancedheading-block-editor-only-style',
            ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/editor.css',
            [],
            ADVANCEDHEADING_BLOCK_VERSION
        );
    }

    // Editor Style.
    wp_register_style(
        'create-block-advancedheading-block-editor-style',
        $style_css,
        array_filter( [
            'fontawesome-frontend-css',
            'fontpicker-default-theme',
            'fontpicker-material-theme',
            'essential-blocks-animation',
            wp_style_is( 'essential-blocks-iconpicker-css', 'registered' ) ? 'essential-blocks-iconpicker-css' : null,
            wp_style_is( 'essential-blocks-editor-css', 'registered' ) ? 'essential-blocks-editor-css' : null,
            wp_style_is( 'create-block-advancedheading-block-editor-only-style', 'registered' ) ? 'create-block-advancedheading-block-editor-only-style' : null,
        ] ),
        ADVANCEDHEADING_BLOCK_VERSION
    );

    // Frontend Style.
    wp_register_style(
        'create-block-advancedheading-block-frontend-style',
        $style_css,
        [
            'fontawesome-frontend-css',
            'essential-blocks-animation',
        ],
        ADVANCEDHEADING_BLOCK_VERSION
    );

    register_block_type(
        Advanced_Heading_Helper::get_block_register_path( 'advanced-heading/advanced-heading', ADVANCEDHEADING_BLOCK_ADMIN_PATH ),
        [
            'editor_script'   => 'create-block-advancedheading-block-editor-script',
            'editor_style'    => 'create-block-advancedheading-block-editor-style',
            'render_callback' => 'advanced_heading_render_callback',
        ]
    );
}

/**
 * Frontend render callback.
 *
 * Advanced Heading is a static block: the saved markup lives in post content,
 * so we simply return it after enqueuing the frontend assets. The whole thing
 * is exception-guarded so a broken edge case degrades to "show the saved
 * content" rather than a fatal error.
 *
 * Handles both modes:
 *   - source = "dynamic-title": markup is built in PHP (save() returns null).
 *   - source = "custom" (default): return the saved markup, after inlining any
 *     sanitized custom SVG separator icons.
 *
 * @param array         $attributes Block attributes.
 * @param string        $content    Saved block HTML.
 * @param WP_Block|null $block      Block instance (Loop Builder context).
 * @return string
 */
function advanced_heading_render_callback( $attributes, $content, $block = null ) {
    try {
        if ( ! is_admin() ) {
            wp_enqueue_style( 'create-block-advancedheading-block-frontend-style' );
            wp_enqueue_script( 'essential-blocks-eb-animation' );
        }

        // Dynamic Title source: static save() returned null, build it in PHP.
        if ( isset( $attributes['source'] ) && 'dynamic-title' === $attributes['source'] ) {
            if ( is_admin() ) {
                return '';
            }
            if ( function_exists( 'advanced_heading_render_dynamic_title' ) ) {
                return advanced_heading_render_dynamic_title( $attributes, $block );
            }
            return '';
        }

        // Custom source: inline any sanitized custom SVG separator icons.
        if ( function_exists( 'advanced_heading_inline_svg_icons' ) ) {
            return advanced_heading_inline_svg_icons( $content );
        }
    } catch ( \Throwable $e ) {
        // Never let rendering take down the page — fall back to saved content.
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '[advanced-heading] render failed: ' . $e->getMessage() );
        }
    }

    return $content;
}

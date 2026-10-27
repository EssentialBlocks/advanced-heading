<?php

/**
 * Load google fonts.
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

class Advanced_Heading_Helper
{

    private static $instance;

    /**
     * Registers the plugin.
     */
    public static function register()
    {
        if (null === self::$instance) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    /**
     * The Constructor.
     */
    public function __construct()
    {
        add_action('admin_enqueue_scripts', array($this, 'enqueues'));
    }

    /**
     * Load fonts.
     *
     * @access public
     */
    public function enqueues()
    {
        global $pagenow;

        /**
         * Only for admin add/edit pages/posts
         */
        $query_string = isset($_SERVER['QUERY_STRING']) ? sanitize_text_field(wp_unslash($_SERVER['QUERY_STRING'])) : '';

        if ($pagenow == 'post-new.php' || $pagenow == 'post.php' || $pagenow == 'site-editor.php' || ($pagenow == 'themes.php' && !empty($query_string) && str_contains($query_string, 'gutenberg-edit-site'))) {

            // `include` (not `include_once`) so the returned array is available even if
            // the file has already been included elsewhere in the request.
            $controls_dependencies = include ADVANCEDHEADING_BLOCK_ADMIN_PATH . '/dist/modules.asset.php';
            if (!is_array($controls_dependencies)) {
                $controls_dependencies = array();
            }
            $controls_dependencies['dependencies'] = isset($controls_dependencies['dependencies']) && is_array($controls_dependencies['dependencies']) ? $controls_dependencies['dependencies'] : array();
            $controls_dependencies['version'] = isset($controls_dependencies['version']) ? $controls_dependencies['version'] : ADVANCEDHEADING_BLOCK_VERSION;

            wp_register_script(
                "advancedheading-block-controls-util",
                ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/modules.js',
                array_merge($controls_dependencies['dependencies'],['lodash']),
                $controls_dependencies['version'],
                true
            );

            // Essential Blocks and other standalone blocks define the same globals.
            // wp_localize_script() would emit `var EssentialBlocksLocalize = {...}` and
            // replace theirs (Essential Blocks' editor then fails on missing keys), so
            // only fill in the keys that are not already set.
            $editor_type = ($pagenow == 'post-new.php' || $pagenow == 'post.php') ? 'edit-post' : 'edit-site';
            wp_add_inline_script(
                'advancedheading-block-controls-util',
                sprintf(
                    'window.EssentialBlocksLocalize = Object.assign(%1$s, window.EssentialBlocksLocalize || {});' .
                    'window.eb_conditional_localize = Object.assign(%2$s, window.eb_conditional_localize || {});',
                    wp_json_encode(array(
                        'eb_wp_version' => (float) get_bloginfo('version'),
                        'rest_rootURL' => get_rest_url(),
                        'fontAwesome' => "true"
                    )),
                    wp_json_encode(array(
                        'editor_type' => $editor_type
                    ))
                ),
                'before'
            );

            wp_register_style(
				'essential-blocks-iconpicker-css',
				ADVANCEDHEADING_BLOCK_ADMIN_URL . 'dist/style-modules.css',
				[],
				ADVANCEDHEADING_BLOCK_VERSION,
				'all'
			);

            wp_enqueue_style(
                'essential-blocks-editor-css',
                ADVANCEDHEADING_BLOCK_ADMIN_URL . '/dist/modules.css',
                array('essential-blocks-iconpicker-css'),
                $controls_dependencies['version'],
                'all'
            );
        }
    }
    public static function get_block_register_path($blockname, $blockPath)
    {
        if ((float) get_bloginfo('version') <= 5.6) {
            return $blockname;
        } else {
            return $blockPath;
        }
    }
}
Advanced_Heading_Helper::register();

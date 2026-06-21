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
        /**
         * The controls bundle (advancedheading-block-controls-util) and all
         * editor control styles are now registered unconditionally on `init`
         * in the main plugin file and wired into the block's editor assets, so
         * they load reliably in every block editor (post, page and site editor).
         * This method is intentionally left as a no-op for backward
         * compatibility with the original class structure.
         */
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

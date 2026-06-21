<?php
/**
 * Server-side rendering helpers for the Advanced Heading block.
 *
 * Ported (FREE-only) from the Essential Blocks codebase so the standalone
 * plugin supports the same free features:
 *   - "Dynamic Title" source (pull the current/looped post title).
 *   - Font Awesome / Dashicon separator icons.
 *   - Inline + sanitized custom SVG separator icons (EBDisplayIconSave).
 *
 * Everything here is defensive: any unexpected condition falls back to
 * returning the already-saved content, never a fatal error.
 *
 * @package advanced-heading
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'Advanced_Heading_Svg_Sanitizer' ) ) {
    /**
     * Minimal, dependency-free SVG sanitizer.
     *
     * Ported verbatim from EssentialBlocks\Utils\SvgSanitizer (the allow-lists
     * are unchanged) so inlined custom SVG icons are stripped of scripts,
     * event handlers, PHP/ASP tags, comments and DOCTYPE/ENTITY declarations.
     */
    class Advanced_Heading_Svg_Sanitizer {
        private static $instance;

        public static function get_instance() {
            if ( null === self::$instance ) {
                self::$instance = new self();
            }
            return self::$instance;
        }

        public function sanitize( $content ) {
            $content = $this->strip_comments( $content );
            $content = $this->strip_php_tags( $content );
            $content = $this->strip_line_breaks( $content );

            $svg = new \DOMDocument();
            libxml_use_internal_errors( true );

            if ( ! $svg->loadXML( $content, LIBXML_NONET ) ) {
                libxml_clear_errors();
                return '';
            }
            libxml_clear_errors();

            $xpath              = new \DOMXPath( $svg );
            $elements           = $xpath->query( '//*' );
            $allowed_elements   = $this->get_allowed_elements();
            $allowed_attributes = $this->get_allowed_attributes();

            foreach ( $elements as $element ) {
                if ( ! in_array( $element->nodeName, $allowed_elements, true ) ) {
                    if ( $element->parentNode ) {
                        $element->parentNode->removeChild( $element );
                    }
                    continue;
                }
                if ( $element->hasAttributes() ) {
                    foreach ( iterator_to_array( $element->attributes ) as $attribute ) {
                        if ( ! in_array( strtolower( $attribute->nodeName ), $allowed_attributes, true ) ) {
                            $element->removeAttribute( $attribute->nodeName );
                        }
                    }
                }
            }

            $this->strip_doctype( $svg );
            return $svg->saveXML();
        }

        private function strip_comments( $content ) {
            $content = preg_replace( '/<!--(.*)-->/Us', '', $content );
            $content = preg_replace( '/\/\*(.*)\*\//Us', '', $content );
            if ( ( false !== strpos( $content, '<!--' ) ) || ( false !== strpos( $content, '/*' ) ) ) {
                return '';
            }
            return $content;
        }

        private function strip_php_tags( $content ) {
            $content = preg_replace( '/<\?(=|php)(.+?)\?>/i', '', $content );
            $content = preg_replace( '/<\?(.*)\?>/Us', '', $content );
            $content = preg_replace( '/<\%(.*)\%>/Us', '', $content );
            if ( ( false !== strpos( $content, '<?' ) ) || ( false !== strpos( $content, '<%' ) ) ) {
                return '';
            }
            return $content;
        }

        private function strip_line_breaks( $content ) {
            return preg_replace( '/\r|\n/', '', $content );
        }

        private function strip_doctype( $document ) {
            if ( $document instanceof \DOMDocument && $document->doctype ) {
                $document->removeChild( $document->doctype );
            }
        }

        private function get_allowed_attributes() {
            $allowed_attributes = [
                'accent-height', 'accumulate', 'additivive', 'alignment-baseline', 'aria-hidden', 'aria-controls',
                'aria-describedby', 'aria-description', 'aria-expanded', 'aria-haspopup', 'aria-label', 'aria-labelledby',
                'aria-roledescription', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency',
                'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clip-path', 'clip-rule', 'clippathunits',
                'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering',
                'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dominant-baseline',
                'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterres',
                'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust',
                'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name',
                'glyphref', 'gradienttransform', 'gradientunits', 'height', 'href', 'id', 'image-rendering', 'in', 'in2',
                'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust',
                'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end',
                'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'mask', 'maskcontentunits',
                'maskunits', 'max', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'opacity',
                'operator', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength',
                'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha',
                'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount',
                'repeatdur', 'requiredfeatures', 'restart', 'result', 'role', 'rotate', 'scale', 'seed', 'shape-rendering',
                'spacing', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation',
                'stitchtiles', 'stop-color', 'stop-opacity', 'stroke', 'stroke-dasharray', 'stroke-dashoffset',
                'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'style',
                'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'transform-origin',
                'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2',
                'underline-position', 'underline-thickness', 'unicode', 'unicode-bidi', 'values', 'vector-effect',
                'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'viewbox', 'visibility', 'width', 'word-spacing',
                'wrap', 'writing-mode', 'x', 'x1', 'x2', 'xchannelselector', 'xlink:href', 'xlink:title', 'xmlns',
                'xmlns:se', 'xmlns:xlink', 'xml:lang', 'xml:space', 'y', 'y1', 'y2', 'ychannelselector', 'z',
                'zoomandpan',
            ];
            return apply_filters( 'advanced_heading/files/svg/allowed_attributes', $allowed_attributes );
        }

        private function get_allowed_elements() {
            $allowed_elements = [
                'a', 'animate', 'animateMotion', 'animateTransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse',
                'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
                'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG',
                'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset',
                'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'foreignobject',
                'g', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern',
                'polygon', 'polyline', 'radialgradient', 'rect', 'set', 'stop', 'style', 'svg', 'switch', 'symbol',
                'text', 'textpath', 'title', 'tspan', 'use', 'view',
            ];
            return apply_filters( 'advanced_heading/files/svg/allowed_elements', $allowed_elements );
        }
    }
}

if ( ! function_exists( 'advanced_heading_get_icon_type' ) ) {
    /**
     * Detect icon type from an icon class string.
     */
    function advanced_heading_get_icon_type( $value ) {
        if ( is_string( $value ) && strpos( $value, 'fa-' ) !== false ) {
            return 'fontawesome';
        }
        return 'dashicon';
    }
}

if ( ! function_exists( 'advanced_heading_render_icon' ) ) {
    /**
     * Render a Font Awesome or Dashicon icon (used by dynamic-title separators).
     */
    function advanced_heading_render_icon( $icon_type, $class_name, $icon ) {
        if ( 'dashicon' === $icon_type ) {
            return '<span class="dashicon dashicons ' . esc_attr( $icon ) . ' ' . esc_attr( $class_name ) . '"></span>';
        } elseif ( 'fontawesome' === $icon_type ) {
            return '<i class="' . esc_attr( $icon ) . ' ' . esc_attr( $class_name ) . '"></i>';
        }
        return '';
    }
}

if ( ! function_exists( 'advanced_heading_inline_svg_icons' ) ) {
    /**
     * Replace EBDisplayIconSave placeholders (`eb-display-icon-svg` + `data-svg-url`)
     * with sanitized inline SVG. Ported from the Essential Blocks Block base.
     */
    function advanced_heading_inline_svg_icons( $content ) {
        if ( is_admin() || empty( $content ) ) {
            return $content;
        }
        if ( strpos( $content, 'eb-display-icon-svg' ) === false || strpos( $content, 'data-svg-url' ) === false ) {
            return $content;
        }

        $pattern = '~<span\b(?=[^>]*\bclass=(["\"]) (?:(?!\\1).)*?\beb-display-icon-svg\b (?:(?!\\1).)*?\\1)(?=[^>]*\bdata-svg-url=(["\"])(.*?)\\2)[^>]*\s*/?>\s*(?:</span>)?~xis';

        $replaced = preg_replace_callback( $pattern, function ( $m ) {
            $url = isset( $m[3] ) ? esc_url_raw( $m[3] ) : '';
            if ( empty( $url ) ) {
                return $m[0];
            }
            $path = wp_parse_url( $url, PHP_URL_PATH );
            if ( ! $path || ! preg_match( '/\.svg($|[?#])/i', $path ) ) {
                return $m[0];
            }

            $cache_key = 'ah_svg_' . md5( $url );
            $svg       = get_transient( $cache_key );

            if ( false === $svg ) {
                $svg = '';
                $res = wp_remote_get( $url, [
                    'timeout'            => 5,
                    'redirection'        => 3,
                    'headers'            => [ 'Accept' => 'image/svg+xml,text/plain,*/*' ],
                    'reject_unsafe_urls' => true,
                ] );
                if ( ! is_wp_error( $res ) && (int) wp_remote_retrieve_response_code( $res ) === 200 ) {
                    $raw = (string) wp_remote_retrieve_body( $res );
                    if ( preg_match( '/<svg[\s\S]*?<\/svg>/i', $raw, $mm ) ) {
                        $raw = $mm[0];
                    }
                    $sanitized = Advanced_Heading_Svg_Sanitizer::get_instance()->sanitize( $raw );
                    if ( ! empty( $sanitized ) ) {
                        $svg = $sanitized;
                    }
                }
                set_transient( $cache_key, $svg, HOUR_IN_SECONDS * 6 );
            }

            if ( ! empty( $svg ) && preg_match( '/\bdata-class-name=(["\'])(.*?)\1/i', $m[0], $mc ) ) {
                $classAttr = trim( $mc[2] );
                if ( '' !== $classAttr ) {
                    $classes = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $classAttr ) ) );
                    if ( ! empty( $classes ) ) {
                        $final = implode( ' ', $classes );
                        $svg   = preg_replace_callback( '/<svg\b([^>]*)>/i', function ( $m2 ) use ( $final ) {
                            $before = $m2[1];
                            if ( preg_match( '/\sclass=(["\'])(.*?)\1/i', $before ) ) {
                                return '<svg' . preg_replace( '/\sclass=(["\'])(.*?)\1/i', ' class=$1' . esc_attr( $final ) . '$1', $before, 1 ) . '>';
                            }
                            return '<svg' . $before . ' class="' . esc_attr( $final ) . '">';
                        }, $svg, 1 );
                    }
                }
            }

            return $svg ?: $m[0];
        }, $content );

        // preg_replace_callback returns null on error — never lose the content.
        return null === $replaced ? $content : $replaced;
    }
}

if ( ! function_exists( 'advanced_heading_render_dynamic_title' ) ) {
    /**
     * Render the "Dynamic Title" source (post title), ported from
     * EssentialBlocks\Blocks\AdvancedHeading::render_callback (FREE behavior).
     *
     * @param array         $attributes Block attributes.
     * @param WP_Block|null $block      Block instance (for Loop Builder context).
     * @return string
     */
    function advanced_heading_render_dynamic_title( $attributes, $block = null ) {
        $defaults = [
            'preset'            => 'button-1',
            'currentPostId'     => 0,
            'tagName'           => 'h2',
            'displaySeperator'  => false,
            'seperatorPosition' => 'bottom',
            'seperatorType'     => 'line',
            'separatorIcon'     => 'fas fa-arrow-circle-down',
            'enableLink'        => false,
            'openInNewTab'      => false,
            'effects'           => '',
            'blockId'           => '',
            'classHook'         => '',
        ];
        $attributes = wp_parse_args( $attributes, $defaults );

        // Resolve post ID from Loop Builder context, then attribute, then current.
        $post_id = null;
        if ( $block && isset( $block->context['essential-blocks/postId'] ) ) {
            $post_id = $block->context['essential-blocks/postId'];
        } elseif ( ! empty( $attributes['currentPostId'] ) ) {
            $post_id = $attributes['currentPostId'];
        }

        $title = $post_id ? get_the_title( $post_id ) : get_the_title();
        if ( ! $title ) {
            return '';
        }

        if ( ! empty( $attributes['titleLength'] ) && intval( $attributes['titleLength'] ) > 0 ) {
            $title = wp_trim_words( $title, intval( $attributes['titleLength'] ), '…' );
        }

        if ( isset( $attributes['version'] ) && '2' === $attributes['version'] ) {
            $title = sprintf( '<span class="first-title">%s</span>', $title );
        }

        $tag_name   = preg_replace( '/[^a-zA-Z0-9]/', '', $attributes['tagName'] );
        $tag_name   = $tag_name ?: 'h2';
        $linkTarget = $attributes['openInNewTab'] ? '_blank' : '';

        if ( ! empty( $attributes['enableLink'] ) ) {
            $rel       = '_blank' === $linkTarget ? 'rel="noopener"' : '';
            $permalink = $post_id ? get_the_permalink( $post_id ) : get_the_permalink();
            $title     = sprintf( '<a href="%1$s" target="%2$s" %3$s>%4$s</a>', esc_url( $permalink ), esc_attr( $linkTarget ), $rel, $title );
        }

        $seperator_icon = '';
        if ( 'icon' === $attributes['seperatorType'] ) {
            $seperator_icon = advanced_heading_render_icon(
                advanced_heading_get_icon_type( $attributes['separatorIcon'] ),
                'eb-button-icon',
                $attributes['separatorIcon']
            );
        }

        $seperator_top = '';
        if ( $attributes['displaySeperator'] && 'top' === $attributes['seperatorPosition'] ) {
            $seperator_top = sprintf( '<div class="eb-ah-separator %1$s">%2$s</div>', esc_attr( $attributes['seperatorType'] ), $seperator_icon );
        }
        $seperator_bottom = '';
        if ( $attributes['displaySeperator'] && 'bottom' === $attributes['seperatorPosition'] ) {
            $seperator_bottom = sprintf( '<div class="eb-ah-separator %1$s">%2$s</div>', esc_attr( $attributes['seperatorType'] ), $seperator_icon );
        }

        $parent_classes = array_filter( [ 'eb-parent-wrapper', 'eb-parent-' . $attributes['blockId'], $attributes['classHook'] ] );
        $wrapper_classes = array_filter( [ 'eb-advance-heading-wrapper', $attributes['blockId'], $attributes['preset'], $attributes['effects'] ] );

        $parent_attributes  = get_block_wrapper_attributes( [ 'class' => implode( ' ', $parent_classes ) ] );
        $wrapper_attributes = get_block_wrapper_attributes( [ 'class' => implode( ' ', $wrapper_classes ), 'data-id' => $attributes['blockId'] ] );

        $wrapper = sprintf(
            '<div %1$s><div %2$s>%5$s<%3$s class="eb-ah-title">%4$s</%3$s>%6$s</div></div>',
            $parent_attributes,
            $wrapper_attributes,
            $tag_name,
            $title,
            $seperator_top,
            $seperator_bottom
        );

        return wp_kses_post( $wrapper );
    }
}

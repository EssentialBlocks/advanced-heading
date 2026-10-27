<?php

/**
 * Server render for the "Dynamic Title" source.
 *
 * Blocks on the latest design with `source: dynamic-title` save no markup; the
 * heading is built here from the post title. The post comes from the block
 * context (the current post, or each post inside a Query Loop).
 *
 * @package advanced-heading
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Render the heading for a dynamic-title block.
 *
 * @param array         $attributes Block attributes.
 * @param WP_Block|null $block      Block instance.
 * @return string
 */
function advanced_heading_render_dynamic_title( $attributes, $block = null ) {
    $defaults   = [
        'blockId'           => '',
        'preset'            => 'button-1',
        'effects'           => '',
        'tagName'           => 'h2',
        'classHook'         => '',
        'displaySeperator'  => false,
        'seperatorPosition' => 'bottom',
        'seperatorType'     => 'line',
        'separatorIcon'     => 'fas fa-arrow-circle-down',
        'enableLink'        => false,
        'openInNewTab'      => false,
    ];
    $attributes = wp_parse_args( is_array( $attributes ) ? $attributes : [], $defaults );

    $post_id = 0;
    if ( $block instanceof WP_Block && ! empty( $block->context['postId'] ) ) {
        $post_id = (int) $block->context['postId'];
    } elseif ( get_the_ID() ) {
        $post_id = (int) get_the_ID();
    }

    if ( ! $post_id ) {
        return '';
    }

    $title = get_the_title( $post_id );
    if ( '' === trim( wp_strip_all_tags( $title ) ) ) {
        return '';
    }

    $title = sprintf( '<span class="first-title">%s</span>', wp_kses_post( $title ) );

    if ( ! empty( $attributes['enableLink'] ) ) {
        $new_tab = ! empty( $attributes['openInNewTab'] );
        $title   = sprintf(
            '<a class="eb-ah-link" href="%1$s"%2$s>%3$s</a>',
            esc_url( get_permalink( $post_id ) ),
            $new_tab ? ' target="_blank" rel="noopener"' : '',
            $title
        );
    }

    $allowed_tags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p' ];
    $tag_name     = in_array( $attributes['tagName'], $allowed_tags, true ) ? $attributes['tagName'] : 'h2';

    $separator = '';
    if ( ! empty( $attributes['displaySeperator'] ) ) {
        $type = 'icon' === $attributes['seperatorType'] ? 'icon' : 'line';
        $icon = '';
        if ( 'icon' === $type ) {
            $icon = advanced_heading_render_icon( (string) $attributes['separatorIcon'] );
        }
        $separator = sprintf( '<div class="eb-ah-separator %1$s">%2$s</div>', esc_attr( $type ), $icon );
    }

    $block_id        = (string) $attributes['blockId'];
    $parent_classes  = array_filter( [ 'eb-parent-wrapper', 'eb-parent-' . $block_id, (string) $attributes['classHook'] ] );
    $wrapper_classes = array_filter( [ 'eb-advance-heading-wrapper', $block_id, (string) $attributes['preset'], (string) $attributes['effects'] ] );

    $is_top = 'top' === $attributes['seperatorPosition'];

    return sprintf(
        '<div %1$s><div class="%2$s"><div class="%3$s" data-id="%4$s">%5$s<%6$s class="eb-ah-title">%7$s</%6$s>%8$s</div></div></div>',
        get_block_wrapper_attributes(),
        esc_attr( implode( ' ', $parent_classes ) ),
        esc_attr( implode( ' ', $wrapper_classes ) ),
        esc_attr( $block_id ),
        $is_top ? $separator : '',
        $tag_name,
        $title,
        $is_top ? '' : $separator
    );
}

/**
 * Markup for a separator icon, matching the editor's icon display: a Font
 * Awesome class list on <i>, or a Dashicon.
 *
 * @param string $icon Icon class, e.g. "fas fa-arrow-circle-down" or "dashicons-star-filled".
 * @return string
 */
function advanced_heading_render_icon( $icon ) {
    $icon = trim( $icon );
    if ( '' === $icon ) {
        return '';
    }

    if ( false !== strpos( $icon, 'fa-' ) ) {
        if ( ! preg_match( '/^fa[srb]?(\s+fa-[a-z0-9-]+)+$/', $icon ) ) {
            return '';
        }
        return sprintf( '<i class="%s"></i>', esc_attr( $icon ) );
    }

    $name = preg_replace( '/^dashicons-/', '', $icon );
    if ( ! preg_match( '/^[a-z0-9-]+$/', $name ) ) {
        return '';
    }
    return sprintf( '<span class="dashicon dashicons dashicons-%s"></span>', esc_attr( $name ) );
}

<?php
/**
 * Fix ACF post ID when previewing draft posts.
 *
 * In preview mode, WordPress uses the latest revision/autosave ID, which may not contain the updated ACF meta field data.
 *
 * This support thread got me halfway there, but it had to be modified to only interfere if the post ID is a single post, otherwise fields inside ACF blocks and other contexts don't work.
 * https://support.advancedcustomfields.com/forums/topic/preview-solution/page/3/#post-134967
 *
 * @param null|int $null    The value to return. If null, then the ACF plugin will figure out the context itself.
 * @param int      $post_id The "post ID" to check. Can be a post, but can also be any number of other ACF contexts.
 */
/*
function fix_post_id_on_preview($null, $post_id) {
    if (is_preview()) {
        return get_the_ID();
    }
    else {
        $acf_post_id = isset($post_id->ID) ? $post_id->ID : $post_id;

        if (!empty($acf_post_id)) {
            return $acf_post_id;
        }
        else {
            return $null;
        }
    }
}
add_filter( 'acf/pre_load_post_id', 'fix_post_id_on_preview', 10, 2 );
*/
/*
function fix_acf_post_id_on_preview( $null, $post_id ) {
	// Only intervene if the post_id is a single post and we're in preview mode.
	if ( is_single( $post_id ) && is_preview() ) {
		// Get the actual post ID instead of the current revision ID.
		return get_the_ID();
	}

	return $null;
}
add_filter( 'acf/pre_load_post_id', 'fix_acf_post_id_on_preview', 10, 2 );
*/

/**
 * Plugin Name:       ACF Slider Block
 * Description:       A slider carousel block.
 * Version:           0.1.2
 * Author:            ACF
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Update URI:        null
 * Text Domain:       wpe
 *
 * @package           slider-acf
 */

/**
 * Register blocks
 *
 * @return void
 */
function wpe_slider_register_blocks() {
}
add_action( 'init', 'wpe_slider_register_blocks', 5 );

/**
 * Check for JavaScript modules and set
 * type="module" based on the registered handle.
 *
 * @param string $tag The <script> tag for the enqueued script.
 * @param string $handle The script's registered handle.
 * @return string $tag The <script> tag for the enqueued script.
 */
function wpe_script_attrs( $tag, $handle ) {
	if ( str_contains( $handle, 'module' ) ) {
		$tag = str_replace( '<script ', '<script type="module" ', $tag );
	}

	return $tag;
}
add_filter( 'script_loader_tag', 'wpe_script_attrs', 10, 2 );

/**
 * Register Swiper scripts.
 *
 * @return void
 */
function wpe_slider_register_scripts() {

	//experimental!
	//https://make.wordpress.org/core/2021/07/01/block-styles-loading-enhancements-in-wordpress-5-8/
	add_filter( 'should_load_separate_core_block_assets', '__return_true' );

	// we need to register the styles, if we load the style in block.json style "file:./style.css" auto load doesnt work
	wp_register_style('swiperjs-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', array(), '11.1.8' );
	wp_register_style('swiperjs-css-style', plugin_dir_url( __FILE__ ) . 'blocks/slider/style.css', array(), '1.0' );

	/**
	 * We register our block's with WordPress's handy
	 * register_block_type();
	 *
	 * @link https://developer.wordpress.org/reference/functions/register_block_type/
	 */
	//this doesnt work
	//register_block_type( __DIR__ . '/blocks/slider/' , array( 'style' => 'swiperjs-css', 'swiperjs-css-style', ) );
	register_block_type( __DIR__ . '/blocks/slider/' );
	register_block_type( __DIR__ . '/blocks/slide/' );


	/**
	 * Front end modules.
	 *
	 * @see "viewScript" in
	 * blocks/slider/block.json
	 */
	wp_register_script(
		'swiper-module-front', // "viewScript" entry.
		plugin_dir_url( __FILE__ ) . 'blocks/slider/view.js',
		array(),
		'11.0.4', // Using Swiper's current version.
		true
	);

	/**
	 * Editor only modules.
	 *
	 * @see "editorScript" in
	 * blocks/slider/block.json
	 */
	wp_register_script(
		'swiper-module-editor', // editorScript entry.
		plugin_dir_url( __FILE__ ) . 'blocks/slider/editor.js',
		array(),
		'11.0.4', // Using Swiper's current version.
		true
	);
}
add_action( 'init', 'wpe_slider_register_scripts' );

// gb fix
add_action( 'wp_head', function () {
	if ( is_admin() ) {
		?>
		<style>
		.editor-styles-wrapper .gb-container .wp-block {
			margin:0 !important;
		}
		<?php
	}
} );


function my_pre_theme_assets() {
    wp_register_style( 'dummy-handle', false );
    wp_enqueue_style( 'dummy-handle' );
    wp_add_inline_style( 'dummy-handle', '
	?>
	<style>
	.swiper-slide:not(.swiper-slide-active) {
	}


	.swiper-wrapper {
		display: flex;
	}

.wp-block-wpe-slider .swiper-thumbs {
    flex-wrap: wrap;
    column-gap: 10px;
    row-gap: 10px;
	width:100%;
	justify-content:center;
}

	.wp-block-wpe-slider .swiper-thumbs .swiper-wrapper {
		height: 80px; /*causes slight under/over size*/
		padding-top: 10px;
	}
	.wp-block-wpe-slider .swiper-thumbs .swiper-slide {
		opacity:0; /*avoid pageshift*/
		width:0px;
	}

	.wp-block-wpe-slider .swiper-main .swiper-slide img {
		object-fit: cover; /*avoid squeezed imaged on initial load*/
		aspect-ratio: 1/1;
	}

	.wp-block-wpe-slider .swiper-main .swiper-slide:not(:first-child) {
		opacity:0; /*avoid pageshift */
		width:0px;
		display:none;
	}

	.wp-block-wpe-slider .swiper-main .swiper-slide {
	}

	</style>
	<?php
	' );
}
add_action( 'wp_enqueue_scripts', 'my_pre_theme_assets', 0 );

/**
 * Register ACF field group through JSON.
 *
 * @return void
 */
function wpe_register_acf_fields() {
	$path                      = __DIR__ . '/acf-json/acf-fields.json';
	$fields_json               = json_decode( file_get_contents( $path ), true ); // phpcs:ignore
	$fields_json['location']   = array(
		array(
			array(
				'param'    => 'block',
				'operator' => '==',
				'value'    => 'wpe/slide', // Assign to desired block.
			),
		),
	);
	$fields_json['local']      = 'json';
	$fields_json['local_file'] = $path;

	acf_add_local_field_group( $fields_json );
}
add_action( 'acf/include_fields', 'wpe_register_acf_fields' );

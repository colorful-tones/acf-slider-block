<?php
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
	/**
	 * We register our block's with WordPress's handy
	 * register_block_type();
	 *
	 * @link https://developer.wordpress.org/reference/functions/register_block_type/
	 */
	register_block_type( __DIR__ . '/blocks/slider/' );
	register_block_type( __DIR__ . '/blocks/slide/' );
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

<?php

/**
 * Plugin Name:       ACF Slider Block
 * Description:       This plugin allows you to create a slider carousel block.
 * Version:           1.1.0
 * Author:            Haz Agency
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Update URI:        null
 * Text Domain:       acf-slider-block
 *
 * @package           acf-slider-block
 */


if (!defined('ABSPATH')) exit;

define('ACF_SLIDER_BLOCK_VERSION', '1.1.0');
define('ACF_SLIDER_BLOCK_DIR', plugin_dir_path(__FILE__));
define('ACF_SLIDER_BLOCK_URL', plugin_dir_url(__FILE__));

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
 * Check for JavaScript modules and set
 * type="module" based on the registered handle.
 *
 * @param string $tag The <script> tag for the enqueued script.
 * @param string $handle The script's registered handle.
 * @return string $tag The <script> tag for the enqueued script.
 */
function wpe_script_attrs($tag, $handle)
{
	if (str_contains($handle, 'module')) {
		$tag = str_replace('<script ', '<script type="module" ', $tag);
	}

	return $tag;
}
add_filter('script_loader_tag', 'wpe_script_attrs', 10, 2);

/**
 * Register blocks
 *
 * @return void
 */
function wpe_slider_register_blocks()
{
	/**
	 * We register our block's with WordPress's handy
	 * register_block_type();
	 *
	 * @link https://developer.wordpress.org/reference/functions/register_block_type/
	 */
	//this doesnt work
	//register_block_type( __DIR__ . '/blocks/slider/' , array( 'style' => 'swiperjs-css', 'swiperjs-css-style', ) );
	register_block_type(ACF_SLIDER_BLOCK_DIR . 'blocks/slider/');
	register_block_type(ACF_SLIDER_BLOCK_DIR . 'blocks/slide/');
}
add_action('init', 'wpe_slider_register_blocks', 5);


/**
 * Register Swiper scripts.
 *
 * @return void
 */
function wpe_slider_register_scripts()
{

	//experimental!
	//https://make.wordpress.org/core/2021/07/01/block-styles-loading-enhancements-in-wordpress-5-8/
	add_filter('should_load_separate_core_block_assets', '__return_true');

	// we need to register the styles, if we load the style in block.json style "file:./style.css" auto load doesnt work
	wp_register_style('swiperjs-css', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', array(), ACF_SLIDER_BLOCK_VERSION);
	wp_register_style('swiperjs-css-style', ACF_SLIDER_BLOCK_URL . 'blocks/slider/style.css', array(), ACF_SLIDER_BLOCK_VERSION);

	wp_register_style('lightgallery-css', 'https://cdnjs.cloudflare.com/ajax/libs/lightgallery/2.7.2/css/lightgallery.min.css', array(), ACF_SLIDER_BLOCK_VERSION);
	wp_register_style('lightgallery-bundle', 'https://cdnjs.cloudflare.com/ajax/libs/lightgallery/2.7.2/css/lightgallery-bundle.min.css', array(), ACF_SLIDER_BLOCK_VERSION);

	/**
	 * Front end modules.
	 *
	 * @see "viewScript" in
	 * blocks/slider/block.json
	 */
	wp_register_script(
		'swiper-module-front', // "viewScript" entry.
		ACF_SLIDER_BLOCK_URL . 'blocks/slider/view.js',
		array(),
		ACF_SLIDER_BLOCK_VERSION,
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
		ACF_SLIDER_BLOCK_URL . 'blocks/slider/editor.js',
		array(),
		ACF_SLIDER_BLOCK_VERSION,
		true
	);
}
add_action('init', 'wpe_slider_register_scripts');

// gb fix
add_action('admin_enqueue_scripts', function () {
	wp_enqueue_style('admin-css-style', ACF_SLIDER_BLOCK_URL . 'assets/admin.css', array(), ACF_SLIDER_BLOCK_VERSION);
});


function slider_register_frontend_scripts()
{
	wp_enqueue_style('theme-css-style', ACF_SLIDER_BLOCK_URL . 'assets/style.css', array(), ACF_SLIDER_BLOCK_VERSION);
}
add_action('wp_enqueue_scripts', 'slider_register_frontend_scripts', 0);

/**
 * Register ACF field group through JSON.
 *
 * @return void
 */

/// LOAD AUTO EXPORT JSON
// be sure to set active to true
function wpe_register_acf_fields()
{

	$dir = new DirectoryIterator(ACF_SLIDER_BLOCK_DIR . 'acf-json/');
	foreach ($dir as $file) {
		// var_dump( $file );
		if (!$file->isDot() && 'json' == $file->getExtension()) {
			$fields_json = json_decode(file_get_contents($file->getPathname()), true);
			$fields_json['active'] = true;
			acf_add_local_field_group($fields_json);
		}
	}
}
add_action('acf/include_fields', 'wpe_register_acf_fields');



//LOAD MANUALLY EXPORTED JSON
/*
add_action( 'acf/include_fields', 'wpe_register_acf_fields_slider' );
function wpe_register_acf_fields_slider() {

	$dir = new DirectoryIterator( __DIR__ . '/acf-fields-export/' );
	foreach( $dir as $file )
	{
		// var_dump( $file );
		if ( !$file->isDot() && 'json' == $file->getExtension() )
		{
			$fields_json = json_decode( file_get_contents( $file->getPathname() ), true );
			$fields_json['active'] = true;
			//DISABLED
			//acf_add_local_field_group( $fields_json[0] );
		}
	}
}
*/

add_filter('acf/settings/save_json', 'my_acf_json_save_point');
function my_acf_json_save_point($path)
{
	// Update path
	$path = ACF_SLIDER_BLOCK_DIR . 'acf-json';
	// Return path
	return $path;
}


/**
 * Register the path to load the ACF json files so that they are version controlled.
 * @param $paths The default relative path to the folder where ACF saves the files.
 * @return string The new relative path to the folder where we are saving the files.
 */
add_filter('acf/settings/load_json', 'my_acf_json_load_point');
function my_acf_json_load_point($paths)
{
	// Remove original path
	unset($paths[0]); // Append our new path
	$paths[] = ACF_SLIDER_BLOCK_DIR . 'acf-json';
	return $paths;
}

/**
 * Allow JSON files to be uploaded through WordPress media uploader
 */
function wpe_allow_json_uploads($mimes)
{
	$mimes['json'] = 'application/json';
	return $mimes;
}
add_filter('upload_mimes', 'wpe_allow_json_uploads');

/**
 * Allow JSON files in ACF file fields
 */
function wpe_allow_json_in_acf($mimes)
{
	$mimes['json'] = 'application/json';
	return $mimes;
}
add_filter('acf/upload_prefilter', function ($file) {
	// Allow JSON files specifically for our field
	if (isset($_POST['field_key']) && (strpos($_POST['field_key'], 'field_main_slider_json_file') !== false || strpos($_POST['field_key'], 'field_thumbnails_json_file') !== false)) {
		$file['type'] = 'application/json';
		$file['ext'] = 'json';
	}
	return $file;
});

/**
 * Ensure JSON files are allowed in WordPress uploads
 */
function wpe_ensure_json_allowed($file)
{
	// Check if this is a JSON file
	if (isset($file['name']) && pathinfo($file['name'], PATHINFO_EXTENSION) === 'json') {
		$file['type'] = 'application/json';
		$file['ext'] = 'json';
	}
	return $file;
}
add_filter('wp_handle_upload_prefilter', 'wpe_ensure_json_allowed');

/**
 * Add JSON to allowed file types in WordPress
 */
function wpe_add_json_to_allowed_types($types)
{
	$types['json'] = 'application/json';
	return $types;
}
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {
	// Allow JSON files
	if (pathinfo($filename, PATHINFO_EXTENSION) === 'json') {
		$data['type'] = 'application/json';
		$data['proper_filename'] = $filename;
		$data['ext'] = 'json';
	}
	return $data;
}, 10, 4);

/**
 * Validate and process Swiper JSON configuration for main slider
 * @param mixed $value The field value
 * @param mixed $post_id The post ID
 * @param array $field The field array
 * @return mixed The processed value
 */
function wpe_validate_main_slider_json($value, $post_id, $field)
{
	// Only process if this is our main slider config field
	if ($field['name'] !== 'main_slider_config') {
		return $value;
	}

	error_log('wpe_validate_main_slider_json: Processing field: ' . $field['name']);
	error_log('wpe_validate_main_slider_json: Value: ' . print_r($value, true));

	$json_data = null;
	$validation_message = '';

	// Check if file upload is provided (takes precedence)
	if (!empty($value['field_main_slider_json_file']) && !empty($value['field_main_slider_json_file']['ID'])) {
		$file_path = get_attached_file($value['field_main_slider_json_file']['ID']);
		if ($file_path && file_exists($file_path)) {
			$file_content = file_get_contents($file_path);
			$json_data = json_decode($file_content, true);
			if (json_last_error() !== JSON_ERROR_NONE) {
				$validation_message = 'Error: Invalid JSON in uploaded file. ' . json_last_error_msg();
			}
		}
	}
	// Fallback to textarea content
	elseif (!empty($value['field_main_slider_json_textarea'])) {
		$json_data = json_decode($value['field_main_slider_json_textarea'], true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			$validation_message = 'Error: Invalid JSON in textarea. ' . json_last_error_msg();
		}
	}

	// Validate Swiper.js structure if JSON is valid
	if ($json_data !== null && empty($validation_message)) {
		$validation_message = wpe_validate_swiper_structure($json_data);
	}

	// Store validation message
	if (!empty($validation_message)) {
		$value['field_main_slider_json_validation'] = $validation_message;
		error_log('wpe_validate_main_slider_json: Validation error: ' . $validation_message);
	} else {
		$value['field_main_slider_json_validation'] = '✅ Valid Swiper.js configuration';
		error_log('wpe_validate_main_slider_json: Validation successful');
	}

	// Store processed JSON data for backward compatibility
	$value['processed_json'] = $json_data;

	error_log('wpe_validate_main_slider_json: Final value: ' . print_r($value, true));
	return $value;
}
add_filter('acf/update_value', 'wpe_validate_main_slider_json', 10, 3);

/**
 * Validate and process Swiper JSON configuration for thumbnails
 * @param mixed $value The field value
 * @param mixed $post_id The post ID
 * @param array $field The field array
 * @return mixed The processed value
 */
function wpe_validate_thumbnails_json($value, $post_id, $field)
{
	// Only process if this is our thumbnails config field
	if ($field['name'] !== 'thumbnails_config') {
		return $value;
	}

	error_log('wpe_validate_thumbnails_json: Processing field: ' . $field['name']);
	error_log('wpe_validate_thumbnails_json: Value: ' . print_r($value, true));

	$json_data = null;
	$validation_message = '';

	// Check if file upload is provided (takes precedence)
	if (!empty($value['field_thumbnails_json_file']) && !empty($value['field_thumbnails_json_file']['ID'])) {
		$file_path = get_attached_file($value['field_thumbnails_json_file']['ID']);
		if ($file_path && file_exists($file_path)) {
			$file_content = file_get_contents($file_path);
			$json_data = json_decode($file_content, true);
			if (json_last_error() !== JSON_ERROR_NONE) {
				$validation_message = 'Error: Invalid JSON in uploaded file. ' . json_last_error_msg();
			}
		}
	}
	// Fallback to textarea content
	elseif (!empty($value['field_thumbnails_json_textarea'])) {
		$json_data = json_decode($value['field_thumbnails_json_textarea'], true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			$validation_message = 'Error: Invalid JSON in textarea. ' . json_last_error_msg();
		}
	}

	// Validate Swiper.js structure if JSON is valid
	if ($json_data !== null && empty($validation_message)) {
		$validation_message = wpe_validate_swiper_structure($json_data);
	}

	// Store validation message
	if (!empty($validation_message)) {
		$value['field_thumbnails_json_validation'] = $validation_message;
		error_log('wpe_validate_thumbnails_json: Validation error: ' . $validation_message);
	} else {
		$value['field_thumbnails_json_validation'] = '✅ Valid Swiper.js configuration';
		error_log('wpe_validate_thumbnails_json: Validation successful');
	}

	// Store processed JSON data for backward compatibility
	$value['processed_json'] = $json_data;

	error_log('wpe_validate_thumbnails_json: Final value: ' . print_r($value, true));
	return $value;
}
add_filter('acf/update_value', 'wpe_validate_thumbnails_json', 10, 3);

/**
 * Force update validation message field
 */
function wpe_force_update_validation_message($value, $post_id, $field)
{
	// Only process validation message fields
	if (strpos($field['name'], 'json_validation') === false) {
		return $value;
	}

	error_log('wpe_force_update_validation_message: Updating validation message for field: ' . $field['name']);
	return $value;
}
add_filter('acf/update_value', 'wpe_force_update_validation_message', 5, 3);

/**
 * Validate Swiper.js configuration structure
 * @param array $config The JSON configuration
 * @return string Error message or empty string if valid
 */
function wpe_validate_swiper_structure($config)
{
	if (!is_array($config)) {
		return 'Error: Configuration must be an object/array';
	}

	// List of valid Swiper.js options (partial list - can be expanded)
	$valid_options = [
		'slidesPerView',
		'slidesPerGroup',
		'spaceBetween',
		'centeredSlides',
		'loop',
		'autoplay',
		'effect',
		'speed',
		'direction',
		'threshold',
		'observer',
		'observeParents',
		'watchSlidesProgress',
		'grabCursor',
		'keyboard',
		'mousewheel',
		'hashNavigation',
		'history',
		'virtual',
		'breakpoints',
		'navigation',
		'pagination',
		'scrollbar',
		'freeMode',
		'grid',
		'coverflowEffect',
		'flipEffect',
		'cubeEffect',
		'fadeEffect',
		'creativeEffect',
		'cardsEffect'
	];

	// Check for invalid options (basic validation)
	foreach ($config as $key => $value) {
		if (!in_array($key, $valid_options) && !is_array($value)) {
			return "Warning: '$key' may not be a valid Swiper.js option";
		}
	}

	return ''; // Valid
}

/**
 * Get processed Swiper configuration for main slider
 * @param int $post_id The post ID
 * @param string $block_id The block ID
 * @param array $block The block data (optional)
 * @return array|null The processed configuration or null
 */
function wpe_get_main_slider_config($post_id, $block_id = null, $block = null)
{
	// If block data is provided, extract config from block attributes
	if ($block && isset($block['data'])) {
		error_log('wpe_get_main_slider_config: Block data available: ' . print_r($block['data'], true));

		// Try different possible field name patterns
		$json_textarea = null;

		// Pattern 1: Full field name in block data
		if (isset($block['data']['field_main_slider_json_textarea'])) {
			$json_textarea = $block['data']['field_main_slider_json_textarea'];
			error_log('wpe_get_main_slider_config: Found field_main_slider_json_textarea in block data');
		}
		// Pattern 2: Group field with sub-field
		elseif (isset($block['data']['main_slider_config']) && isset($block['data']['main_slider_config']['json_textarea'])) {
			$json_textarea = $block['data']['main_slider_config']['json_textarea'];
			error_log('wpe_get_main_slider_config: Found main_slider_config.json_textarea in block data');
		}
		// Pattern 3: Legacy direct field name
		elseif (isset($block['data']['main_slider_config_json_textarea'])) {
			$json_textarea = $block['data']['main_slider_config_json_textarea'];
			error_log('wpe_get_main_slider_config: Found main_slider_config_json_textarea in block data');
		}
		// Pattern 4: Direct json_textarea field (fallback)
		elseif (isset($block['data']['json_textarea'])) {
			$json_textarea = $block['data']['json_textarea'];
			error_log('wpe_get_main_slider_config: Found json_textarea in block data');
		}

		if (!empty($json_textarea)) {
			error_log('wpe_get_main_slider_config: JSON content: ' . substr($json_textarea, 0, 100) . '...');
			$json_data = json_decode($json_textarea, true);
			if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
				error_log('wpe_get_main_slider_config: Successfully parsed JSON from block data');
				return $json_data;
			} else {
				error_log('wpe_get_main_slider_config: JSON parsing error: ' . json_last_error_msg());
			}
		} else {
			error_log('wpe_get_main_slider_config: No JSON textarea found in block data');
		}
	} else {
		error_log('wpe_get_main_slider_config: No block data found');
	}

	// Fallback: try to get from post meta using new field structure
	error_log('wpe_get_main_slider_config: Falling back to post meta');
	$main_slider_config = get_field('main_slider_config', $post_id);

	if (!empty($main_slider_config) && !empty($main_slider_config['json_textarea'])) {
		$json_textarea = $main_slider_config['json_textarea'];
		error_log('wpe_get_main_slider_config: Found JSON textarea in post meta');

		if (!empty($json_textarea)) {
			$json_data = json_decode($json_textarea, true);
			if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
				error_log('wpe_get_main_slider_config: Successfully parsed JSON from post meta');
				return $json_data;
			} else {
				error_log('wpe_get_main_slider_config: JSON parsing error from post meta: ' . json_last_error_msg());
			}
		}
	}

	// Legacy fallback for old field structure
	if (!empty($main_slider_config) && !empty($main_slider_config['processed_json'])) {
		error_log('wpe_get_main_slider_config: Found legacy processed_json in post meta');
		return $main_slider_config['processed_json'];
	}

	error_log('wpe_get_main_slider_config: No configuration found');
	return null;
}

/**
 * Get processed Swiper configuration for thumbnails
 * @param int $post_id The post ID
 * @param string $block_id The block ID
 * @param array $block The block data (optional)
 * @return array|null The processed configuration or null
 */
function wpe_get_thumbnails_config($post_id, $block_id = null, $block = null)
{
	// If block data is provided, extract config from block attributes
	if ($block && isset($block['data'])) {
		error_log('wpe_get_thumbnails_config: Block data available: ' . print_r($block['data'], true));

		// Try different possible field name patterns
		$json_textarea = null;

		// Pattern 1: Full field name in block data
		if (isset($block['data']['field_thumbnails_json_textarea'])) {
			$json_textarea = $block['data']['field_thumbnails_json_textarea'];
			error_log('wpe_get_thumbnails_config: Found field_thumbnails_json_textarea in block data');
		}
		// Pattern 2: Group field with sub-field
		elseif (isset($block['data']['thumbnails_config']) && isset($block['data']['thumbnails_config']['json_textarea'])) {
			$json_textarea = $block['data']['thumbnails_config']['json_textarea'];
			error_log('wpe_get_thumbnails_config: Found thumbnails_config.json_textarea in block data');
		}
		// Pattern 3: Legacy direct field name
		elseif (isset($block['data']['thumbnails_config_json_textarea'])) {
			$json_textarea = $block['data']['thumbnails_config_json_textarea'];
			error_log('wpe_get_thumbnails_config: Found thumbnails_config_json_textarea in block data');
		}
		// Pattern 4: Direct json_textarea field (fallback)
		elseif (isset($block['data']['json_textarea'])) {
			$json_textarea = $block['data']['json_textarea'];
			error_log('wpe_get_thumbnails_config: Found json_textarea in block data');
		}

		if (!empty($json_textarea)) {
			error_log('wpe_get_thumbnails_config: JSON content: ' . substr($json_textarea, 0, 100) . '...');
			$json_data = json_decode($json_textarea, true);
			if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
				error_log('wpe_get_thumbnails_config: Successfully parsed JSON from block data');
				return $json_data;
			} else {
				error_log('wpe_get_thumbnails_config: JSON parsing error: ' . json_last_error_msg());
			}
		} else {
			error_log('wpe_get_thumbnails_config: No JSON textarea found in block data');
		}
	} else {
		error_log('wpe_get_thumbnails_config: No block data found');
	}

	// Fallback: try to get from post meta using new field structure
	error_log('wpe_get_thumbnails_config: Falling back to post meta');
	$thumbnails_config = get_field('thumbnails_config', $post_id);

	if (!empty($thumbnails_config) && !empty($thumbnails_config['json_textarea'])) {
		$json_textarea = $thumbnails_config['json_textarea'];
		error_log('wpe_get_thumbnails_config: Found JSON textarea in post meta');

		if (!empty($json_textarea)) {
			$json_data = json_decode($json_textarea, true);
			if (json_last_error() === JSON_ERROR_NONE && is_array($json_data)) {
				error_log('wpe_get_thumbnails_config: Successfully parsed JSON from post meta');
				return $json_data;
			} else {
				error_log('wpe_get_thumbnails_config: JSON parsing error from post meta: ' . json_last_error_msg());
			}
		}
	}

	// Legacy fallback for old field structure
	if (!empty($thumbnails_config) && !empty($thumbnails_config['processed_json'])) {
		error_log('wpe_get_thumbnails_config: Found legacy processed_json in post meta');
		return $thumbnails_config['processed_json'];
	}

	error_log('wpe_get_thumbnails_config: No configuration found');
	return null;
}

/**
 * Get processed Swiper configuration for a block (backward compatibility)
 * @param int $post_id The post ID
 * @param string $block_id The block ID
 * @param array $block The block data (optional)
 * @return array|null The processed configuration or null
 */
function wpe_get_swiper_config($post_id, $block_id = null, $block = null)
{
	// For backward compatibility, return main slider config
	return wpe_get_main_slider_config($post_id, $block_id, $block);
}

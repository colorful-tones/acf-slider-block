<?php

/**
 * Slider block.
 *
 * @param array  $block The block settings and attributes.
 * @param string $content The block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id The post ID the block is rendering content against.
 *                     This is either the post ID currently being displayed inside a query loop,
 *                     or the post ID of the post hosting this block.
 * @param array $context The context provided to the block by the post or it's parent block.
 */

// Support custom id values.
$block_id = wp_unique_prefixed_id('wpe-block-id-');
if (! empty($block['anchor'])) {
	$block_id = esc_attr($block['anchor']);
}

// Grab our alignment class.
$block_classes = '';
if ('' !== $block['align']) {
	$block_classes = 'align' . $block['align'];
}

// Which blocks do we want to allow to be nested in InnerBlocks.
$allowed_blocks = array(
	'wpe/slide',
);

$thumbnail = get_field('thumbnail');
$arrows = get_field('arrows');

// Get custom Swiper configuration for main slider
$main_slider_config = null;
if (function_exists('wpe_get_main_slider_config')) {
	$main_slider_config = wpe_get_main_slider_config($post_id, $block_id, $block);
}

// Get custom Swiper configuration for thumbnails
$thumbnails_config = null;
if (function_exists('wpe_get_thumbnails_config')) {
	$thumbnails_config = wpe_get_thumbnails_config($post_id, $block_id, $block);
}

// Log configuration status for debugging
if ($main_slider_config) {
	error_log("✅ Main slider config loaded for block {$block_id}");
} else {
	error_log("ℹ️ No main slider config found for block {$block_id}, will use defaults");
}

if ($thumbnails_config) {
	error_log("✅ Thumbnails config loaded for block {$block_id}");
} else {
	error_log("ℹ️ No thumbnails config found for block {$block_id}, will use defaults");
}

error_log(print_r('main_slider_config___', true));
error_log(print_r($main_slider_config, true));
error_log(print_r('thumbnails_config___', true));
error_log(print_r($thumbnails_config, true));
error_log(print_r($block_id, true));
error_log(print_r($block, true));
error_log(print_r($post_id, true));

// Prepare data attributes for custom configurations
$main_slider_data_attr = '';
if ($main_slider_config && is_array($main_slider_config)) {
	$main_slider_data_attr = ' data-swiper-config="' . esc_attr(json_encode($main_slider_config)) . '"';
}

$thumbnails_data_attr = '';
if ($thumbnails_config && is_array($thumbnails_config)) {
	$thumbnails_data_attr = ' data-swiper-config="' . esc_attr(json_encode($thumbnails_config)) . '"';
}

// Our InnerBlocks template to populate when new block is inserted.
// we can define swiper configuration options here and use them in view.js
// for example slidesPerPage: 3
$inner_blocks_template = array(
	array(
		'wpe/slide',
		array(
			'slideImg' => array(
				'src' => '../slider/assets/image1.jpg',
			),
			'slideTitle' => 'Slide Title #1',
			//'className'  => 'swiper-slide',
		),
		array(),
	),
	array(
		'wpe/slide',
		array(
			'slideImg' => array(
				'src' => '../slider/assets/image2.jpg',
			),
			'slideTitle' => 'Slide Title #2',
			//'className'  => 'swiper-slide',
		),
		array(),
	),
	array(
		'wpe/slide',
		array(
			'slideImg' => array(
				'src' => '../slider/assets/image3.jpg',
			),
			'slideTitle' => 'Slide Title #3',
			//'className'  => 'swiper-slide',
		),
		array(),
	),
);


?>

<?php if (! $is_preview) : ?>
	<div
		<?php
		echo wp_kses_data(
			get_block_wrapper_attributes(
				array(
					'id'    => esc_attr($block_id),
					'class' => $block_classes,
				)
			)
		);
		?>>
	<?php endif; ?>

	<div class="swiper-gallery" id="<?php echo $block_id; ?>">
		<div class="swiper swiper-main" <?php echo $main_slider_data_attr; ?>>

			<InnerBlocks
				allowedBlocks="<?php echo esc_attr(wp_json_encode($allowed_blocks)); ?>"
				class="swiper-wrapper wp-block-wpe-slider__innerblocks"
				orientation="horizontal"
				template="<?php echo esc_attr(wp_json_encode($inner_blocks_template)); ?>" />

			<?php if ('is-style-complex' === $block['className']) : ?>
				<!-- <div class="swiper-pagination"></div> -->
			<?php endif; ?>
			<div class="swiper-pagination"></div>

			<?php if ($arrows) : ?>

				<div class="swiper-button-prev .<?php echo $block_id; ?>"></div>
				<div class="swiper-button-next .<?php echo $block_id; ?>"></div>

			<?php endif; ?>

		</div><!-- .swiper -->

		<?php if (! $is_preview) : ?>

			<?php
			//$thumb_justify = get_field('thumb_justify') ? get_field('thumb_justify') : 'center';
			//$styles = array( 'justify-content: ' . $thumb_justify );
			//$style  = implode( '; ', $styles );

			?>

			<div class="swiper-thumbs" <?php echo $thumbnails_data_attr; ?>>

				<?php if ($thumbnail == true) : ?>

					<div style="<?php echo esc_attr($style); ?>" class="swiper-wrapper wp-block-wpe-slider__innerblocks swiper-wrapper-thumb">

						<?php

						//				echo $content;

						// Load the HTML into a DOMDocument
						$doc = new DOMDocument();
						libxml_use_internal_errors(true); // Suppress warnings for malformed HTML
						$doc->loadHTML($content);
						libxml_clear_errors();
						/*
				// Find all div elements
				$divs = $doc->getElementsByTagName('div');

				foreach ($divs as $div) {
				    // Collect all child nodes
				    $children = [];
				    foreach ($div->childNodes as $child) {
				        $children[] = $child;
				    }

				    // Remove all child nodes that are not <img>
				    foreach ($children as $child) {
				        if ($child->nodeName !== 'img') {
				            $div->removeChild($child);
				        }
				    }
				}
*/
						// Save the modified HTML back to a string
						$content = $doc->saveHTML();

						$height = get_field('height');
						$styles = array('height: ' . $height);
						$style  = implode('; ', $styles);
						$content = str_replace($style, '', $content); //remove main slider height

						$content = str_replace('lightbox-toggle', '', $content); //remove lightbox

						/*
				$height = get_field('height');
				$styles = array( 'height: ' . $height );
				$style  = implode( '; ', $styles );
				$content = str_replace( '<div class="swiper-slide', '<div style="heigth:80px;" class="swiper-slide', $content);
				*/

						// Output the modified HTML
						echo $content;

						?>

					</div>

				<?php endif; ?>
			</div>

		<?php else : ?>
			<!-- Editor Preview Mode - Show thumbnails in editor -->
			<?php if ($thumbnail == true) : ?>
				<div class="swiper-thumbs editor-thumbnails" <?php echo $thumbnails_data_attr; ?>>
					<div class="swiper-wrapper wp-block-wpe-slider__innerblocks swiper-wrapper-thumb">
						<?php
						// For editor preview, we need to get the content from InnerBlocks
						// Since we're in preview mode, we'll create a simplified version
						// that will be populated by the editor JavaScript
						?>
					</div>
				</div>
			<?php endif; ?>
		<?php endif; ?>

	</div>

	<?php if (! $is_preview) : ?>
	</div>
<?php endif; ?>
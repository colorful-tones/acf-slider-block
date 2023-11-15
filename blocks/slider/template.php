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
$block_id = wp_unique_prefixed_id( 'wpe-block-id-' );
if ( ! empty( $block['anchor'] ) ) {
	$block_id = esc_attr( $block['anchor'] );
}

// Grab our alignment class.
$block_classes = '';
if ( '' !== $block['align'] ) {
	$block_classes = 'align' . $block['align'];
}

// Which blocks do we want to allow to be nested in InnerBlocks.
$allowed_blocks = array(
	'wpe/slide',
);

// Our InnerBlocks template to populate when new block is inserted.
$inner_blocks_template = array(
	array(
		'wpe/slide',
		array(
			'slideImg' => array(
				'src' => '../slider/assets/image1.jpg',
			),
			'slideTitle' => 'Slide Title #1',
			'className'  => 'swiper-slide',
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
			'className'  => 'swiper-slide',
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
			'className'  => 'swiper-slide',
		),
		array(),
	),
);

?>

<?php if ( ! $is_preview ) : ?>
	<div
		<?php
		echo wp_kses_data(
			get_block_wrapper_attributes(
				array(
					'id'    => esc_attr( $block_id ),
					'class' => $block_classes,
				)
			)
		);
		?>
	>
<?php endif; ?>

	<div class="swiper">

		<InnerBlocks 
			allowedBlocks="<?php echo esc_attr( wp_json_encode( $allowed_blocks ) ); ?>"
			class="swiper-wrapper wp-block-wpe-slider__innerblocks"
			orientation="horizontal"
			template="<?php echo esc_attr( wp_json_encode( $inner_blocks_template ) ); ?>"
		/>

		<?php if ( 'is-style-complex' === $block['className'] ) : ?>
			<div class="swiper-pagination"></div>
		<?php endif; ?>

		<div class="swiper-button-prev"></div>
		<div class="swiper-button-next"></div>

	</div><!-- .swiper -->

<?php if ( ! $is_preview ) : ?>
	</div>
<?php endif; ?>

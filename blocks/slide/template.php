<?php
/**
 * Slide block.
 *
 * @param array  $block The block settings and attributes.
 * @param string $content The block inner HTML (empty).
 * @param bool   $is_preview True during backend preview render.
 * @param int    $post_id The post ID the block is rendering content against.
 *                     This is either the post ID currently being displayed inside a query loop,
 *                     or the post ID of the post hosting this block.
 * @param array $context The context provided to the block by the post or it's parent block.
 */

$slide_img   = get_field( 'image' );
$slide_title = get_field( 'title' ) ? get_field( 'title' ) : $block['slideTitle'];

if ( $slide_img['ID'] ) {
	$slide_img = wp_get_attachment_image( $slide_img['ID'], 'full', '', array( 'class' => 'wp-block-wpe-slide__img' ) );
} else {
	$slide_img = '<img src="' . plugins_url( $block['slideImg']['src'], __FILE__ ) . '" height="1080" width="1920" class="wp-block-wpe-slide__img">';
}

// Support custom id values.
$block_id = wp_unique_prefixed_id( 'slide-id-' );
if ( ! empty( $block['anchor'] ) ) {
	$block_id = esc_attr( $block['anchor'] );
}

$block_classes = 'swiper-slide';
// Grab our alignment class.
if ( '' !== $block['align'] ) {
	$block_classes = ' align' . $block['align'];
}
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

	<?php echo wp_kses_post( $slide_img ); ?>
	<p class="wp-block-wpe-slide__copy"><?php echo esc_html( $slide_title ); ?></p>

<?php if ( ! $is_preview ) : ?>
	</div>
<?php endif; ?>

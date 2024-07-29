/**
 * This will run only in the editor.
 */

// Import Swiper dependency as module.
import { Swiper } from '../../swiper/swiper-bundle.mjs';

// Import internal Swiper config object.
import { swiperConfig } from './swiper-config-default.js';

// Make sure ACF's hooks are available.
if ( window.acf ) {
	// Trigger action for our Slider block.
	window.acf.addAction( 'render_block_preview/type=wpe/slider', acfRenderSliderBlock )
}

// Initialize Swiper with special configuration for editor.
function acfRenderSliderBlock( block ) {
	let swiperEl = block[0].querySelector( '.swiper' );

	if ( ! swiperEl ) {
		return;
	}

	// We want to make sure some Swiper things behave
	// smoothly in the editor.
	if ( swiperEl && swiperConfig ) {
		swiperConfig.autoplay = false;
		swiperConfig.loop = false;
		swiperConfig.observer = true;
		swiperConfig.observeSlideChildren = true;
		swiperConfig.simulateTouch = false;
	}

	// Initialize a Swiper instance.
	new Swiper( swiperEl, swiperConfig );

	// Use Swiper's MutationObserver to trigger updates.
	swiperEl.swiper.on( 'observerUpdate', () => {
		swiperEl.swiper.update();
		swiperEl.swiper.updateSlides();
	} );
}

/**
 * We need each new slide to have .swiper-slide
 * class added in the editor. This is how we do it.
 */
const el = React.createElement;

const withSlideBlockClass = wp.compose.createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		const { name } = props;

		// Return usual component if not our's.
		if ( name != 'wpe/slide' ) {
			return el ( BlockListBlock, { ...props } );
		}

		const newProps = {
			...props,
			className: 'swiper-slide'
		}

		// Return usual component with our custom class.
		return el ( BlockListBlock, newProps );
	};
}, 'withSlideBlockClass' );

wp.hooks.addFilter(
	'editor.BlockListBlock',
	'wpe/slide-class',
	withSlideBlockClass
);

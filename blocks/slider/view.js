/**
 * // This will run on the front end only.
 */

// Import Swiper dependency as module.
import { Swiper } from '../../swiper/swiper-bundle.mjs';

// Import internal Swiper config object.
import { swiperConfig } from './swiper-config-default.js';

document.addEventListener( 'DOMContentLoaded', () => {
	const containers = document.querySelectorAll( '.swiper' );

	if ( ! containers.length ) {
		return;
	}

	containers.forEach( ( element ) => {
		new Swiper( element, swiperConfig );
	} );
} );
/**
 * Define some defaults for Swiper.
 *
 * @see https://swiperjs.com/swiper-api#parameters
 */
export const swiperConfig = {
	autoplay: false, // Automatically slide.
	centeredSlides: true, // Center our slide.
	direction: 'horizontal', // Horizontal slider.
	effect: 'fade', // slide, fade and more.
	grabCursor: true, // Show grab cursor for UI/UX.
	keyboard: true, // Enable keyboard navigation.
	loop: true, // Enable continuous loop mode.
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev'
	},
	on: {
		init() {
			// Feel free to remove (debug).
			console.log( 'Swiper initialized.' );
		},
	},
	pagination: {
		el: '.swiper-pagination',
		type: 'fraction'
	},
	slidesPerView: 1,
	speed: 300,
};
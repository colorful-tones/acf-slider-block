/**
 * Define some defaults for Swiper.
 *
 * @see https://swiperjs.com/swiper-api#parameters
 */
export const swiperConfig = {
	//autoplay: false, // Automatically slide.
	//slidesPerView: 1,
	//loopedSlides: 4,
	//centeredSlides: true, // Center our slide.
	uniqueNavElements: true,
	direction: 'horizontal', // Horizontal slider.
	effect: 'fade', // slide, fade and more.
	grabCursor: true, // Show grab cursor for UI/UX.
	keyboard: true, // Enable keyboard navigation.
	loop: true, // Enable continuous loop mode.
	//init: false,

/*
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
*/

	on: {
//		init() {

		beforeInit: function (swiper) {

        		//setTimeout(() => {
		     	    const slides = document.querySelectorAll('.swiper-main .swiper-slide');
		            slides.forEach(function (slide) {
		                slide.style.display = 'block';
		            });
			    swiper.update(); // 'this' refers to the Swiper instance

			    //swiper.slideTo(1);
		        //}, 10);
			//console.log( 'Swiper initialized.' );
   		    //swiper.init();
		},
		realIndexChange: function(swiper) { //slideChange //realIndexChange
		        console.log('change '+swiper.realIndex);
			if (swiper.thumbs.swiper)
			{
				swiper.thumbs.swiper.slideTo(swiper.realIndex);
			}
		    },
//	  	afterInit: function(swiper) {
//		    //console.log('afterInit', swiper)
//			swiper.slideTo(0);
//			//swiper.update();
//		  },

	},

	pagination: {
		el: '.swiper-pagination',
		type: 'fraction'
	},

	//slidesPerView: 4,
	//speed: 300,
};

/**
 * Define some defaults for Swiper.
 *
 * @see https://swiperjs.com/swiper-api#parameters
 */
export const swiperConfig = {
  //autoplay: false, // Automatically slide.
  slidesPerView: 1,
  //spaceBetween: 10,
  //loopedSlides: 4,
  //centeredSlides: true, // Center our slide.
  uniqueNavElements: true,
  direction: "horizontal", // Horizontal slider.
  //   effect: "fade", // slide, fade and more. EFFECT FADE WILL ONLY ALLOW 1 SLIDEPERVIEW
  effect: "slide",
  //grabCursor: false, // Show grab cursor for UI/UX.
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
    afterInit: function (swiper) {
      //console.log(swiper);
      //const $lgSwiper = document.getElementById(swiper);
      if (!window.acf) {
        const $lgSwiper = swiper.hostEl;
        lightGallery($lgSwiper, {
          //showZoomInOutIcons: true,
          speed: 300,
          download: false,
          //easing: 'lg-fade',
          actualSize: false,
          controls: true,
          mode: "lg-fade",
          loop: true,
          zoomFromOrigin: false,
          swipeToClose: true,
          startAnimationDuration: 0,
          startClass: "",
          slideEndAnimation: false,
          mobileSettings: {
            controls: false,
            showCloseIcon: true,
          },
          backdropDuration: 0,
          selector: "[lightbox-toggle] > img",
        });
      }
      // Before closing lightGallery, make sure swiper slide
      // is aligned with the lightGallery active slide
      //$lgSwiper.addEventListener('lgBeforeClose', () => {
      //	swiper.slideTo(lg.index, 0)
      //});
    },
    beforeInit: function (swiper) {
      //setTimeout(() => {
      const slides = document.querySelectorAll(".swiper-main .swiper-slide");
      slides.forEach(function (slide) {
        slide.style.display = "block";
      });
      swiper.update(); // 'this' refers to the Swiper instance

      //swiper.slideTo(1);
      //}, 10);
      //console.log( 'Swiper initialized.' );
      //swiper.init();
    },
    realIndexChange: function (swiper) {
      //slideChange //realIndexChange
      console.log("change " + swiper.realIndex);
      if (swiper.thumbs.swiper) {
        swiper.thumbs.swiper.slideToLoop(swiper.realIndex);
      }
    },
    //	  	afterInit: function(swiper) {
    //		},
  },

  //   pagination: {
  //     el: ".swiper-pagination",
  //     type: "fraction",
  //   },

  //slidesPerView: 4,
  //speed: 300,
};

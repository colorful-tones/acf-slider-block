/**
 * // This will run on the front end only.
 */

// Import Swiper dependency as module.
//import { Swiper } from '../../swiper/swiper-bundle.mjs';
//import Thumbs from '../../swiper/modules/thumbs.mjs';

import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

//old lightgallery
//import 'https://cdn.rawgit.com/sachinchoolur/lightgallery.js/master/dist/js/lightgallery.js';

//import lightGallery from 'https://cdnjs.cloudflare.com/ajax/libs/lightgallery/2.7.1/lightgallery.es5.min.js';
//import lightgallery from 'https://cdn.jsdelivr.net/npm/lightgallery@2.7.2/+esm'
//import lightGallery from "https://cdn.skypack.dev/lightgallery@2.0.0-beta.3";
import "https://cdnjs.cloudflare.com/ajax/libs/lightgallery/2.7.2/lightgallery.min.js";

//import lgZoom from "https://cdnjs.cloudflare.com/ajax/libs/lightgallery/2.7.1/plugins/zoom/lg-zoom.es5.min.js";
//import lightGallery from 'https://cdn.skypack.dev/lightgallery@2.0.0-beta.3';
//let $lgSwiper = document.getElementById("lg-swipper");

// Import internal Swiper config object.
import { swiperConfig } from "./swiper-config-default.js";

document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll(".swiper-main");

  // Select all thumbnail Swiper containers.
  const thumbContainers = document.querySelectorAll(".swiper-thumbs");
  const nextButtons = document.querySelectorAll(".swiper-button-next");
  const prevButtons = document.querySelectorAll(".swiper-button-prev");

  if (!containers.length) {
    console.log("ℹ️ No slider containers found");
    return;
  }

  console.log(`🎯 Found ${containers.length} slider container(s)`);

  //var count = 0;
  containers.forEach((element, index) => {
    const thumbElement = thumbContainers[index];

    console.log(`🎯 Processing slider ${index + 1}/${containers.length}`);

    //console.log(thumbElement);
    //console.log(thumbElement.childNodes.length);

    if (thumbElement && thumbElement.childNodes.length > 1) {
      console.log(`🎯 Slider ${index + 1}: Has thumbnails`);
      //console.log('test '+index);

      //console.log(element.id);
      //const newThumbElement = document.querySelectorAll(element.id+' .swiper-thumbs');
      //console.log(newThumbElement);

      // Get the main slider configuration from data attribute
      let mainSliderConfig = {};
      if (element.dataset.swiperConfig) {
        try {
          mainSliderConfig = JSON.parse(element.dataset.swiperConfig);
          console.log(
            "✅ Using imported main slider config:",
            mainSliderConfig
          );
        } catch (e) {
          console.warn(
            "⚠️ Failed to parse main slider config, using defaults:",
            e
          );
          mainSliderConfig = {};
        }
      } else {
        console.log("ℹ️ No main slider config found, using defaults");
      }

      // Get thumbnail configuration from data attribute
      let thumbConfig = {};
      if (thumbElement.dataset.swiperConfig) {
        try {
          thumbConfig = JSON.parse(thumbElement.dataset.swiperConfig);
          console.log("✅ Using imported thumbnail config:", thumbConfig);
        } catch (e) {
          console.warn(
            "⚠️ Failed to parse thumbnail config, using defaults:",
            e
          );
          thumbConfig = {};
        }
      } else {
        console.log("ℹ️ No thumbnail config found, using defaults");
      }

      // Merge thumbnail config with defaults
      const finalThumbConfig = {
        centeredSlides: true,
        centeredSlidesBounds: true, //fills out full bar wide
        slidesPerView: 3, // Adjust slidesPerView for vertical
        spaceBetween: 10, // Space between thumbnails.
        loop: true, // Enable loop to match main swiper
        direction: "horizontal", // Sync direction with main swiper
        ...thumbConfig, // Apply custom thumbnail config (imported or default)
      };

      const thumbSwiper = new Swiper(thumbElement, finalThumbConfig);

      // Merge main slider configuration with defaults
      const finalConfig = {
        ...swiperConfig, // Start with default config
        ...mainSliderConfig, // Override with imported config if available
        navigation: {
          nextEl: nextButtons[index],
          prevEl: prevButtons[index],
        },
        thumbs: {
          swiper: thumbSwiper, // Link the thumbnail swiper to the main swiper.
        },
      };
      console.log("🎯 Final main slider config:", finalConfig);
      console.log("🎯 Final thumbnail config:", finalThumbConfig);

      // Initialize the main Swiper with the linked thumbnail Swiper.
      //const mainSwiper = new Swiper(element, finalConfig);
      //new Swiper(element, finalConfig);
      var swiper = new Swiper(element, finalConfig);

      //swiper.controller.control = thumbSwiper;
      //thumbSwiper.controller.control = swiper;
    } else {
      console.log(`🎯 Slider ${index + 1}: No thumbnails`);
      // No thumbnails - only main slider
      let mainSliderConfig = {};
      if (element.dataset.swiperConfig) {
        try {
          mainSliderConfig = JSON.parse(element.dataset.swiperConfig);
          console.log(
            "✅ Using imported main slider config (no thumbnails):",
            mainSliderConfig
          );
        } catch (e) {
          console.warn(
            "⚠️ Failed to parse main slider config, using defaults:",
            e
          );
          mainSliderConfig = {};
        }
      } else {
        console.log(
          "ℹ️ No main slider config found, using defaults (no thumbnails)"
        );
      }

      // Merge main slider configuration with defaults
      const finalConfig = {
        ...swiperConfig, // Start with default config
        ...mainSliderConfig, // Override with imported config if available
        navigation: {
          nextEl: nextButtons[index],
          prevEl: prevButtons[index],
        },
      };
      console.log("🎯 Final main slider config (no thumbnails):", finalConfig);
      // Initialize the main Swiper with custom configuration.
      var swiper = new Swiper(element, finalConfig);
    }

    // document
    //   .querySelectorAll(".swiper-button-prev, .swiper-button-next")
    //   .forEach((button) => {
    //     if (!button.hasAttribute("aria-controls")) {
    //       button.style.display = "none";
    //     }
    //   });

    function copyColorClassesAndInlineStylesToActiveBullet(slider) {
      // Get all class names that contain "color"
      const colorClasses = Array.from(slider.classList).filter((cls) =>
        cls.includes("color")
      );

      // Find the active pagination bullet
      const activeBullet = slider.querySelector(
        ".swiper-pagination-bullet.swiper-pagination-bullet-active"
      );

      if (activeBullet) {
        // Add all color-related classes
        colorClasses.forEach((cls) => {
          activeBullet.classList.add(cls);
        });

        // Copy inline color and background styles, if any
        const inlineColor = slider.style.color;
        const inlineBg =
          slider.style.background || slider.style.backgroundColor;

        if (inlineColor) {
          activeBullet.style.color = inlineColor;
        }
        if (inlineBg) {
          activeBullet.style.background = inlineBg;
        }
      }
    }

    document.querySelectorAll(".wp-block-wpe-slider").forEach((slider) => {
      copyColorClassesAndInlineStylesToActiveBullet(slider);

      const swiperInstance = slider.querySelector(".swiper")?.swiper;
      if (swiperInstance) {
        swiperInstance.on("slideChange", () => {
          // Clean up old color classes and inline styles
          slider
            .querySelectorAll(".swiper-pagination-bullet")
            .forEach((bullet) => {
              Array.from(bullet.classList).forEach((cls) => {
                if (cls.includes("color")) {
                  bullet.classList.remove(cls);
                }
              });
              bullet.style.color = "";
              bullet.style.background = "";
            });

          // Copy color-related classes and inline styles to new active bullet
          copyColorClassesAndInlineStylesToActiveBullet(slider);
        });
      }
    });

    //let $lgSwiper = document.getElementById('lg-swipper');

    /*
		swiper.on('afterInit', function () {
		    swiper.slideTo(1, 1, false)
		    //swiper.slidePrev(1, false)
		})
		swiper.init()
		*/
    //swiper.SlideTo(1);

    //count++;
  });

  console.log("🎯 Slider initialization complete");

  //			let $lgSwiper = document.getElementById("wpe-block-id-1");

  /*
	const $lgContainer = document.getElementById("wpe-block-id-1");

	const lg = lightGallery($lgContainer, {
	  speed: 500,
	  showZoomInOutIcons: true,
	  actualSize: false,
		controls: true,
		selector: '.swiper-slide > img',
	  //plugins: [lgZoom]
	});
*/
});

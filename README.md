# ACF Slider Block plugin

__Fork it, or download the [latest release](https://github.com/colorful-tones/acf-slider-block/releases), and make it your own!__

This is a demonstration of how you might create a custom [ACF Block](https://www.advancedcustomfields.com/resources/blocks/), which is a slider carousel UI. We're using SwiperJS (3rd-party dependency) for the slider JavaScript and CSS (mostly).

## Installation

__Required__ You must have [ACF PRO](https://https://www.advancedcustomfields.com/pro/) installed and activated in order to use the ACF Slider Block plugin.

### Manual

1. Upload the `acf-slider-block` folder to the plugins directory (typically `wp-content/plugins`) in your WordPress installation.
2. Activate the ACF Slider Block plugin.
3. Create a new post or page, and insert the Slider block.
4. That's it.

## Changelog

### 0.1.1 – 2023-11-15

Initial release, which includes:

- Slider Block which uses [SwiperJS](https://swiperjs.com/) (v11.0.4)
  - Two style variations: "Default" and "Complex" - examples of how you might have different variations. Feel free to fork and modify!

## Resources

- Need help converting your block markup to PHP nested arrays or JS objects? Check out [WPHTML Converter](https://happyprime.github.io/wphtml-converter/)
- Download and include the latest [SwiperJS from JSDelivr.com](https://www.jsdelivr.com/package/npm/swiper).
- Developer.WordPress.org - ['Metadata in block.json'](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)
- Developer.WordPress.org - ['Supports'](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/)

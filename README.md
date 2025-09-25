# ACF Slider Block

A WordPress slider carousel block with separate configuration options for main slider and thumbnails, featuring real-time JSON validation and Swiper.js integration.

## Table of Contents

- [Features](#features)
- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Frontend Implementation](#frontend-implementation)
- [Testing Guide](#testing-guide)
- [File Structure](#file-structure)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Requirements](#requirements)
- [Support](#support)

## Features

- **Separate Configuration**: Configure main slider and thumbnail slider independently
- **JSON Configuration**: Paste JSON directly or upload JSON files
- **Real-time Validation**: JSON validation with helpful error messages
- **Swiper.js Integration**: Full Swiper.js configuration support
- **Conditional Thumbnails**: Thumbnail configuration only shows when thumbnails are enabled
- **Visual Feedback**: Status indicators for validation results
- **Example Template**: Pre-configured example JSON file
- **Debounced Input**: Performance-optimized validation (300ms delay)

## Overview

The ACF Slider Block now supports custom Swiper.js configuration through JSON input with **real-time validation**. This allows you to customize the slider behavior, effects, and responsive settings directly from the Gutenberg editor with immediate feedback.

### Key Features

- **Textarea Input**: Paste JSON configuration directly
- **File Upload**: Upload JSON files for configuration
- **Real-time Validation**: ✅ **NEW** - JSON syntax and structure validation as you type
- **Visual Feedback**: Status indicators for validation results
- **Example Template**: Pre-configured example JSON file
- **Debounced Input**: Performance-optimized validation (300ms delay)

## Installation

1. Upload the plugin to your WordPress plugins directory
2. Activate the plugin through the WordPress admin
3. Ensure Advanced Custom Fields Pro is installed and activated
4. The Slider block will be available in the Gutenberg editor

## Usage

### 1. Adding the Slider Block

1. In the Gutenberg editor, add a new "Slider" block
2. The block will appear with default settings

### 2. Configuring Swiper Settings

In the block settings panel, you'll find accordion sections for configuration:

#### Main Slider Section
1. **Accordion**: "Main Slider" (expandable)
2. **Group**: "Main Slider Configuration" (contains fields)
   - JSON Configuration (textarea)
   - Upload JSON File (file upload)
   - Validation Status (message)

#### Thumbnails Section
1. **Accordion**: "Thumbnails" (expandable, conditional)
2. **Group**: "Thumbnails Configuration" (contains fields)
   - JSON Configuration (textarea)
   - Upload JSON File (file upload)
   - Validation Status (message)

### 3. Configuration Methods

#### Textarea Method
- Paste your JSON configuration directly into the textarea
- **Real-time validation** occurs as you type (with 300ms debounce)
- Use the provided placeholder as a template
- Validation status updates immediately

#### File Upload Method
- Click "Upload JSON File" to select a JSON file
- Only `.json` files are accepted (max 1MB)
- File content is validated immediately upon selection
- File content will override textarea content

### 4. Real-time Validation

The system provides **immediate feedback**:
- ✅ **Valid**: Configuration is accepted and will be applied
- ❌ **Error**: JSON syntax error - fix before saving
- ⚠️ **Warning**: Potential invalid Swiper option - review
- 📁 **Loading**: File is being processed
- **Empty**: No configuration provided

## Configuration

### Example Configurations

#### Main Slider Configuration
```json
{
  "threshold": 5,
  "slidesPerView": 3,
  "observer": true,
  "observeParents": true,
  "loop": true,
  "watchSlidesProgress": true,
  "autoplay": {
    "disableOnInteraction": false,
    "enabled": true,
    "delay": 3000
  },
  "grabCursor": true,
  "effect": "coverflow",
  "speed": 600,
  "centeredSlides": true,
  "keyboard": {
    "enabled": true
  },
  "breakpoints": {
    "320": {
      "slidesPerView": 1,
      "spaceBetween": 10
    },
    "768": {
      "slidesPerView": 2,
      "spaceBetween": 20
    },
    "1024": {
      "slidesPerView": 3,
      "spaceBetween": 30
    }
  }
}
```

#### Thumbnails Configuration
```json
{
  "slidesPerView": 4,
  "spaceBetween": 10,
  "freeMode": true,
  "watchSlidesProgress": true,
  "centeredSlides": true,
  "centeredSlidesBounds": true,
  "loop": true,
  "direction": "horizontal",
  "breakpoints": {
    "320": {
      "slidesPerView": 2,
      "spaceBetween": 5
    },
    "768": {
      "slidesPerView": 3,
      "spaceBetween": 10
    },
    "1024": {
      "slidesPerView": 4,
      "spaceBetween": 10
    }
  }
}
```

### Supported Swiper Options

The system validates against common Swiper.js options:

#### Basic Options
- `slidesPerView`, `slidesPerGroup`, `spaceBetween`
- `centeredSlides`, `loop`, `speed`, `direction`
- `threshold`, `observer`, `observeParents`

#### Effects
- `effect`, `coverflowEffect`, `flipEffect`
- `cubeEffect`, `fadeEffect`, `creativeEffect`

#### Navigation
- `navigation`, `pagination`, `scrollbar`
- `keyboard`, `mousewheel`, `hashNavigation`

#### Autoplay
- `autoplay` (object with `enabled`, `delay`, etc.)

#### Responsive
- `breakpoints` (object with screen size configurations)

#### Advanced
- `freeMode`, `grid`, `virtual`, `history`
- `grabCursor`, `watchSlidesProgress`
- Touch and interaction options

## Frontend Implementation

### How It Works

The frontend checks for configuration data in the following order:

1. **Main Slider Configuration**: 
   - Checks `data-swiper-config` attribute on `.swiper-main` element
   - If found and valid JSON, uses the imported configuration
   - If not found or invalid, falls back to default configuration

2. **Thumbnail Configuration**:
   - Checks `data-swiper-config` attribute on `.swiper-thumbs` element
   - If found and valid JSON, uses the imported configuration
   - If not found or invalid, falls back to default configuration

### Default Configurations

#### Main Slider Defaults
```javascript
{
  slidesPerView: 1,
  uniqueNavElements: true,
  direction: "horizontal",
  effect: "slide",
  keyboard: true,
  loop: true,
  // ... other defaults from swiper-config-default.js
}
```

#### Thumbnail Defaults
```javascript
{
  centeredSlides: true,
  centeredSlidesBounds: true,
  slidesPerView: 3,
  spaceBetween: 10,
  loop: true,
  direction: "horizontal"
}
```

### Configuration Merging

The final configuration is created by merging in this order:

1. **Default configuration** (from `swiper-config-default.js`)
2. **Imported configuration** (if provided and valid)
3. **Navigation elements** (next/prev buttons)
4. **Thumbnail linking** (if thumbnails exist)

### Error Handling

- **JSON Parsing Errors**: If imported JSON is invalid, the system logs a warning and uses defaults
- **Missing Configurations**: If no configuration is provided, the system logs an info message and uses defaults
- **Thumbnail Detection**: Automatically detects if thumbnails exist and configures accordingly

### Console Logging

The implementation includes comprehensive console logging to help with debugging:

- `🎯 Found X slider container(s)` - Shows how many sliders were found
- `🎯 Processing slider X/Y` - Shows progress through slider initialization
- `✅ Using imported main slider config` - When imported config is successfully loaded
- `ℹ️ No main slider config found, using defaults` - When falling back to defaults
- `⚠️ Failed to parse main slider config, using defaults` - When JSON parsing fails
- `🎯 Final main slider config` - Shows the final merged configuration

## Testing Guide

### Current Structure

The plugin now uses proper ACF accordion fields:

### Main Slider Section
1. **Accordion**: "Main Slider" (expandable)
2. **Group**: "Main Slider Configuration" (contains fields)
   - JSON Configuration (textarea)
   - Upload JSON File (file upload)
   - Validation Status (message)

### Thumbnails Section
1. **Accordion**: "Thumbnails" (expandable, conditional)
2. **Group**: "Thumbnails Configuration" (contains fields)
   - JSON Configuration (textarea)
   - Upload JSON File (file upload)
   - Validation Status (message)

### Testing Steps

1. **Add Slider Block**: Create a new post/page and add the Slider block
2. **Check Accordions**: Verify "Main Slider" and "Thumbnails" appear as expandable accordions
3. **Expand Main Slider**: Click on "Main Slider" accordion - should show configuration fields
4. **Enable Thumbnails**: Toggle "Show thumbnail" to see "Thumbnails" accordion appear
5. **Expand Thumbnails**: Click on "Thumbnails" accordion - should show configuration fields
6. **Test JSON Input**: Paste JSON in textarea fields
7. **Test File Upload**: Upload JSON files
8. **Check Validation**: Verify validation messages appear

### Expected Behavior

- ✅ Accordions should expand/collapse smoothly
- ✅ Fields should be visible when accordions are expanded
- ✅ Thumbnails accordion should only show when thumbnails are enabled
- ✅ JSON validation should work for both sections
- ✅ File uploads should work for both sections

### Field Names

- Main Slider: `main_slider_config`
- Thumbnails: `thumbnails_config`
- Accordion dividers: `main_slider_accordion`, `thumbnails_accordion`

## File Structure

```
acf-slider-block-main/
├── assets/
│   └── swiper-config-example.json    # Example configuration
├── acf-json/
│   └── group_slider_fields.json      # ACF field definitions
├── blocks/
│   └── slider/
│       ├── template.php              # Block template
│       ├── view.js                   # Frontend JavaScript
│       ├── editor.js                 # Editor JavaScript (with validation)
│       └── editor.css                # Editor styles
├── swiper/                           # Swiper.js library files
├── acf-fields-export/                # ACF field exports
└── acf-slider-block.php              # Main plugin file
```

## Technical Details

### Data Flow
1. User inputs JSON in editor
2. **Real-time validation** occurs immediately
3. PHP validates JSON syntax and structure on save
4. Validated data stored in block attributes
5. JavaScript reads configuration from data attributes
6. Swiper.js initialized with custom settings

### Validation Process
1. **Real-time Check**: Validates JSON format as user types
2. **Structure Check**: Validates against known Swiper options
3. **Type Validation**: Checks data types for specific options
4. **Storage**: Stores processed configuration
5. **Application**: Applies settings to Swiper instance

### Performance Features
- **Debounced Input**: 300ms delay to prevent excessive validation
- **File Size Limit**: 1MB maximum for uploaded files
- **Efficient DOM Updates**: Minimal re-rendering
- **Memory Management**: Proper cleanup of event listeners

### Error Handling
- Invalid JSON shows error message immediately
- Unknown options show warning
- File upload errors are handled gracefully
- Graceful fallback to default settings

### Backend Integration

The backend provides configuration through:

1. **Block Data**: Configuration stored in block attributes during editing
2. **Post Meta**: Configuration stored in post meta fields
3. **Template Rendering**: Data attributes added to HTML elements

The `wpe_get_main_slider_config()` and `wpe_get_thumbnails_config()` functions handle the backend logic for retrieving and processing configurations.

## Troubleshooting

### JSON Not Applied
- Check validation status in editor (should show ✅)
- Ensure JSON syntax is correct
- Verify Swiper option names

### Validation Not Working
- Clear browser cache
- Check browser console for JavaScript errors
- Ensure ACF Pro is active
- Verify plugin is properly activated

### Configuration Conflicts
- Custom settings override defaults
- Navigation settings are preserved
- Thumbnail settings take precedence

### Performance
- Large configurations may impact load time
- Consider using breakpoints for responsive design
- Test on different devices

### Testing

To test the implementation:

1. Create a slider block without any custom configuration - should use defaults
2. Add custom JSON configuration for main slider - should merge with defaults
3. Add custom JSON configuration for thumbnails - should merge with defaults
4. Add invalid JSON - should fall back to defaults with warning
5. Check browser console for detailed logging of the configuration process

## Requirements

- WordPress 5.0+
- Advanced Custom Fields Pro
- Modern browser with ES6 support
- Swiper.js 11.x (included)

## Support

For issues or questions:
1. Check validation messages in editor
2. Review browser console for errors
3. Test with example configuration
4. Clear cache if using caching plugins
5. Verify ACF Pro is active
6. Refer to the WordPress plugin documentation or contact the development team 
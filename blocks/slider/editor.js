/**
 * This will run only in the editor.
 */

// Import Swiper dependency as module.
//import { Swiper } from '../../swiper/swiper-bundle.mjs';
import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

// Import internal Swiper config object.
import { swiperConfig } from "./swiper-config-default.js";

// Make sure ACF's hooks are available.
if (window.acf) {
  // Trigger action for our Slider block.
  window.acf.addAction(
    "render_block_preview/type=wpe/slider",
    acfRenderSliderBlock
  );

  // Also trigger validation initialization when block is rendered
  window.acf.addAction("render_block_preview/type=wpe/slider", () => {
    console.log("🔍 Slider block rendered, initializing validation...");
    // Wait a bit for ACF fields to be fully rendered
    setTimeout(initializeJsonValidation, 500);
  });
}

// Also listen for WordPress block editor events
if (window.wp && window.wp.data) {
  // Listen for block selection changes
  window.wp.data.subscribe(() => {
    const selectedBlock = window.wp.data
      .select("core/block-editor")
      .getSelectedBlock();
    if (selectedBlock && selectedBlock.name === "wpe/slider") {
      // Re-initialize navigation when slider block is selected
      setTimeout(() => {
        const sliderBlock = document.querySelector(
          `[data-block="${selectedBlock.clientId}"]`
        );
        if (sliderBlock) {
          const swiperEl = sliderBlock.querySelector(".swiper-main");
          if (swiperEl && swiperEl.swiper) {
            updateEditorNavigation(sliderBlock, swiperEl.swiper);
          }
        }
      }, 100);
    }
  });

  // Listen for block changes to regenerate thumbnails
  let previousBlockCount = 0;
  window.wp.data.subscribe(() => {
    const blocks = window.wp.data.select("core/block-editor").getBlocks();
    const currentBlockCount = blocks.length;

    // If blocks were added or removed, update all sliders
    if (currentBlockCount !== previousBlockCount) {
      console.log("🔄 Block count changed, regenerating thumbnail sliders...");
      setTimeout(() => {
        const sliderBlocks = document.querySelectorAll("[data-block]");
        sliderBlocks.forEach((blockEl) => {
          const swiperEl = blockEl.querySelector(".swiper-main");
          if (swiperEl && swiperEl.swiper) {
            // Update main swiper
            swiperEl.swiper.update();
            swiperEl.swiper.updateSlides();

            // Update editor navigation
            updateEditorNavigation(blockEl, swiperEl.swiper);

            // Regenerate thumbnails if enabled with delay for image loading
            const thumbnailEnabled =
              blockEl.querySelector(".swiper-thumbs.editor-thumbnails") !==
              null;
            if (thumbnailEnabled) {
              setTimeout(() => {
                populateThumbnailContent(blockEl);
                const thumbSwiper = blockEl.querySelector(
                  ".swiper-thumbs.editor-thumbnails"
                );
                if (thumbSwiper && thumbSwiper.swiper) {
                  thumbSwiper.swiper.update();
                  thumbSwiper.swiper.updateSlides();
                }
                updateThumbnailActiveState(blockEl, swiperEl.swiper);
              }, 300); // Give images time to load
            }
          }
        });
      }, 200);
    }

    previousBlockCount = currentBlockCount;
  });
}

// Initialize Swiper with special configuration for editor.
function acfRenderSliderBlock(block) {
  let swiperEl = block[0].querySelector(".swiper-main");
  let sliderBlock = block[0];

  if (!swiperEl) {
    return;
  }

  // We want to make sure some Swiper things behave
  // smoothly in the editor.
  if (swiperEl && swiperConfig) {
    swiperConfig.autoplay = false;
    swiperConfig.loop = false;
    swiperConfig.observer = true;
    swiperConfig.observeSlideChildren = true;
    swiperConfig.simulateTouch = false;
  }

  // Check if thumbnails are enabled
  const thumbnailEnabled =
    sliderBlock.querySelector(".swiper-thumbs.editor-thumbnails") !== null;
  let thumbSwiper = null;

  // Initialize thumbnail Swiper if enabled
  if (thumbnailEnabled) {
    const thumbEl = sliderBlock.querySelector(
      ".swiper-thumbs.editor-thumbnails"
    );
    if (thumbEl) {
      // Get thumbnail configuration from data attribute
      let thumbConfig = {};
      if (thumbEl.dataset.swiperConfig) {
        try {
          thumbConfig = JSON.parse(thumbEl.dataset.swiperConfig);
          console.log(
            "✅ Using imported thumbnail config in editor:",
            thumbConfig
          );
        } catch (e) {
          console.warn(
            "⚠️ Failed to parse thumbnail config in editor, using defaults:",
            e
          );
          thumbConfig = {};
        }
      }

      // Merge thumbnail config with editor-specific defaults
      const finalThumbConfig = {
        centeredSlides: true,
        centeredSlidesBounds: true,
        slidesPerView: 3,
        spaceBetween: 10,
        loop: false, // Disable loop in editor
        direction: "horizontal",
        observer: true,
        observeSlideChildren: true,
        simulateTouch: false, // Disable touch in editor
        speed: 300, // Smooth transition speed
        freeMode: {
          enabled: true,
          sticky: true, // Keep slides in place when not dragging
        },
        watchSlidesProgress: true, // Enable slide progress watching
        ...thumbConfig, // Apply custom thumbnail config
      };

      // Populate thumbnail content from main slider
      populateThumbnailContent(sliderBlock);

      // Initialize thumbnail Swiper
      thumbSwiper = new Swiper(thumbEl, finalThumbConfig);
      console.log(
        "✅ Thumbnail Swiper initialized in editor",
        finalThumbConfig
      );
    }
  }

  // Add thumbs configuration to main slider if thumbnails exist
  if (thumbSwiper) {
    swiperConfig.thumbs = {
      swiper: thumbSwiper,
    };
  }

  // Initialize a Swiper instance.
  const swiper = new Swiper(swiperEl, swiperConfig);

  // Add editor navigation controls
  addEditorNavigation(sliderBlock, swiper);

  // Use Swiper's MutationObserver to trigger updates.
  swiperEl.swiper.on("observerUpdate", () => {
    swiperEl.swiper.update();
    swiperEl.swiper.updateSlides();
    updateEditorNavigation(sliderBlock, swiper);

    // Update thumbnail content when main slider changes
    if (thumbnailEnabled) {
      populateThumbnailContent(sliderBlock);
      if (thumbSwiper) {
        thumbSwiper.update();
        thumbSwiper.updateSlides();
      }
      updateThumbnailActiveState(sliderBlock, swiper);
    }
  });

  // Add MutationObserver to detect when slides are added, removed, or updated
  const slideObserver = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    let slideChangeType = "unknown";

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        // Check if slide elements were added
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList && node.classList.contains("swiper-slide")) {
              shouldUpdate = true;
              slideChangeType = "added";
            } else if (
              node.querySelector &&
              node.querySelector(".swiper-slide")
            ) {
              shouldUpdate = true;
              slideChangeType = "added";
            }
          }
        });

        // Check if slide elements were removed
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList && node.classList.contains("swiper-slide")) {
              shouldUpdate = true;
              slideChangeType = "removed";
            } else if (
              node.querySelector &&
              node.querySelector(".swiper-slide")
            ) {
              shouldUpdate = true;
              slideChangeType = "removed";
            }
          }
        });
      }

      // Check for attribute changes (like image updates)
      if (mutation.type === "attributes") {
        const target = mutation.target;
        if (target.tagName === "IMG" && target.closest(".swiper-slide")) {
          shouldUpdate = true;
          slideChangeType = "updated";
        }
      }
    });

    if (shouldUpdate) {
      console.log(
        `🔄 Slide ${slideChangeType} detected, regenerating thumbnail slider...`
      );

      // Update main swiper
      setTimeout(() => {
        swiperEl.swiper.update();
        swiperEl.swiper.updateSlides();
        updateEditorNavigation(sliderBlock, swiper);

        // Regenerate thumbnail slider with delay to allow images to load
        if (thumbnailEnabled) {
          setTimeout(() => {
            populateThumbnailContent(sliderBlock);
            if (thumbSwiper) {
              thumbSwiper.update();
              thumbSwiper.updateSlides();
            }
            updateThumbnailActiveState(sliderBlock, swiper);
          }, 300); // Give images time to load
        }
      }, 100);
    }
  });

  // Start observing the swiper wrapper for changes
  const swiperWrapper = swiperEl.querySelector(".swiper-wrapper");
  if (swiperWrapper) {
    slideObserver.observe(swiperWrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "alt", "class", "style"],
    });
  }

  // Add specific observer for image changes within slides
  const imageObserver = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        const target = mutation.target;
        if (target.tagName === "IMG" && target.closest(".swiper-slide")) {
          // Check if it's a meaningful change (src, alt, or style changes)
          if (
            ["src", "alt", "class", "style"].includes(mutation.attributeName)
          ) {
            shouldUpdate = true;
            console.log(`🔄 Image ${mutation.attributeName} changed in slide`);
          }
        }
      }
    });

    if (shouldUpdate) {
      console.log("🔄 Image change detected, updating thumbnails...");

      // Update thumbnails with delay to allow image to load
      if (thumbnailEnabled) {
        setTimeout(() => {
          populateThumbnailContent(sliderBlock);
          if (thumbSwiper) {
            thumbSwiper.update();
            thumbSwiper.updateSlides();
          }
          updateThumbnailActiveState(sliderBlock, swiper);
        }, 200);
      }
    }
  });

  // Observe all images within the slider for changes
  const allImages = swiperWrapper.querySelectorAll("img");
  allImages.forEach((img) => {
    imageObserver.observe(img, {
      attributes: true,
      attributeFilter: ["src", "alt", "class", "style"],
    });
  });

  // Store observers for cleanup
  sliderBlock._slideObserver = slideObserver;
  sliderBlock._imageObserver = imageObserver;
}

// Populate thumbnail content from main slider
function populateThumbnailContent(sliderBlock) {
  const mainSwiper = sliderBlock.querySelector(".swiper-main");
  const thumbSwiper = sliderBlock.querySelector(
    ".swiper-thumbs.editor-thumbnails"
  );

  if (!mainSwiper || !thumbSwiper) {
    return;
  }

  const mainSlides = mainSwiper.querySelectorAll(".swiper-slide");
  const thumbWrapper = thumbSwiper.querySelector(".swiper-wrapper");

  if (!thumbWrapper) {
    return;
  }

  // Clear existing thumbnail content
  thumbWrapper.innerHTML = "";

  // Copy each main slide to create thumbnail
  mainSlides.forEach((slide, index) => {
    const thumbSlide = slide.cloneNode(true);

    // Add swiper-slide class if not present
    if (!thumbSlide.classList.contains("swiper-slide")) {
      thumbSlide.classList.add("swiper-slide");
    }

    // Add editor-specific thumbnail class
    thumbSlide.classList.add("editor-thumbnail-slide");

    // Remove lightbox functionality from thumbnails
    const lightboxElements = thumbSlide.querySelectorAll(".lightbox-toggle");
    lightboxElements.forEach((el) => el.remove());

    // Remove height styles that might interfere with thumbnail display
    thumbSlide.style.height = "";

    // Handle image loading for thumbnails
    const images = thumbSlide.querySelectorAll("img");
    images.forEach((img) => {
      // If image is already loaded, ensure it displays properly
      if (img.complete && img.naturalHeight !== 0) {
        img.style.opacity = "1";
        img.style.visibility = "visible";
      } else {
        // If image is still loading, wait for it to load
        img.style.opacity = "0";
        img.style.visibility = "hidden";

        const handleImageLoad = () => {
          img.style.opacity = "1";
          img.style.visibility = "visible";
          img.removeEventListener("load", handleImageLoad);
          img.removeEventListener("error", handleImageError);
        };

        const handleImageError = () => {
          console.warn("Thumbnail image failed to load:", img.src);
          img.style.opacity = "1";
          img.style.visibility = "visible";
          img.removeEventListener("load", handleImageLoad);
          img.removeEventListener("error", handleImageError);
        };

        img.addEventListener("load", handleImageLoad);
        img.addEventListener("error", handleImageError);

        // Force reload if image is in loading state
        if (img.src && !img.complete) {
          const originalSrc = img.src;
          img.src = "";
          img.src = originalSrc;
        }
      }
    });

    // Add click handler to sync with main slider
    thumbSlide.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Find the main swiper instance and slide to this index
      const mainSwiperInstance = mainSwiper.swiper;
      if (mainSwiperInstance) {
        mainSwiperInstance.slideTo(index);
      }
    });

    thumbWrapper.appendChild(thumbSlide);
  });

  console.log(`✅ Populated ${mainSlides.length} thumbnails in editor`);
}

// Add navigation controls to the editor
function addEditorNavigation(sliderBlock, swiper) {
  // Remove existing navigation if any
  const existingNav = sliderBlock.querySelector(".editor-slide-navigation");
  if (existingNav) {
    existingNav.remove();
  }

  // Check if we have multiple slides
  const slides = sliderBlock.querySelectorAll(".swiper-main .swiper-slide");
  console.log("slides", slides.length);
  if (slides.length <= 1) {
    sliderBlock.classList.remove("has-multiple-slides");
    return;
  }

  sliderBlock.classList.add("has-multiple-slides");

  // Create navigation container
  const navigation = document.createElement("div");
  navigation.className = "editor-slide-navigation";
  navigation.innerHTML = `
    <button class="editor-slide-nav-button" data-action="prev" title="Previous Slide">← Prev</button>
    <div class="editor-slide-counter">1 / ${slides.length}</div>
    <button class="editor-slide-nav-button" data-action="next" title="Next Slide">Next →</button>
  `;

  // Add event listeners with event delegation and prevent default
  navigation.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const button = e.target.closest(".editor-slide-nav-button");
    if (!button) return;

    // Don't proceed if button is disabled
    if (button.disabled) return;

    const action = button.getAttribute("data-action");

    if (action === "prev") {
      swiper.slidePrev();
    } else if (action === "next") {
      swiper.slideNext();
    }

    // Update state after a short delay to ensure Swiper has updated
    setTimeout(updateNavigationState, 50);
  });

  // Ensure block selection still works by allowing clicks to pass through
  navigation.addEventListener("mousedown", (e) => {
    // Don't prevent mousedown events that might be needed for block selection
    if (!e.target.closest(".editor-slide-nav-button")) {
      e.stopPropagation();
    }
  });

  // Update navigation state
  function updateNavigationState() {
    const currentSlide = swiper.realIndex + 1;
    const totalSlides = slides.length;
    const counter = navigation.querySelector(".editor-slide-counter");
    const prevButton = navigation.querySelector('[data-action="prev"]');
    const nextButton = navigation.querySelector('[data-action="next"]');

    if (counter) {
      counter.textContent = `${currentSlide} / ${totalSlides}`;
    }

    if (prevButton) {
      // Disable prev button when on first slide
      const isFirstSlide = swiper.realIndex === 0;
      prevButton.disabled = isFirstSlide;
      if (isFirstSlide) {
        prevButton.style.opacity = "0.5";
        prevButton.style.cursor = "not-allowed";
      } else {
        prevButton.style.opacity = "1";
        prevButton.style.cursor = "pointer";
      }
    }

    if (nextButton) {
      // Disable next button when on last slide
      const isLastSlide = swiper.realIndex === totalSlides - 1;
      nextButton.disabled = isLastSlide;
      if (isLastSlide) {
        nextButton.style.opacity = "0.5";
        nextButton.style.cursor = "not-allowed";
      } else {
        nextButton.style.opacity = "1";
        nextButton.style.cursor = "pointer";
      }
    }
  }

  // Listen for slide changes
  swiper.on("slideChange", () => {
    updateNavigationState();
    updateThumbnailActiveState(sliderBlock, swiper);
  });

  // Initial state
  updateNavigationState();
  updateThumbnailActiveState(sliderBlock, swiper);

  // Add navigation to slider
  sliderBlock.appendChild(navigation);

  // Store reference to prevent garbage collection
  sliderBlock._editorNavigation = {
    navigation: navigation,
    updateState: updateNavigationState,
  };
}

// Update thumbnail active state to match main slider
function updateThumbnailActiveState(sliderBlock, mainSwiper) {
  const thumbSwiper = sliderBlock.querySelector(
    ".swiper-thumbs.editor-thumbnails"
  );
  if (!thumbSwiper || !thumbSwiper.swiper) {
    return;
  }

  const currentIndex = mainSwiper.realIndex;
  const thumbSlides = thumbSwiper.querySelectorAll(".editor-thumbnail-slide");
  // Remove active class from all thumbnails
  thumbSlides.forEach((slide) => {
    slide.classList.remove("swiper-slide-thumb-active");
  });

  // Add active class to current thumbnail
  if (thumbSlides[currentIndex]) {
    thumbSlides[currentIndex].classList.add("swiper-slide-thumb-active");
  }

  // Update thumbnail swiper to show current slide
  if (thumbSwiper.swiper) {
    thumbSwiper.swiper.slideTo(currentIndex, 0); // 0 speed for instant update
  }
}

// Update navigation when slides change
function updateEditorNavigation(sliderBlock, swiper) {
  const slides = sliderBlock.querySelectorAll(".swiper-main .swiper-slide");
  const navigation = sliderBlock.querySelector(".editor-slide-navigation");

  if (slides.length <= 1) {
    sliderBlock.classList.remove("has-multiple-slides");
    if (navigation) {
      navigation.remove();
    }
    return;
  }

  sliderBlock.classList.add("has-multiple-slides");

  if (!navigation) {
    addEditorNavigation(sliderBlock, swiper);
  } else {
    const counter = navigation.querySelector(".editor-slide-counter");
    const prevButton = navigation.querySelector('[data-action="prev"]');
    const nextButton = navigation.querySelector('[data-action="next"]');

    const currentSlide = swiper.realIndex + 1;
    const totalSlides = slides.length;

    counter.textContent = `${currentSlide} / ${totalSlides}`;
    prevButton.disabled = swiper.isBeginning;
    nextButton.disabled = swiper.isEnd;

    // Update thumbnail active state
    updateThumbnailActiveState(sliderBlock, swiper);
  }
}

/**
 * Real-time JSON validation for Swiper configuration
 */
function initializeJsonValidation() {
  console.log("🔍 initializeJsonValidation called");

  // Wait for ACF fields to be rendered
  setTimeout(() => {
    console.log("🔍 Searching for JSON validation elements...");

    // Match any JSON textarea related to Swiper blocks
    const textareas = document.querySelectorAll(
      'textarea[name*="json_textarea"]'
    );

    // Match any file input meant for JSON files
    const fileInputs = document.querySelectorAll('input[name*="json_file"]');

    // dataname is json_validation
    const validationFields = document.querySelectorAll(
      '[data-name*="json_validation"], [data-name*="swiper_config[json_validation]"]'
    );

    console.log("📝 Found textareas:", textareas.length);
    console.log("📁 Found file inputs:", fileInputs.length);
    console.log("✅ Found validation fields:", validationFields.length);

    // Debug: Log all textarea elements to see what's available
    const allTextareas = document.querySelectorAll("textarea");
    console.log("🔍 All textareas on page:", allTextareas.length);
    allTextareas.forEach((ta, i) => {
      console.log(`🔍 Textarea ${i}:`, ta.name, ta.placeholder);
    });

    // Debug: Log all elements with "json" in the name
    const allJsonElements = document.querySelectorAll('[name*="json"]');
    console.log('🔍 All elements with "json" in name:', allJsonElements.length);
    allJsonElements.forEach((el, i) => {
      console.log(`🔍 JSON element ${i}:`, el.name, el.tagName);
    });

    // Debug: Log all ACF file fields
    const allAcfFileFields = document.querySelectorAll(".acf-field-file");
    console.log("🔍 All ACF file fields:", allAcfFileFields.length);
    allAcfFileFields.forEach((field, i) => {
      console.log(`🔍 ACF file field ${i}:`, field);
    });

    // Add event listeners to textareas with debouncing
    textareas.forEach((textarea, index) => {
      console.log(`📝 Setting up textarea ${index}:`, textarea);
      let debounceTimer;

      textarea.addEventListener("input", () => {
        console.log(
          `📝 Textarea ${index} input event triggered, value:`,
          textarea.value.substring(0, 50) + "..."
        );
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`📝 Debounced validation for textarea ${index}`);
          validateJsonInput(textarea.value, validationFields[index]);
        }, 300); // 300ms debounce
      });

      textarea.addEventListener("blur", () => {
        console.log(`📝 Textarea ${index} blur event triggered`);
        clearTimeout(debounceTimer);
        validateJsonInput(textarea.value, validationFields[index]);
      });

      // Initial validation if there's content
      if (textarea.value.trim()) {
        console.log(`📝 Initial validation for textarea ${index}`);
        validateJsonInput(textarea.value, validationFields[index]);
      }
    });

    // Add event listeners to ACF file fields
    const acfFileFields = document.querySelectorAll(
      '.acf-field-file[data-name="json_file"], .acf-field-file[data-name*="swiper_config"]'
    );
    console.log("🔍 Found ACF file fields:", acfFileFields.length);

    acfFileFields.forEach((fileField, index) => {
      console.log(`📁 Setting up ACF file field ${index}:`, fileField);

      // Look for the actual file input within the ACF field
      const fileInput = fileField.querySelector('input[type="file"]');
      if (fileInput) {
        console.log(`📁 Found file input in ACF field ${index}:`, fileInput);
        fileInput.addEventListener("change", (e) => {
          console.log(`📁 ACF file input ${index} change event triggered`);
          handleFileUpload(e.target, validationFields[index]);
        });
      }

      // Also listen for ACF's custom upload events
      const uploadButton = fileField.querySelector(".acf-button");
      if (uploadButton) {
        console.log(
          `📁 Found upload button in ACF field ${index}:`,
          uploadButton
        );
        uploadButton.addEventListener("click", () => {
          console.log(`📁 ACF upload button ${index} clicked`);
          // Set loading state immediately
          updateValidationField(
            validationFields[index],
            "📁 Uploading file...",
            "loading"
          );
        });
      }

      // Monitor the hidden input that stores the attachment data
      const hiddenInput = fileField.querySelector('input[type="hidden"]');
      if (hiddenInput) {
        console.log(
          `📁 Found hidden input in ACF field ${index}:`,
          hiddenInput
        );

        // Create a mutation observer for this specific input
        const inputObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "value"
            ) {
              console.log(
                `📁 Hidden input ${index} value changed:`,
                hiddenInput.value
              );
              if (hiddenInput.value) {
                // Pass the file field element instead of validationFields[index]
                handleAcfFileId(hiddenInput.value, fileField);
              }
            }
          });
        });

        // Start observing the hidden input
        inputObserver.observe(hiddenInput, {
          attributes: true,
          attributeFilter: ["value"],
        });

        // Also listen for input events
        hiddenInput.addEventListener("input", () => {
          console.log(
            `📁 Hidden input ${index} input event:`,
            hiddenInput.value
          );
          if (hiddenInput.value) {
            // Pass the file field element instead of validationFields[index]
            handleAcfFileId(hiddenInput.value, fileField);
          }
        });
      }
    });

    // Also try to find any file inputs that might be hidden or dynamically created
    const allFileInputs = document.querySelectorAll('input[type="file"]');
    console.log("🔍 All file inputs on page:", allFileInputs.length);
    allFileInputs.forEach((input, i) => {
      console.log(`🔍 File input ${i}:`, input.name, input.id, input.className);
    });
  }, 1000);
}

/**
 * Validate JSON input and update validation field
 */
function validateJsonInput(jsonString, validationField) {
  console.log(
    "🔍 validateJsonInput called with:",
    jsonString.substring(0, 50) + "..."
  );
  console.log("🔍 validationField:", validationField);

  if (!jsonString.trim()) {
    console.log("🔍 Empty JSON string, setting empty state");
    updateValidationField(
      validationField,
      "JSON configuration is empty",
      "empty"
    );
    return;
  }

  try {
    console.log("🔍 Attempting to parse JSON...");
    const jsonData = JSON.parse(jsonString);
    console.log("🔍 JSON parsed successfully:", jsonData);

    const validationResult = validateSwiperStructure(jsonData);
    console.log("🔍 Validation result:", validationResult);

    if (validationResult.isValid) {
      console.log("🔍 JSON is valid, updating to success state");
      updateValidationField(
        validationField,
        "✅ Valid Swiper.js configuration",
        "success"
      );
    } else {
      console.log("🔍 JSON has warnings, updating to warning state");
      updateValidationField(
        validationField,
        `⚠️ ${validationResult.message}`,
        "warning"
      );
    }
  } catch (error) {
    console.log("🔍 JSON parsing error:", error.message);
    updateValidationField(
      validationField,
      `❌ Invalid JSON: ${error.message}`,
      "error"
    );
  }
}

/**
 * Handle file upload and validate JSON content
 */
function handleFileUpload(fileInput, validationField) {
  console.log("🔍 handleFileUpload called");
  const file = fileInput.files[0];
  if (!file) {
    console.log("🔍 No file selected");
    updateValidationField(validationField, "No file selected", "empty");
    return;
  }

  console.log(
    "🔍 File selected:",
    file.name,
    "Size:",
    file.size,
    "Type:",
    file.type
  );

  // Check file extension
  if (!file.name.toLowerCase().endsWith(".json")) {
    console.log("🔍 Invalid file extension");
    updateValidationField(
      validationField,
      "❌ Please select a valid JSON file (.json extension)",
      "error"
    );
    return;
  }

  // Check file size (max 1MB)
  if (file.size > 1024 * 1024) {
    console.log("🔍 File too large");
    updateValidationField(
      validationField,
      "❌ File too large (max 1MB)",
      "error"
    );
    return;
  }

  // Add loading state
  console.log("🔍 Setting loading state");
  updateValidationField(validationField, "📁 Reading file...", "loading");

  const reader = new FileReader();
  reader.onload = function (e) {
    console.log("🔍 File read successfully");
    try {
      const jsonData = JSON.parse(e.target.result);
      console.log("🔍 File JSON parsed:", jsonData);
      const validationResult = validateSwiperStructure(jsonData);

      if (validationResult.isValid) {
        console.log("🔍 File JSON is valid");
        updateValidationField(
          validationField,
          "✅ Valid Swiper.js configuration from file",
          "success"
        );

        // Optionally, populate the textarea with the file content
        const textarea = document.querySelector(
          'textarea[name*="json_textarea"]'
        );
        if (textarea) {
          textarea.value = e.target.result;
          console.log("🔍 Populated textarea with file content");
        }
      } else {
        console.log("🔍 File JSON has warnings");
        updateValidationField(
          validationField,
          `⚠️ ${validationResult.message}`,
          "warning"
        );
      }
    } catch (error) {
      console.log("🔍 File JSON parsing error:", error.message);
      updateValidationField(
        validationField,
        `❌ Invalid JSON in file: ${error.message}`,
        "error"
      );
    }
  };

  reader.onerror = function () {
    console.log("🔍 File reading error");
    updateValidationField(validationField, "❌ Error reading file", "error");
  };

  reader.readAsText(file);
}

/**
 * Validate Swiper.js configuration structure
 */
function validateSwiperStructure(config) {
  console.log("🔍 validateSwiperStructure called with:", config);

  if (typeof config !== "object" || config === null) {
    console.log("🔍 Config is not an object");
    return { isValid: false, message: "Configuration must be an object" };
  }

  // List of valid Swiper.js options (expanded)
  const validOptions = [
    "slidesPerView",
    "slidesPerGroup",
    "spaceBetween",
    "slidesPerGroupAuto",
    "centeredSlides",
    "slideToClickedSlide",
    "loop",
    "autoplay",
    "autoHeight",
    "effect",
    "speed",
    "direction",
    "threshold",
    "observer",
    "observeParents",
    "watchSlidesProgress",
    "grabCursor",
    "keyboard",
    "mousewheel",
    "hashNavigation",
    "history",
    "virtual",
    "breakpoints",
    "navigation",
    "pagination",
    "scrollbar",
    "freeMode",
    "grid",
    "coverflowEffect",
    "flipEffect",
    "cubeEffect",
    "fadeEffect",
    "creativeEffect",
    "cardsEffect",
    "simulateTouch",
    "observeSlideChildren",
    "allowTouchMove",
    "resistance",
    "resistanceRatio",
    "preventInteractionOnTransition",
    "edgeSwipeDetection",
    "edgeSwipeThreshold",
    "touchEventsTarget",
    "simulateTouch",
    "shortSwipes",
    "longSwipes",
    "longSwipesRatio",
    "longSwipesMs",
    "followFinger",
    "threshold",
    "touchMoveStopPropagation",
    "touchReleaseOnEdges",
    "iOSEdgeSwipeDetection",
    "iOSEdgeSwipeThreshold",
    "touchRatio",
    "touchAngle",
    "simulateTouch",
    "shortSwipes",
    "longSwipes",
    "longSwipesRatio",
    "longSwipesMs",
    "followFinger",
    "threshold",
    "touchMoveStopPropagation",
    "touchReleaseOnEdges",
    "iOSEdgeSwipeDetection",
    "iOSEdgeSwipeThreshold",
    "touchRatio",
    "touchAngle",
  ];

  // Check for potentially invalid options
  const invalidOptions = [];
  for (const key in config) {
    if (!validOptions.includes(key) && typeof config[key] !== "object") {
      invalidOptions.push(key);
    }
  }

  if (invalidOptions.length > 0) {
    console.log("🔍 Invalid options found:", invalidOptions);
    return {
      isValid: false,
      message: `Unknown options: ${invalidOptions.join(", ")}`,
    };
  }

  // Additional validation for specific options
  const warnings = [];

  // Check autoplay configuration
  if (config.autoplay && typeof config.autoplay === "object") {
    if (
      config.autoplay.delay &&
      (typeof config.autoplay.delay !== "number" || config.autoplay.delay < 0)
    ) {
      warnings.push("autoplay.delay should be a positive number");
    }
  }

  // Check slidesPerView
  if (
    config.slidesPerView &&
    (typeof config.slidesPerView !== "number" || config.slidesPerView <= 0)
  ) {
    warnings.push("slidesPerView should be a positive number");
  }

  // Check speed
  if (config.speed && (typeof config.speed !== "number" || config.speed < 0)) {
    warnings.push("speed should be a positive number");
  }

  if (warnings.length > 0) {
    console.log("🔍 Warnings found:", warnings);
    return {
      isValid: false,
      message: `Configuration issues: ${warnings.join(", ")}`,
    };
  }

  console.log("🔍 Config is valid");
  return { isValid: true, message: "" };
}

/**
 * Update validation field with message and styling
 */
function updateValidationField(validationField, message, type) {
  console.log("🔍 updateValidationField called:", {
    message,
    type,
    validationField,
  });

  // Detect section from the validation field element
  const section = detectSectionFromElement(validationField);
  if (section) {
    // Use the unified validation system
    updateSectionValidation(section, message, validationField);
  } else {
    console.log("🔍 Could not detect section from validation field");
  }
}

/**
 * We need each new slide to have .swiper-slide
 * class added in the editor. This is how we do it.
 */
const el = React.createElement;

const withSlideBlockClass = wp.compose.createHigherOrderComponent(
  (BlockListBlock) => {
    return (props) => {
      const { name } = props;

      // Return usual component if not our's.
      if (name != "wpe/slide") {
        return el(BlockListBlock, { ...props });
      }

      const newProps = {
        ...props,
        className: "swiper-slide",
      };

      // Return usual component with our custom class.
      return el(BlockListBlock, newProps);
    };
  },
  "withSlideBlockClass"
);

wp.hooks.addFilter(
  "editor.BlockListBlock",
  "wpe/slide-class",
  withSlideBlockClass
);

// Also initialize when ACF fields are rendered
if (window.acf) {
  console.log("🔍 ACF is available, setting up hooks");
  window.acf.addAction("append", () => {
    console.log("🔍 ACF append action fired");
    initializeJsonValidation();
  });
} else {
  console.log("🔍 ACF is not available");
}

// Set up mutation observer to watch for ACF field changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      // Check for changes in existing file fields
      mutation.target.querySelectorAll &&
        mutation.target.querySelectorAll(".acf-field-file").forEach((field) => {
          const fileInput = field.querySelector('input[type="file"]');
          if (fileInput && fileInput.files && fileInput.files.length > 0) {
            console.log("🔍 File selected in existing ACF field");
            const validationField = document.querySelector(
              ".acf-field-swiper-json-validation"
            );
            if (validationField) {
              handleFileUpload(fileInput, validationField);
            }
          }
        });
    }
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

/**
 * Handle ACF file ID and fetch attachment data
 */
function handleAcfFileId(fileId, fileField) {
  console.log("🔍 handleAcfFileId called with file ID:", fileId);
  console.log("🔍 File field element:", fileField);

  // Check if it's a valid file ID (number)
  if (!fileId || isNaN(fileId)) {
    console.log("🔍 Invalid file ID:", fileId);
    return;
  }

  // Detect section from file field
  const section = detectSectionFromElement(fileField);
  console.log("🔍 Section:", section);
  if (!section) {
    console.log("🔍 Could not detect section from file field");
    return;
  }

  // Set loading state using unified system
  updateSectionValidation(section, "📁 Fetching file data...", fileField);

  // Fetch file content directly using attachment_id parameter
  const apiUrl = `${window.location.origin}/?attachment_id=${fileId}`;
  console.log("🔍 Fetching file content from:", apiUrl);

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((content) => {
      console.log("🔍 File content fetched, length:", content.length);

      // Validate JSON syntax
      try {
        const jsonData = JSON.parse(content);
        console.log("🔍 File JSON parsed successfully:", jsonData);

        // Validate Swiper.js structure
        const validationResult = validateSwiperStructure(jsonData);

        if (validationResult.isValid) {
          console.log("🔍 Uploaded file JSON is valid Swiper.js configuration");
          updateSectionValidation(
            section,
            "✅ Valid Swiper.js configuration from uploaded file",
            fileField
          );

          const sectionFieldName = getSectionFieldName(section);

          // Populate the textarea in the same section
          const textarea = document.querySelector(
            `textarea[name*="${sectionFieldName}_json_textarea"]`
          );
          if (textarea) {
            textarea.value = content;
            console.log("🔍 Populated textarea with uploaded file content");
          }
        } else {
          console.log(
            "🔍 Uploaded file JSON has warnings:",
            validationResult.message
          );
          updateSectionValidation(
            section,
            `⚠️ ${validationResult.message}`,
            fileField
          );

          const sectionFieldName = getSectionFieldName(section);

          // Still populate the textarea even if there are warnings
          const textarea = document.querySelector(
            `textarea[name*="${sectionFieldName}_json_textarea"]`
          );
          if (textarea) {
            textarea.value = content;
            console.log(
              "🔍 Populated textarea with uploaded file content (with warnings)"
            );
          }
        }
      } catch (error) {
        console.log("🔍 Uploaded file JSON parsing error:", error.message);
        updateSectionValidation(
          section,
          `❌ Invalid JSON in uploaded file: ${error.message}`,
          fileField
        );
      }
    })
    .catch((error) => {
      console.log("🔍 Error fetching file content:", error);
      updateSectionValidation(
        section,
        `❌ Error reading uploaded file: ${error.message}`,
        fileField
      );
    });
}

function getSectionFieldName(sectionName) {
  if (sectionName === "main") {
    return "field_main_slider";
  } else if (sectionName === "thumbnails") {
    return "field_thumbnails";
  }
  return null;
}

// Unified validation function
function validateAndUpdateSection(sectionName, jsonString, sourceElement) {
  console.log("🔍 validateAndUpdateSection called:", {
    sectionName,
    sourceElement,
  });

  // Validate JSON
  let validationResult;
  try {
    JSON.parse(jsonString);
    validationResult = { valid: true, message: "✅ Valid JSON" };
  } catch (e) {
    validationResult = {
      valid: false,
      message: "❌ Invalid JSON: " + e.message,
    };
  }

  // Update the correct validation field based on section
  updateSectionValidation(sectionName, validationResult.message, sourceElement);
}

// Update validation field for specific section
function updateSectionValidation(sectionName, message, sourceElement) {
  console.log("🔍 updateSectionValidation called:", { sectionName, message });

  // Determine which validation field to update based on section
  let validationSelector;
  if (sectionName === "main") {
    validationSelector = ".acf-field-main-slider-json-validation";
  } else if (sectionName === "thumbnails") {
    validationSelector = ".acf-field-thumbnails-json-validation";
  } else {
    console.log("🔍 Unknown section:", sectionName);
    return;
  }

  // Find the validation field
  const validationField = document.querySelector(validationSelector);
  console.log("🔍 Found validation field:", validationField);

  if (validationField) {
    // Try to find the message element
    const messageElement = validationField.querySelector(".acf-input p");
    if (messageElement) {
      messageElement.textContent = message;
      console.log("✅ Updated validation message:", message);
    } else {
      // Fallback to direct update
      validationField.textContent = message;
      console.log("✅ Updated validation field directly:", message);
    }
  } else {
    console.log("🔍 No validation field found for section:", sectionName);
  }
}

// Detect section from element
function detectSectionFromElement(element) {
  if (!element) return null;

  // Find the closest group container
  const parent = element.closest(".acf-field-accordion");
  if (parent) {
    const groupLabel = parent.querySelector(".acf-label label");
    if (groupLabel) {
      const sectionText = groupLabel.textContent.trim().toLowerCase();
      if (sectionText.includes("main")) return "main";
      if (sectionText.includes("thumbnail")) return "thumbnails";
    }
  }

  // Fallback to field name detection
  const fieldName = element.name || element.getAttribute("name");
  if (fieldName) {
    if (fieldName.includes("main_slider")) return "main";
    if (fieldName.includes("thumbnails")) return "thumbnails";
  }

  return null;
}

// Add event listeners for real-time validation
document.addEventListener("DOMContentLoaded", function () {
  // Monitor textarea changes
  document.addEventListener("input", function (e) {
    if (e.target.name && e.target.name.includes("json_textarea")) {
      console.log("🔍 Textarea input detected:", e.target.name);
      const section = detectSectionFromElement(e.target);
      if (section) {
        validateAndUpdateSection(section, e.target.value, e.target);
      }
    }
  });

  // Monitor file upload changes
  document.addEventListener("change", function (e) {
    if (e.target.name && e.target.name.includes("json_file")) {
      console.log("🔍 File upload detected:", e.target.name);
      const file = e.target.files[0];
      if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = function (e) {
          const section = detectSectionFromElement(e.target);
          if (section) {
            validateAndUpdateSection(section, e.target.result, e.target);
          }
        };
        reader.readAsText(file);
      }
    }
  });
});

/* Shared product-detail page behavior for price, quantity, and add-to-basket */
(function () {
  "use strict";

  /* Support one or more product-page sections on the current document */
  const productPages = document.querySelectorAll(".product-page");
  if (!productPages.length) {
    return;
  }

  /* Convert a text value into a stable slug fragment */
  function toSlug(value) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* Format GBP prices using shared cart helper when available */
  function formatPrice(value) {
    if (window.JermaineCart && typeof window.JermaineCart.formatCurrency === "function") {
      return window.JermaineCart.formatCurrency(value);
    }

    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP"
    }).format(value);
  }

  productPages.forEach(function (productPage) {
    const quantityInput = productPage.querySelector(".detail-qty-input");
    const decreaseButton = productPage.querySelector(".detail-qty-decrease");
    const increaseButton = productPage.querySelector(".detail-qty-increase");
    const sizeSelect = productPage.querySelector(".detail-size-select");
    const formatSelect = productPage.querySelector(".detail-format-select");
    const priceValue = productPage.querySelector(".detail-price-value");
    const addButton = productPage.querySelector(".detail-add-button");
    const feedbackLine = productPage.querySelector(".detail-feedback");

    if (!quantityInput || !addButton) {
      return;
    }

    /* Read and sanitize quantity values */
    function getSafeQuantity() {
      const parsedValue = Number.parseInt(quantityInput.value, 10);
      if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return 1;
      }
      return parsedValue;
    }

    /* Write a safe quantity back to the quantity field */
    function setSafeQuantity(nextValue) {
      quantityInput.value = String(Math.max(1, nextValue));
    }

    /* Resolve active finish and additional frame cost */
    function getSelectedFormat() {
      if (!formatSelect || formatSelect.selectedIndex < 0) {
        return {
          formatLabel: "Print only",
          extraPrice: 0
        };
      }

      const selectedOption = formatSelect.options[formatSelect.selectedIndex];
      return {
        formatLabel: selectedOption.value,
        extraPrice: Number.parseFloat(selectedOption.dataset.extra) || 0
      };
    }

    /* Resolve active print size and corresponding total unit price */
    function getSelectedVariant() {
      if (!sizeSelect || sizeSelect.selectedIndex < 0) {
        const defaultFormat = getSelectedFormat();
        return {
          sizeLabel: "Standard",
          formatLabel: defaultFormat.formatLabel,
          unitPrice: (Number.parseFloat(productPage.dataset.basePrice) || 0) + defaultFormat.extraPrice
        };
      }

      const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
      const selectedFormat = getSelectedFormat();
      return {
        sizeLabel: selectedOption.value,
        formatLabel: selectedFormat.formatLabel,
        unitPrice: (Number.parseFloat(selectedOption.dataset.price) || 0) + selectedFormat.extraPrice
      };
    }

    /* Reflect selected size pricing in the product detail display */
    function syncDisplayedPrice() {
      if (!priceValue) {
        return;
      }

      const selectedVariant = getSelectedVariant();
      priceValue.textContent = formatPrice(selectedVariant.unitPrice);
    }

    /* Wire quantity decrement control */
    if (decreaseButton) {
      decreaseButton.addEventListener("click", function () {
        setSafeQuantity(getSafeQuantity() - 1);
      });
    }

    /* Wire quantity increment control */
    if (increaseButton) {
      increaseButton.addEventListener("click", function () {
        setSafeQuantity(getSafeQuantity() + 1);
      });
    }

    /* Guard direct quantity input edits */
    quantityInput.addEventListener("change", function () {
      setSafeQuantity(getSafeQuantity());
    });

    /* Update displayed price when print size changes */
    if (sizeSelect) {
      sizeSelect.addEventListener("change", function () {
        syncDisplayedPrice();
      });
    }

    /* Update displayed price when print finish changes */
    if (formatSelect) {
      formatSelect.addEventListener("change", function () {
        syncDisplayedPrice();
      });
    }

    /* Add currently selected variant and quantity to local basket state */
    addButton.addEventListener("click", function () {
      if (!window.JermaineCart) {
        return;
      }

      const selectedVariant = getSelectedVariant();
      const selectedQuantity = getSafeQuantity();
      const baseId = String(productPage.dataset.productId || "product");
      const sizeSlug = toSlug(selectedVariant.sizeLabel);
      const productName = String(productPage.dataset.productName || "Print");
      const productType = String(
        productPage.dataset.productType || "Fine art print on museum-grade matte paper."
      );
      const publishedDate = String(productPage.dataset.productPublished || "");

      window.JermaineCart.addItem(
        {
          id: baseId + "-" + sizeSlug + "-" + toSlug(selectedVariant.formatLabel),
          name: productName + " (" + selectedVariant.sizeLabel + ", " + selectedVariant.formatLabel + ")",
          price: selectedVariant.unitPrice,
          image: String(productPage.dataset.productImage || ""),
          type:
            productType +
            " | Size: " +
            selectedVariant.sizeLabel +
            " | Finish: " +
            selectedVariant.formatLabel,
          publishedDate: publishedDate
        },
        selectedQuantity
      );

      if (feedbackLine) {
        feedbackLine.textContent = productName + " added to basket.";
      }
    });

    syncDisplayedPrice();
  });
})();

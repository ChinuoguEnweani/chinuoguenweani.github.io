/* Basket page interactions: render line items, quantities, and removal controls */
(function () {
  "use strict";

  /* Locate key basket page elements */
  const cartEmptyState = document.getElementById("cart-empty");
  const cartContent = document.getElementById("cart-content");
  const cartItemsBody = document.getElementById("cart-items-body");
  const cartSubtotalValue = document.getElementById("cart-subtotal");

  if (!cartEmptyState || !cartContent || !cartItemsBody || !cartSubtotalValue) {
    return;
  }

  if (!window.JermaineCart) {
    return;
  }

  /* Resolve product detail page URL from item id prefix */
  function getProductPageLink(productId) {
    if (productId.startsWith("turquoise-alpine-lake")) {
      return "product-turquoise-alpine-lake.html";
    }

    if (productId.startsWith("sunflowers-and-lemons")) {
      return "product-sunflowers-and-lemons.html";
    }

    if (productId.startsWith("rolling-green-hills")) {
      return "product-rolling-green-hills.html";
    }

    if (productId.startsWith("two-pears-in-sunlight")) {
      return "product-two-pears-in-sunlight.html";
    }

    if (productId.startsWith("lemon-grove-still-life")) {
      return "product-lemon-grove-still-life.html";
    }

    return "purchase-prints.html";
  }

  /* Build one basket row for a line item */
  function createCartRow(item) {
    const row = document.createElement("tr");
    row.className = "cart-row";
    row.dataset.productId = item.id;

    const productCell = document.createElement("td");
    productCell.className = "cart-product-cell";

    const productImageLink = document.createElement("a");
    productImageLink.className = "cart-product-image-link";
    productImageLink.href = getProductPageLink(item.id);

    const productImage = document.createElement("img");
    productImage.className = "cart-product-image";
    productImage.src = item.image;
    productImage.alt = item.name + " thumbnail";
    productImageLink.appendChild(productImage);

    const productInfo = document.createElement("div");
    productInfo.className = "cart-product-info";

    const productName = document.createElement("h2");
    productName.className = "cart-product-name";
    productName.textContent = item.name;

    const productType = document.createElement("p");
    productType.className = "cart-product-meta";
    productType.textContent = item.type;

    const productDate = document.createElement("p");
    productDate.className = "cart-product-meta";
    productDate.textContent = "Published: " + item.publishedDate;

    productInfo.appendChild(productName);
    productInfo.appendChild(productType);
    productInfo.appendChild(productDate);
    productCell.appendChild(productImageLink);
    productCell.appendChild(productInfo);

    const priceCell = document.createElement("td");
    priceCell.className = "cart-price-cell";
    priceCell.textContent = window.JermaineCart.formatCurrency(item.price);

    const quantityCell = document.createElement("td");
    quantityCell.className = "cart-quantity-cell";

    const quantityControl = document.createElement("div");
    quantityControl.className = "cart-quantity-control";
    quantityControl.setAttribute("role", "group");
    quantityControl.setAttribute("aria-label", "Quantity selector for " + item.name);

    const decreaseButton = document.createElement("button");
    decreaseButton.className = "cart-qty-button cart-qty-decrease";
    decreaseButton.type = "button";
    decreaseButton.setAttribute("aria-label", "Decrease quantity for " + item.name);
    decreaseButton.textContent = "-";

    const quantityInput = document.createElement("input");
    quantityInput.className = "cart-qty-input";
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.value = String(item.quantity);
    quantityInput.inputMode = "numeric";
    quantityInput.setAttribute("aria-label", "Quantity for " + item.name);

    const increaseButton = document.createElement("button");
    increaseButton.className = "cart-qty-button cart-qty-increase";
    increaseButton.type = "button";
    increaseButton.setAttribute("aria-label", "Increase quantity for " + item.name);
    increaseButton.textContent = "+";

    quantityControl.appendChild(decreaseButton);
    quantityControl.appendChild(quantityInput);
    quantityControl.appendChild(increaseButton);
    quantityCell.appendChild(quantityControl);

    const totalCell = document.createElement("td");
    totalCell.className = "cart-total-cell";
    totalCell.textContent = window.JermaineCart.formatCurrency(item.price * item.quantity);

    const removeCell = document.createElement("td");
    removeCell.className = "cart-remove-cell";

    const removeButton = document.createElement("button");
    removeButton.className = "cart-remove-button";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove " + item.name + " from cart");

    removeCell.appendChild(removeButton);

    row.appendChild(productCell);
    row.appendChild(priceCell);
    row.appendChild(quantityCell);
    row.appendChild(totalCell);
    row.appendChild(removeCell);

    return row;
  }

  /* Render basket rows and subtotal from persisted cart state */
  function renderCart() {
    const cartItems = window.JermaineCart.readCart();
    cartItemsBody.innerHTML = "";

    if (cartItems.length === 0) {
      cartContent.hidden = true;
      cartEmptyState.hidden = false;
      cartSubtotalValue.textContent = window.JermaineCart.formatCurrency(0);
      return;
    }

    cartItems.forEach(function (item) {
      cartItemsBody.appendChild(createCartRow(item));
    });

    cartSubtotalValue.textContent = window.JermaineCart.formatCurrency(
      window.JermaineCart.calculateSubtotal(cartItems)
    );
    cartEmptyState.hidden = true;
    cartContent.hidden = false;
  }

  /* Handle quantity changes and remove action via event delegation */
  cartItemsBody.addEventListener("click", function (event) {
    const targetRow = event.target.closest(".cart-row");
    if (!targetRow) {
      return;
    }

    const productId = targetRow.dataset.productId;
    const quantityInput = targetRow.querySelector(".cart-qty-input");
    const currentQuantity = Number.parseInt(quantityInput.value, 10) || 1;

    if (event.target.classList.contains("cart-qty-increase")) {
      window.JermaineCart.updateItemQuantity(productId, currentQuantity + 1);
      renderCart();
      return;
    }

    if (event.target.classList.contains("cart-qty-decrease")) {
      window.JermaineCart.updateItemQuantity(productId, Math.max(1, currentQuantity - 1));
      renderCart();
      return;
    }

    if (event.target.classList.contains("cart-remove-button")) {
      window.JermaineCart.removeItem(productId);
      renderCart();
    }
  });

  /* Handle manual quantity input edits */
  cartItemsBody.addEventListener("change", function (event) {
    if (!event.target.classList.contains("cart-qty-input")) {
      return;
    }

    const targetRow = event.target.closest(".cart-row");
    if (!targetRow) {
      return;
    }

    const productId = targetRow.dataset.productId;
    const nextQuantity = Number.parseInt(event.target.value, 10);
    const safeQuantity = Number.isFinite(nextQuantity) && nextQuantity > 0 ? nextQuantity : 1;

    window.JermaineCart.updateItemQuantity(productId, safeQuantity);
    renderCart();
  });

  renderCart();
})();

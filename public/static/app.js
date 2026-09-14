/* ==========================================================================
   Aliza Traders — Storefront Frontend Logic
   ========================================================================== */

(function () {
  'use strict';

  const CART_KEY = 'aliza_traders_cart';
  const state = {
    products: {}, // slug -> product cache
    cart: loadCart(),
    activeProduct: null
  };

  // ---------------- Utilities ----------------
  function fmtPrice(n) {
    return 'Rs. ' + Math.round(n).toLocaleString('en-PK');
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    renderCartCount();
  }

  function showToast(message, icon = 'fa-solid fa-check') {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  async function api(path, opts) {
    const res = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    });
    return res.json();
  }

  // Icon per category for gradient placeholder cards
  function categoryIcon(slug) {
    switch (slug) {
      case 'party-wear': return 'fa-solid fa-champagne-glasses';
      case 'function-wear': return 'fa-solid fa-music';
      case 'mehndi-wear': return 'fa-solid fa-hand-sparkles';
      case 'bridal-luxe': return 'fa-solid fa-crown';
      default: return 'fa-solid fa-shirt';
    }
  }

  // Renders either a real uploaded product photo (from admin panel / R2)
  // or a gradient placeholder tile if no photo has been uploaded yet.
  function mediaHTML(imagePrimary, categorySlug, iconSize) {
    const sizeAttr = iconSize ? `style="font-size:${iconSize}"` : '';
    if (
      imagePrimary &&
      (imagePrimary.startsWith('/api/images/') ||
        imagePrimary.startsWith('http://') ||
        imagePrimary.startsWith('https://') ||
        imagePrimary.startsWith('data:'))
    ) {
      return `<img src="${imagePrimary}" alt="" loading="lazy" />`;
    }
    const gradClass = imagePrimary || 'grad-maroon';
    return `<div class="pg ${gradClass}"><i class="${categoryIcon(categorySlug)}" ${sizeAttr}></i></div>`;
  }

  // ---------------- Rendering: Product Card ----------------
  function productCardHTML(p) {
    const price = p.sale_price || p.price;
    const hasDiscount = !!p.sale_price;
    const badgeClass = p.badge === 'Sale' ? 'badge-sale' : '';
    const colorMap = {
      'Maroon': '#6d1b2f', 'Gold': '#c69a4b', 'Emerald': '#1f5c47', 'Wine': '#5c1a2a',
      'Black': '#1a1a1a', 'Rani Pink': '#c2185b', 'Royal Blue': '#1c2f6b', 'Champagne': '#e8d3a8',
      'Peach': '#f2b79b', 'Bottle Green': '#0e3d2a', 'Teal': '#0f4c4c', 'Mauve': '#a9788a',
      'Orange': '#d9631a', 'Fuchsia': '#c2185b', 'Turquoise': '#0e6e73', 'Coral': '#e8735a',
      'Lilac': '#a695c9', 'Mint': '#8fd6b8', 'Yellow': '#e6c229', 'Hot Pink': '#e0518c',
      'Sky Blue': '#5aa9d6', 'Parrot Green': '#7fae1f', 'Mustard': '#c99a1f', 'Multicolor': 'linear-gradient(90deg,#e6c229,#e0518c,#0e6e73)',
      'Deep Red & Gold': '#7a1b2b', 'Maroon & Gold': '#6d1b2f', 'Wine & Gold': '#5c1a2a'
    };
    const colorsHtml = (p.colors || []).slice(0, 4).map(c => {
      const bg = colorMap[c] || '#ccc';
      return `<span class="color-dot" style="background:${bg}" title="${c}"></span>`;
    }).join('');

    return `
      <div class="product-card" data-slug="${p.slug}">
        <div class="product-media" onclick="AlizaStore.openQuickView('${p.slug}')">
          ${p.badge ? `<span class="product-card-badge ${badgeClass}">${p.badge}</span>` : ''}
          ${mediaHTML(p.image_primary, p.category_slug)}
          <div class="quick-add-btn">Quick View</div>
        </div>
        <div class="product-info">
          <span class="product-cat-label">${p.category_name || ''}</span>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-price-row">
            <span class="price-current">${fmtPrice(price)}</span>
            ${hasDiscount ? `<span class="price-old">${fmtPrice(p.price)}</span>` : ''}
          </div>
          <div class="product-colors">${colorsHtml}</div>
        </div>
      </div>
    `;
  }

  // ---------------- Load Products Per Section ----------------
  async function loadCategoryGrid(gridEl, categorySlug) {
    try {
      const res = await api('/products?category=' + encodeURIComponent(categorySlug));
      if (!res.success || !res.data || res.data.length === 0) {
        gridEl.innerHTML = '<div class="grid-empty">Coming soon...</div>';
        return;
      }
      res.data.forEach(p => (state.products[p.slug] = p));
      gridEl.innerHTML = res.data.map(productCardHTML).join('');
    } catch (e) {
      gridEl.innerHTML = '<div class="grid-empty">Unable to load products. Please refresh.</div>';
    }
  }

  function initSections() {
    document.querySelectorAll('.product-grid[data-grid]').forEach(gridEl => {
      const cat = gridEl.getAttribute('data-grid');
      loadCategoryGrid(gridEl, cat);
    });
  }

  // ---------------- Quick View Modal ----------------
  let qvState = { slug: null, size: null, color: null, qty: 1 };

  async function openQuickView(slug) {
    let p = state.products[slug];
    if (!p) {
      const res = await api('/products/' + slug);
      if (!res.success) return showToast('Product not found', 'fa-solid fa-triangle-exclamation');
      p = res.data;
      state.products[slug] = p;
    }

    qvState = { slug, size: (p.sizes && p.sizes[0]) || null, color: (p.colors && p.colors[0]) || null, qty: 1 };
    renderQuickView(p);

    document.getElementById('productModalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function renderQuickView(p) {
    const price = p.sale_price || p.price;
    const hasDiscount = !!p.sale_price;
    const modal = document.getElementById('productModal');
    const imgUrl = p.image_primary;
    const isRealImage = !!(
      imgUrl &&
      (imgUrl.startsWith('/api/images/') ||
        imgUrl.startsWith('http://') ||
        imgUrl.startsWith('https://') ||
        imgUrl.startsWith('data:'))
    );

    const sizesHtml = (p.sizes || []).map(s =>
      `<span class="option-pill ${s === qvState.size ? 'selected' : ''}" data-type="size" data-value="${s}">${s}</span>`
    ).join('');

    const colorsHtml = (p.colors || []).map(c =>
      `<span class="option-pill ${c === qvState.color ? 'selected' : ''}" data-type="color" data-value="${c}">${c}</span>`
    ).join('');

    modal.innerHTML = `
      <button class="modal-close" onclick="AlizaStore.closeQuickView()"><i class="fa-solid fa-xmark"></i></button>
      <div class="pm-media ${isRealImage ? 'zoomable' : ''}" id="pmMediaZoom">
        ${mediaHTML(p.image_primary, p.category_slug, '4rem')}
        ${isRealImage ? `<button class="pm-zoom-btn" type="button" aria-label="Zoom image" onclick="AlizaStore.openZoomViewer('${imgUrl}')"><i class="fa-solid fa-magnifying-glass-plus"></i></button>` : ''}
      </div>
      <div class="pm-info">
        <span class="product-cat-label">${p.category_name || ''}</span>
        <h3>${p.name}</h3>
        <div class="pm-price-row">
          <span class="price-current">${fmtPrice(price)}</span>
          ${hasDiscount ? `<span class="price-old">${fmtPrice(p.price)}</span>` : ''}
        </div>
        <p class="pm-desc">${p.description || ''}</p>
        <p class="pm-fabric"><strong>Fabric:</strong> ${p.fabric || 'N/A'}</p>

        ${(p.sizes && p.sizes.length) ? `
        <div class="option-group">
          <span class="option-label">Size</span>
          <div class="option-pills" data-group="size">${sizesHtml}</div>
        </div>` : ''}

        ${(p.colors && p.colors.length) ? `
        <div class="option-group">
          <span class="option-label">Color</span>
          <div class="option-pills" data-group="color">${colorsHtml}</div>
        </div>` : ''}

        <div class="pm-qty-row">
          <span class="option-label">Qty</span>
          <div class="qty-control">
            <button onclick="AlizaStore.changeQvQty(-1)">-</button>
            <span id="qvQty">${qvState.qty}</span>
            <button onclick="AlizaStore.changeQvQty(1)">+</button>
          </div>
        </div>

        <div class="pm-actions">
          <button class="btn btn-primary" onclick="AlizaStore.addToCartFromQuickView()">
            <i class="fa-solid fa-bag-shopping"></i> Add to Bag
          </button>
        </div>
        <span class="pm-stock"><i class="fa-solid fa-circle-check"></i> In Stock — Ready to Ship</span>
      </div>
    `;

    modal.querySelectorAll('.option-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const type = pill.getAttribute('data-type');
        const value = pill.getAttribute('data-value');
        qvState[type] = value;
        modal.querySelectorAll(`[data-group="${type}"] .option-pill`).forEach(el => {
          el.classList.toggle('selected', el.getAttribute('data-value') === value);
        });
      });
    });

    if (isRealImage) initHoverZoom(modal.querySelector('#pmMediaZoom'), imgUrl);
  }

  // ---------------- Hover Zoom Lens (desktop, Maria B / Khaadi style) ----------------
  function initHoverZoom(mediaEl, imgUrl) {
    if (!mediaEl) return;
    // Only enable hover-lens on devices with a real mouse (avoids odd behaviour on touch)
    if (window.matchMedia('(hover: none)').matches) return;

    const lens = document.createElement('div');
    lens.className = 'zoom-lens';
    const pane = document.createElement('div');
    pane.className = 'zoom-pane';
    pane.style.backgroundImage = `url("${imgUrl}")`;
    mediaEl.appendChild(lens);
    mediaEl.appendChild(pane);

    const ZOOM = 2.5;

    function moveLens(e) {
      const rect = mediaEl.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      const lensW = lens.offsetWidth, lensH = lens.offsetHeight;
      let lx = cx - lensW / 2;
      let ly = cy - lensH / 2;
      lx = Math.max(0, Math.min(lx, rect.width - lensW));
      ly = Math.max(0, Math.min(ly, rect.height - lensH));
      lens.style.left = lx + 'px';
      lens.style.top = ly + 'px';

      pane.style.backgroundSize = (rect.width * ZOOM) + 'px ' + (rect.height * ZOOM) + 'px';
      pane.style.backgroundPosition = `-${lx * ZOOM}px -${ly * ZOOM}px`;
    }

    mediaEl.addEventListener('mouseenter', () => {
      lens.classList.add('active');
      pane.classList.add('active');
    });
    mediaEl.addEventListener('mouseleave', () => {
      lens.classList.remove('active');
      pane.classList.remove('active');
    });
    mediaEl.addEventListener('mousemove', moveLens);
  }

  // ---------------- Full-Screen Zoom Viewer (mobile pinch-zoom + desktop scroll/drag) ----------------
  let zoomViewerState = { scale: 1, x: 0, y: 0, pointers: {}, startDist: 0, startScale: 1, dragging: false, lastX: 0, lastY: 0 };

  function openZoomViewer(imgUrl) {
    let overlay = document.getElementById('zoomViewerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'zoomViewerOverlay';
      overlay.className = 'zoom-viewer-overlay';
      overlay.innerHTML = `
        <button class="zoom-viewer-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        <div class="zoom-viewer-hint"><i class="fa-solid fa-hand"></i> Scroll / Pinch to zoom &nbsp;•&nbsp; Drag to pan</div>
        <div class="zoom-viewer-stage">
          <img class="zoom-viewer-img" id="zoomViewerImg" src="" alt="" />
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('.zoom-viewer-close').addEventListener('click', closeZoomViewer);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeZoomViewer();
      });

      const img = overlay.querySelector('#zoomViewerImg');

      function applyTransform() {
        img.style.transform = `translate(${zoomViewerState.x}px, ${zoomViewerState.y}px) scale(${zoomViewerState.scale})`;
      }

      // Desktop: wheel to zoom, drag to pan
      img.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.18 : -0.18;
        zoomViewerState.scale = Math.min(4, Math.max(1, zoomViewerState.scale + delta));
        if (zoomViewerState.scale === 1) { zoomViewerState.x = 0; zoomViewerState.y = 0; }
        applyTransform();
      }, { passive: false });

      img.addEventListener('dblclick', () => {
        zoomViewerState.scale = zoomViewerState.scale > 1 ? 1 : 2.5;
        if (zoomViewerState.scale === 1) { zoomViewerState.x = 0; zoomViewerState.y = 0; }
        applyTransform();
      });

      img.addEventListener('mousedown', (e) => {
        if (zoomViewerState.scale <= 1) return;
        zoomViewerState.dragging = true;
        zoomViewerState.lastX = e.clientX;
        zoomViewerState.lastY = e.clientY;
      });
      window.addEventListener('mousemove', (e) => {
        if (!zoomViewerState.dragging) return;
        zoomViewerState.x += e.clientX - zoomViewerState.lastX;
        zoomViewerState.y += e.clientY - zoomViewerState.lastY;
        zoomViewerState.lastX = e.clientX;
        zoomViewerState.lastY = e.clientY;
        applyTransform();
      });
      window.addEventListener('mouseup', () => { zoomViewerState.dragging = false; });

      // Mobile: pinch to zoom, single-finger drag to pan
      img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          zoomViewerState.startDist = touchDist(e.touches);
          zoomViewerState.startScale = zoomViewerState.scale;
        } else if (e.touches.length === 1 && zoomViewerState.scale > 1) {
          zoomViewerState.dragging = true;
          zoomViewerState.lastX = e.touches[0].clientX;
          zoomViewerState.lastY = e.touches[0].clientY;
        }
      }, { passive: true });

      img.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const dist = touchDist(e.touches);
          const ratio = dist / zoomViewerState.startDist;
          zoomViewerState.scale = Math.min(4, Math.max(1, zoomViewerState.startScale * ratio));
          applyTransform();
        } else if (e.touches.length === 1 && zoomViewerState.dragging) {
          zoomViewerState.x += e.touches[0].clientX - zoomViewerState.lastX;
          zoomViewerState.y += e.touches[0].clientY - zoomViewerState.lastY;
          zoomViewerState.lastX = e.touches[0].clientX;
          zoomViewerState.lastY = e.touches[0].clientY;
          applyTransform();
        }
      }, { passive: false });

      img.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) zoomViewerState.dragging = false;
      });
    }

    zoomViewerState = { scale: 1, x: 0, y: 0, pointers: {}, startDist: 0, startScale: 1, dragging: false, lastX: 0, lastY: 0 };
    const img = overlay.querySelector('#zoomViewerImg');
    img.src = imgUrl;
    img.style.transform = 'translate(0px, 0px) scale(1)';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function touchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function closeZoomViewer() {
    const overlay = document.getElementById('zoomViewerOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function changeQvQty(delta) {
    qvState.qty = Math.max(1, qvState.qty + delta);
    const el = document.getElementById('qvQty');
    if (el) el.textContent = qvState.qty;
  }

  function closeQuickView() {
    document.getElementById('productModalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function addToCartFromQuickView() {
    const p = state.products[qvState.slug];
    if (!p) return;
    addToCart(p, qvState.size, qvState.color, qvState.qty);
    closeQuickView();
  }

  // ---------------- Cart ----------------
  function addToCart(product, size, color, qty) {
    const existing = state.cart.find(
      item => item.slug === product.slug && item.size === size && item.color === color
    );
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({
        slug: product.slug,
        product_id: product.id,
        name: product.name,
        image: product.image_primary,
        category_slug: product.category_slug,
        price: product.sale_price || product.price,
        size,
        color,
        qty
      });
    }
    saveCart();
    renderCartDrawer();
    showToast(`${product.name} added to bag`, 'fa-solid fa-bag-shopping');
  }

  function removeFromCart(idx) {
    state.cart.splice(idx, 1);
    saveCart();
    renderCartDrawer();
  }

  function changeCartQty(idx, delta) {
    state.cart[idx].qty = Math.max(1, state.cart[idx].qty + delta);
    saveCart();
    renderCartDrawer();
  }

  function cartSubtotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function renderCartCount() {
    const totalQty = state.cart.reduce((s, i) => s + i.qty, 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = totalQty;
  }

  function renderCartDrawer() {
    const itemsEl = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');

    if (state.cart.length === 0) {
      itemsEl.innerHTML = '<p class="cart-empty">Your bag is empty. Start adding your favourite lehengas!</p>';
      footerEl.style.display = 'none';
      return;
    }

    itemsEl.innerHTML = state.cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-media">${mediaHTML(item.image, item.category_slug, '1.4rem')}</div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-meta">${item.size ? 'Size: ' + item.size : ''}${item.color ? ' • ' + item.color : ''}</span>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button onclick="AlizaStore.changeCartQty(${idx}, -1)">-</button>
              <span>${item.qty}</span>
              <button onclick="AlizaStore.changeCartQty(${idx}, 1)">+</button>
            </div>
            <span class="cart-item-price">${fmtPrice(item.price * item.qty)}</span>
          </div>
          <a class="cart-item-remove" onclick="AlizaStore.removeFromCart(${idx})">Remove</a>
        </div>
      </div>
    `).join('');

    footerEl.style.display = 'block';
    document.getElementById('cartSubtotal').textContent = fmtPrice(cartSubtotal());
  }

  function openCart() {
    renderCartDrawer();
    document.getElementById('cartOverlay').classList.add('open');
    document.getElementById('cartDrawer').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('cartDrawer').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ---------------- Checkout ----------------
  function openCheckout() {
    if (state.cart.length === 0) {
      showToast('Your bag is empty', 'fa-solid fa-triangle-exclamation');
      return;
    }
    closeCart();
    renderCheckoutSummary();
    document.getElementById('checkoutModalOverlay').classList.add('open');
    document.getElementById('checkoutStepForm').style.display = 'block';
    document.getElementById('checkoutSuccess').style.display = 'none';
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    document.getElementById('checkoutModalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCheckoutSummary() {
    const subtotal = cartSubtotal();
    const shipping = subtotal >= 15000 ? 0 : 250;
    const total = subtotal + shipping;
    const el = document.getElementById('checkoutSummary');
    el.innerHTML = `
      <div class="cs-row"><span>Items (${state.cart.reduce((s, i) => s + i.qty, 0)})</span><span>${fmtPrice(subtotal)}</span></div>
      <div class="cs-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : fmtPrice(shipping)}</span></div>
      <div class="cs-row cs-total"><span>Total</span><span>${fmtPrice(total)}</span></div>
    `;
  }

  async function submitCheckout(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing Order...';

    const payload = {
      customer_name: document.getElementById('ckName').value,
      phone: document.getElementById('ckPhone').value,
      email: document.getElementById('ckEmail').value,
      address: document.getElementById('ckAddress').value,
      city: document.getElementById('ckCity').value,
      notes: document.getElementById('ckNotes').value,
      payment_method: document.querySelector('input[name="payment"]:checked').value,
      items: state.cart.map(item => ({
        product_id: item.product_id,
        quantity: item.qty,
        size: item.size,
        color: item.color
      }))
    };

    try {
      const res = await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
      if (res.success) {
        document.getElementById('checkoutStepForm').style.display = 'none';
        document.getElementById('checkoutSuccess').style.display = 'block';
        document.getElementById('successOrderNumber').textContent = res.data.order_number;
        state.cart = [];
        saveCart();
      } else {
        showToast(res.error || 'Something went wrong', 'fa-solid fa-triangle-exclamation');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'fa-solid fa-triangle-exclamation');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  }

  // ---------------- Newsletter & Contact ----------------
  async function submitNewsletter(e) {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    const msgEl = document.getElementById('newsletterMsg');
    try {
      const res = await api('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      msgEl.textContent = res.message || 'Subscribed!';
      document.getElementById('newsletterEmail').value = '';
    } catch (e) {
      msgEl.textContent = 'Something went wrong. Please try again.';
    }
  }

  async function submitContact(e) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('contactName').value,
      email: document.getElementById('contactEmail').value,
      phone: document.getElementById('contactPhone').value,
      message: document.getElementById('contactMessage').value
    };
    const msgEl = document.getElementById('contactMsg');
    try {
      const res = await api('/contact', { method: 'POST', body: JSON.stringify(payload) });
      msgEl.textContent = res.message || 'Message sent!';
      e.target.reset();
    } catch (e) {
      msgEl.textContent = 'Something went wrong. Please try again.';
    }
  }

  // ---------------- Search ----------------
  let searchTimer = null;
  function handleSearch(e) {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    if (q.length < 2) return;
    searchTimer = setTimeout(async () => {
      const res = await api('/products?search=' + encodeURIComponent(q));
      if (res.success && res.data.length > 0) {
        showToast(`${res.data.length} result(s) found for "${q}"`, 'fa-solid fa-magnifying-glass');
      }
    }, 400);
  }

  // ---------------- Event Wiring ----------------
  function initEvents() {
    document.getElementById('footerYear').textContent = new Date().getFullYear();

    document.getElementById('cartToggle').addEventListener('click', openCart);
    document.getElementById('cartClose').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);
    document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

    document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
    document.getElementById('checkoutModalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'checkoutModalOverlay') closeCheckout();
    });
    document.getElementById('checkoutForm').addEventListener('submit', submitCheckout);
    document.getElementById('successCloseBtn').addEventListener('click', closeCheckout);

    document.getElementById('productModalOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'productModalOverlay') closeQuickView();
    });

    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });

    document.getElementById('searchToggle').addEventListener('click', () => {
      document.getElementById('searchBar').classList.add('open');
      setTimeout(() => document.getElementById('searchInput').focus(), 100);
    });
    document.getElementById('searchClose').addEventListener('click', () => {
      document.getElementById('searchBar').classList.remove('open');
    });
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    document.getElementById('newsletterForm').addEventListener('submit', submitNewsletter);
    document.getElementById('contactForm').addEventListener('submit', submitContact);

    document.getElementById('mobileNavToggle').addEventListener('click', () => {
      document.getElementById('mainNav').classList.toggle('mobile-open');
    });

    // Close mobile nav after clicking a link
    document.querySelectorAll('#mainNav .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        document.getElementById('mainNav').classList.remove('mobile-open');
      });
    });

    // Escape key closes modals/drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeZoomViewer();
        closeCart();
        closeQuickView();
        closeCheckout();
      }
    });
  }

  // ---------------- Site Settings (contact + stats from admin) ----------------
  async function loadSettings() {
    try {
      const res = await api('/settings');
      if (!res.success || !res.data) return;
      const s = res.data;

      // Announcement bar
      const announceEl = document.getElementById('announceBarText');
      if (announceEl && s.announce_bar_text) {
        announceEl.textContent = s.announce_bar_text;
      }

      // Stats
      const happyEl = document.getElementById('statHappyCustomers');
      const designsEl = document.getElementById('statUniqueDesigns');
      const handEl = document.getElementById('statHandcrafted');
      if (happyEl) happyEl.textContent = s.happy_customers || '—';
      if (designsEl) designsEl.textContent = s.unique_designs || '—';
      if (handEl) handEl.textContent = s.handcrafted || '100%';

      // Contact info
      const setContact = (id, iconHtml, text) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!text) {
          el.style.display = 'none';
          return;
        }
        el.style.display = '';
        el.innerHTML = iconHtml + ' <span>' + text + '</span>';
      };

      setContact('contactPhoneRow', '<i class="fa-solid fa-phone"></i>', s.phone);
      setContact('contactWhatsapp', '<i class="fa-brands fa-whatsapp"></i>', s.whatsapp ? ('WhatsApp: ' + s.whatsapp) : '');
      setContact('contactEmail', '<i class="fa-solid fa-envelope"></i>', s.email);
      setContact('contactAddress', '<i class="fa-solid fa-location-dot"></i>', s.address);

      // Social links — only show if URL is set
      const setSocial = (id, url) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (url && url.trim()) {
          el.href = url.trim();
          el.style.display = '';
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        } else {
          el.style.display = 'none';
        }
      };
      setSocial('socialInstagram', s.instagram_url);
      setSocial('socialFacebook', s.facebook_url);
      setSocial('socialTiktok', s.tiktok_url);
    } catch (e) {
      console.warn('Settings load failed', e);
    }
  }

  function init() {
    renderCartCount();
    initSections();
    initEvents();
    loadSettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API for inline onclick handlers
  window.AlizaStore = {
    openQuickView,
    closeQuickView,
    changeQvQty,
    addToCartFromQuickView,
    removeFromCart,
    changeCartQty,
    openZoomViewer,
    closeZoomViewer
  };
})();

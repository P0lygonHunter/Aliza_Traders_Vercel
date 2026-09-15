/* ==========================================================================
   Aliza Traders — Admin Panel Logic (vanilla JS, no build step)
   ========================================================================== */

(function () {
  'use strict';

  const root = document.getElementById('adminRoot');
  const state = {
    view: 'dashboard',
    categories: [],
    products: [],
    orders: [],
    productForm: { colors: [], sizes: [], image_key: null, image_url: null },
    heroImages: []
  };

  function fmtPrice(n) {
    return 'Rs. ' + Math.round(n).toLocaleString('en-PK');
  }

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  async function api(path, opts = {}) {
    const res = await fetch('/api/admin' + path, {
      credentials: 'same-origin',
      headers: opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      ...opts
    });
    const data = await res.json().catch(() => ({ success: false, error: 'Server error' }));
    if (res.status === 401) {
      renderLogin('Session expired, please login again');
      throw new Error('unauthorized');
    }
    return data;
  }

  function showToast(msg, isError) {
    let t = document.getElementById('adminToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'adminToast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.className = 'toast' + (isError ? ' error' : '');
    t.innerHTML = `<i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-check'}"></i><span>${esc(msg)}</span>`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  const categoryIcon = (slug) => ({
    'party-wear': 'fa-solid fa-champagne-glasses',
    'function-wear': 'fa-solid fa-music',
    'mehndi-wear': 'fa-solid fa-hand-sparkles',
    'bridal-luxe': 'fa-solid fa-crown'
  }[slug] || 'fa-solid fa-shirt');

  function imageThumbHTML(product, size) {
    const w = size || 46;
    const src = product.image_primary || '';
    if (
      src.startsWith('/api/images/') ||
      src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('data:')
    ) {
      return `<div class="thumb" style="width:${w}px"><img src="${src}" /></div>`;
    }
    const gradClass = src || 'grad-maroon';
    return `<div class="thumb pg ${gradClass}" style="width:${w}px"><i class="${categoryIcon(product.category_slug)}"></i></div>`;
  }

  // ---------------- Auth ----------------
  async function checkSession() {
    try {
      const res = await api('/session');
      if (res.authenticated) {
        await bootstrapApp();
      } else {
        renderLogin();
      }
    } catch (e) {
      renderLogin();
    }
  }

  function renderLogin(errorMsg) {
    root.innerHTML = `
      <div class="login-screen">
        <div class="login-box">
          <div class="brand-crown"><i class="fa-solid fa-crown"></i></div>
          <h2>Aliza Traders</h2>
          <p class="sub">Admin Panel Login</p>
          <form class="login-form" id="loginForm">
            <input type="text" id="loginUser" placeholder="Username" required autofocus />
            <input type="password" id="loginPass" placeholder="Password" required />
            <button type="submit"><i class="fa-solid fa-right-to-bracket"></i> Login</button>
            <p class="login-error" id="loginError">${esc(errorMsg || '')}</p>
          </form>
        </div>
      </div>
    `;
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUser').value;
      const password = document.getElementById('loginPass').value;
      const errEl = document.getElementById('loginError');
      errEl.textContent = '';
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          await bootstrapApp();
        } else {
          errEl.textContent = data.error || 'Login failed';
        }
      } catch (err) {
        errEl.textContent = 'Network error. Please try again.';
      }
    });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    renderLogin();
  }

  // ---------------- App Shell ----------------
  async function bootstrapApp() {
    const catRes = await api('/categories');
    state.categories = catRes.data || [];
    renderShell();
    navigate('dashboard');
  }

  function renderShell() {
    root.innerHTML = `
      <div class="admin-app">
        <aside class="sidebar">
          <div class="sidebar-brand"><i class="fa-solid fa-crown"></i><span>Aliza Traders</span></div>
          <nav class="sidebar-nav" id="sidebarNav">
            <a class="sidebar-link" data-view="dashboard"><i class="fa-solid fa-gauge"></i> Dashboard</a>
            <a class="sidebar-link" data-view="products"><i class="fa-solid fa-shirt"></i> Products</a>
            <a class="sidebar-link" data-view="orders"><i class="fa-solid fa-bag-shopping"></i> Orders</a>
            <a class="sidebar-link" data-view="messages"><i class="fa-solid fa-envelope"></i> Messages</a>
            <a class="sidebar-link" data-view="settings"><i class="fa-solid fa-gear"></i> Settings</a>
          </nav>
          <div class="sidebar-footer">
            <a href="/" target="_blank" style="display:block;text-align:center;color:rgba(255,255,255,0.6);font-size:0.8rem;margin-bottom:12px;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> View Storefront
            </a>
            <button id="logoutBtn"><i class="fa-solid fa-power-off"></i> Logout</button>
          </div>
        </aside>
        <main class="main-panel" id="mainPanel"></main>
      </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => navigate(link.getAttribute('data-view')));
    });
  }

  function setActiveNav(view) {
    document.querySelectorAll('.sidebar-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('data-view') === view);
    });
  }

  async function navigate(view) {
    state.view = view;
    setActiveNav(view);
    const panel = document.getElementById('mainPanel');
    panel.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';

    if (view === 'dashboard') return renderDashboard(panel);
    if (view === 'products') return renderProducts(panel);
    if (view === 'orders') return renderOrders(panel);
    if (view === 'messages') return renderMessages(panel);
    if (view === 'settings') return renderSettings(panel);
  }

  // ---------------- Dashboard ----------------
  async function renderDashboard(panel) {
    const res = await api('/stats');
    const s = res.data;
    panel.innerHTML = `
      <div class="panel-header"><div><h1>Dashboard</h1><p>Welcome back! Here's what's happening with your store.</p></div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon ic-products"><i class="fa-solid fa-shirt"></i></div><div class="stat-info"><strong>${s.products}</strong><span>Total Products</span></div></div>
        <div class="stat-card"><div class="stat-icon ic-orders"><i class="fa-solid fa-bag-shopping"></i></div><div class="stat-info"><strong>${s.orders}</strong><span>Total Orders</span></div></div>
        <div class="stat-card"><div class="stat-icon ic-pending"><i class="fa-solid fa-clock"></i></div><div class="stat-info"><strong>${s.pending_orders}</strong><span>Pending Orders</span></div></div>
        <div class="stat-card"><div class="stat-icon ic-revenue"><i class="fa-solid fa-money-bill-wave"></i></div><div class="stat-info"><strong>${fmtPrice(s.revenue)}</strong><span>Total Revenue</span></div></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Quick Actions</h3></div>
        <div style="padding:24px;display:flex;gap:14px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="qaAddProduct"><i class="fa-solid fa-plus"></i> Add New Product</button>
          <button class="btn btn-outline" id="qaViewOrders"><i class="fa-solid fa-bag-shopping"></i> View Orders</button>
        </div>
      </div>
    `;
    document.getElementById('qaAddProduct').addEventListener('click', () => { navigate('products').then(() => openProductModal()); });
    document.getElementById('qaViewOrders').addEventListener('click', () => navigate('orders'));
  }

  // ---------------- Products ----------------
  async function renderProducts(panel) {
    const res = await api('/products');
    state.products = res.data || [];
    renderProductsTable(panel);
  }

  function renderProductsTable(panel) {
    const rows = state.products.map(p => {
      const price = p.sale_price ? `<span style="text-decoration:line-through;color:#b7a8ab;margin-right:6px;">${fmtPrice(p.price)}</span>${fmtPrice(p.sale_price)}` : fmtPrice(p.price);
      return `
        <tr>
          <td><div class="prod-name-cell">${imageThumbHTML(p)}<div><div class="name">${esc(p.name)}</div><div class="cat">${esc(p.category_name)}</div></div></div></td>
          <td>${price}</td>
          <td>${p.stock}</td>
          <td>${p.badge ? `<span class="badge-pill badge-confirmed">${esc(p.badge)}</span>` : '—'}</td>
          <td>
            <div class="row-actions">
              <button class="icon-action" title="Edit" onclick="AdminApp.editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
              <button class="icon-action danger" title="Delete" onclick="AdminApp.deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    panel.innerHTML = `
      <div class="panel-header">
        <div><h1>Products</h1><p>Manage your lehenga, gharara &amp; sharara catalog — add new items anytime.</p></div>
        <button class="btn btn-primary" id="addProductBtn"><i class="fa-solid fa-plus"></i> Add New Product</button>
      </div>
      <div class="card">
        <div class="card-head"><h3>All Products (${state.products.length})</h3></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Badge</th><th>Actions</th></tr></thead>
            <tbody>${rows || ''}</tbody>
          </table>
          ${state.products.length === 0 ? '<div class="empty-state"><i class="fa-solid fa-shirt"></i>No products yet. Click "Add New Product" to create your first listing.</div>' : ''}
        </div>
      </div>
    `;
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
  }

  // ---------------- Product Modal (Add / Edit) ----------------
  function openProductModal(product) {
    const isEdit = !!product;
    const img = product?.image_primary || '';
    const isRealImg = !!(img && (img.startsWith('http') || img.startsWith('/api/images/') || img.startsWith('data:')));
    state.productForm = {
      id: product?.id || null,
      slug: product?.slug || null,
      colors: product?.colors ? [...product.colors] : [],
      sizes: product?.sizes ? [...product.sizes] : [],
      image_key: isRealImg ? img : null,
      image_gradient: isRealImg ? null : (img || 'grad-maroon')
    };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.id = 'productModalOverlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <button class="modal-close" id="pmCloseBtn"><i class="fa-solid fa-xmark"></i></button>
        <h3>${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
        <form id="productForm" class="form-grid">
          <div class="form-group full">
            <label>Product Image</label>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
              <input type="file" id="fImageFile" accept="image/jpeg,image/png,image/webp,image/gif" style="max-width:260px" />
              <span style="font-size:0.82rem;color:#6b5a5e">or paste a URL below</span>
            </div>
            <div id="uploadStatus" style="font-size:0.82rem;margin-top:4px"></div>
            <input type="url" id="fImageUrl" placeholder="https://..." style="margin-top:8px" value="${esc(
              (product?.image_primary && (String(product.image_primary).startsWith('http') || String(product.image_primary).startsWith('data:')))
                ? product.image_primary
                : ''
            )}" />
            <span class="form-hint">Upload a file (recommended) or paste an existing image URL. Leave both empty for color placeholder.</span>
            <div class="image-preview" id="imagePreview" style="margin-top:10px"></div>
          </div>

          <div class="form-group full">
            <label>Product Name *</label>
            <input type="text" id="fName" value="${esc(product?.name || '')}" required />
          </div>

          <div class="form-group">
            <label>Category *</label>
            <select id="fCategory" required>
              ${state.categories.map(c => `<option value="${c.id}" ${product?.category_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Badge</label>
            <select id="fBadge">
              <option value="">None</option>
              ${['New', 'Sale', 'Bestseller'].map(b => `<option value="${b}" ${product?.badge === b ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Regular Price (Rs.) *</label>
            <input type="number" id="fPrice" value="${product?.price || ''}" min="0" step="1" required />
          </div>

          <div class="form-group">
            <label>Sale Price (Rs.)</label>
            <input type="number" id="fSalePrice" value="${product?.sale_price || ''}" min="0" step="1" />
            <span class="form-hint">Leave empty if not on sale</span>
          </div>

          <div class="form-group">
            <label>Fabric</label>
            <input type="text" id="fFabric" value="${esc(product?.fabric || '')}" placeholder="e.g. Net with Sequin Embroidery" />
          </div>

          <div class="form-group">
            <label>Stock Quantity</label>
            <input type="number" id="fStock" value="${product?.stock ?? 10}" min="0" step="1" />
          </div>

          <div class="form-group full">
            <label>Description</label>
            <textarea id="fDescription" rows="3">${esc(product?.description || '')}</textarea>
          </div>

          <div class="form-group full">
            <label>Colors (press Enter to add)</label>
            <div class="color-tag-input" id="colorTagInput">
              <input type="text" id="colorInputField" placeholder="Type a color and press Enter..." />
            </div>
          </div>

          <div class="form-group full">
            <label>Sizes (press Enter to add)</label>
            <div class="color-tag-input" id="sizeTagInput">
              <input type="text" id="sizeInputField" placeholder="e.g. S, M, L, XL, Custom Stitched" />
            </div>
          </div>

          <label style="display:flex;align-items:center;gap:8px;grid-column:1/-1;font-size:0.85rem;">
            <input type="checkbox" id="fFeatured" ${product?.is_featured ? 'checked' : ''} style="width:auto;" /> Feature this product on homepage
          </label>

          <div class="modal-form-actions">
            <button type="submit" class="btn btn-primary" id="saveProductBtn"><i class="fa-solid fa-check"></i> ${isEdit ? 'Update Product' : 'Save Product'}</button>
            <button type="button" class="btn btn-outline" id="cancelProductBtn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    renderImagePreview();
    renderTagChips('color', state.productForm.colors);
    renderTagChips('size', state.productForm.sizes);

    document.getElementById('pmCloseBtn').addEventListener('click', closeProductModal);
    document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProductModal(); });

    const imgUrlInput = document.getElementById('fImageUrl');
    if (imgUrlInput) {
      imgUrlInput.addEventListener('input', () => {
        const url = imgUrlInput.value.trim();
        if (url) {
          state.productForm.image_key = url;
          state.productForm.image_gradient = null;
        } else {
          state.productForm.image_key = null;
          state.productForm.image_gradient = 'grad-maroon';
        }
        renderImagePreview();
      });
    }

    const imgFileInput = document.getElementById('fImageFile');
    if (imgFileInput) {
      imgFileInput.addEventListener('change', async () => {
        const file = imgFileInput.files && imgFileInput.files[0];
        if (!file) return;
        const statusEl = document.getElementById('uploadStatus');
        statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
        try {
          const fd = new FormData();
          fd.append('file', file);
          const r = await api('/upload-image', { method: 'POST', body: fd });
          if (r.success && r.url) {
            state.productForm.image_key = r.url;
            state.productForm.image_gradient = null;
            if (imgUrlInput) imgUrlInput.value = r.url;
            statusEl.innerHTML = '<span style="color:#2f7a4f"><i class="fa-solid fa-circle-check"></i> Uploaded</span>';
            renderImagePreview();
          } else {
            statusEl.innerHTML = '<span style="color:#b23b3b">' + esc(r.error || 'Upload failed') + '</span>';
          }
        } catch (err) {
          statusEl.innerHTML = '<span style="color:#b23b3b">Network error during upload</span>';
        }
      });
    }

    document.getElementById('colorInputField').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val) { state.productForm.colors.push(val); e.target.value = ''; renderTagChips('color', state.productForm.colors); }
      }
    });
    document.getElementById('sizeInputField').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val) { state.productForm.sizes.push(val); e.target.value = ''; renderTagChips('size', state.productForm.sizes); }
      }
    });

    document.getElementById('productForm').addEventListener('submit', (e) => submitProductForm(e, isEdit));
  }

  function renderImagePreview() {
    const el = document.getElementById('imagePreview');
    if (!el) return;
    if (state.productForm.image_key) {
      el.innerHTML = `<img src="${state.productForm.image_key}" style="max-width:160px;border-radius:6px" /><span style="font-size:0.82rem;color:#2f7a4f;display:block;margin-top:6px"><i class="fa-solid fa-circle-check"></i> Image URL set</span>`;
    } else {
      el.innerHTML = `<div class="pg-preview ${state.productForm.image_gradient || 'grad-maroon'}"><i class="fa-solid fa-shirt"></i></div><span style="font-size:0.82rem;color:#6b5a5e;">No image URL — gradient placeholder will be used.</span>`;
    }
  }

  function renderTagChips(type, list) {
    const container = document.getElementById(type === 'color' ? 'colorTagInput' : 'sizeTagInput');
    const input = container.querySelector('input');
    // Remove existing chips
    container.querySelectorAll('.tag-chip').forEach(c => c.remove());
    list.forEach((val, idx) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${esc(val)} <button type="button" data-idx="${idx}">✕</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        list.splice(idx, 1);
        renderTagChips(type, list);
      });
      container.insertBefore(chip, input);
    });
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const box = document.getElementById('imgUploadBox');
    box.querySelector('.txt').textContent = 'Uploading...';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api('/upload-image', { method: 'POST', body: formData });
      if (res.success) {
        state.productForm.image_key = res.data.url;
        renderImagePreview();
        showToast('Image uploaded successfully');
      } else {
        showToast(res.error || 'Upload failed', true);
      }
    } catch (err) {
      if (err.message !== 'unauthorized') showToast('Upload failed. Please try again.', true);
    } finally {
      box.querySelector('.txt').textContent = 'Click or drag to upload an image (JPG, PNG, WEBP — max 5MB)';
    }
  }

  function closeProductModal() {
    document.getElementById('productModalOverlay')?.remove();
  }

  async function submitProductForm(e, isEdit) {
    e.preventDefault();
    const btn = document.getElementById('saveProductBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    const nameVal = document.getElementById('fName').value.trim();
    const slug = nameVal
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80) || ('product-' + Date.now());
    const imgUrl = (document.getElementById('fImageUrl') || {}).value.trim();
    const payload = {
      name: nameVal,
      slug: state.productForm.id ? (state.productForm.slug || slug) : slug,
      category_id: parseInt(document.getElementById('fCategory').value),
      badge: document.getElementById('fBadge').value || null,
      price: parseFloat(document.getElementById('fPrice').value),
      sale_price: document.getElementById('fSalePrice').value ? parseFloat(document.getElementById('fSalePrice').value) : null,
      fabric: document.getElementById('fFabric').value,
      stock: parseInt(document.getElementById('fStock').value) || 0,
      description: document.getElementById('fDescription').value,
      colors: state.productForm.colors,
      sizes: state.productForm.sizes,
      image_primary: imgUrl || state.productForm.image_key || state.productForm.image_gradient || 'grad-maroon',
      is_featured: document.getElementById('fFeatured').checked ? 1 : 0
    };

    try {
      const res = isEdit
        ? await api(`/products/${state.productForm.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await api('/products', { method: 'POST', body: JSON.stringify(payload) });

      if (res.success) {
        showToast(isEdit ? 'Product updated successfully' : 'Product added successfully');
        closeProductModal();
        navigate('products');
      } else {
        showToast(res.error || 'Something went wrong', true);
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> ${isEdit ? 'Update Product' : 'Save Product'}`;
      }
    } catch (err) {
      if (err.message !== 'unauthorized') {
        showToast('Network error. Please try again.', true);
        btn.disabled = false;
      }
    }
  }

  async function editProduct(id) {
    const res = await api(`/products/${id}`);
    if (res.success) openProductModal(res.data);
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    const res = await api(`/products/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Product deleted');
      navigate('products');
    } else {
      showToast(res.error || 'Failed to delete', true);
    }
  }

  // ---------------- Orders ----------------
  async function renderOrders(panel, statusFilter) {
    const res = await api('/orders' + (statusFilter ? `?status=${statusFilter}` : ''));
    state.orders = res.data || [];

    const rows = state.orders.map(o => `
      <tr>
        <td><strong>${esc(o.order_number)}</strong></td>
        <td>${esc(o.customer_name)}<br/><span style="font-size:0.78rem;color:#6b5a5e;">${esc(o.phone)}</span></td>
        <td>${esc(o.city)}</td>
        <td>${fmtPrice(o.total)}</td>
        <td><span class="badge-pill badge-${o.status}">${esc(o.status)}</span></td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td><button class="icon-action" title="View Details" onclick="AdminApp.viewOrder(${o.id})"><i class="fa-solid fa-eye"></i></button></td>
      </tr>
    `).join('');

    panel.innerHTML = `
      <div class="panel-header"><div><h1>Orders</h1><p>Track and manage customer orders.</p></div></div>
      <div class="card">
        <div class="card-head">
          <h3>All Orders (${state.orders.length})</h3>
          <div class="filter-row">
            <select id="statusFilter">
              <option value="">All Statuses</option>
              ${['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => `<option value="${s}" ${statusFilter === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Order #</th><th>Customer</th><th>City</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>${rows || ''}</tbody>
          </table>
          ${state.orders.length === 0 ? '<div class="empty-state"><i class="fa-solid fa-bag-shopping"></i>No orders yet.</div>' : ''}
        </div>
      </div>
    `;
    document.getElementById('statusFilter').addEventListener('change', (e) => renderOrders(panel, e.target.value));
  }

  async function viewOrder(id) {
    const res = await api(`/orders/${id}`);
    if (!res.success) return showToast('Failed to load order', true);
    const o = res.data;

    const itemsRows = (o.items || []).map(i => `
      <tr><td>${esc(i.product_name)}</td><td>${esc(i.size || '—')}</td><td>${esc(i.color || '—')}</td><td>${i.quantity}</td><td>${fmtPrice(i.unit_price)}</td></tr>
    `).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.id = 'orderModalOverlay';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width:700px;">
        <button class="modal-close" id="omCloseBtn"><i class="fa-solid fa-xmark"></i></button>
        <h3>Order ${esc(o.order_number)}</h3>
        <div class="order-detail-grid">
          <div class="order-detail-box">
            <h4>Customer Info</h4>
            <p><strong>${esc(o.customer_name)}</strong></p>
            <p><i class="fa-solid fa-phone"></i> ${esc(o.phone)}</p>
            ${o.email ? `<p><i class="fa-solid fa-envelope"></i> ${esc(o.email)}</p>` : ''}
            <p><i class="fa-solid fa-location-dot"></i> ${esc(o.address)}, ${esc(o.city)}</p>
            ${o.notes ? `<p><i class="fa-solid fa-note-sticky"></i> ${esc(o.notes)}</p>` : ''}
          </div>
          <div class="order-detail-box">
            <h4>Order Summary</h4>
            <p>Payment: <strong>${esc(o.payment_method)}</strong></p>
            <p>Subtotal: ${fmtPrice(o.subtotal)}</p>
            <p>Shipping: ${o.shipping_fee === 0 ? 'FREE' : fmtPrice(o.shipping_fee)}</p>
            <p style="font-size:1rem;color:#4a0f1f;"><strong>Total: ${fmtPrice(o.total)}</strong></p>
          </div>
        </div>
        <table class="order-items-table">
          <thead><tr><th>Product</th><th>Size</th><th>Color</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <div class="status-select-row">
          <label style="font-size:0.85rem;font-weight:500;">Update Status:</label>
          <select id="orderStatusSelect">
            ${['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" id="updateStatusBtn"><i class="fa-solid fa-check"></i> Update</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('omCloseBtn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('updateStatusBtn').addEventListener('click', async () => {
      const status = document.getElementById('orderStatusSelect').value;
      const res2 = await api(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      if (res2.success) {
        showToast('Order status updated');
        overlay.remove();
        navigate('orders');
      } else {
        showToast(res2.error || 'Failed to update', true);
      }
    });
  }

  // ---------------- Messages (Newsletter + Contact) ----------------
  async function renderMessages(panel) {
    const [nlRes, cmRes] = await Promise.all([api('/newsletter'), api('/contact-messages')]);
    const subscribers = nlRes.data || [];
    const messages = cmRes.data || [];

    panel.innerHTML = `
      <div class="panel-header"><div><h1>Messages</h1><p>Newsletter subscribers and contact form submissions.</p></div></div>

      <div class="card" style="margin-bottom:24px;">
        <div class="card-head"><h3>Contact Messages (${messages.length})</h3></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th></tr></thead>
            <tbody>
              ${messages.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.phone || '—')}</td><td>${esc(m.message)}</td><td>${new Date(m.created_at).toLocaleDateString()}</td></tr>`).join('')}
            </tbody>
          </table>
          ${messages.length === 0 ? '<div class="empty-state"><i class="fa-solid fa-envelope"></i>No messages yet.</div>' : ''}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Newsletter Subscribers (${subscribers.length})</h3></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Email</th><th>Subscribed On</th></tr></thead>
            <tbody>
              ${subscribers.map(s => `<tr><td>${esc(s.email)}</td><td>${new Date(s.created_at).toLocaleDateString()}</td></tr>`).join('')}
            </tbody>
          </table>
          ${subscribers.length === 0 ? '<div class="empty-state"><i class="fa-solid fa-paper-plane"></i>No subscribers yet.</div>' : ''}
        </div>
      </div>
    `;
  }

  // ---------------- Settings (Contact + Stats) ----------------
  async function renderSettings(panel) {
    const res = await api('/settings');
    const s = res.data || {};
    const live = s._live || { products: 0, customers: 0 };
    state.heroImages = Array.isArray(s.hero_images) ? [...s.hero_images] : [];

    panel.innerHTML = `
      <div class="panel-header">
        <div>
          <h1>Store Settings</h1>
          <p>Contact details, social links and storefront stats. Changes appear on the website immediately.</p>
        </div>
      </div>

      <form id="settingsForm">
        <div class="card" style="margin-bottom:20px">
          <div class="card-head"><h3>Hero Background Slideshow</h3></div>
          <div style="padding:16px">
            <p style="font-size:0.85rem;color:#6b5a5e;margin-bottom:14px">
              Upload 2–4 images. They auto-rotate on the homepage background every ~5.5 seconds. Recommended size: 1920×1080px or wider, landscape.
            </p>
            <div id="heroSlotsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;max-width:760px"></div>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="card-head"><h3>Contact Information</h3></div>
          <div style="padding:16px;display:grid;gap:14px;max-width:560px">
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value="${esc(s.phone)}" placeholder="+92 300 1234567" />
            </div>
            <div class="form-group">
              <label>WhatsApp Number</label>
              <input type="text" name="whatsapp" value="${esc(s.whatsapp)}" placeholder="+92 300 1234567" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" value="${esc(s.email)}" placeholder="hello@alizatraders.pk" />
            </div>
            <div class="form-group">
              <label>Address / City</label>
              <input type="text" name="address" value="${esc(s.address)}" placeholder="Karachi, Pakistan" />
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="card-head"><h3>Social Media Links</h3></div>
          <div style="padding:16px;display:grid;gap:14px;max-width:560px">
            <div class="form-group">
              <label>Instagram URL</label>
              <input type="url" name="instagram_url" value="${esc(s.instagram_url)}" placeholder="https://instagram.com/yourpage" />
            </div>
            <div class="form-group">
              <label>Facebook URL</label>
              <input type="url" name="facebook_url" value="${esc(s.facebook_url)}" placeholder="https://facebook.com/yourpage" />
            </div>
            <div class="form-group">
              <label>TikTok URL</label>
              <input type="url" name="tiktok_url" value="${esc(s.tiktok_url)}" placeholder="https://tiktok.com/@yourpage" />
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="card-head"><h3>Storefront Stats (About section)</h3></div>
          <div style="padding:16px;display:grid;gap:14px;max-width:560px">
            <div class="form-group">
              <label>Stats Mode</label>
              <select name="stats_mode">
                <option value="auto" ${s.stats_mode === 'auto' ? 'selected' : ''}>Automatic (from real data)</option>
                <option value="manual" ${s.stats_mode === 'manual' ? 'selected' : ''}>Manual (use numbers below)</option>
              </select>
              <p style="font-size:0.85rem;color:#666;margin-top:6px">
                Live right now → Products: <strong>${live.products}</strong> · Unique customers: <strong>${live.customers}</strong>
              </p>
            </div>
            <div class="form-group">
              <label>Happy Customers (shown when Manual, or as fallback)</label>
              <input type="text" name="happy_customers_display" value="${esc(s.happy_customers_display)}" placeholder="500+" />
            </div>
            <div class="form-group">
              <label>Unique Designs (shown when Manual, or as fallback)</label>
              <input type="text" name="unique_designs_display" value="${esc(s.unique_designs_display)}" placeholder="50+" />
            </div>
            <div class="form-group">
              <label>Handcrafted Detail</label>
              <input type="text" name="handcrafted_display" value="${esc(s.handcrafted_display)}" placeholder="100%" />
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:20px">
          <div class="card-head"><h3>Announcement Bar</h3></div>
          <div style="padding:16px;max-width:700px">
            <div class="form-group">
              <label>Top bar text</label>
              <input type="text" name="announce_bar_text" value="${esc(s.announce_bar_text)}" placeholder="Free Delivery on Orders Above Rs. 15,000 • Cash on Delivery Available Nationwide" />
            </div>
          </div>
        </div>

        <div style="padding:0 0 40px">
          <button type="submit" class="btn btn-primary" id="saveSettingsBtn">
            <i class="fa-solid fa-floppy-disk"></i> Save Settings
          </button>
        </div>
      </form>
    `;

    renderHeroSlots();

    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const btn = document.getElementById('saveSettingsBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const payload = {};
      new FormData(form).forEach((val, key) => { payload[key] = val; });
      payload.hero_images = JSON.stringify(state.heroImages);

      try {
        const r = await api('/settings', { method: 'PUT', body: JSON.stringify(payload) });
        if (r.success) {
          showToast('Settings saved — storefront updated');
        } else {
          showToast(r.error || 'Failed to save', true);
        }
      } catch (err) {
        showToast('Network error', true);
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Settings';
    });
  }

  // ---------------- Hero Slideshow Slots ----------------
  const MAX_HERO_IMAGES = 4;

  function renderHeroSlots() {
    const grid = document.getElementById('heroSlotsGrid');
    if (!grid) return;

    const slotsHtml = [];
    state.heroImages.forEach((url, i) => {
      slotsHtml.push(`
        <div class="hero-slot" style="position:relative;border-radius:8px;overflow:hidden;aspect-ratio:16/10;border:1px solid #e6dcd0">
          <img src="${esc(url)}" style="width:100%;height:100%;object-fit:cover;display:block" />
          <button type="button" class="hero-slot-remove" data-idx="${i}" style="position:absolute;top:6px;right:6px;background:rgba(20,10,12,0.7);color:#fff;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <span style="position:absolute;bottom:4px;left:6px;background:rgba(20,10,12,0.6);color:#fff;font-size:0.7rem;padding:2px 6px;border-radius:4px">Slide ${i + 1}</span>
        </div>
      `);
    });

    if (state.heroImages.length < MAX_HERO_IMAGES) {
      slotsHtml.push(`
        <label class="hero-slot-add" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;aspect-ratio:16/10;border:2px dashed #d8c9ba;border-radius:8px;cursor:pointer;color:#8a6d55;font-size:0.82rem">
          <i class="fa-solid fa-plus" style="font-size:1.2rem"></i>
          Add Image
          <input type="file" id="heroSlotFileInput" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none" />
        </label>
      `);
    }

    grid.innerHTML = slotsHtml.join('');

    grid.querySelectorAll('.hero-slot-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        state.heroImages.splice(idx, 1);
        renderHeroSlots();
      });
    });

    const addInput = document.getElementById('heroSlotFileInput');
    if (addInput) {
      addInput.addEventListener('change', async () => {
        const file = addInput.files && addInput.files[0];
        if (!file) return;
        const label = addInput.closest('.hero-slot-add');
        label.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
        try {
          const fd = new FormData();
          fd.append('file', file);
          const r = await api('/upload-image', { method: 'POST', body: fd });
          if (r.success && r.url) {
            state.heroImages.push(r.url);
            showToast('Hero image uploaded — click Save Settings to publish');
          } else {
            showToast(r.error || 'Upload failed', true);
          }
        } catch (err) {
          showToast('Network error during upload', true);
        }
        renderHeroSlots();
      });
    }
  }

  // ---------------- Init ----------------
  // Next.js loads this script after DOMContentLoaded may already have fired
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSession);
  } else {
    checkSession();
  }

  window.AdminApp = { editProduct, deleteProduct, viewOrder };
})();

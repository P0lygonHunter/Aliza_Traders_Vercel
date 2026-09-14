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
    productForm: { colors: [], sizes: [], image_key: null, image_url: null }
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

  // FULL CONTENT TOO LARGE - USE FILE FROM ARTIFACTS
  // This is a probe call
  console.log('probe');
}
)();

import Script from 'next/script'

export default function HomePage() {
  return (
    <>
      <link href="/static/style.css" rel="stylesheet" />
      <div
        dangerouslySetInnerHTML={{
          __html: `
      <div class="announce-bar" id="announceBar">
        <i class="fa-solid fa-truck-fast"></i>&nbsp; <span id="announceBarText">Free Delivery on Orders Above Rs. 15,000 • Cash on Delivery Available Nationwide</span>
      </div>

      <header class="site-header" id="site-header">
        <div class="header-inner">
          <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Open menu">
            <i class="fa-solid fa-bars"></i>
          </button>
          <a href="/" class="brand-mark">
            <span class="brand-crown"><i class="fa-solid fa-crown"></i></span>
            <span class="brand-text">
              <span class="brand-name">Aliza Traders</span>
              <span class="brand-tag">Ethnic Couture</span>
            </span>
          </a>
          <nav class="main-nav" id="mainNav">
            <a href="#party-wear" class="nav-link">Party Wear</a>
            <a href="#function-wear" class="nav-link">Function Wear</a>
            <a href="#mehndi-wear" class="nav-link">Mehndi Wear</a>
            <a href="#bridal-luxe" class="nav-link">Bridal Luxe</a>
            <a href="#about" class="nav-link">About</a>
            <a href="#contact" class="nav-link">Contact</a>
          </nav>
          <div class="header-actions">
            <button class="icon-btn" id="searchToggle" aria-label="Search">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
            <button class="icon-btn cart-btn" id="cartToggle" aria-label="Cart">
              <i class="fa-solid fa-bag-shopping"></i>
              <span class="cart-count" id="cartCount">0</span>
            </button>
          </div>
        </div>
        <div class="search-bar" id="searchBar">
          <div class="search-bar-inner">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="searchInput" placeholder="Search lehengas, gharara, sharara..." />
            <button id="searchClose" aria-label="Close search"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      </header>

      <section class="hero-section" id="hero-section">
        <div class="hero-media">
          <img src="/static/img/hero-banner.png" alt="Aliza Traders Bridal and Party Wear" />
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <span class="hero-eyebrow">New Season Edit</span>
          <h1 class="hero-title">Woven With<br />Elegance</h1>
          <p class="hero-sub">Hand-embroidered lehengas for every celebration - party nights, mehndi dholkis, and everything in between.</p>
          <div class="hero-cta-row">
            <a href="#party-wear" class="btn btn-light">Shop Party Wear</a>
            <a href="#mehndi-wear" class="btn btn-outline-light">Shop Mehndi Wear</a>
          </div>
        </div>
        <a href="#category-strip" class="scroll-hint" aria-label="Scroll down">
          <i class="fa-solid fa-chevron-down"></i>
        </a>
      </section>

      <section class="category-strip" id="category-strip">
        <a href="#party-wear" class="cat-card cat-party">
          <span class="cat-swatch swatch-emerald"></span>
          <h3>Party Wear</h3>
          <span class="cat-link">Shop Now <i class="fa-solid fa-arrow-right"></i></span>
        </a>
        <a href="#function-wear" class="cat-card cat-function">
          <span class="cat-swatch swatch-orange"></span>
          <h3>Function Wear</h3>
          <span class="cat-link">Shop Now <i class="fa-solid fa-arrow-right"></i></span>
        </a>
        <a href="#mehndi-wear" class="cat-card cat-mehndi">
          <span class="cat-swatch swatch-mehndi"></span>
          <h3>Mehndi Wear</h3>
          <span class="cat-link">Shop Now <i class="fa-solid fa-arrow-right"></i></span>
        </a>
        <a href="#bridal-luxe" class="cat-card cat-bridal">
          <span class="cat-swatch swatch-bridal"></span>
          <h3>Bridal Luxe</h3>
          <span class="cat-link">Shop Now <i class="fa-solid fa-arrow-right"></i></span>
        </a>
      </section>

      <main id="app-main">
        <section class="product-section" id="party-wear" data-category="party-wear">
          <div class="section-head">
            <div>
              <span class="section-eyebrow">Shine Bright</span>
              <h2 class="section-title">Party Wear</h2>
            </div>
            <a href="#party-wear" class="view-all-link">View All <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          <div class="product-grid" data-grid="party-wear">
            <div class="grid-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading collection...</div>
          </div>
        </section>

        <section class="promo-banner">
          <div class="promo-inner">
            <span class="promo-eyebrow">Limited Time</span>
            <h2>Function Season Sale - Up to 25% Off</h2>
            <a href="#function-wear" class="btn btn-dark">Explore Offers</a>
          </div>
        </section>

        <section class="product-section" id="function-wear" data-category="function-wear">
          <div class="section-head">
            <div>
              <span class="section-eyebrow">Celebrate In Style</span>
              <h2 class="section-title">Function Wear</h2>
            </div>
            <a href="#function-wear" class="view-all-link">View All <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          <div class="product-grid" data-grid="function-wear">
            <div class="grid-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading collection...</div>
          </div>
        </section>

        <section class="product-section alt-bg" id="mehndi-wear" data-category="mehndi-wear">
          <div class="section-head">
            <div>
              <span class="section-eyebrow">Dance The Night Away</span>
              <h2 class="section-title">Mehndi Wear</h2>
            </div>
            <a href="#mehndi-wear" class="view-all-link">View All <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          <div class="product-grid" data-grid="mehndi-wear">
            <div class="grid-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading collection...</div>
          </div>
        </section>

        <section class="product-section" id="bridal-luxe" data-category="bridal-luxe">
          <div class="section-head">
            <div>
              <span class="section-eyebrow">Once In A Lifetime</span>
              <h2 class="section-title">Bridal Luxe</h2>
            </div>
            <a href="#bridal-luxe" class="view-all-link">View All <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          <div class="product-grid" data-grid="bridal-luxe">
            <div class="grid-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading collection...</div>
          </div>
        </section>
      </main>

      <section class="features-strip">
        <div class="feature-item">
          <i class="fa-solid fa-truck"></i>
          <div><h4>Nationwide Delivery</h4><p>Karachi, Lahore, Islamabad and beyond</p></div>
        </div>
        <div class="feature-item">
          <i class="fa-solid fa-money-bill-wave"></i>
          <div><h4>Cash on Delivery</h4><p>Pay when your order arrives</p></div>
        </div>
        <div class="feature-item">
          <i class="fa-solid fa-hand-holding-heart"></i>
          <div><h4>Hand-Embroidered</h4><p>Crafted by skilled artisans</p></div>
        </div>
        <div class="feature-item">
          <i class="fa-solid fa-rotate-left"></i>
          <div><h4>Easy Exchange</h4><p>7-day exchange policy</p></div>
        </div>
      </section>

      <section class="about-section" id="about">
        <div class="about-content">
          <span class="section-eyebrow">Our Story</span>
          <h2 class="section-title">Aliza Traders</h2>
          <p>Aliza Traders is a Pakistan-based online boutique bringing hand-crafted party wear, function wear, mehndi wear and bridal lehengas straight to your doorstep.</p>
          <p>From glimmering sequin lehengas for your next wedding night to breezy mehndi shararas in festive yellows and greens, our collections are curated for the modern Pakistani bride and her entourage.</p>
          <div class="about-stats" id="aboutStats">
            <div><strong id="statHappyCustomers">-</strong><span>Happy Customers</span></div>
            <div><strong id="statUniqueDesigns">-</strong><span>Unique Designs</span></div>
            <div><strong id="statHandcrafted">100%</strong><span>Handcrafted Detail</span></div>
          </div>
        </div>
      </section>

      <section class="newsletter-section">
        <div class="newsletter-inner">
          <h3>Join The Aliza Traders Family</h3>
          <p>Be the first to know about new arrivals, exclusive sales and wedding season drops.</p>
          <form id="newsletterForm" class="newsletter-form">
            <input type="email" id="newsletterEmail" placeholder="Enter your email address" required />
            <button type="submit"><i class="fa-solid fa-paper-plane"></i> Subscribe</button>
          </form>
          <p class="newsletter-msg" id="newsletterMsg"></p>
        </div>
      </section>

      <section class="contact-section" id="contact">
        <div class="contact-grid">
          <div class="contact-info">
            <span class="section-eyebrow">Get In Touch</span>
            <h2 class="section-title">Contact Us</h2>
            <p>Have a question about sizing, custom stitching, or an order? Reach out - we usually reply within a few hours.</p>
            <ul class="contact-list" id="contactList">
              <li id="contactPhoneRow"><i class="fa-solid fa-phone"></i> <span>-</span></li>
              <li id="contactWhatsapp"><i class="fa-brands fa-whatsapp"></i> <span>WhatsApp: -</span></li>
              <li id="contactEmailRow"><i class="fa-solid fa-envelope"></i> <span>-</span></li>
              <li id="contactAddress"><i class="fa-solid fa-location-dot"></i> <span>-</span></li>
            </ul>
            <div class="social-row" id="socialRow">
              <a href="#" id="socialInstagram" aria-label="Instagram" style="display:none"><i class="fa-brands fa-instagram"></i></a>
              <a href="#" id="socialFacebook" aria-label="Facebook" style="display:none"><i class="fa-brands fa-facebook"></i></a>
              <a href="#" id="socialTiktok" aria-label="TikTok" style="display:none"><i class="fa-brands fa-tiktok"></i></a>
            </div>
          </div>
          <form id="contactForm" class="contact-form">
            <input type="text" id="cfName" placeholder="Your Name" required />
            <input type="email" id="cfEmail" placeholder="Your Email" required />
            <input type="tel" id="cfPhone" placeholder="Phone Number" />
            <textarea id="cfMessage" rows="4" placeholder="Your Message" required></textarea>
            <button type="submit" class="btn btn-primary">Send Message</button>
            <p class="contact-msg" id="contactMsg"></p>
          </form>
        </div>
      </section>

      <footer class="site-footer">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="brand-mark">
              <span class="brand-crown"><i class="fa-solid fa-crown"></i></span>
              <span class="brand-text"><span class="brand-name">Aliza Traders</span></span>
            </a>
            <p>Pakistan boutique for party wear, function wear, mehndi wear and bridal lehengas - delivered nationwide.</p>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <a href="#party-wear">Party Wear</a>
            <a href="#function-wear">Function Wear</a>
            <a href="#mehndi-wear">Mehndi Wear</a>
            <a href="#bridal-luxe">Bridal Luxe</a>
          </div>
          <div class="footer-col">
            <h4>Help</h4>
            <a href="#contact">Contact Us</a>
          </div>
          <div class="footer-col">
            <h4>Payment We Accept</h4>
            <div class="payment-icons">
              <span><i class="fa-solid fa-money-bill-wave"></i> COD</span>
              <span><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; <span id="footerYear"></span> Aliza Traders. All rights reserved.</p>
        </div>
      </footer>

      <div class="cart-overlay" id="cartOverlay"></div>
      <aside class="cart-drawer" id="cartDrawer">
        <div class="cart-drawer-head">
          <h3><i class="fa-solid fa-bag-shopping"></i> Your Bag</h3>
          <button id="cartClose" aria-label="Close cart"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="cart-items" id="cartItems">
          <p class="cart-empty">Your bag is empty. Start adding your favourite lehengas!</p>
        </div>
        <div class="cart-footer" id="cartFooter" style="display:none">
          <div class="cart-subtotal-row">
            <span>Subtotal</span>
            <strong id="cartSubtotal">Rs. 0</strong>
          </div>
          <p class="cart-note">Shipping calculated at checkout.</p>
          <button class="btn btn-primary btn-block" id="checkoutBtn">Proceed to Checkout</button>
        </div>
      </aside>

      <div class="modal-overlay" id="productModalOverlay">
        <div class="modal-box product-modal" id="productModal"></div>
      </div>

      <div class="modal-overlay" id="checkoutModalOverlay">
        <div class="modal-box checkout-modal" id="checkoutModal">
          <button class="modal-close" id="checkoutClose"><i class="fa-solid fa-xmark"></i></button>
          <h3><i class="fa-solid fa-lock"></i> Secure Checkout</h3>
          <div id="checkoutStepForm">
            <form id="checkoutForm" class="checkout-form">
              <div class="form-row">
                <input type="text" id="ckName" placeholder="Full Name" required />
                <input type="tel" id="ckPhone" placeholder="Phone Number" required />
              </div>
              <input type="email" id="ckEmail" placeholder="Email (optional)" />
              <input type="text" id="ckAddress" placeholder="Delivery Address" required />
              <input type="text" id="ckCity" placeholder="City" required />
              <textarea id="ckNotes" rows="2" placeholder="Order notes (optional)"></textarea>
              <div class="payment-options">
                <label class="payment-option active">
                  <input type="radio" name="payment" value="COD" checked />
                  <i class="fa-solid fa-money-bill-wave"></i> Cash on Delivery
                </label>
                <label class="payment-option">
                  <input type="radio" name="payment" value="Bank Transfer" />
                  <i class="fa-solid fa-building-columns"></i> Bank Transfer
                </label>
              </div>
              <div class="checkout-summary" id="checkoutSummary"></div>
              <button type="submit" class="btn btn-primary btn-block">Place Order</button>
            </form>
          </div>
          <div id="checkoutSuccess" style="display:none" class="checkout-success">
            <i class="fa-solid fa-circle-check"></i>
            <h4>Order Placed Successfully!</h4>
            <p>Your order number is <strong id="successOrderNumber"></strong>. We will contact you shortly to confirm delivery details.</p>
            <button class="btn btn-outline" id="successCloseBtn">Continue Shopping</button>
          </div>
        </div>
      </div>
          `
        }}
      />
      <Script src="/static/app.js" strategy="afterInteractive" />
    </>
  )
}

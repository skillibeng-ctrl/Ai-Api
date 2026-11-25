document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initNav();
  initBackToTop();
  initDemoCards();
  initConfigPanel();
  initApiCallDialog();
});

/* ---------- STARS ---------- */
function initStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    star.style.animationDelay = (Math.random() * 3) + 's';
    star.style.opacity = (Math.random() * 0.7 + 0.3).toFixed(2);
    frag.appendChild(star);
  }
  container.appendChild(frag);
}

/* ---------- NAV ---------- */
function initNav() {
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (!navLinks || !hamburger) return;

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- BACK TO TOP ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- DEMO CARDS ---------- */
const DEMO_LABELS = {
  'web-scraping': 'AI Web Scraping',
  vision: 'Computer Vision',
  social: 'Social Analytics',
  data: 'Data Intelligence'
};

function initDemoCards() {
  const cards = document.querySelectorAll('.demo-card');
  const activeCard = document.querySelector('.demo-card.active');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.demo;
      const configSection = document.getElementById('config');

      if (key === 'web-scraping') {
        configSection?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      showToast(`${DEMO_LABELS[key] || 'This demo'} is coming soon — try AI Web Scraping below.`);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
  });
}

/* ---------- CONFIG PANEL ---------- */
const MOCK_PRODUCTS = [
  { name: 'Premium Headphones', price: '$299', rating: 4.8, reviews: 1247 },
  { name: 'Wireless Speaker',  price: '$199', rating: 4.6, reviews: 892  },
  { name: 'Smart Watch',       price: '$399', rating: 4.9, reviews: 2156 }
];

function initConfigPanel() {
  const runButton       = document.getElementById('runAnalysis');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const resultsSection  = document.getElementById('resultsSection');
  const exportButton    = document.getElementById('exportResults');
  const apiButton       = document.getElementById('viewApiCall');
  const targetUrl       = document.getElementById('targetUrl');
  const aiModel         = document.getElementById('aiModel');
  const resultsMeta     = document.getElementById('resultsMeta');
  const resultsBody     = document.getElementById('resultsBody');
  const resultsCount    = document.getElementById('resultsCount');

  if (!runButton || !loadingIndicator || !resultsSection) return;

  let lastResults = [];

  async function callProductExtractionApi(url, model) {
    // Simulated delay; swap for a real fetch in production.
    await new Promise(resolve => setTimeout(resolve, 2300));
    return {
      success: true,
      processingTime: '2.3s',
      products: MOCK_PRODUCTS
    };
  }

  function renderResults(products) {
    const starSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>`;

    resultsBody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div class="product-name">${escapeHtml(p.name)}</div>
          <div class="product-rating">
            ${starSvg}
            ${p.rating}
            <span class="product-reviews">(${p.reviews.toLocaleString()} reviews)</span>
          </div>
        </td>
        <td class="product-price">${escapeHtml(p.price)}</td>
      </tr>
    `).join('') + `
      <tr class="summary-row">
        <td>Total Products</td>
        <td>${products.length}</td>
      </tr>`;

    resultsCount.textContent = `${products.length} items`;
  }

  runButton.addEventListener('click', async () => {
    if (!targetUrl.value.trim()) {
      showToast('Please enter a target URL.');
      targetUrl.focus();
      return;
    }

    runButton.disabled = true;
    loadingIndicator.style.display = 'block';
    resultsSection.style.display = 'none';

    try {
      const results = await callProductExtractionApi(targetUrl.value.trim(), aiModel.value);

      if (results.success) {
        lastResults = results.products;
        resultsMeta.textContent = `${results.processingTime} Processing Time`;
        renderResults(results.products);
        resultsSection.style.display = 'block';
      } else {
        showToast('Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error('API Error:', err);
      showToast('An error occurred during analysis.');
    } finally {
      loadingIndicator.style.display = 'none';
      runButton.disabled = false;
    }
  });

  exportButton?.addEventListener('click', () => {
    if (!lastResults.length) return;
    const header = 'Product,Price,Rating,Reviews\n';
    const rows = lastResults.map(p =>
      `"${p.name.replace(/"/g, '""')}","${p.price}",${p.rating},${p.reviews}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dataflow-results.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Results exported as CSV.');
  });

  apiButton?.addEventListener('click', () => {
    const payload = {
      url: targetUrl.value || 'https://example.com',
      model: aiModel.value,
      extract: ['products', 'prices', 'reviews']
    };
    openApiDialog(payload);
  });
}

/* ---------- API CALL DIALOG ---------- */
function initApiCallDialog() {
  const dialog = document.getElementById('apiCallDialog');
  const closeBtn = document.getElementById('closeApiDialog');
  const copyBtn = document.getElementById('copyApiCall');
  const codeEl = document.getElementById('apiCallCode');
  if (!dialog || !closeBtn) return;

  closeBtn.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeEl.textContent);
      showToast('Request copied to clipboard.');
    } catch {
      showToast('Copy failed — select and copy manually.');
    }
  });
}

function openApiDialog(payload) {
  const dialog = document.getElementById('apiCallDialog');
  const codeEl = document.getElementById('apiCallCode');

  const snippet = `POST /api/scrape
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

${JSON.stringify(payload, null, 2)}`;

  codeEl.textContent = snippet;

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    alert(snippet); // fallback for very old browsers
  }
}

/* ---------- UTILITIES ---------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 2600);
}
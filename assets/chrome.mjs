const NAV = [
  { id: 'home', label: 'Home', href: '/' },
  {
    id: 'shastra',
    label: 'Śāstra Library',
    href: '/dharma-sutra/',
    children: [
      { id: 'dharma', label: 'Āpastamba Dharma Sūtra', href: '/dharma-sutra/' },
      { id: 'gruhya', label: 'Āpastamba Gṛhya Sūtra', href: '/gruhya-sutra/' }
    ]
  },
  { id: 'vedic', label: 'Vedic Texts', href: '/vedic-mantras/' },
  { id: 'articles', label: 'Articles & Research', href: '/articles/' },
  { id: 'topics', label: 'Topics', href: '/topics/' },
  { id: 'search', label: 'Search', href: '/search/' },
  {
    id: 'tools',
    label: 'Traditional Tools',
    href: '/tarabalam/',
    children: [
      { id: 'tarabalam', label: 'Tarabalam', href: '/tarabalam/' }
    ]
  },
  { id: 'about', label: 'About', href: '/about.html' }
];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function itemCurrent(item, active) {
  if (!active) return false;
  if (item.id === active) return true;
  return (item.children || []).some((child) => child.id === active);
}

export function headerHtml(active = '') {
  const links = NAV.map((item) => {
    const current = itemCurrent(item, active);
    if (item.children) {
      const subs = item.children.map((child) => {
        const on = child.id === active ? ' aria-current="page"' : '';
        return `<a href="${esc(child.href)}"${on}>${esc(child.label)}</a>`;
      }).join('');
      return `<div class="nav-drop${current ? ' current' : ''}">
        <button type="button" aria-expanded="false" aria-haspopup="true">${esc(item.label)}</button>
        <div class="nav-sub" role="group" aria-label="${esc(item.label)}">${subs}</div>
      </div>`;
    }
    const on = current ? ' aria-current="page"' : '';
    const extra = item.id === 'search' ? ' class="nav-search-link"' : '';
    return `<a href="${esc(item.href)}"${on}${extra}>${esc(item.label)}</a>`;
  }).join('');

  return `<a class="skip-link" href="#content">Skip to content</a>
<header class="site-header">
  <div class="header-bar">
    <a class="brand" href="/">
      <img src="/favicon.png" alt="" width="48" height="48">
      <span>Bramha.org</span>
    </a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Main">${links}</nav>
    <form class="header-search" action="/search/" method="get" role="search">
      <label class="sr-only" for="header-q">Search the library</label>
      <input id="header-q" name="q" type="search" placeholder="Search the library" autocomplete="off">
      <button type="submit">Search</button>
    </form>
  </div>
</header>`;
}

export function footerHtml() {
  return `<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <img src="/favicon.png" alt="" width="56" height="56">
      <p>Bramha.org is a digital Śāstra knowledge library. Public pages show only verified, published records.</p>
    </div>
    <div>
      <h2>Library</h2>
      <a href="/dharma-sutra/">Āpastamba Dharma Sūtra</a>
      <a href="/gruhya-sutra/">Āpastamba Gṛhya Sūtra</a>
      <a href="/vedic-mantras/">Vedic Texts</a>
      <a href="/articles/">Articles &amp; Research</a>
    </div>
    <div>
      <h2>Study</h2>
      <a href="/topics/">Topics</a>
      <a href="/search/">Search</a>
      <a href="/bhashyam/">Commentaries</a>
      <a href="/prayoga/">Prayoga</a>
      <a href="/account/">Personal study</a>
    </div>
    <div>
      <h2>Bramha.org</h2>
      <a href="/tarabalam/">Tarabalam</a>
      <a href="/about.html">About</a>
      <a href="mailto:contact@bramha.org">contact@bramha.org</a>
    </div>
  </div>
  <div class="footer-bottom">© 2026 Bramha.org · Digital Śāstra Knowledge Library</div>
</footer>`;
}

export function mountChrome() {
  const active = document.body?.dataset.nav || '';
  const headerHost = document.getElementById('site-header');
  const footerHost = document.getElementById('site-footer');
  if (headerHost && !headerHost.querySelector('.site-header')) headerHost.innerHTML = headerHtml(active);
  if (footerHost && !footerHost.querySelector('.site-footer')) footerHost.innerHTML = footerHtml();
  const root = document.querySelector('.site-header');
  const menu = root?.querySelector('.menu-btn');
  menu?.addEventListener('click', () => {
    const open = root.classList.toggle('nav-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  root?.querySelectorAll('.nav-drop > button').forEach((button) => {
    button.addEventListener('click', () => {
      const drop = button.parentElement;
      const open = !drop.classList.contains('open');
      root.querySelectorAll('.nav-drop.open').forEach((node) => {
        if (node !== drop) {
          node.classList.remove('open');
          node.querySelector('button')?.setAttribute('aria-expanded', 'false');
        }
      });
      drop.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root?.classList.contains('nav-open')) {
      root.classList.remove('nav-open');
      menu?.setAttribute('aria-expanded', 'false');
      menu?.focus();
    }
  });
}

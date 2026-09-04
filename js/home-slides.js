(function () {
  const hero = document.getElementById('homeHero');
  if (!hero) return;

  const els = {
    image: document.getElementById('heroImage'),
    eyebrow: document.getElementById('heroEyebrow'),
    title: document.getElementById('heroTitle'),
    highlight: document.getElementById('heroHighlight'),
    description: document.getElementById('heroDescription'),
    button: document.getElementById('heroButton'),
    prev: document.getElementById('heroPrev'),
    next: document.getElementById('heroNext'),
    dots: document.getElementById('heroDots')
  };

  const fallback = [
    {
      id: 'fallback-library',
      eyebrow: 'Bramha.org · Digital Śāstra library',
      title: 'Read. Compare. Understand.',
      highlight: 'One place for traditional knowledge.',
      description: 'A student-friendly repository for Sūtras, Vedic texts, articles, meanings, commentaries, Prayoga and cross-references.',
      imageUrl: '/hero-manuscript.jpg',
      altText: 'Traditional manuscript and Śāstra knowledge',
      buttonText: 'Search the library',
      buttonUrl: 'search/'
    },
    {
      id: 'fallback-dharma',
      eyebrow: 'Śāstra library',
      title: 'Āpastamba Dharma Sūtra',
      highlight: 'Text, meaning, commentary, context.',
      description: 'Read by Praśna, Paṭala, Khāṇḍa and Sūtra, with layered views for students and researchers.',
      imageUrl: '/card-shastra.jpg',
      altText: 'Dharma Sūtra manuscript',
      buttonText: 'Open Dharma Sūtra',
      buttonUrl: 'dharma-sutra/'
    },
    {
      id: 'fallback-mantras',
      eyebrow: 'Vedic texts',
      title: 'Mantras and source notes',
      highlight: 'Published only when verified.',
      description: 'Text, meaning, viniyoga and references as reviewed material is added to the public library.',
      imageUrl: '/card-mantras.jpg',
      altText: 'Vedic mantra study',
      buttonText: 'Browse Vedic texts',
      buttonUrl: 'vedic-mantras/'
    },
    {
      id: 'fallback-tarabalam',
      eyebrow: 'Traditional tools',
      title: 'Tarabalam',
      highlight: 'Five languages. One calculation.',
      description: 'Find the relationship between Janma Nakshatra and the selected day or Muhūrta Nakshatra.',
      imageUrl: '/hero-temple.jpg',
      altText: 'Temple architecture at dusk',
      buttonText: 'Open Tarabalam',
      buttonUrl: 'tarabalam/'
    }
  ];

  let slides = fallback;
  let current = 0;
  let timer = null;

  function normaliseImageUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (raw.startsWith('/')) return `${location.origin}${raw}`;

    // Accept Google Drive share links when the file is shared as "Anyone with the link".
    const fileMatch = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    const idMatch = raw.match(/[?&]id=([^&]+)/i);
    const id = fileMatch?.[1] || idMatch?.[1];
    if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2400`;

    return raw;
  }

  function parseSlide(row) {
    return {
      id: row.article_id || '',
      eyebrow: 'Bramha.org · Featured',
      title: row.title || '',
      highlight: row.content || '',
      description: row.summary || '',
      imageUrl: normaliseImageUrl(row.featured_image_url),
      altText: row.topic_tags || row.title || 'Bramha.org featured image',
      buttonText: row.source_references || 'EXPLORE »',
      buttonUrl: row.slug || '#'
    };
  }

  function renderDots() {
    if (!els.dots) return;
    els.dots.innerHTML = '';
    slides.forEach((slide, index) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = index === current ? 'active' : '';
      b.setAttribute('aria-label', `Show slide ${index + 1}`);
      b.addEventListener('click', () => { show(index); restart(); });
      els.dots.appendChild(b);
    });
  }

  function setOptional(el, value, displayValue) {
    if (!el) return;
    const hasValue = String(value || '').trim() !== '';
    el.textContent = hasValue ? value : '';
    el.style.display = hasValue ? (displayValue || '') : 'none';
  }

  function show(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    const s = slides[current];

    setOptional(els.eyebrow, s.eyebrow);
    setOptional(els.title, s.title);
    setOptional(els.highlight, s.highlight);
    setOptional(els.description, s.description);

    if (els.button) {
      if (s.buttonText && s.buttonUrl) {
        els.button.textContent = s.buttonText;
        els.button.href = s.buttonUrl;
        els.button.style.display = '';
      } else {
        els.button.style.display = 'none';
      }
    }

    if (els.image && s.imageUrl) {
      els.image.classList.add('changing');
      const img = new Image();
      img.onload = () => {
        els.image.src = s.imageUrl;
        els.image.alt = s.altText || '';
        requestAnimationFrame(() => els.image.classList.remove('changing'));
      };
      img.onerror = () => els.image.classList.remove('changing');
      img.src = s.imageUrl;
    }

    renderDots();
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }
  function restart() {
    if (timer) clearInterval(timer);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && slides.length > 1) timer = setInterval(next, 7000);
  }

  els.next?.addEventListener('click', () => { next(); restart(); });
  els.prev?.addEventListener('click', () => { prev(); restart(); });
  hero.addEventListener('mouseenter', () => timer && clearInterval(timer));
  hero.addEventListener('mouseleave', restart);
  hero.addEventListener('focusin', () => timer && clearInterval(timer));
  hero.addEventListener('focusout', restart);

  async function load() {
    let cms = [];
    try {
      if (typeof window.sbFetch !== 'function') throw new Error('Supabase API helper unavailable');
      const rows = await window.sbFetch('articles?select=article_id,title,slug,summary,content,featured_image_url,source_references,topic_tags&language=eq.Homepage%20Slide&featured=eq.true&publish=eq.true&verification_status=eq.Verified&order=article_id.asc&limit=20');
      if (Array.isArray(rows) && rows.length) cms = rows.map(parseSlide).filter(s => s.imageUrl);
    } catch (err) {
      console.warn('Homepage slides: using built-in fallback.', err);
    }
    if (cms.length >= 2) {
      slides = cms;
    } else {
      const seen = new Set(cms.map(s => String(s.imageUrl || s.title).toLowerCase()));
      slides = cms.concat(fallback.filter(s => !seen.has(String(s.imageUrl || s.title).toLowerCase())));
    }
    if (!slides.length) slides = fallback;
    show(0);
    restart();
  }

  load();
})();

(() => {
  'use strict';

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const header = document.getElementById('site-header');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open');
    });

    // Close menu when a nav link is clicked
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  // Sticky header background on scroll
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Platform detection & smart store links ---
  const STORE_URLS = {
    ios: 'https://apps.apple.com/us/app/relicroute/id6799253953',
    android: 'https://play.google.com/store/apps/details?id=com.relicroute.app&pcampaignid=web_share'
  };

  function detectPlatform() {
    const ua = navigator.userAgent || '';
    // iPadOS 13+ reports a desktop Mac UA; identify it via multi-touch support
    const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    if (isIpadOs || /iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return null;
  }

  const platform = detectPlatform();

  if (platform) {
    document.documentElement.classList.add('platform-' + platform);

    // Upgrade generic download CTAs to a direct store link. Must run before
    // the smooth-scroll wiring below so a rewritten link is no longer
    // treated as an in-page anchor.
    document.querySelectorAll('a[data-store-link]').forEach(link => {
      link.href = STORE_URLS[platform];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Platform tabs (Help page)
  const platformTabs = document.querySelectorAll('.platform-tab');
  if (platformTabs.length) {
    platformTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update tabs
        platformTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Update content
        document.querySelectorAll('.platform-content').forEach(panel => {
          panel.classList.remove('active');
          panel.hidden = true;
        });
        const target = document.getElementById(tab.getAttribute('aria-controls'));
        if (target) {
          target.classList.add('active');
          target.hidden = false;
        }
      });
    });

    // Auto-select the tab matching the visitor's device
    if (platform) {
      const matchingTab = document.querySelector('.platform-tab[data-platform="' + platform + '"]');
      if (matchingTab && !matchingTab.classList.contains('active')) {
        matchingTab.click();
      }
    }
  }

  // Accordion toggles (Help page)
  document.querySelectorAll('.help-article-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
    });
  });

  // Scroll-reveal animations via Intersection Observer
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll(
      '.feature-card, .step, .problem-solution-body, .pricing-content, .pricing-card, .hero-content, .preview-item, .beta-teaser-content'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => observer.observe(el));
  }

  // --- Searchable Select (Beta form device picker) ---
  const deviceData = {
    'Apple': [
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 16e',
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
      'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
      'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
      'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
      'iPhone SE (3rd gen)', 'iPhone SE (2nd gen)',
      'Other'
    ],
    'Samsung': [
      'Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25',
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S24 FE',
      'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
      'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
      'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
      'Galaxy Z Fold6', 'Galaxy Z Fold5', 'Galaxy Z Flip6', 'Galaxy Z Flip5',
      'Galaxy A55', 'Galaxy A54', 'Galaxy A35', 'Galaxy A34', 'Galaxy A25', 'Galaxy A16', 'Galaxy A15', 'Galaxy A14',
      'Other'
    ],
    'Google Pixel': [
      'Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 9a',
      'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
      'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
      'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
      'Other'
    ],
    'OnePlus': [
      'OnePlus 13', 'OnePlus 12', 'OnePlus 12R',
      'OnePlus 11',
      'OnePlus Nord 4', 'OnePlus Nord CE 4', 'OnePlus Nord 3',
      'Other'
    ],
    'Xiaomi': [
      'Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 14T Pro', 'Xiaomi 14T',
      'Xiaomi 13T Pro', 'Xiaomi 13T', 'Xiaomi 13',
      'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
      'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12',
      'Redmi 13', 'Redmi 12',
      'POCO F6 Pro', 'POCO F6', 'POCO X6 Pro',
      'Other'
    ],
    'Motorola': [
      'Edge 50 Ultra', 'Edge 50 Pro', 'Edge 50 Fusion',
      'Edge 40 Pro', 'Edge 40',
      'Moto G84', 'Moto G54', 'Moto G34', 'Moto G24',
      'Razr 50 Ultra', 'Razr 50',
      'Other'
    ],
    'Honor': [
      'Magic 6 Pro', 'Magic 5 Pro',
      'Honor 200 Pro', 'Honor 200',
      'Honor 90', 'Honor 70',
      'Other'
    ],
    'Huawei': [
      'P60 Pro', 'P50 Pro',
      'Mate 60 Pro', 'Mate 50 Pro',
      'Nova 12', 'Nova 11',
      'Other'
    ],
    'Sony': [
      'Xperia 1 VI', 'Xperia 1 V',
      'Xperia 5 V',
      'Xperia 10 VI', 'Xperia 10 V',
      'Other'
    ],
    'Nokia (HMD)': [
      'Nokia G42', 'Nokia G22', 'Nokia G21',
      'Nokia X30', 'Nokia XR21',
      'Other'
    ],
    'Oppo': [
      'Find X7 Ultra', 'Find X7',
      'Reno 12 Pro', 'Reno 12', 'Reno 11 Pro',
      'A80', 'A60', 'A38',
      'Other'
    ],
    'Realme': [
      'GT 6', 'GT 5 Pro',
      'Realme 12 Pro+', 'Realme 12 Pro', 'Realme 12',
      'Realme C67', 'Realme C55',
      'Other'
    ],
    'Nothing': [
      'Phone (2a)', 'Phone (2)', 'Phone (1)',
      'Other'
    ]
  };

  const brandList = [...Object.keys(deviceData), 'Other'];

  function initSearchableSelect(container, options, placeholder) {
    const input = container.querySelector('.searchable-select-input');
    const hidden = container.querySelector('input[type="hidden"]');
    const dropdown = container.querySelector('.searchable-select-dropdown');
    let highlighted = -1;
    let currentOptions = options;
    let isOpen = false;

    function render(filter) {
      const query = (filter || '').toLowerCase();
      const filtered = currentOptions.filter(opt => opt.toLowerCase().includes(query));
      dropdown.innerHTML = '';
      highlighted = -1;

      if (filtered.length === 0) {
        const li = document.createElement('li');
        li.className = 'searchable-select-no-results';
        li.textContent = 'No matches found';
        dropdown.appendChild(li);
        return;
      }

      filtered.forEach((opt, i) => {
        const li = document.createElement('li');
        li.className = 'searchable-select-option';
        li.setAttribute('role', 'option');
        li.textContent = opt;
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          select(opt);
        });
        li.addEventListener('mouseenter', () => {
          setHighlight(i);
        });
        dropdown.appendChild(li);
      });
    }

    function open() {
      if (input.disabled) return;
      isOpen = true;
      dropdown.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
      render(input.value === hidden.value ? '' : input.value);
    }

    function close() {
      isOpen = false;
      dropdown.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      highlighted = -1;
      // Restore display value if user didn't pick a new option
      if (hidden.value && input.value !== hidden.value) {
        input.value = hidden.value;
      }
    }

    function select(value) {
      hidden.value = value;
      input.value = value;
      close();
      input.dispatchEvent(new Event('ss:change'));
    }

    function setHighlight(index) {
      const items = dropdown.querySelectorAll('.searchable-select-option');
      items.forEach(li => li.classList.remove('is-highlighted'));
      if (index >= 0 && index < items.length) {
        highlighted = index;
        items[index].classList.add('is-highlighted');
        items[index].scrollIntoView({ block: 'nearest' });
      }
    }

    input.addEventListener('focus', open);
    input.addEventListener('click', () => { if (!isOpen) open(); });

    input.addEventListener('input', () => {
      hidden.value = '';
      if (!isOpen) open();
      render(input.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.searchable-select-option');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) { open(); return; }
        setHighlight(Math.min(highlighted + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight(Math.max(highlighted - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlighted >= 0 && items[highlighted]) {
          select(items[highlighted].textContent);
        }
      } else if (e.key === 'Escape') {
        close();
        input.blur();
      }
    });

    input.addEventListener('blur', () => {
      // Small delay so mousedown on option fires first
      setTimeout(close, 150);
    });

    return {
      setOptions(newOptions, newPlaceholder) {
        currentOptions = newOptions;
        hidden.value = '';
        input.value = '';
        input.placeholder = newPlaceholder || placeholder;
        render('');
      },
      enable() {
        input.disabled = false;
        input.classList.remove('is-disabled');
      },
      disable() {
        input.disabled = true;
        input.classList.add('is-disabled');
        hidden.value = '';
        input.value = '';
      },
      reset() {
        hidden.value = '';
        input.value = '';
        input.placeholder = placeholder;
      }
    };
  }

  // Wire up beta form selects if present
  const brandContainer = document.getElementById('brand-select');
  const modelContainer = document.getElementById('model-select');

  if (brandContainer && modelContainer) {
    const modelSelect = initSearchableSelect(modelContainer, [], 'Select a brand first...');
    const brandSelect = initSearchableSelect(brandContainer, brandList, 'Search or select brand...');

    const brandInput = brandContainer.querySelector('.searchable-select-input');
    brandInput.addEventListener('ss:change', () => {
      const brand = brandContainer.querySelector('input[type="hidden"]').value;
      if (brand === 'Other') {
        // Convert model to free-text
        const modelInput = modelContainer.querySelector('.searchable-select-input');
        const modelDropdown = modelContainer.querySelector('.searchable-select-dropdown');
        modelSelect.enable();
        modelSelect.setOptions([], 'Type your phone model...');
        modelInput.value = '';
        modelContainer.querySelector('input[type="hidden"]').value = '';
        // Allow free-text entry: sync visible input to hidden
        modelInput.removeEventListener('input', modelFreeText);
        modelInput.addEventListener('input', modelFreeText);
        modelDropdown.classList.remove('is-open');
      } else if (deviceData[brand]) {
        modelSelect.enable();
        modelSelect.setOptions(deviceData[brand], 'Search or select model...');
        // Remove free-text handler if it was set
        const modelInput = modelContainer.querySelector('.searchable-select-input');
        modelInput.removeEventListener('input', modelFreeText);
      } else {
        modelSelect.disable();
      }
    });

    function modelFreeText() {
      const modelInput = modelContainer.querySelector('.searchable-select-input');
      modelContainer.querySelector('input[type="hidden"]').value = modelInput.value;
    }

    // Handle form reset (after successful submission)
    const betaForm = document.getElementById('beta-signup-form');
    if (betaForm) {
      betaForm.addEventListener('reset', () => {
        setTimeout(() => {
          brandSelect.reset();
          modelSelect.disable();
          modelContainer.querySelector('.searchable-select-input').placeholder = 'Select a brand first...';
        }, 0);
      });
    }
  }

  // --- AJAX Form Submission (Web3Forms) ---
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.contact-submit');
      const statusEl = form.querySelector('.form-status');
      const originalText = submitBtn.textContent;

      const ajaxUrl = form.getAttribute('action');

      statusEl.textContent = '';
      statusEl.className = 'form-status';

      submitBtn.classList.add('is-loading');
      submitBtn.textContent = 'Sending\u2026';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(ajaxUrl, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            statusEl.textContent = form.getAttribute('data-success-message')
              || 'Thank you! Your submission has been received.';
            statusEl.className = 'form-status is-success';
            form.reset();
          } else {
            throw new Error(data.message || 'Submission failed. Please try again.');
          }
        } else {
          throw new Error('Server error (' + response.status + '). Please try again or email us directly.');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        const message = err.name === 'AbortError'
          ? 'The request timed out. Please try again, or email us directly at support@relicroute.co.uk'
          : (err.message || 'Something went wrong. Please try again or email us directly.');
        statusEl.textContent = message;
        statusEl.className = 'form-status is-error';
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  });
})();

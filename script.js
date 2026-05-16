// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== BACK TO TOP =====
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SCROLL REVEAL ANIMATION =====
const revealElements = document.querySelectorAll(
  '.service-card, .team-card, .testimonial-card, .gallery-item, .contact-item, .stat, .about-image-wrap, .about-content, .section-header'
);

revealElements.forEach(el => {
  el.classList.add('reveal');
});

// Exposed so Google reviews renderer can observe new cards
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger effect for grid items
      const delay = Array.from(entry.target.parentElement?.children || []).indexOf(entry.target) * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, Math.min(delay, 400));
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkItems.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--gold)';
        }
      });
    }
  });
}, {
  threshold: 0.4
});

sections.forEach(section => sectionObserver.observe(section));

// ===== GALLERY LIGHTBOX (simple) =====
document.querySelectorAll('.gallery-item').forEach(item => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    const label = item.querySelector('p')?.textContent;
    if (label) console.log(`Opening: ${label}`);
  });
});

// ===== GOOGLE REVIEWS =====
// ➤ Fill in your credentials below, then save.
// How to get them: see the comment block at the bottom of this file.
const GOOGLE_CONFIG = {
  apiKey:  'YOUR_GOOGLE_MAPS_API_KEY',   // e.g. 'AIzaSy...'
  placeId: 'ChIJNXFaalUBKC8RWXDffAfqXUs',
  maxReviews: 5,                         // Google returns up to 5
  minRating: 4,                          // only show reviews ≥ this rating
};

// Static fallback reviews shown when Google is not configured
const STATIC_REVIEWS = [
  {
    author_name: 'Δημήτρης Κ.',
    rating: 5,
    text: 'Το καλύτερο κουρείο της πόλης! Ο Νίκος ξέρει πάντα τι θέλω ακόμα και χωρίς να του πω πολλά. Αποτέλεσμα που μιλά από μόνο του.',
    relative_time_description: '5 χρόνια τώρα',
    profile_photo_url: null,
  },
  {
    author_name: 'Αλέξης Μ.',
    rating: 5,
    text: 'Απίστευτη ατμόσφαιρα, επαγγελματική εξυπηρέτηση και τέλειο αποτέλεσμα. Δεν πηγαίνω πουθενά αλλού εδώ και 3 χρόνια!',
    relative_time_description: 'Τακτικός πελάτης',
    profile_photo_url: null,
  },
  {
    author_name: 'Σπύρος Π.',
    rating: 5,
    text: 'Έφερα τον γιο μου πρώτη φορά και η εμπειρία ήταν υπέροχη. Πολύ υπομονετικοί και το αποτέλεσμα τέλειο!',
    relative_time_description: '2 χρόνια τώρα',
    profile_photo_url: null,
  },
];

function starsHtml(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style="color:${i < rating ? '#f5a623' : '#444'}">${i < rating ? '★' : '☆'}</span>`
  ).join('');
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderReviews(reviews, place) {
  const grid = document.getElementById('testimonials-grid');
  const badge = document.getElementById('google-badge');

  // Show rating summary if we have real place data
  if (place) {
    const summary = document.getElementById('reviews-summary');
    document.getElementById('reviews-rating-big').textContent = place.rating?.toFixed(1) ?? '';
    document.getElementById('reviews-stars-row').innerHTML = starsHtml(Math.round(place.rating ?? 0));
    document.getElementById('reviews-count').textContent =
      `${(place.user_ratings_total ?? 0).toLocaleString()} κριτικές`;
    const link = document.getElementById('reviews-link');
    link.href = `https://search.google.com/local/writereview?placeid=${GOOGLE_CONFIG.placeId}`;
    summary.style.display = 'flex';
    badge.style.display = 'flex';
  }

  const cards = reviews.slice(0, GOOGLE_CONFIG.maxReviews).map((r, i) => {
    const initials = getInitials(r.author_name);
    const avatarHtml = r.profile_photo_url
      ? `<img src="${r.profile_photo_url}" alt="${r.author_name}" class="author-photo" />`
      : `<div class="author-avatar">${initials}</div>`;

    return `
      <div class="testimonial-card${i === 1 ? ' featured-testimonial' : ''}">
        <div class="review-top-row">
          <div class="stars">${starsHtml(r.rating)}</div>
          ${place ? `<svg class="google-icon" width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>` : ''}
        </div>
        <p>"${r.text}"</p>
        <div class="testimonial-author">
          ${avatarHtml}
          <div>
            <strong>${r.author_name}</strong>
            <span>${r.relative_time_description}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  grid.innerHTML = cards;

  // Re-run reveal observer on new cards
  grid.querySelectorAll('.testimonial-card').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

function initGoogleReviews() {
  if (!GOOGLE_CONFIG.apiKey || GOOGLE_CONFIG.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    // Not configured — show static fallback immediately
    renderReviews(STATIC_REVIEWS, null);
    return;
  }

  // Dynamically load the Maps JS API
  window._mapsCallback = function () {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails(
      {
        placeId: GOOGLE_CONFIG.placeId,
        fields: ['name', 'rating', 'user_ratings_total', 'reviews', 'url'],
        language: 'el',
      },
      function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.reviews?.length) {
          const filtered = place.reviews.filter(r => r.rating >= GOOGLE_CONFIG.minRating);
          renderReviews(filtered.length ? filtered : place.reviews, place);
        } else {
          console.warn('Google Places API error:', status);
          renderReviews(STATIC_REVIEWS, null);
        }
      }
    );
  };

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_CONFIG.apiKey}&libraries=places&callback=_mapsCallback`;
  script.async = true;
  script.onerror = () => renderReviews(STATIC_REVIEWS, null);
  document.head.appendChild(script);
}

// Kick off when DOM is ready
initGoogleReviews();

/*
 * ─────────────────────────────────────────────
 *  HOW TO SET UP GOOGLE REVIEWS
 * ─────────────────────────────────────────────
 *
 *  1. GET A GOOGLE MAPS API KEY
 *     → Go to https://console.cloud.google.com/
 *     → Create a project → Enable "Maps JavaScript API" + "Places API"
 *     → Create credentials → API Key
 *     → Restrict the key to your website domain (HTTP referrers)
 *
 *  2. GET YOUR PLACE ID
 *     → Go to https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 *     → Search for "Liokaftos Barbershop" and copy the Place ID
 *     → It looks like: ChIJN1t_tDeuEmsRUsoyG83frY4
 *
 *  3. PASTE BOTH VALUES INTO GOOGLE_CONFIG at the top of this section
 *
 *  Note: Google returns up to 5 reviews (their most relevant selection).
 * ─────────────────────────────────────────────
 */

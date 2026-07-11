const ONLINE_MEETING_URL = "";

const header = document.querySelector('#site-header');
const hero = document.querySelector('#home');
const heroMedia = document.querySelector('.hero-media');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#nav-links');
const inviteMode = new URLSearchParams(window.location.search).get('invite');
const validInviteModes = ['wedding', 'full', 'online'];
const heroSchedule = document.querySelector('#hero-schedule');
const weddingCountdown = document.querySelector('#wedding-countdown');
const scrollProgress = document.querySelector('#scroll-progress');
const ceremonyEntryLabel = document.querySelector('#ceremony-entry-label');
const onlineMeetingButton = document.querySelector('.online-meeting-button');
const landingHelpButton = document.querySelector('#landing-help-button');
const landingDialog = document.querySelector('#landing-dialog');
const dialogCloseButton = document.querySelector('#dialog-close-button');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

if (validInviteModes.includes(inviteMode)) {
  document.body.dataset.inviteMode = inviteMode;
  document.querySelectorAll('[data-invite-visible]').forEach((element) => {
    element.hidden = !element.dataset.inviteVisible.split(' ').includes(inviteMode);
  });

  const ceremonyTime = document.createElement('span');
  ceremonyTime.textContent = '婚禮｜14:00';
  heroSchedule.append(ceremonyTime);

  if (inviteMode === 'online') {
    ceremonyEntryLabel.textContent = '線上開放進入';
  }

  if (inviteMode === 'full') {
    const banquetTime = document.createElement('span');
    banquetTime.textContent = '婚宴｜18:00';
    heroSchedule.append(banquetTime);
  }
} else {
  document.body.classList.add('invite-missing');
}

document.body.classList.remove('invite-pending');

function updateWeddingCountdown() {
  const now = new Date();
  const weddingDayStart = new Date('2026-12-26T00:00:00+08:00');
  const weddingCeremony = new Date('2026-12-26T14:00:00+08:00');
  const weddingDayEnd = new Date('2026-12-27T00:00:00+08:00');

  if (now < weddingDayStart) {
    const daysRemaining = Math.ceil((weddingCeremony - now) / 86400000);
    weddingCountdown.textContent = `距離我們的婚禮還有 ${daysRemaining} 天`;
  } else if (now < weddingDayEnd) {
    weddingCountdown.textContent = '今天，我們結婚了。';
  } else {
    weddingCountdown.textContent = '謝謝您與我們一起見證這一天。';
  }
}

updateWeddingCountdown();
window.setInterval(updateWeddingCountdown, 3600000);

function openLandingDialog() {
  landingDialog.hidden = false;
  dialogCloseButton.focus();
}

function closeLandingDialog() {
  landingDialog.hidden = true;
  landingHelpButton.focus();
}

landingHelpButton.addEventListener('click', openLandingDialog);
dialogCloseButton.addEventListener('click', closeLandingDialog);
landingDialog.addEventListener('click', (event) => {
  if (event.target === landingDialog) closeLandingDialog();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !landingDialog.hidden) closeLandingDialog();
});

if (ONLINE_MEETING_URL.trim()) {
  onlineMeetingButton.textContent = '進入線上婚禮';
  onlineMeetingButton.href = ONLINE_MEETING_URL.trim();
  onlineMeetingButton.target = '_blank';
  onlineMeetingButton.rel = 'noopener noreferrer';
  onlineMeetingButton.removeAttribute('aria-disabled');
  onlineMeetingButton.classList.remove('is-unavailable');
} else {
  onlineMeetingButton.removeAttribute('href');
  onlineMeetingButton.setAttribute('aria-disabled', 'true');
  onlineMeetingButton.classList.add('is-unavailable');
  onlineMeetingButton.textContent = '線上參加連結將於婚禮前提供';
}

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  navLinks.classList.toggle('open', open);
  header.classList.toggle('menu-active', open);
  if (open) header.classList.remove('compact');
  document.body.classList.toggle('menu-open', open);
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) setMenu(false);
  requestScrollUpdate();
});

function updateHeader() {
  const heroBottom = hero.offsetTop + hero.offsetHeight - header.offsetHeight;
  header.classList.toggle('scrolled', window.scrollY >= heroBottom);
}

let lastScrollY = window.scrollY;
let scrollTicking = false;

function updateScrollEffects() {
  const currentScrollY = window.scrollY;
  updateHeader();

  const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
  const scrollRatio = scrollableDistance > 0 ? Math.min(1, currentScrollY / scrollableDistance) : 0;
  scrollProgress.style.width = `${scrollRatio * 100}%`;

  if (window.innerWidth > 820 && !reducedMotionQuery.matches && !document.body.classList.contains('invite-missing')) {
    const parallaxOffset = Math.min(26, Math.max(0, currentScrollY * .055));
    heroMedia.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
  } else {
    heroMedia.style.transform = '';
  }

  if (!header.classList.contains('menu-active')) {
    if (currentScrollY > lastScrollY + 4 && currentScrollY > 90) header.classList.add('compact');
    if (currentScrollY < lastScrollY - 4 || currentScrollY < 30) header.classList.remove('compact');
  }

  lastScrollY = currentScrollY;
  scrollTicking = false;
}

function requestScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateScrollEffects);
}

requestScrollUpdate();
window.addEventListener('scroll', requestScrollUpdate, { passive: true });

const unifiedRevealTargets = document.querySelectorAll([
  '.page-section .section-title',
  '.page-section .glass-card',
  '.page-section .share-step',
  '.story-gallery .story-title',
  '.story-gallery .gallery-media'
].join(','));

unifiedRevealTargets.forEach((item) => item.classList.add('reveal'));

document.querySelectorAll('.wedding-facts, .ceremony-note-grid, .parking-grid, .share-steps').forEach((group) => {
  [...group.children].forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index * 90, 180)}ms`);
  });
});

const revealItems = document.querySelectorAll('.reveal:not(.is-visible)');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -24px' });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const seatData = {
  '王小明': { table: 'A12', guests: '2 位', meal: '一般餐' },
  '林美玲': { table: 'B08', guests: '1 位', meal: '素食' },
  '陳大華': { table: 'C05', guests: '4 位', meal: '一般餐' }
};

const seatSearch = document.querySelector('#seat-search');
const guestNameInput = document.querySelector('#guest-name');
const lookupResult = document.querySelector('#lookup-result');
const lookupHint = document.querySelector('#lookup-hint');
const lookupButton = seatSearch.querySelector('.lookup-button');
const lookupButtonLabel = lookupButton.querySelector('.button-label');
let lookupTimer;

function revealLookupResult(type) {
  lookupResult.className = `lookup-result ${type}`;
  void lookupResult.offsetWidth;
  lookupResult.classList.add('show');

  requestAnimationFrame(() => {
    const bounds = lookupResult.getBoundingClientRect();
    if (bounds.top < header.offsetHeight || bounds.bottom > window.innerHeight) {
      lookupResult.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'center' });
    }
  });
}

function showSeatResult(name, seat) {
  lookupResult.innerHTML = `
    <p class="result-welcome">歡迎蒞臨</p>
    <h3 class="result-name"></h3>
    <p class="table-number"></p>
    <div class="result-rule" aria-hidden="true"></div>
    <p class="guest-count"></p>
    <p class="result-closing">期待與您共度美好時光</p>
    <p class="special-meal" hidden></p>`;
  lookupResult.querySelector('.result-name').textContent = name;
  lookupResult.querySelector('.table-number').textContent = `${seat.table} 桌`;
  lookupResult.querySelector('.guest-count').textContent = `${seat.guests}賓客`;
  if (seat.meal !== '一般餐') {
    const specialMeal = lookupResult.querySelector('.special-meal');
    specialMeal.textContent = `※ 已安排${seat.meal}`;
    specialMeal.hidden = false;
  }
  revealLookupResult('success');
}

function showNotFound() {
  lookupResult.innerHTML = `
    <span class="not-found-icon" aria-hidden="true"></span>
    <h3 class="not-found-title">很抱歉</h3>
    <p class="not-found-copy">目前找不到您的座位資訊。<br>請確認姓名是否與喜帖相同，<br>或向現場接待人員詢問。</p>`;
  revealLookupResult('not-found');
}

function setLookupLoading(loading) {
  lookupButton.disabled = loading;
  lookupButton.classList.toggle('loading', loading);
  lookupButtonLabel.textContent = loading ? '查詢中...' : '查詢座位';
  seatSearch.setAttribute('aria-busy', String(loading));
}

seatSearch.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = guestNameInput.value.trim();
  clearTimeout(lookupTimer);

  if (!name) {
    setLookupLoading(false);
    lookupResult.className = 'lookup-result';
    lookupResult.replaceChildren();
    lookupHint.classList.add('show');
    guestNameInput.focus();
    return;
  }

  lookupHint.classList.remove('show');
  lookupResult.className = 'lookup-result';
  setLookupLoading(true);

  lookupTimer = window.setTimeout(() => {
    const seat = seatData[name];
    if (seat) showSeatResult(name, seat);
    else showNotFound();
    setLookupLoading(false);
  }, 500);
});

guestNameInput.addEventListener('input', () => {
  if (guestNameInput.value.trim()) lookupHint.classList.remove('show');
});

document.querySelectorAll('.image-shell img').forEach((image) => {
  const markLoaded = () => {
    image.closest('.image-shell').classList.add('loaded');
    requestScrollUpdate();
  };
  if (image.complete) markLoaded();
  else image.addEventListener('load', markLoaded, { once: true });
});

const galleryButtons = [...document.querySelectorAll('[data-gallery-index]')];
const lightbox = document.querySelector('#gallery-lightbox');
const lightboxImage = lightbox.querySelector('.lightbox-image');
const lightboxCounter = lightbox.querySelector('.lightbox-counter');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');
const gallerySources = galleryButtons
  .sort((a, b) => Number(a.dataset.galleryIndex) - Number(b.dataset.galleryIndex))
  .map((button) => button.querySelector('img').getAttribute('src'));
let currentGalleryIndex = 0;
let lastGalleryTrigger;
let touchStartX = 0;
let lightboxScrollY = 0;
let lightboxCloseTimer;

document.querySelectorAll('.gallery-media img').forEach((image) => {
  const markLoaded = () => {
    image.closest('.gallery-media').classList.add('loaded');
    requestScrollUpdate();
  };
  if (image.complete) markLoaded();
  else image.addEventListener('load', markLoaded, { once: true });
});

function showGalleryImage(index) {
  currentGalleryIndex = (index + gallerySources.length) % gallerySources.length;
  lightboxImage.src = gallerySources[currentGalleryIndex];
  lightboxImage.alt = `子靖與勤萱婚紗照 ${currentGalleryIndex + 1}`;
  lightboxCounter.textContent = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${gallerySources.length}`;
}

function openLightbox(index, trigger) {
  window.clearTimeout(lightboxCloseTimer);
  lastGalleryTrigger = trigger;
  showGalleryImage(index);
  lightbox.classList.remove('closing');
  lightbox.hidden = false;
  lightboxScrollY = window.scrollY;
  document.body.classList.add('lightbox-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lightboxScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  lightboxClose.focus();
}

function finishClosingLightbox() {
  lightbox.hidden = true;
  lightbox.classList.remove('closing');
  lightboxImage.removeAttribute('src');
  document.body.classList.remove('lightbox-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, lightboxScrollY);
  if (lastGalleryTrigger) lastGalleryTrigger.focus();
}

function closeLightbox() {
  if (lightbox.hidden || lightbox.classList.contains('closing')) return;
  lightbox.classList.add('closing');
  lightboxCloseTimer = window.setTimeout(finishClosingLightbox, reducedMotionQuery.matches ? 0 : 250);
}

galleryButtons.forEach((button) => {
  button.addEventListener('click', () => openLightbox(Number(button.dataset.galleryIndex), button));
});

lightboxPrev.addEventListener('click', () => showGalleryImage(currentGalleryIndex - 1));
lightboxNext.addEventListener('click', () => showGalleryImage(currentGalleryIndex + 1));
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.classList.contains('lightbox-stage')) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showGalleryImage(currentGalleryIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(currentGalleryIndex + 1);
});

lightbox.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) < 50) return;
  showGalleryImage(currentGalleryIndex + (distance < 0 ? 1 : -1));
}, { passive: true });

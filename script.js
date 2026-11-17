document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     1. INTRO Y REPRODUCCIÓN DE AUDIO
     ========================================================= */
  const introEl = document.getElementById('intro');
  const startBtn = document.getElementById('start-btn');
  const bgAudio = document.getElementById('bg-audio');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const iconPause = audioToggleBtn.querySelector('.icon-pause');
  const iconPlay = audioToggleBtn.querySelector('.icon-play');
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const heroSection = document.getElementById('hero');

  function syncAudioUI(playing) {
    if (playing) {
      iconPause.classList.remove('hidden');
      iconPlay.classList.add('hidden');
      audioToggleBtn.classList.add('is-playing');
      audioToggleBtn.setAttribute('aria-label', 'Pausar música');
    } else {
      iconPause.classList.add('hidden');
      iconPlay.classList.remove('hidden');
      audioToggleBtn.classList.remove('is-playing');
      audioToggleBtn.setAttribute('aria-label', 'Reproducir música');
    }
  }

  function playMusic() {
    if (!bgAudio) return;
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => syncAudioUI(true))
        .catch(() => syncAudioUI(false));
    }
  }

  startBtn.addEventListener('click', () => {
    document.body.classList.remove('locked');
    document.body.classList.add('entered');
    introEl.classList.add('is-closing');
    window.scrollTo({ top: 0, behavior: 'instant' });
    playMusic();

    setTimeout(() => {
      introEl.style.display = 'none';
    }, 700);
  });

  audioToggleBtn.addEventListener('click', () => {
    if (bgAudio.paused) {
      playMusic();
    } else {
      bgAudio.pause();
      syncAudioUI(false);
    }
  });

  let scrollSweepId = null;

  function cancelScrollSweep() {
    if (scrollSweepId !== null) {
      cancelAnimationFrame(scrollSweepId);
      scrollSweepId = null;
      document.documentElement.style.scrollBehavior = '';
    }
  }

  function sweepScrollToTop(duration = 1350) {
    cancelScrollSweep();
    const startY = window.scrollY || window.pageYOffset;
    if (startY <= 0) return;

    const startTime = performance.now();
    document.documentElement.style.scrollBehavior = 'auto';

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const nextY = startY * (1 - easeInOutCubic(progress));
      window.scrollTo(0, nextY);

      if (progress < 1) {
        scrollSweepId = requestAnimationFrame(step);
      } else {
        scrollSweepId = null;
        document.documentElement.style.scrollBehavior = '';
      }
    }

    scrollSweepId = requestAnimationFrame(step);
  }

  window.addEventListener('wheel', cancelScrollSweep, { passive: true });
  window.addEventListener('touchstart', cancelScrollSweep, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    sweepScrollToTop(1350);
  });

  /* =========================================================
     2. CUENTA REGRESIVA CON EFECTO DE HOJAS ABATIBLES (FLIP)
     Fecha objetivo: Sábado 16 de Enero de 2027, 18:00 hrs
     ========================================================= */
  const targetTimestamp = new Date('2027-01-16T18:00:00-06:00').getTime();
  const flipCards = {
    days: document.querySelector('.flip-card[data-unit="days"]'),
    hours: document.querySelector('.flip-card[data-unit="hours"]'),
    minutes: document.querySelector('.flip-card[data-unit="minutes"]'),
    seconds: document.querySelector('.flip-card[data-unit="seconds"]')
  };

  const currentValues = {
    days: null,
    hours: null,
    minutes: null,
    seconds: null
  };

  function padTwo(value) {
    return String(Math.max(0, value)).padStart(2, '0');
  }

  function setCardStatic(card, valueStr) {
    card.querySelector('.flip-top span').textContent = valueStr;
    card.querySelector('.flip-bottom span').textContent = valueStr;
  }

  function animateFlipCard(card, prevStr, nextStr) {
    const oldLeaves = card.querySelectorAll('.flip-leaf-top, .flip-leaf-bottom');
    oldLeaves.forEach((leaf) => leaf.remove());

    const topSpan = card.querySelector('.flip-top span');
    const bottomSpan = card.querySelector('.flip-bottom span');

    // Mitad superior ya muestra el siguiente número debajo de la hoja que cae
    topSpan.textContent = nextStr;
    bottomSpan.textContent = prevStr;

    const leafTop = document.createElement('div');
    leafTop.className = 'flip-leaf-top';
    leafTop.innerHTML = `<span>${prevStr}</span>`;

    const leafBottom = document.createElement('div');
    leafBottom.className = 'flip-leaf-bottom';
    leafBottom.innerHTML = `<span>${nextStr}</span>`;

    card.appendChild(leafTop);
    card.appendChild(leafBottom);

    window.setTimeout(() => {
      bottomSpan.textContent = nextStr;
      leafTop.remove();
      leafBottom.remove();
    }, 580);
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, targetTimestamp - now);

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const next = {
      days: padTwo(days),
      hours: padTwo(hours),
      minutes: padTwo(minutes),
      seconds: padTwo(seconds)
    };

    Object.keys(next).forEach((unit) => {
      const card = flipCards[unit];
      if (!card) return;
      if (currentValues[unit] === null) {
        setCardStatic(card, next[unit]);
        currentValues[unit] = next[unit];
      } else if (currentValues[unit] !== next[unit]) {
        animateFlipCard(card, currentValues[unit], next[unit]);
        currentValues[unit] = next[unit];
      }
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =========================================================
     3. ANIMACIONES AL APARECER CON EL SCROLL
     ========================================================= */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* =========================================================
     4. GALERÍA INTERACTIVA TIPO INSTAGRAM
     ========================================================= */
  const galleryPhotos = [
    'assets/Images/fotos/gallery-01.jpeg',
    'assets/Images/fotos/gallery-02.jpeg',
    'assets/Images/fotos/gallery-03.jpeg',
    'assets/Images/fotos/gallery-04.jpeg',
    'assets/Images/fotos/gallery-05.jpeg',
    'assets/Images/fotos/gallery-06.jpeg',
    'assets/Images/fotos/gallery-07.jpg',
    'assets/Images/fotos/gallery-08.jpeg'
  ];

  const openGalleryBtn = document.getElementById('open-gallery-btn');
  const galleryModal = document.getElementById('gallery-modal');
  const closeGalleryBtn = document.getElementById('close-gallery-btn');
  const igActivePhoto = document.getElementById('ig-active-photo');
  const igMediaStage = document.getElementById('ig-media-stage');
  const igCounter = document.getElementById('ig-counter');
  const igPrevBtn = document.getElementById('ig-prev-btn');
  const igNextBtn = document.getElementById('ig-next-btn');
  const igLikeBtn = document.getElementById('ig-like-btn');
  const igLikesCount = document.getElementById('ig-likes-count');
  const igDoubleTapHeart = document.getElementById('ig-doubletap-heart');
  const igDots = document.getElementById('ig-dots');
  const igThumbStrip = document.getElementById('ig-thumb-strip');
  const igFeedView = document.getElementById('ig-feed-view');
  const igGridView = document.getElementById('ig-grid-view');
  const tabFeed = document.getElementById('tab-feed');
  const tabGrid = document.getElementById('tab-grid');

  let activeIndex = 0;
  const likedPhotos = new Set();
  const baseLikes = [15, 24, 19, 28, 31, 22, 37, 26];

  function buildGalleryUI() {
    igDots.innerHTML = '';
    igThumbStrip.innerHTML = '';
    igGridView.innerHTML = '';

    galleryPhotos.forEach((src, index) => {
      // Dots
      const dot = document.createElement('span');
      dot.className = 'ig-dot';
      igDots.appendChild(dot);

      // Strip thumbnails
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = 'ig-thumb-btn';
      thumbBtn.setAttribute('aria-label', `Ver foto ${index + 1}`);
      thumbBtn.innerHTML = `<img src="${src}" alt="Miniatura ${index + 1}">`;
      thumbBtn.addEventListener('click', () => renderPhoto(index));
      igThumbStrip.appendChild(thumbBtn);

      // Grid items
      const gridBtn = document.createElement('button');
      gridBtn.type = 'button';
      gridBtn.className = 'ig-grid-item';
      gridBtn.setAttribute('aria-label', `Abrir foto ${index + 1}`);
      gridBtn.innerHTML = `<img src="${src}" alt="Galería Camila ${index + 1}">`;
      gridBtn.addEventListener('click', () => {
        switchGalleryTab('feed');
        renderPhoto(index);
      });
      igGridView.appendChild(gridBtn);
    });
  }

  function renderPhoto(index) {
    activeIndex = (index + galleryPhotos.length) % galleryPhotos.length;
    igActivePhoto.src = galleryPhotos[activeIndex];
    igActivePhoto.alt = `Fotografía ${activeIndex + 1} de Camila`;
    igCounter.textContent = `${activeIndex + 1} / ${galleryPhotos.length}`;

    const isLiked = likedPhotos.has(activeIndex);
    igLikeBtn.classList.toggle('liked', isLiked);
    igLikeBtn.setAttribute('aria-pressed', String(isLiked));
    const count = baseLikes[activeIndex] + (isLiked ? 1 : 0);
    igLikesCount.textContent = `${count} Me gusta`;

    const dots = igDots.querySelectorAll('.ig-dot');
    dots.forEach((d, idx) => d.classList.toggle('active', idx === activeIndex));

    const thumbs = igThumbStrip.querySelectorAll('.ig-thumb-btn');
    thumbs.forEach((t, idx) => {
      t.classList.toggle('active', idx === activeIndex);
      if (idx === activeIndex) {
        t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  function switchGalleryTab(mode) {
    const isFeed = mode === 'feed';
    igFeedView.classList.toggle('hidden', !isFeed);
    igGridView.classList.toggle('hidden', isFeed);
    tabFeed.classList.toggle('active', isFeed);
    tabGrid.classList.toggle('active', !isFeed);
    tabFeed.setAttribute('aria-selected', String(isFeed));
    tabGrid.setAttribute('aria-selected', String(!isFeed));
  }

  function toggleCurrentLike(forceLike = false) {
    if (forceLike) {
      likedPhotos.add(activeIndex);
    } else if (likedPhotos.has(activeIndex)) {
      likedPhotos.delete(activeIndex);
    } else {
      likedPhotos.add(activeIndex);
    }
    renderPhoto(activeIndex);
  }

  function triggerHeartPop() {
    igDoubleTapHeart.classList.remove('pop');
    void igDoubleTapHeart.offsetWidth;
    igDoubleTapHeart.classList.add('pop');
  }

  function openGalleryModal() {
    galleryModal.hidden = false;
    document.body.style.overflow = 'hidden';
    switchGalleryTab('feed');
    renderPhoto(activeIndex);
  }

  function closeGalleryModal() {
    galleryModal.hidden = true;
    document.body.style.overflow = '';
  }

  buildGalleryUI();
  renderPhoto(0);

  openGalleryBtn.addEventListener('click', openGalleryModal);
  closeGalleryBtn.addEventListener('click', closeGalleryModal);
  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) closeGalleryModal();
  });

  igPrevBtn.addEventListener('click', () => renderPhoto(activeIndex - 1));
  igNextBtn.addEventListener('click', () => renderPhoto(activeIndex + 1));
  igLikeBtn.addEventListener('click', () => toggleCurrentLike(false));
  tabFeed.addEventListener('click', () => switchGalleryTab('feed'));
  tabGrid.addEventListener('click', () => switchGalleryTab('grid'));

  // Doble clic / doble toque para "Me gusta" + swipe táctil
  let lastTap = 0;
  let touchStartX = 0;
  igMediaStage.addEventListener('dblclick', () => {
    toggleCurrentLike(true);
    triggerHeartPop();
  });

  igMediaStage.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
      const now = Date.now();
      if (now - lastTap < 280) {
        toggleCurrentLike(true);
        triggerHeartPop();
      }
      lastTap = now;
    },
    { passive: true }
  );

  igMediaStage.addEventListener(
    'touchend',
    (e) => {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diffX) > 45) {
        if (diffX < 0) renderPhoto(activeIndex + 1);
        else renderPhoto(activeIndex - 1);
      }
    },
    { passive: true }
  );

  /* =========================================================
     5. FORMULARIO RSVP DESLIZABLE Y CONFIRMACIÓN A WHATSAPP
     ========================================================= */
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpName = document.getElementById('rsvp-name');
  const rsvpGuests = document.getElementById('rsvp-guests');
  const rsvpMessage = document.getElementById('rsvp-message');
  const rsvpSlider = document.getElementById('rsvp-slider');
  const labelYes = document.getElementById('label-yes');
  const labelNo = document.getElementById('label-no');
  const rsvpError = document.getElementById('rsvp-error');

  const rsvpSummary = document.getElementById('rsvp-summary');
  const summaryName = document.getElementById('summary-name');
  const summaryStatus = document.getElementById('summary-status');
  const summaryGuestsRow = document.getElementById('summary-guests-row');
  const summaryGuests = document.getElementById('summary-guests');
  const summaryMessageRow = document.getElementById('summary-message-row');
  const summaryMessage = document.getElementById('summary-message');
  const whatsappConfirmLink = document.getElementById('whatsapp-confirm-link');
  const editRsvpBtn = document.getElementById('edit-rsvp-btn');

  function updateSliderState(val) {
    const numVal = Number(val);
    labelYes.classList.toggle('is-selected-yes', numVal === 0);
    labelNo.classList.toggle('is-selected-no', numVal === 2);

    if (numVal === 0) {
      rsvpSlider.setAttribute('data-state', 'yes');
      rsvpGuests.disabled = false;
    } else if (numVal === 2) {
      rsvpSlider.setAttribute('data-state', 'no');
      rsvpGuests.disabled = true;
    } else {
      rsvpSlider.setAttribute('data-state', 'neutral');
      rsvpGuests.disabled = false;
    }
    rsvpError.textContent = '';
  }

  rsvpSlider.addEventListener('input', (e) => updateSliderState(e.target.value));
  labelYes.addEventListener('click', () => {
    rsvpSlider.value = '0';
    updateSliderState('0');
  });
  labelNo.addEventListener('click', () => {
    rsvpSlider.value = '2';
    updateSliderState('2');
  });
  updateSliderState(rsvpSlider.value);

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = rsvpName.value.trim();
    const sliderVal = Number(rsvpSlider.value);
    const guestsRaw = rsvpGuests.value.trim();
    const message = rsvpMessage.value.trim();

    if (!name) {
      rsvpError.textContent = 'Por favor escribe tu nombre.';
      rsvpName.focus();
      return;
    }

    if (sliderVal === 1) {
      rsvpError.textContent = 'Desliza el botón hacia "Sí Asistiré" o "No podré".';
      rsvpSlider.focus();
      return;
    }

    const willAttend = sliderVal === 0;
    const guestsCount = Number(guestsRaw);

    if (willAttend && (!guestsRaw || Number.isNaN(guestsCount) || guestsCount < 1)) {
      rsvpError.textContent = 'Indica cuántas personas asistirán.';
      rsvpGuests.focus();
      return;
    }

    rsvpError.textContent = '';

    // Construir resumen y enlace de WhatsApp (+526181669898)
    const statusText = willAttend ? 'Sí Asistiré' : 'No podré asistir';
    summaryName.textContent = name;
    summaryStatus.textContent = statusText;

    if (willAttend) {
      summaryGuestsRow.classList.remove('hidden');
      summaryGuests.textContent = `${guestsCount} ${guestsCount === 1 ? 'persona' : 'personas'}`;
    } else {
      summaryGuestsRow.classList.add('hidden');
    }

    if (message) {
      summaryMessageRow.classList.remove('hidden');
      summaryMessage.textContent = message;
    } else {
      summaryMessageRow.classList.add('hidden');
    }

    let waLines = [
      '¡Hola! Envío mi confirmación para los XV años de Camila:',
      `*Nombre:* ${name}`,
      `*Respuesta:* ${statusText}`
    ];
    if (willAttend) {
      waLines.push(`*Asistentes:* ${guestsCount}`);
    }
    if (message) {
      waLines.push(`*Mensaje:* ${message}`);
    }

    const waUrl = `https://wa.me/526181669898?text=${encodeURIComponent(waLines.join('\n'))}`;
    whatsappConfirmLink.href = waUrl;

    rsvpSummary.classList.remove('hidden');
    rsvpSummary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  editRsvpBtn.addEventListener('click', () => {
    rsvpSummary.classList.add('hidden');
    rsvpName.focus();
  });

  /* =========================================================
     6. MODAL DE AVISO DE PRIVACIDAD Y TECLA ESCAPE
     ========================================================= */
  const privacyModal = document.getElementById('privacy-modal');
  const closePrivacyBtn = document.getElementById('close-privacy-btn');
  const privacyTriggers = document.querySelectorAll('[data-open-privacy]');

  function openPrivacyModal() {
    privacyModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closePrivacyModal() {
    privacyModal.hidden = true;
    if (galleryModal.hidden) {
      document.body.style.overflow = '';
    }
  }

  privacyTriggers.forEach((btn) => btn.addEventListener('click', openPrivacyModal));
  closePrivacyBtn.addEventListener('click', closePrivacyModal);
  privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) closePrivacyModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!privacyModal.hidden) closePrivacyModal();
      else if (!galleryModal.hidden) closeGalleryModal();
    } else if (!galleryModal.hidden) {
      if (e.key === 'ArrowLeft') renderPhoto(activeIndex - 1);
      else if (e.key === 'ArrowRight') renderPhoto(activeIndex + 1);
    }
  });
});

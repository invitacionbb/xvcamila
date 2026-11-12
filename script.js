document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const introScreen = document.getElementById('intro');
    const btnOpenInv = document.getElementById('btn-open-inv');
    const heroSection = document.getElementById('hero');
    const bgMusic = document.getElementById('bg-music');
    const floatingControls = document.getElementById('floating-controls');
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const iconPlaying = document.getElementById('icon-playing');
    const iconPaused = document.getElementById('icon-paused');
    const btnScrollTop = document.getElementById('btn-scroll-top');

    /* ==========================================================================
       1. APERTURA DE INVITACIÓN (INTRO -> HERO + AUTOPLAY DE MÚSICA)
       ========================================================================== */
    function updateAudioIcons(isPlaying) {
        if (isPlaying) {
            iconPlaying.style.display = 'block';
            iconPaused.style.display = 'none';
        } else {
            iconPlaying.style.display = 'none';
            iconPaused.style.display = 'block';
        }
    }

    btnOpenInv.addEventListener('click', () => {
        // Desbloquear scroll y ocultar el intro suavemente
        body.classList.remove('locked-scroll');
        introScreen.classList.add('intro-hidden');
        floatingControls.classList.add('visible');

        // Llevar a la sección Hero
        heroSection.scrollIntoView({ behavior: 'smooth' });

        // Iniciar reproducción de audio en assets/audio/cancion.mp3
        if (bgMusic) {
            bgMusic.play().then(() => {
                updateAudioIcons(true);
            }).catch(() => {
                updateAudioIcons(false);
            });
        }

        // Disparar actualización inicial de animaciones de scroll
        requestAnimationFrame(handleScrollAnimations);
    });

    /* ==========================================================================
       2. BOTONES FLOTANTES (PAUSAR/REPRODUCIR MÚSICA Y SUBIR AL HERO SUAVEMENTE)
       ========================================================================== */
    btnAudioToggle.addEventListener('click', () => {
        if (!bgMusic) return;
        if (bgMusic.paused) {
            bgMusic.play().then(() => updateAudioIcons(true)).catch(() => {});
        } else {
            bgMusic.pause();
            updateAudioIcons(false);
        }
    });

    function smoothSweepScrollTo(targetY, duration = 1200) {
        const startY = window.scrollY || window.pageYOffset;
        const diff = targetY - startY;
        if (Math.abs(diff) < 2) return;

        const startTime = performance.now();
        // Desactivar temporalmente scroll-behavior: smooth de CSS para que no compita con el barrido por frame
        const htmlEl = document.documentElement;
        const prevBehavior = htmlEl.style.scrollBehavior;
        htmlEl.style.scrollBehavior = 'auto';

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = easeInOutCubic(progress);

            window.scrollTo(0, startY + diff * eased);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                htmlEl.style.scrollBehavior = prevBehavior;
            }
        }

        requestAnimationFrame(step);
    }

    btnScrollTop.addEventListener('click', () => {
        const targetTop = heroSection.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
        smoothSweepScrollTo(targetTop, 1250);
    });

    /* ==========================================================================
       3. CUENTA REGRESIVA (Sábado 16 de Enero de 2027 - 18:00 Hrs)
       ========================================================================== */
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');

    const eventTimestamp = new Date('2027-01-16T18:00:00-06:00').getTime();

    function updateCountdown() {
        const now = Date.now();
        const diff = Math.max(0, eventTimestamp - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        cdDays.textContent = String(days).padStart(2, '0');
        cdHours.textContent = String(hours).padStart(2, '0');
        cdMinutes.textContent = String(minutes).padStart(2, '0');
        cdSeconds.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ==========================================================================
       4. EFECTO DE IMÁGENES FLOTANTES EN SECCIÓN 02 (FONDO FIJO + FLUJO CONTINUO)
       - El fondo sec-02-bg.png se mantiene fijo en pantalla mientras recorres la sección.
       - Los elementos están cerca entre sí; conforme suben hacia el margen superior
         siguen desplazándose hacia afuera mientras el siguiente elemento entra justo debajo.
       - Al terminar el último (vestimenta.png), queda bloqueado y sube junto con el fondo.
       ========================================================================== */
    const scrollItems = Array.from(document.querySelectorAll('[data-scroll-item]'));

    function handleScrollAnimations() {
        const vh = window.innerHeight || document.documentElement.clientHeight;

        scrollItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const isFirst = item.classList.contains('item-top-fade');
            const isLast = item.classList.contains('item-last-lock');

            if (isFirst) {
                // 1- fecha.png: inicia ya visible arriba y se va desvaneciendo conforme sale por el top margin
                if (rect.top < vh * 0.12) {
                    const fadeOut = Math.max(0, Math.min(1, rect.bottom / (rect.height * 0.9)));
                    item.style.opacity = fadeOut.toFixed(3);
                    item.style.transform = `translateY(${(1 - fadeOut) * -14}px)`;
                } else {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }
                return;
            }

            if (isLast) {
                // 8- vestimenta.png: aparece al entrar por abajo y al llegar a su posición se bloquea para subir junto con el fondo
                if (rect.top > vh * 0.72) {
                    const enterProgress = Math.max(0, Math.min(1, (vh * 0.98 - rect.top) / (vh * 0.26)));
                    item.style.opacity = enterProgress.toFixed(3);
                    item.style.transform = `translateY(${(1 - enterProgress) * 24}px)`;
                } else {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }
                return;
            }

            // Elementos intermedios (2 al 7): aparecen suavemente al entrar por abajo y siguen desplazándose hacia el top margin
            let opacity = 1;
            let translateY = 0;

            const enterStart = vh * 0.96;
            const enterFull = vh * 0.72;

            if (rect.top > enterFull) {
                const p = Math.max(0, Math.min(1, (enterStart - rect.top) / (enterStart - enterFull)));
                opacity = p;
                translateY = (1 - p) * 24;
            } else if (rect.bottom < vh * 0.22) {
                // Cuando ya está saliendo por el borde superior (top margin)
                const p = Math.max(0, Math.min(1, rect.bottom / (vh * 0.22)));
                opacity = p;
                translateY = (1 - p) * -12;
            }

            item.style.opacity = opacity.toFixed(3);
            item.style.transform = `translateY(${translateY.toFixed(1)}px)`;
        });
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(handleScrollAnimations);
    }, { passive: true });
    window.addEventListener('resize', () => {
        requestAnimationFrame(handleScrollAnimations);
    });
    handleScrollAnimations();

    /* ==========================================================================
       5. INTERSECTION OBSERVER PARA ANIMAR EL RESTO DEL CONTENIDO AL SCROLL
       ========================================================================== */
    const revealItems = document.querySelectorAll('.reveal-item');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (entry.target.classList.contains('reveal-once')) {
                    observer.unobserve(entry.target);
                }
            } else if (!entry.target.classList.contains('reveal-once')) {
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.15
    });

    revealItems.forEach((el) => revealObserver.observe(el));

    /* ==========================================================================
       6. FORMULARIO DE ASISTENCIA + BOTÓN DESLIZABLE + RESUMEN A WHATSAPP
       ========================================================================== */
    const attendanceSlider = document.getElementById('attendance-slider');
    const lblSi = document.getElementById('lbl-si');
    const lblNo = document.getElementById('lbl-no');
    const guestCountInput = document.getElementById('guest-count');
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSummary = document.getElementById('rsvp-summary');
    const sumName = document.getElementById('sum-name');
    const sumStatus = document.getElementById('sum-status');
    const sumCount = document.getElementById('sum-count');
    const sumMsg = document.getElementById('sum-msg');
    const sumMsgRow = document.getElementById('sum-msg-row');
    const btnWhatsappConfirm = document.getElementById('btn-whatsapp-confirm');

    function isDeclining() {
        return Number(attendanceSlider.value) >= 50;
    }

    function syncSliderState() {
        if (isDeclining()) {
            lblNo.classList.add('active-choice');
            lblSi.classList.remove('active-choice');
        } else {
            lblSi.classList.add('active-choice');
            lblNo.classList.remove('active-choice');
        }
    }

    // Al soltar el deslizador, se ajusta suavemente al extremo elegido (0 = Sí Asistiré, 100 = No podré)
    attendanceSlider.addEventListener('input', syncSliderState);
    attendanceSlider.addEventListener('change', () => {
        attendanceSlider.value = isDeclining() ? '100' : '0';
        syncSliderState();
    });

    // Permitir clic directo en las etiquetas laterales para deslizar
    lblSi.addEventListener('click', () => {
        attendanceSlider.value = '0';
        syncSliderState();
    });
    lblNo.addEventListener('click', () => {
        attendanceSlider.value = '100';
        syncSliderState();
    });

    // Enforzar límites en tiempo real para invitados (1 a 5) y comentario (máx. 100 caracteres)
    const guestNameInput = document.getElementById('guest-name');
    const guestMessageInput = document.getElementById('guest-message');

    guestCountInput.addEventListener('input', () => {
        const raw = guestCountInput.value.replace(/[^0-9]/g, '');
        if (!raw) {
            guestCountInput.value = '';
            return;
        }
        const num = Math.max(1, Math.min(5, parseInt(raw, 10)));
        guestCountInput.value = String(num);
    });

    guestMessageInput.addEventListener('input', () => {
        if (guestMessageInput.value.length > 100) {
            guestMessageInput.value = guestMessageInput.value.slice(0, 100);
        }
    });

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Sanitización básica contra caracteres de control y límites estrictos
        const guestName = guestNameInput.value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 80);
        const declining = isDeclining();
        const parsedCount = parseInt(guestCountInput.value, 10);
        const safeCount = Number.isNaN(parsedCount) ? 1 : Math.max(1, Math.min(5, parsedCount));
        const guestCount = declining ? '0' : String(safeCount);
        const guestMessage = guestMessageInput.value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 100);

        if (!guestName) {
            guestNameInput.focus();
            return;
        }

        if (!declining && !guestCountInput.value.trim()) {
            guestCountInput.focus();
            return;
        }

        const attendanceText = declining ? 'No podré asistir' : '¡Sí asistiré!';

        // Poblar resumen
        sumName.textContent = guestName;
        sumStatus.textContent = attendanceText;
        sumCount.textContent = declining ? '0' : guestCount;

        if (guestMessage) {
            sumMsg.textContent = guestMessage;
            sumMsgRow.style.display = 'block';
        } else {
            sumMsgRow.style.display = 'none';
        }

        // Construir enlace a WhatsApp +526181669898
        const waLines = [
            `¡Hola! Confirmo mi respuesta para los XV años de *Camila*:`,
            `• *Nombre:* ${guestName}`,
            `• *Respuesta:* ${attendanceText}`,
            `• *Asistentes:* ${declining ? '0' : guestCount}`
        ];
        if (guestMessage) {
            waLines.push(`• *Mensaje:* ${guestMessage}`);
        }

        const waUrl = `https://wa.me/526181669898?text=${encodeURIComponent(waLines.join('\n'))}`;
        btnWhatsappConfirm.href = waUrl;

        // Mostrar resumen y abrir WhatsApp
        rsvpSummary.hidden = false;
        rsvpSummary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    /* ==========================================================================
       7. MODAL DE AVISO DE PRIVACIDAD (DESDE NOTA DE FORMULARIO Y DESDE FOOTER)
       ========================================================================== */
    const privacyModal = document.getElementById('privacy-modal');
    const openPrivacyBtns = document.querySelectorAll('[data-open-privacy]');
    const closePrivacyBtns = document.querySelectorAll('[data-close-privacy]');

    openPrivacyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            privacyModal.hidden = false;
        });
    });

    closePrivacyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            privacyModal.hidden = true;
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && privacyModal && !privacyModal.hidden) {
            privacyModal.hidden = true;
        }
    });
});

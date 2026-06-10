/* --- Cookie Banner --- */
(function () {
    if (localStorage.getItem('cookieConsent')) return;

    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'true');
        banner.setAttribute('aria-label', 'Consenso cookie');

        banner.innerHTML =
            '<div class="cookie-card">' +
                '<p class="cookie-title cookie-title-dark">Cookie.</p>' +
                '<div class="cookie-clip">' +
                    '<p class="cookie-title cookie-title-light">Cookie.</p>' +
                '</div>' +
                '<div class="cookie-body">' +
                    '<p class="cookie-text">Usiamo cookie tecnici per far funzionare il sito. Nessun dato viene condiviso con terze parti.</p>' +
                    '<div class="cookie-actions">' +
                        '<button class="cookie-accept">Accetto</button>' +
                        '<button class="cookie-reject">Rifiuto</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(banner);

        function dismiss(value) {
            localStorage.setItem('cookieConsent', value);
            banner.classList.remove('cookie-visible');
            banner.addEventListener('transitionend', () => banner.remove(), { once: true });
        }

        banner.querySelector('.cookie-accept').addEventListener('click', () => dismiss('accepted'));
        banner.querySelector('.cookie-reject').addEventListener('click', () => dismiss('rejected'));

        // Force reflow so the CSS transition plays
        banner.getBoundingClientRect();
        banner.classList.add('cookie-visible');
    }

    // Su index.html: appare dopo che il video è scrollato fuori dalla viewport.
    // Su tutte le altre pagine: appare dopo 800ms.
    document.addEventListener('DOMContentLoaded', () => {
        const videoIntro = document.getElementById('video-intro');
        if (videoIntro) {
            const obs = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) {
                    obs.disconnect();
                    createBanner();
                }
            }, { threshold: 0 });
            obs.observe(videoIntro);
        } else {
            setTimeout(createBanner, 800);
        }
    });
})();

/* --- Loading screen --- */
(function () {
    if (sessionStorage.getItem('loaderShown')) return;
    sessionStorage.setItem('loaderShown', '1');

    const overlay = document.createElement('div');
    overlay.id = 'loader-overlay';

    const title = document.createElement('span');
    title.id = 'loader-title';
    title.textContent = 'Millelevrieri';

    const track = document.createElement('div');
    track.id = 'loader-track';
    const bar = document.createElement('div');
    bar.id = 'loader-bar';
    track.appendChild(bar);

    overlay.appendChild(title);
    overlay.appendChild(track);
    document.body.appendChild(overlay);

    let progress = 0;
    const duration = 5000;
    const interval = 16;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
        progress = Math.min(progress + step + Math.random() * step * 0.5, 100);
        bar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(timer);
            setTimeout(() => {
                overlay.classList.add('loader-done');
                overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
            }, 400);
        }
    }, interval);
})();

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const videoIntro = document.getElementById('video-intro');

    /* --- Hamburger menu --- */
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isOpen = header.classList.toggle('nav-open');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close when a nav link is clicked
        document.querySelectorAll('header nav a').forEach(link => {
            link.addEventListener('click', () => {
                header.classList.remove('nav-open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close when clicking outside the header
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && header.classList.contains('nav-open')) {
                header.classList.remove('nav-open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    /* --- End hamburger --- */

    function updateHeader() {
        if (!videoIntro) return;
        const videoBottom = videoIntro.getBoundingClientRect().bottom;
        if (videoBottom > 0) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
    }

    if (videoIntro) {
        // Nascondi subito il header senza transition al caricamento
        header.style.transition = 'none';
        updateHeader();
        requestAnimationFrame(() => { header.style.transition = ''; });
        window.addEventListener('scroll', updateHeader, { passive: true });
    }



    const imgCol = document.querySelector('.home-intro-img');
    const textCol = document.querySelector('.home-intro-text');

    function syncIntroHeight() {
        if (!imgCol || !textCol) return;
        if (window.matchMedia('(max-width: 768px)').matches) {
            textCol.style.height = '';
            return;
        }
        textCol.style.height = imgCol.offsetHeight + 'px';
    }

    if (imgCol) {
        const img = imgCol.querySelector('img');
        if (img && img.complete) {
            syncIntroHeight();
        } else if (img) {
            img.addEventListener('load', syncIntroHeight);
        }
    }

    window.addEventListener('resize', syncIntroHeight);

    // --- Parallax scroll scritta Millelevrieri ---
    const videoTitles = document.querySelectorAll('.video-title');
    if (videoIntro && videoTitles.length) {
        // Posizione finale = equivalente di bottom: 6px → top = videoH - textH - 6
        // Posizione iniziale = top: -20px (CSS)
        const startTop = -20;

        function updateTitleScroll() {
            const videoH = videoIntro.offsetHeight;
            const textH = videoTitles[0] ? videoTitles[0].offsetHeight : 200;
            const endTop = videoH - textH - 6;
            const maxTranslate = endTop - startTop;

            const scrollY = window.scrollY;
            // Completa la discesa nel primo 45% dello scroll del video
            const scrollRange = videoH * 0.45;
            const progress = Math.min(1, Math.max(0, scrollY / scrollRange));
            const translateY = progress * maxTranslate;

            videoTitles.forEach(el => {
                el.style.transform = `translateY(${translateY}px)`;
            });
        }

        window.addEventListener('scroll', updateTitleScroll, { passive: true });
        window.addEventListener('resize', updateTitleScroll, { passive: true });
        updateTitleScroll();
    }

    // --- Lightbox immagini lavori ---
    const lavoriImgs = document.querySelectorAll('.lavoro-detail img');
    if (lavoriImgs.length > 0) {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        const lbImg = document.createElement('img');
        overlay.appendChild(lbImg);
        document.body.appendChild(overlay);

        lavoriImgs.forEach(img => {
            img.addEventListener('click', () => {
                lbImg.src = img.src;
                lbImg.alt = img.alt;
                overlay.classList.add('active');
            });
        });

        overlay.addEventListener('click', () => overlay.classList.remove('active'));
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') overlay.classList.remove('active');
        });
    }

    // --- Video griglia portfolio: parte dal secondo 10 ---
    const gridVideo = document.querySelector('.video-wrapper video');
    if (gridVideo) {
        const startAt10 = () => { gridVideo.currentTime = 10; };
        gridVideo.addEventListener('loadedmetadata', startAt10, { once: true });
        if (gridVideo.readyState >= 1) startAt10();
    }

    // --- Controlli video Pietà (lavoro-4.html) ---
    const pietaVideo = document.querySelector('.pieta-video');
    if (pietaVideo) {
        // Parte dal secondo 10
        const seekTo10 = () => { pietaVideo.currentTime = 10; };
        pietaVideo.addEventListener('loadedmetadata', seekTo10, { once: true });
        if (pietaVideo.readyState >= 1) seekTo10();

        // Autoplay senza loop (controllato manualmente)
        pietaVideo.play().catch(() => {});

        const btnPlay       = document.querySelector('.vc-play');
        const btnBack       = document.querySelector('.vc-back');
        const btnForward    = document.querySelector('.vc-forward');
        const btnFullscreen = document.querySelector('.vc-fullscreen');
        const progressFill  = document.querySelector('.video-progress-fill');
        const progressTrack = document.querySelector('.video-progress-track');

        // Aggiorna icona play/pausa
        function syncPlayBtn() {
            btnPlay.innerHTML = pietaVideo.paused ? '&#9654;' : '&#9646;&#9646;';
        }

        // Play / Pausa — bottone e clic diretto sul video
        function togglePlay() {
            pietaVideo.paused ? pietaVideo.play() : pietaVideo.pause();
        }

        btnPlay.addEventListener('click', togglePlay);
        pietaVideo.addEventListener('click', togglePlay);

        pietaVideo.addEventListener('play',  syncPlayBtn);
        pietaVideo.addEventListener('pause', syncPlayBtn);

        // −5 secondi
        btnBack.addEventListener('click', () => {
            pietaVideo.currentTime = Math.max(0, pietaVideo.currentTime - 5);
        });

        // +5 secondi
        btnForward.addEventListener('click', () => {
            pietaVideo.currentTime = Math.min(pietaVideo.duration || 0, pietaVideo.currentTime + 5);
        });

        // Aggiorna barra di avanzamento
        pietaVideo.addEventListener('timeupdate', () => {
            if (!pietaVideo.duration) return;
            progressFill.style.width = (pietaVideo.currentTime / pietaVideo.duration * 100) + '%';
        });

        // Scrubbing: clic + trascinamento sulla barra
        let isScrubbing = false;
        let wasPlaying = false;

        function scrubTo(e) {
            const rect = progressTrack.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            pietaVideo.currentTime = ratio * (pietaVideo.duration || 0);
            progressFill.style.width = (ratio * 100) + '%';
        }

        progressTrack.addEventListener('mousedown', (e) => {
            isScrubbing = true;
            wasPlaying = !pietaVideo.paused;
            pietaVideo.pause();
            scrubTo(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isScrubbing) scrubTo(e);
        });

        document.addEventListener('mouseup', () => {
            if (isScrubbing) {
                isScrubbing = false;
                if (wasPlaying) pietaVideo.play();
            }
        });

        // Fullscreen
        btnFullscreen.addEventListener('click', () => {
            if (pietaVideo.requestFullscreen) pietaVideo.requestFullscreen();
            else if (pietaVideo.webkitRequestFullscreen) pietaVideo.webkitRequestFullscreen();
        });
    }

    // --- Logo typewriter nel header ---
    const logoEl = document.querySelector('.header-logo');
    if (!logoEl) return;
    const LOGO_TEXT = 'Millelevrieri';
    const CHAR_DELAY = 80;
    let typeTimer = null;

    function typeLogo() {
        if (typeTimer) return;
        logoEl.textContent = '';
        let i = 0;
        typeTimer = setInterval(() => {
            logoEl.textContent += LOGO_TEXT[i];
            i++;
            if (i >= LOGO_TEXT.length) {
                clearInterval(typeTimer);
                typeTimer = null;
            }
        }, CHAR_DELAY);
    }

    function clearLogo() {
        if (typeTimer) {
            clearInterval(typeTimer);
            typeTimer = null;
        }
        logoEl.textContent = '';
    }

    /* --- Bio quote sticky texts --- */
    (function () {
        const wrapper    = document.querySelector('.bio-quote-wrapper');
        const topText    = document.querySelector('.bio-quote-top');
        const bottomText = document.querySelector('.bio-quote-bottom');
        const bioSection = document.querySelector('#bio');
        if (!wrapper || !topText || !bottomText) return;

        const TOP_CSS_PERCENT  = 0.20;
        const BOT_CSS_PERCENT  = 0.68;
        const GAP              = 8;
        const STOP_ABOVE_BIO   = 70;   // px above #bio where both texts come to rest
        let ticking = false;

        function updateQuoteSticky() {
            const rect        = wrapper.getBoundingClientRect();
            const wH          = wrapper.offsetHeight;
            const scrollY     = window.scrollY;
            const headerH     = header ? header.offsetHeight : 0;
            const topH        = topText.offsetHeight;
            const botH        = bottomText.offsetHeight;

            // Natural viewport positions (as if still absolute on image)
            const topNatural  = rect.top + wH * TOP_CSS_PERCENT;
            const botNatural  = rect.top + wH * BOT_CSS_PERCENT;

            // Fixed-to-viewport targets
            const topTarget   = headerH;
            const botTarget   = headerH + topH + GAP;

            // Final document resting position (70px above #bio)
            const bioDocTop   = bioSection
                ? bioSection.getBoundingClientRect().top + scrollY
                : Infinity;
            const finalDocTop = bioDocTop - STOP_ABOVE_BIO - topH - GAP - botH;

            // Current document Y of the fixed top text
            const fixedDocY   = scrollY + topTarget;

            // Phase 3: both stuck, now pin them to their final document position
            if (fixedDocY >= finalDocTop && botNatural <= botTarget) {
                const wrapperDocTop = rect.top + scrollY;
                const absTop = finalDocTop - wrapperDocTop;

                topText.style.position = 'absolute';
                topText.style.top      = absTop + 'px';
                topText.style.left     = '10%';
                topText.style.right    = '10%';
                topText.style.zIndex   = '500';

                bottomText.style.position = 'absolute';
                bottomText.style.top      = (absTop + topH + GAP) + 'px';
                bottomText.style.left     = '10%';
                bottomText.style.right    = '10%';
                bottomText.style.zIndex   = '500';

            } else {
                // Phase 1 & 2: normal sequential stick to viewport
                if (topNatural <= topTarget) {
                    topText.style.position = 'fixed';
                    topText.style.top      = topTarget + 'px';
                    topText.style.left     = '0';
                    topText.style.right    = '0';
                    topText.style.zIndex   = '500';
                } else {
                    topText.style.position = '';
                    topText.style.top      = '';
                    topText.style.left     = '';
                    topText.style.right    = '';
                    topText.style.zIndex   = '';
                }

                if (botNatural <= botTarget) {
                    bottomText.style.position = 'fixed';
                    bottomText.style.top      = botTarget + 'px';
                    bottomText.style.left     = '0';
                    bottomText.style.right    = '0';
                    bottomText.style.zIndex   = '500';
                } else {
                    bottomText.style.position = '';
                    bottomText.style.top      = '';
                    bottomText.style.left     = '';
                    bottomText.style.right    = '';
                    bottomText.style.zIndex   = '';
                }
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateQuoteSticky);
                ticking = true;
            }
        }, { passive: true });

        updateQuoteSticky();
    })();

    if (videoIntro) {
        // Su index.html: scatta quando #video-intro esce completamente dalla viewport
        const logoObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                clearLogo();
            } else {
                typeLogo();
            }
        }, {
            threshold: 0,
            // Scatta solo quando il fondo della sezione supera la cima dello schermo
            rootMargin: '0px 0px 0px 0px'
        });
        logoObserver.observe(videoIntro);
    } else {
        // Su tutte le altre pagine: typewriter immediato al caricamento
        typeLogo();
    }
});

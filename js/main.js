document.addEventListener('DOMContentLoaded', () => {
    const imgCol = document.querySelector('.home-intro-img');
    const textCol = document.querySelector('.home-intro-text');

    function syncIntroHeight() {
        if (!imgCol || !textCol) return;
        textCol.style.maxHeight = imgCol.offsetHeight + 'px';
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
});

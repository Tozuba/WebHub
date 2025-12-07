// ============================================
// CONFIGURATION - Dynamic image loading
// ============================================

// Total number of images in the imagenes folder
const totalImages = 12; // pag1.jpg to pag12.jpg

// Generate book pages dynamically from images
function generateBookPagesConfig() {
    const pages = [];

    // Always pair images as front and back
    // pag1+pag2 = page 1, pag3+pag4 = page 2, etc.
    for (let i = 1; i <= totalImages; i += 2) {
        const frontImage = `imagenes/pag${i}.jpg`;
        const backImage = i + 1 <= totalImages ? `imagenes/pag${i + 1}.jpg` : null;

        pages.push({
            front: frontImage,
            back: backImage
        });
    }

    // If the last page has no back, add Christmas message
    if (pages.length > 0 && pages[pages.length - 1].back === null) {
        pages[pages.length - 1].back = {
            type: 'christmas',
            message: '¡Feliz Navidad!',
            year: '2025',
            subtitle: 'El Cascanueces',
            description: 'Una noche mágica de ballet'
        };
    }

    return pages;
}

const bookPages = generateBookPagesConfig();

// ============================================
// BOOK STATE MANAGEMENT
// ============================================

const pages = [];
let currentPageIndex = 0;
let isAnimating = false;

// DOM elements
const book = document.getElementById('book');
const pageStack = document.querySelector('.page-stack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageIndicator = document.getElementById('pageIndicator');
const invisibleNavLeft = document.getElementById('invisibleNavLeft');
const invisibleNavRight = document.getElementById('invisibleNavRight');

// ============================================
// INITIALIZATION
// ============================================

function init() {
    generatePagesFromImages();
    createIndicators();
    setupEventListeners();
    updateNavigation();
    preloadImages();
    setupMusicControl();
    setupViewToggle();
}

// ============================================
// VIEW TOGGLE & CASCADE MODE
// ============================================

function setupViewToggle() {
    const viewToggle = document.getElementById('viewToggle');
    const cascadeContainer = document.getElementById('cascadeContainer');
    const viewIcon = viewToggle.querySelector('.view-icon');
    let isCascadeMode = false;

    viewToggle.addEventListener('click', () => {
        isCascadeMode = !isCascadeMode;
        document.body.classList.toggle('cascade-mode', isCascadeMode);

        if (isCascadeMode) {
            viewIcon.textContent = '📖'; // Show book icon to go back
            cascadeContainer.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                cascadeContainer.classList.add('active');
            }, 10);
            populateCascadeView();
        } else {
            viewIcon.textContent = '📱'; // Show mobile/list icon to go to cascade
            cascadeContainer.classList.remove('active');
            setTimeout(() => {
                cascadeContainer.classList.add('hidden');
            }, 500); // Wait for transition
        }
    });
}

function populateCascadeView() {
    const container = document.getElementById('cascadeContainer');
    if (container.children.length > 0) return; // Only populate once

    bookPages.forEach((pageData, index) => {
        // Front Content
        if (pageData.front) {
            const wrapper = document.createElement('div');
            wrapper.className = 'cascade-item';

            // Adjust animation delay for sequential effect
            wrapper.style.animationDelay = `${index * 0.1}s`;

            wrapper.innerHTML = createPageContent(pageData.front, index, 'front');
            container.appendChild(wrapper);
        }

        // Back Content
        if (pageData.back) {
            const wrapper = document.createElement('div');
            wrapper.className = 'cascade-item';

            wrapper.style.animationDelay = `${(index * 0.1) + 0.05}s`;

            wrapper.innerHTML = createPageContent(pageData.back, index, 'back');
            container.appendChild(wrapper);
        }
    });
}

// ============================================
// MUSIC CONTROL
// ============================================

function setupMusicControl() {
    const music = document.getElementById('backgroundMusic');
    const musicControl = document.getElementById('musicControl');
    let isMuted = false;
    let isPaused = false;

    // Try to autoplay (browsers may block this)
    const playPromise = music.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPaused = false;
        }).catch(() => {
            // Autoplay was prevented, will play on first user interaction
            isPaused = true;
        });
    }

    musicControl.addEventListener('click', () => {
        const icon = musicControl.querySelector('.music-icon');

        if (isPaused) {
            music.play();
            isPaused = false;
            musicControl.classList.remove('paused');
            if (isMuted) {
                music.muted = false;
                isMuted = false;
                musicControl.classList.remove('muted');
            }
            icon.textContent = '🔊'; // Playing sound
        } else if (isMuted) {
            music.muted = false;
            isMuted = false;
            musicControl.classList.remove('muted');
            icon.textContent = '🔊'; // Unmuted/Playing
        } else {
            music.muted = true;
            isMuted = true;
            musicControl.classList.add('muted');
            icon.textContent = '🔇'; // Muted
        }
    });

    // Start music on first user interaction if autoplay failed
    document.addEventListener('click', function startMusic() {
        if (isPaused) {
            music.play();
            isPaused = false;
            musicControl.classList.remove('paused');
            const icon = musicControl.querySelector('.music-icon');
            if (icon) icon.textContent = '🔊';
        }
        document.removeEventListener('click', startMusic);
    }, { once: true });
}

// ============================================
// DYNAMIC PAGE GENERATION
// ============================================

function generatePagesFromImages() {
    pageStack.innerHTML = '';

    bookPages.forEach((pageData, index) => {
        const pageElement = createPageElement(pageData, index);
        pageStack.appendChild(pageElement);

        pages.push({
            element: pageElement,
            index: index,
            isFlipped: false
        });
    });

    updatePageStacking();
}

function createPageElement(pageData, index) {
    const page = document.createElement('div');
    page.className = 'page';
    page.dataset.page = index;

    // Create front face
    const frontFace = document.createElement('div');
    frontFace.className = 'page-front';
    frontFace.innerHTML = createPageContent(pageData.front, index, 'front');

    // Create back face
    const backFace = document.createElement('div');
    backFace.className = 'page-back';
    backFace.innerHTML = createPageContent(pageData.back, index, 'back');

    page.appendChild(frontFace);
    page.appendChild(backFace);

    return page;
}

function createPageContent(content, index, side) {
    if (!content) {
        return '<div class="page-content"></div>';
    }

    // Check if it's a Christmas message page
    if (typeof content === 'object' && content.type === 'christmas') {
        return `
      <div class="page-content christmas-message">
        <h2>${content.message}</h2>
        <div class="year">${content.year}</div>
        <div class="decorative-line"></div>
        <p>${content.subtitle}</p>
        <p>${content.description}</p>
      </div>
    `;
    }

    // All other pages are image pages
    return `
      <div class="page-content image-page">
        <img src="${content}" alt="Página ${index + 1} ${side}" class="page-image">
      </div>
    `;
}

// ============================================
// PAGE STACKING & Z-INDEX
// ============================================

function updatePageStacking() {
    pages.forEach((page, index) => {
        if (page.isFlipped) {
            page.element.style.zIndex = index;
        } else {
            page.element.style.zIndex = pages.length - index;
        }
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Button navigation
    prevBtn.addEventListener('click', turnPageBackward);
    nextBtn.addEventListener('click', turnPageForward);

    // Invisible navigation areas
    invisibleNavLeft.addEventListener('click', turnPageBackward);
    invisibleNavRight.addEventListener('click', turnPageForward);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    // Touch/swipe support
    let touchStartX = 0;

    book.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    book.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                turnPageForward();
            } else {
                turnPageBackward();
            }
        }
    }, { passive: true });
}

function handleKeyboard(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        turnPageForward();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        turnPageBackward();
    } else if (e.key === 'Home') {
        e.preventDefault();
        goToFirstPage();
    } else if (e.key === 'End') {
        e.preventDefault();
        goToLastPage();
    }
}

// ============================================
// PAGE TURNING LOGIC
// ============================================

function turnPageForward() {
    if (isAnimating || currentPageIndex >= pages.length) return;

    isAnimating = true;
    const pageToFlip = pages[currentPageIndex];

    // Put the animating page on top immediately to prevent flicker
    pageToFlip.element.style.zIndex = 9999;

    // Toggle the flipped class - CSS transition handles the rest
    pageToFlip.element.classList.add('flipped');
    pageToFlip.isFlipped = true;

    currentPageIndex++;

    // Wait for CSS transition to complete, then update all z-indexes
    setTimeout(() => {
        updatePageStacking();
        updateNavigation();
        updateIndicators();
        isAnimating = false;
    }, 800); // Match CSS transition duration
}

function turnPageBackward() {
    if (isAnimating || currentPageIndex <= 0) return;

    isAnimating = true;
    currentPageIndex--;
    const pageToFlip = pages[currentPageIndex];

    // Put the animating page on top immediately to prevent flicker
    pageToFlip.element.style.zIndex = 9999;

    // Toggle the flipped class - CSS transition handles the rest
    pageToFlip.element.classList.remove('flipped');
    pageToFlip.isFlipped = false;

    // Wait for CSS transition to complete, then update all z-indexes
    setTimeout(() => {
        updatePageStacking();
        updateNavigation();
        updateIndicators();
        isAnimating = false;
    }, 800); // Match CSS transition duration
}

function goToFirstPage() {
    if (currentPageIndex === 0) return;
    flipMultiplePages(currentPageIndex, 'backward');
}

function goToLastPage() {
    if (currentPageIndex === pages.length) return;
    flipMultiplePages(pages.length - currentPageIndex, 'forward');
}

function flipMultiplePages(count, direction) {
    if (count === 0 || isAnimating) return;

    isAnimating = true;
    let flipped = 0;

    const flipNext = () => {
        if (flipped < count) {
            const pageToFlip = direction === 'forward'
                ? pages[currentPageIndex]
                : pages[currentPageIndex - 1];

            if (direction === 'forward') {
                pageToFlip.element.classList.add('flipped');
                pageToFlip.isFlipped = true;
                currentPageIndex++;
            } else {
                currentPageIndex--;
                pageToFlip.element.classList.remove('flipped');
                pageToFlip.isFlipped = false;
            }

            flipped++;
            setTimeout(flipNext, 100);
        } else {
            finishMultiFlip();
        }
    };

    const finishMultiFlip = () => {
        updatePageStacking();
        updateNavigation();
        updateIndicators();
        isAnimating = false;
    };

    flipNext();
}

// ============================================
// UI UPDATES
// ============================================

function updateNavigation() {
    prevBtn.disabled = currentPageIndex === 0;
    nextBtn.disabled = currentPageIndex === pages.length;
    invisibleNavLeft.disabled = currentPageIndex === 0;
    invisibleNavRight.disabled = currentPageIndex === pages.length;
}

function createIndicators() {
    pageIndicator.innerHTML = '';

    for (let i = 0; i <= pages.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot';
        if (i === currentPageIndex) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => jumpToPage(i));
        pageIndicator.appendChild(dot);
    }
}

function updateIndicators() {
    const dots = pageIndicator.querySelectorAll('.indicator-dot');
    dots.forEach((dot, index) => {
        if (index === currentPageIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function jumpToPage(targetIndex) {
    if (targetIndex === currentPageIndex || isAnimating) return;

    const diff = targetIndex - currentPageIndex;
    const direction = diff > 0 ? 'forward' : 'backward';
    flipMultiplePages(Math.abs(diff), direction);
}

// ============================================
// IMAGE PRELOADING
// ============================================

function preloadImages() {
    bookPages.forEach(pageData => {
        if (typeof pageData.front === 'string') {
            const img = new Image();
            img.src = pageData.front;
        }
        if (typeof pageData.back === 'string') {
            const img = new Image();
            img.src = pageData.back;
        }
    });
}

// ============================================
// START THE APP
// ============================================

document.addEventListener('DOMContentLoaded', init);

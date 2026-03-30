// Simple interactivity for navigation and login
document.addEventListener('DOMContentLoaded', function() {
    function t(key) {
        return window.LF_i18n && window.LF_i18n.t ? window.LF_i18n.t(key) : key;
    }

    let lastConfirmationOrder = null;

    // Initialize quantity modal
    initQuantityModal();
    
    // Page navigation
    const pages = document.querySelectorAll('.page');
    
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Add active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const target = this.getAttribute('data-nav-target');
            if (target === 'build-your-own-home-page') {
                showPage('build-your-own-home-page');
                loadProductsForBuilder();
            } else if (target === 'ready-packages-page') {
                showPage('ready-packages-page');
            } else if (target === 'send-floor-plan-page') {
                showPage('send-floor-plan-page');
            } else if (target === 'cancel-subscription-page') {
                showPage('cancel-subscription-page');
            } else if (target === 'terms-page') {
                showPage('terms-page');
            } else {
                showPage('home-page');
            }
        });
    });
    
    // Logo click - go to home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            showPage('home-page');
            navLinks.forEach(l => l.classList.remove('active'));
        });
    }

    // CTA button - go to Get Started page
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            showPage('get-started-page');
            navLinks.forEach(l => l.classList.remove('active'));
        });
    }

    // Footer: "her/here" → Kom i gang-siden med kontaktformular
    document.querySelector('.site-footer')?.addEventListener('click', function(e) {
        const cta = e.target.closest('.footer-contact-cta');
        if (!cta) return;
        e.preventDefault();
        showPage('get-started-page');
        navLinks.forEach(l => l.classList.remove('active'));
        requestAnimationFrame(function() {
            const contactEl = document.getElementById('contact-section');
            if (contactEl) {
                contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Get Started category cards navigation
    const categoryCards = document.querySelectorAll('.category-card[data-target]');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-target');
            if (!targetPage) return;
            showPage(targetPage);
            if (targetPage === 'build-your-own-home-page') {
                loadProductsForBuilder();
            }
            navLinks.forEach(l => l.classList.remove('active'));
            const targetLink = document.querySelector('.nav-link[data-nav-target="' + targetPage + '"]');
            if (targetLink) {
                targetLink.classList.add('active');
            }
        });
    });

    // Ready package selection
    const readyPackageButtons = document.querySelectorAll('.choose-package-btn[data-ready-package]');
    readyPackageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const packageKey = this.dataset.readyPackage;
            if (!readyPackages[packageKey]) return;
            builderSelectedPackage = [...selectedPackage];
            activePackageMode = 'ready';
            readyPackageId = packageKey;
            readyPackagePricing = {
                startup: readyPackages[packageKey].startup,
                monthly: readyPackages[packageKey].monthly,
                removal: readyPackages[packageKey].removal
            };
            extraRoomSelected = false;
            selectedPackage = buildReadyPackageItems(packageKey);
            applyExtraRoomSelection();
            showPackageReviewModal();
        });
    });

    // FAQ accordion toggles
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('is-open');
        });
    });
    
    // Login modal elements
    const loginBtn = document.querySelector('.login-btn');
    const modal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    // Open login modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    }
    
    // Close login modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'none';
                if (loginError) loginError.textContent = '';
            }
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (loginError) loginError.textContent = '';
            }
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Full admin login
            if (username === 'RT' && password === 'RTAMLF') {
                window.location.href = 'admin.html';
            } else if (username === 'AlfaM' && password === 'Alfa2026') {
                // Limited login: overview tab only
                window.location.href = 'admin.html?access=overview';
            } else {
                // Show error message
                if (loginError) {
                    loginError.textContent = t('js.loginError');
                }
            }
        });
    }

    // Build Your Own Home functionality
    let selectedPackage = [];
    let selectedCategory = null;
    let activePackageMode = 'builder';
    let builderSelectedPackage = [];
    let readyPackagePricing = null;
    let readyPackageId = null;
    let extraRoomSelected = false;
    let builderProducts = [];

    const readyPackages = {
        package1: {
            name: 'Package 1',
            startup: 6250,
            monthly: 2000,
            removal: 2500,
            image: 'B1H.jpg',
            items: [
                { name: 'Spisebord til mindst 4 personer', quantity: 1 },
                { name: 'Matchende spisebordsstol', quantity: 4 },
                { name: 'Sovesofa', quantity: 1 },
                { name: 'Sofabord', quantity: 1 },
                { name: '90x200 seng med topmadras', quantity: 2 },
                { name: 'Pude-/dynesæt', quantity: 2 },
                { name: 'Sidebord', quantity: 2 },
                { name: 'Sengebordslampe', quantity: 2 },
                { name: 'Belysningstype', quantity: 2 },
                { name: '55" TV samt TV-bord', quantity: 1 }
            ]
        },
        package2: {
            name: 'Package 2',
            startup: 7500,
            monthly: 2750,
            removal: 3125,
            image: 'B3G.jpg',
            items: [
                { name: 'Spisebord til mindst 6 personer', quantity: 1 },
                { name: 'Matchende spisebordsstol', quantity: 6 },
                { name: 'Sovesofa', quantity: 1 },
                { name: 'Sofabord', quantity: 1 },
                { name: '90x200 seng med topmadras', quantity: 4 },
                { name: 'Pude-/dynesæt', quantity: 4 },
                { name: 'Sidebord', quantity: 4 },
                { name: 'Sengebordslampe', quantity: 4 },
                { name: 'Belysningstype', quantity: 2 },
                { name: '55" TV samt TV-bord', quantity: 1 }
            ]
        }
    };

    const extraRoomItems = [
        { name: '90x200 bed with top mattress', quantity: 2 },
        { name: 'Pillow/duvet set', quantity: 2 },
        { name: 'Bedside table', quantity: 2 },
        { name: 'Lamp', quantity: 2 }
    ];

    function buildReadyPackageItems(packageKey) {
        const pkg = readyPackages[packageKey];
        if (!pkg) return [];
        return pkg.items.map((item, index) => ({
            id: `${packageKey}-${index}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: item.name,
            sku: '',
            imageUrl: 'ProduktB/ReadyP.jpg',
            quantity: item.quantity,
            startupCost: 0,
            month1to4: 0,
            month5to12: 0,
            month13plus: 0
        }));
    }

    function buildExtraRoomItems(imageUrl) {
        return extraRoomItems.map((item, index) => ({
            id: `extra-room-${index}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: item.name,
            sku: '',
            imageUrl: imageUrl,
            quantity: item.quantity,
            startupCost: 0,
            month1to4: 0,
            month5to12: 0,
            month13plus: 0,
            isExtraRoom: true
        }));
    }

    function applyExtraRoomSelection() {
        selectedPackage = selectedPackage.filter(item => !item.isExtraRoom);
        if (extraRoomSelected && readyPackageId) {
            const imageUrl = 'ProduktB/ReadyP.jpg';
            selectedPackage = selectedPackage.concat(buildExtraRoomItems(imageUrl));
        }
    }

    function getBackendBaseUrl() {
        const meta = document.querySelector('meta[name="backend-base-url"]');
        const fromMeta = meta ? (meta.getAttribute('content') || '').trim() : '';
        if (fromMeta) {
            return fromMeta.replace(/\/+$/, '');
        }
        return window.location.origin;
    }

    function getBackendApiCandidates() {
        const host = window.location.hostname || 'localhost';
        const candidates = new Set();
        candidates.add(getBackendBaseUrl());
        candidates.add(`http://${host}:5001`);
        candidates.add('http://localhost:5001');
        candidates.add('http://127.0.0.1:5001');
        candidates.add(`http://${host}:5000`);
        candidates.add('http://localhost:5000');
        candidates.add('http://127.0.0.1:5000');
        return Array.from(candidates);
    }

    async function fetchProductsFromServer() {
        const candidates = getBackendApiCandidates();
        for (const baseUrl of candidates) {
            try {
                const response = await fetch(`${baseUrl}/products`, { cache: 'no-store' });
                if (!response.ok) continue;
                const data = await response.json().catch(() => ({}));
                if (data && Array.isArray(data.products)) {
                    return data.products;
                }
            } catch (error) {
                console.warn('Failed to fetch products from server:', error);
            }
        }
        return null;
    }

    async function saveOrdersToServer(orders) {
        const candidates = getBackendApiCandidates();
        for (const baseUrl of candidates) {
            try {
                const response = await fetch(`${baseUrl}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders })
                });
                if (response.ok) {
                    return true;
                }
            } catch (error) {
                console.warn('Failed to save orders to server:', error);
            }
        }
        return false;
    }

    async function fetchOrdersFromServer() {
        const candidates = getBackendApiCandidates();
        for (const baseUrl of candidates) {
            try {
                const response = await fetch(`${baseUrl}/orders`, { cache: 'no-store' });
                if (!response.ok) continue;
                const data = await response.json().catch(() => ({}));
                if (data && Array.isArray(data.orders)) {
                    return data.orders;
                }
            } catch (error) {
                console.warn('Failed to fetch orders from server:', error);
            }
        }
        return null;
    }

    async function fetchCompletedOrdersFromServer() {
        const candidates = getBackendApiCandidates();
        for (const baseUrl of candidates) {
            try {
                const response = await fetch(`${baseUrl}/completed-orders`, { cache: 'no-store' });
                if (!response.ok) continue;
                const data = await response.json().catch(() => ({}));
                if (data && Array.isArray(data.orders)) {
                    return data.orders;
                }
            } catch (error) {
                console.warn('Failed to fetch completed orders from server:', error);
            }
        }
        return null;
    }

    async function saveCompletedOrdersToServer(orders) {
        const candidates = getBackendApiCandidates();
        for (const baseUrl of candidates) {
            try {
                const response = await fetch(`${baseUrl}/completed-orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders })
                });
                if (response.ok) {
                    return true;
                }
            } catch (error) {
                console.warn('Failed to save completed orders to server:', error);
            }
        }
        return false;
    }

    function getOrdersFromLocalStorageSafe() {
        try {
            const raw = localStorage.getItem('orders');
            if (!raw) return [];
            const p = JSON.parse(raw);
            return Array.isArray(p) ? p : [];
        } catch (e) {
            return [];
        }
    }

    function getCompletedOrdersFromLocalStorageSafe() {
        try {
            const raw = localStorage.getItem('completedOrders');
            if (!raw) return [];
            const p = JSON.parse(raw);
            return Array.isArray(p) ? p : [];
        } catch (e) {
            return [];
        }
    }

    async function mergeOrdersWithServer(serverOrders) {
        const local = getOrdersFromLocalStorageSafe();
        if (serverOrders === null) {
            return local;
        }
        if (serverOrders.length > 0) {
            const serverById = new Map();
            serverOrders.forEach((o) => {
                const id = Number(o.id);
                if (!Number.isNaN(id)) serverById.set(id, o);
            });
            const merged = Array.from(serverById.values());
            local.forEach((o) => {
                const id = Number(o.id);
                if (Number.isNaN(id)) return;
                if (!serverById.has(id)) {
                    merged.push(o);
                }
            });
            try {
                localStorage.setItem('orders', JSON.stringify(merged));
            } catch (e) {}
            return merged;
        }
        if (local.length > 0) {
            await saveOrdersToServer(local);
            return local;
        }
        return [];
    }

    async function mergeCompletedOrdersWithServer(serverCompleted) {
        const local = getCompletedOrdersFromLocalStorageSafe();
        if (serverCompleted === null) {
            return local;
        }
        if (serverCompleted.length > 0) {
            try {
                localStorage.setItem('completedOrders', JSON.stringify(serverCompleted));
            } catch (e) {}
            return serverCompleted;
        }
        if (local.length > 0) {
            await saveCompletedOrdersToServer(local);
            return local;
        }
        return [];
    }

    function getBuilderProductsFromStorage() {
        if (builderProducts && builderProducts.length > 0) {
            return builderProducts;
        }
        const stored = localStorage.getItem('products');
        if (!stored) return [];
        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error parsing local products:', error);
            return [];
        }
    }

    // Load products for builder
    async function loadProductsForBuilder() {
        let products = await fetchProductsFromServer();
        if (products && products.length === 0) {
            const stored = localStorage.getItem('products');
            if (stored) {
                try {
                    const localProducts = JSON.parse(stored);
                    if (Array.isArray(localProducts) && localProducts.length > 0) {
                        products = localProducts;
                    }
                } catch (error) {
                    console.error('Error parsing local products:', error);
                }
            }
        }

        if (!products) {
            const stored = localStorage.getItem('products');
            if (!stored) {
                document.getElementById('productsGrid').innerHTML = '<p data-i18n="js.noProductsAssortment">' + t('js.noProductsAssortment') + '</p>';
                return;
            }
            try {
                products = JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing local products:', error);
                document.getElementById('productsGrid').innerHTML = '<p data-i18n="js.noProductsAssortment">' + t('js.noProductsAssortment') + '</p>';
                return;
            }
        }

        if (!Array.isArray(products) || products.length === 0) {
            document.getElementById('productsGrid').innerHTML = '<p data-i18n="js.noProductsAssortment">' + t('js.noProductsAssortment') + '</p>';
            return;
        }

        builderProducts = products;
        try {
            localStorage.setItem('products', JSON.stringify(products));
        } catch (error) {
            console.warn('Unable to cache products in localStorage:', error);
        }

        displayCategories(products);
        
        // Show all products initially or first category
        if (products.length > 0) {
            const firstCategory = products[0].category;
            selectCategory(firstCategory, products);
        }
    }

    // Display categories
    function displayCategories(products) {
        const categories = [...new Set(products.map(p => p.category))];
        const categoriesList = document.getElementById('categoriesList');
        
        categoriesList.innerHTML = categories.map(category => 
            `<button class="category-btn" data-category="${category}">${category}</button>`
        ).join('');

        // Add click handlers
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                selectCategory(category, products);
            });
        });
    }

    // Select category and display products
    function selectCategory(category, products) {
        selectedCategory = category;
        
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Filter out hidden products
        const filteredProducts = products.filter(p => p.category === category && !p.hidden);
        displayProductsForCategory(filteredProducts);
    }

    // Display products for selected category
    function displayProductsForCategory(products) {
        const productsGrid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            productsGrid.innerHTML = '<p data-i18n="js.noProductsCategory">' + t('js.noProductsCategory') + '</p>';
            return;
        }
        
        // Filter out hidden products
        const visibleProducts = products.filter(product => !product.hidden);
        
        productsGrid.innerHTML = visibleProducts.map(product => {
            const hasOrientation = product.rightOrientedImage || product.leftOrientedImage;
            // Determine initial display: if has orientation images, start with left (or right if no left), hide main
            let initialDisplay = 'main';
            let mainImageDisplay = 'block';
            if (hasOrientation) {
                if (product.leftOrientedImage) {
                    initialDisplay = 'left';
                    mainImageDisplay = 'none';
                } else if (product.rightOrientedImage) {
                    initialDisplay = 'right';
                    mainImageDisplay = 'none';
                }
            }
            
            const startupCost = parseFloat(product.startupCost || 0).toFixed(2);
            return `
                <div class="builder-product-card" data-product-id="${product.id}">
                    <div class="builder-product-image-container">
                        <div class="builder-product-image" data-product-id="${product.id}">
                            <img src="${product.imageUrl}" alt="${product.name}" class="builder-product-main-image" data-orientation="main" style="display: ${mainImageDisplay};">
                            ${product.rightOrientedImage ? `<img src="${product.rightOrientedImage}" alt="${product.name} - Right-Oriented" class="builder-product-orientation-image" data-orientation="right" style="display: ${initialDisplay === 'right' ? 'block' : 'none'};">` : ''}
                            ${product.leftOrientedImage ? `<img src="${product.leftOrientedImage}" alt="${product.name} - Left-Oriented" class="builder-product-orientation-image" data-orientation="left" style="display: ${initialDisplay === 'left' ? 'block' : 'none'};">` : ''}
                        </div>
                        ${hasOrientation ? `
                            <button class="builder-image-nav-btn builder-image-nav-left" data-product-id="${product.id}" data-direction="left">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                            <button class="builder-image-nav-btn builder-image-nav-right" data-product-id="${product.id}" data-direction="right">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                    <div class="builder-product-info">
                        <h4>${product.name}</h4>
                        <div class="builder-product-price">${t('js.startup')}: ${startupCost} DKK</div>
                        <button class="add-to-package-btn" data-product-id="${product.id}">${t('js.addToPackage')}</button>
                    </div>
                </div>
            `;
        }).join('');

        attachBuilderEventListeners();
    }

    // Attach event listeners for builder products
    function attachBuilderEventListeners() {
        // Product card click - show details
        document.querySelectorAll('.builder-product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking on buttons
                if (e.target.closest('.add-to-package-btn') || e.target.closest('.builder-image-nav-btn')) {
                    return;
                }
                const productId = parseInt(this.dataset.productId);
                showProductDetails(productId);
            });
        });
        
        // Add to package buttons - use event delegation
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.addEventListener('click', function(e) {
                const addBtn = e.target.closest('.add-to-package-btn');
                if (addBtn) {
                    e.stopPropagation();
                    e.preventDefault();
                    const productId = parseInt(addBtn.dataset.productId);
                    if (!productId) {
                        console.error('No product ID found');
                        return;
                    }
                    
                    // Get current orientation from product card
                    let currentOrientation = 'main';
                    const productImageContainer = document.querySelector(`.builder-product-image[data-product-id="${productId}"]`);
                    if (productImageContainer) {
                        const visibleImage = productImageContainer.querySelector('img[style*="block"], img:not([style*="none"])');
                        if (visibleImage) {
                            currentOrientation = visibleImage.getAttribute('data-orientation') || 'main';
                        }
                    }
                    // Show quantity modal for all products
                    showQuantityModal(productId, currentOrientation);
                }
            });
        }

        // Image navigation buttons
        document.querySelectorAll('.builder-image-nav-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.productId);
                const direction = this.dataset.direction;
                navigateBuilderProductImage(productId, direction);
            });
        });
    }

    // Navigate builder product images
    function navigateBuilderProductImage(productId, direction) {
        const productImageContainer = document.querySelector(`.builder-product-image[data-product-id="${productId}"]`);
        if (!productImageContainer) return;
        
        const images = productImageContainer.querySelectorAll('img');
        const mainImage = productImageContainer.querySelector('.builder-product-main-image');
        const rightImage = productImageContainer.querySelector('.builder-product-orientation-image[data-orientation="right"]');
        const leftImage = productImageContainer.querySelector('.builder-product-orientation-image[data-orientation="left"]');
        
        let currentOrientation = 'main';
        
        // Find current visible image
        images.forEach(img => {
            if (img.style.display !== 'none' && img.style.display !== '') {
                currentOrientation = img.getAttribute('data-orientation');
            }
        });
        
        // Determine next orientation - skip main if orientation images exist
        let nextOrientation = currentOrientation;
        const hasOrientationImages = (rightImage && rightImage.src) || (leftImage && leftImage.src);
        
        if (hasOrientationImages) {
            // If orientation images exist, only switch between left and right, ignore main
            if (direction === 'left') {
                // Go to left (or stay on left if already there)
                nextOrientation = 'left';
            } else if (direction === 'right') {
                // Go to right (or stay on right if already there)
                nextOrientation = 'right';
            }
        } else {
            // No orientation images, use main image
            nextOrientation = 'main';
        }
        
        // Show/hide images
        images.forEach(img => {
            const orientation = img.getAttribute('data-orientation');
            if (orientation === nextOrientation) {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });
        
        // Update button visibility
        const product = getBuilderProductsFromStorage().find(p => p.id === productId);
        if (product && hasOrientationImages) {
            const leftBtn = document.querySelector(`.builder-image-nav-left[data-product-id="${productId}"]`);
            const rightBtn = document.querySelector(`.builder-image-nav-right[data-product-id="${productId}"]`);
            const hasLeft = product.leftOrientedImage;
            const hasRight = product.rightOrientedImage;
            
            // Show left button if not on left, show right button if not on right
            if (leftBtn && rightBtn) {
                leftBtn.style.display = nextOrientation !== 'left' ? 'flex' : 'none';
                rightBtn.style.display = nextOrientation !== 'right' ? 'flex' : 'none';
            }
        }
    }

    // Show product details modal
    function showProductDetails(productId) {
        const products = getBuilderProductsFromStorage();
        if (!products.length) return;
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('productDetailModal');
        const detailImageContainer = document.getElementById('detailProductImage');
        const hasOrientation = product.rightOrientedImage || product.leftOrientedImage;
        
        detailImageContainer.innerHTML = `
            <div class="product-detail-image" data-product-id="${product.id}">
                <img src="${product.imageUrl}" alt="${product.name}" class="detail-main-image" data-orientation="main">
                ${product.rightOrientedImage ? `<img src="${product.rightOrientedImage}" alt="${product.name} - Right-Oriented" class="detail-orientation-image" data-orientation="right" style="display: none;">` : ''}
                ${product.leftOrientedImage ? `<img src="${product.leftOrientedImage}" alt="${product.name} - Left-Oriented" class="detail-orientation-image" data-orientation="left" style="display: none;">` : ''}
            </div>
            ${hasOrientation ? `
                <button class="detail-image-nav-btn detail-image-nav-left" data-product-id="${product.id}" data-direction="left">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="detail-image-nav-btn detail-image-nav-right" data-product-id="${product.id}" data-direction="right">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            ` : ''}
        `;

        document.getElementById('detailProductName').textContent = product.name;
        document.getElementById('detailStartup').textContent = `${parseFloat(product.startupCost).toFixed(2)} DKK`;
        document.getElementById('detailMonth1to4').textContent = `${parseFloat(product.month1to4).toFixed(2)} DKK`;
        document.getElementById('detailMonth5to12').textContent = `${parseFloat(product.month5to12).toFixed(2)} DKK`;
        document.getElementById('detailMonth13plus').textContent = `${parseFloat(product.month13plus).toFixed(2)} DKK`;
        
        const sizeText = [product.length, product.width, product.height].filter(s => s).join(' × ');
        document.getElementById('detailSize').textContent = sizeText || t('js.na');

        const addToPackageBtn = document.getElementById('detailAddToPackageBtn');
        if (addToPackageBtn) {
            addToPackageBtn.dataset.productId = product.id;
        }
        
        // Add navigation listeners for detail modal
        document.querySelectorAll('.detail-image-nav-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.productId);
                const direction = this.dataset.direction;
                navigateDetailProductImage(productId, direction);
            });
        });
        
        // Initialize button visibility
        const leftBtn = document.querySelector(`#productDetailModal .detail-image-nav-left[data-product-id="${product.id}"]`);
        const rightBtn = document.querySelector(`#productDetailModal .detail-image-nav-right[data-product-id="${product.id}"]`);
        
        if (leftBtn && rightBtn) {
            if (product.leftOrientedImage && product.rightOrientedImage) {
                leftBtn.style.display = 'flex';
                rightBtn.style.display = 'flex';
            } else if (product.leftOrientedImage) {
                leftBtn.style.display = 'flex';
                rightBtn.style.display = 'none';
            } else if (product.rightOrientedImage) {
                leftBtn.style.display = 'none';
                rightBtn.style.display = 'flex';
            }
        }

        modal.style.display = 'flex';
    }

    // Navigate detail product images
    function navigateDetailProductImage(productId, direction) {
        const productImageContainer = document.querySelector(`#productDetailModal .product-detail-image[data-product-id="${productId}"]`);
        if (!productImageContainer) return;
        
        const images = productImageContainer.querySelectorAll('img');
        let currentOrientation = 'main';
        
        images.forEach(img => {
            if (img.style.display !== 'none') {
                currentOrientation = img.getAttribute('data-orientation');
            }
        });
        
        let nextOrientation = currentOrientation;
        if (direction === 'left') {
            if (currentOrientation === 'right') {
                nextOrientation = 'main';
            } else if (currentOrientation === 'main') {
                nextOrientation = 'left';
            }
        } else if (direction === 'right') {
            if (currentOrientation === 'left') {
                nextOrientation = 'main';
            } else if (currentOrientation === 'main') {
                nextOrientation = 'right';
            }
        }
        
        images.forEach(img => {
            if (img.getAttribute('data-orientation') === nextOrientation) {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });
    }

    // Add to package from detail modal - use event delegation
    const productDetailModal = document.getElementById('productDetailModal');
    if (productDetailModal) {
        // Close modal when clicking on close button
        const productDetailCloseBtn = productDetailModal.querySelector('.close-modal');
        if (productDetailCloseBtn) {
            productDetailCloseBtn.addEventListener('click', function() {
                productDetailModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        productDetailModal.addEventListener('click', function(e) {
            if (e.target === productDetailModal) {
                productDetailModal.style.display = 'none';
            }
        });
        
        // Add to package button
        productDetailModal.addEventListener('click', function(e) {
            if (e.target.closest('#detailAddToPackageBtn')) {
                e.stopPropagation();
                const btn = e.target.closest('#detailAddToPackageBtn');
                const productId = parseInt(btn.dataset.productId);
                if (!productId) return;
                
                // Get current orientation from modal
                let currentOrientation = 'main';
                const modalImageContainer = document.querySelector(`#productDetailModal .product-detail-image[data-product-id="${productId}"]`);
                if (modalImageContainer) {
                    const visibleImage = modalImageContainer.querySelector('img[style*="block"], img:not([style*="none"])');
                    if (visibleImage) {
                        currentOrientation = visibleImage.getAttribute('data-orientation') || 'main';
                    }
                }
                // Show quantity modal for all products
                showQuantityModal(productId, currentOrientation);
                // Close detail modal
                productDetailModal.style.display = 'none';
            }
        });
    }

    // Show quantity modal for Spisebordsstole
    function showQuantityModal(productId, orientation = 'main') {
        const products = getBuilderProductsFromStorage();
        if (!products.length) return;
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Determine which image to show
        let imageToShow = product.imageUrl;
        if (orientation === 'right' && product.rightOrientedImage) {
            imageToShow = product.rightOrientedImage;
        } else if (orientation === 'left' && product.leftOrientedImage) {
            imageToShow = product.leftOrientedImage;
        }
        
        // Set image
        const quantityImage = document.getElementById('quantityImage');
        if (quantityImage) {
            quantityImage.src = imageToShow;
            quantityImage.alt = product.name;
        }
        
        // Reset quantity input
        const quantityInput = document.getElementById('quantityInput');
        if (quantityInput) {
            quantityInput.value = 1;
        }
        
        // Show modal
        const quantityModal = document.getElementById('quantityModal');
        if (quantityModal) {
            quantityModal.style.display = 'flex';
        }
        
        // Store product info for when confirming
        quantityModal.dataset.productId = productId;
        quantityModal.dataset.orientation = orientation;
    }
    
    // Close quantity modal
    function closeQuantityModal() {
        const quantityModal = document.getElementById('quantityModal');
        if (quantityModal) {
            quantityModal.style.display = 'none';
        }
    }
    
    // Initialize quantity modal event listeners
    function initQuantityModal() {
        const quantityModal = document.getElementById('quantityModal');
        const closeQuantityModalBtn = document.getElementById('closeQuantityModal');
        const cancelQuantityBtn = document.getElementById('cancelQuantityBtn');
        const confirmQuantityBtn = document.getElementById('confirmQuantityBtn');
        
        if (closeQuantityModalBtn) {
            closeQuantityModalBtn.addEventListener('click', closeQuantityModal);
        }
        
        if (cancelQuantityBtn) {
            cancelQuantityBtn.addEventListener('click', closeQuantityModal);
        }
        
        if (confirmQuantityBtn) {
            confirmQuantityBtn.addEventListener('click', function() {
                const quantityInput = document.getElementById('quantityInput');
                const quantity = parseInt(quantityInput.value) || 1;
                const productId = parseInt(quantityModal.dataset.productId);
                const orientation = quantityModal.dataset.orientation || 'main';
                
                if (productId && quantity > 0) {
                    addToPackage(productId, orientation, quantity);
                    closeQuantityModal();
                }
            });
        }
        
        // Close modal when clicking outside
        if (quantityModal) {
            quantityModal.addEventListener('click', function(e) {
                if (e.target === quantityModal) {
                    closeQuantityModal();
                }
            });
        }
    }
    
    // Add to package
    function addToPackage(productId, orientation = 'main', quantity = 1) {
        const products = getBuilderProductsFromStorage();
        if (!products.length) {
            console.error('Ingen produkter fundet til builder');
            alert(t('js.adminNoProducts'));
            return;
        }
        const product = products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            alert(t('js.productNotFound'));
            return;
        }
        
        // Check if product already in package with same orientation
        const existingIndex = selectedPackage.findIndex(p => 
            p.id === productId && p.selectedOrientation === orientation
        );
        
        if (existingIndex !== -1) {
            // Update quantity if product already exists with same orientation
            selectedPackage[existingIndex].quantity = (selectedPackage[existingIndex].quantity || 1) + quantity;
            updatePackageSummary();
            return;
        }
        
        // Add product with selected orientation and quantity
        const productWithOrientation = {
            ...product,
            selectedOrientation: orientation,
            quantity: quantity
        };
        selectedPackage.push(productWithOrientation);
        updatePackageSummary();
    }
    
    // Remove from package
    function removeFromPackage(productId, orientation = null, index = null) {
        if (index !== null) {
            // Remove specific item by index
            selectedPackage.splice(index, 1);
        } else if (orientation !== null) {
            // Remove specific item by productId and orientation
            selectedPackage = selectedPackage.filter(p => 
                !(p.id === productId && p.selectedOrientation === orientation)
            );
        } else {
            // Remove all instances of product (backward compatibility)
            selectedPackage = selectedPackage.filter(p => p.id !== productId);
        }
        updatePackageSummary();
    }
    
    // Update package summary
    function updatePackageSummary() {
        const packageItems = document.getElementById('packageItems');
        if (!packageItems) return;
        
        if (selectedPackage.length === 0) {
            packageItems.innerHTML = '<p data-i18n="js.noItemsPackage" style="color: #6b7280; text-align: center; padding: 1rem;">' + t('js.noItemsPackage') + '</p>';
            updateTotals();
            return;
        }
        
        packageItems.innerHTML = selectedPackage.map((product, index) => {
            const orientation = product.selectedOrientation || 'main';
            let orientationText = '';
            if (orientation === 'right') {
                orientationText = '<span class="orientation-badge">' + t('js.orientationRight') + '</span>';
            } else if (orientation === 'left') {
                orientationText = '<span class="orientation-badge">' + t('js.orientationLeft') + '</span>';
            }
            
            const quantity = product.quantity || 1;
            const quantityText = quantity > 1 ? ` (${quantity}x)` : '';
            
            return `
                <div class="package-item">
                    <div class="package-item-info">
                        <h4>${product.name}${quantityText} ${orientationText}</h4>
                        <p>${product.category}</p>
                    </div>
                    <button class="remove-item-btn" data-product-id="${product.id}" data-orientation="${orientation}" data-index="${index}">×</button>
                </div>
            `;
        }).join('');
        
        // Add remove button listeners
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.dataset.productId);
                const orientation = this.dataset.orientation || null;
                const index = this.dataset.index !== undefined ? parseInt(this.dataset.index) : null;
                removeFromPackage(productId, orientation, index);
            });
        });
        
        updateTotals();
    }
    
    // Update totals
    function updateTotals() {
        const totalStartupBase = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.startupCost || 0) * quantity);
        }, 0);
        const logisticsFee = 3000; // Logistics, coordination and handling fee
        // Note: Delivery option price is added when showing package review, not in sidebar summary
        const totalStartup = totalStartupBase + logisticsFee;
        
        const totalMonth1to4 = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month1to4 || 0) * quantity);
        }, 0);
        const totalMonth5to12 = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month5to12 || 0) * quantity);
        }, 0);
        const totalMonth13plus = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month13plus || 0) * quantity);
        }, 0);
        
        document.getElementById('totalStartup').textContent = `${totalStartup.toFixed(2)} DKK`;
        document.getElementById('totalMonth1to4').textContent = `${totalMonth1to4.toFixed(2)} DKK`;
        document.getElementById('totalMonth5to12').textContent = `${totalMonth5to12.toFixed(2)} DKK`;
        document.getElementById('totalMonth13plus').textContent = `${totalMonth13plus.toFixed(2)} DKK`;
    }

    // Initialize package summary
    updatePackageSummary();
    
    // Logistics fee info toggle
    const logisticsFeeToggle = document.getElementById('logisticsFeeToggle');
    const logisticsFeeContent = document.getElementById('logisticsFeeContent');
    
    if (logisticsFeeToggle && logisticsFeeContent) {
        logisticsFeeToggle.addEventListener('click', function() {
            const isOpen = logisticsFeeContent.style.display !== 'none';
            if (isOpen) {
                logisticsFeeContent.style.display = 'none';
                logisticsFeeToggle.classList.remove('active');
            } else {
                logisticsFeeContent.style.display = 'block';
                logisticsFeeToggle.classList.add('active');
            }
        });
    }
    
    // Package review modal functionality
    const submitPackageBtn = document.getElementById('submitPackageBtn');
    const packageReviewModal = document.getElementById('packageReviewModal');
    const closePackageReviewModalBtn = document.getElementById('closePackageReviewModal');
    const closePackageReviewBtn = document.getElementById('closePackageReviewBtn');
    const submitPackageFromReviewBtn = document.getElementById('submitPackageFromReviewBtn');
    
    // Store selected delivery option
    let selectedDeliveryOption = {
        type: 'setup',
        price: 2000
    };
    
    function renderPackageReviewItems() {
        const packageReviewItems = document.getElementById('packageReviewItems');
        if (!packageReviewItems) return;
        if (activePackageMode === 'ready') {
            packageReviewItems.classList.add('ready-package-mode');
            const formatReadyPackageLine = (product) => {
                const quantity = product.quantity || 1;
                const name = product.name;

                if (quantity <= 1) {
                    return name;
                }

                if (name.startsWith('90x200 seng')) {
                    const pluralized = name.replace('90x200 seng', '90x200 senge');
                    return `${quantity} x ${pluralized}`;
                }

                const pluralMap = {
                    'Matchende spisebordsstol': 'matchende spisebordsstole',
                    'Pude-/dynesæt': 'pude-/dynesæt',
                    'Sidebord': 'sideborde',
                    'Sengebordslampe': 'sengebordslamper',
                    'Belysningstype': 'belysningstyper'
                };

                if (pluralMap[name]) {
                    return `${quantity} ${pluralMap[name]}`;
                }

                return `${quantity} ${name}`;
            };

            const listItems = selectedPackage.map((product) => (
                `<li>${formatReadyPackageLine(product)}</li>`
            )).join('');

            packageReviewItems.innerHTML = `
                <div class="ready-package-summary">
                    <div class="ready-package-summary-note">${t('js.review.readyNote')}</div>
                    <div class="ready-package-summary-image">
                        <img src="ProduktB/ReadyP.jpg" alt="${t('js.review.readyImgAlt')}">
                    </div>
                    <ul class="ready-package-summary-list">
                        ${listItems}
                    </ul>
                </div>
            `;
            return;
        }

        packageReviewItems.classList.remove('ready-package-mode');
        packageReviewItems.innerHTML = selectedPackage.map((product) => {
            const orientation = product.selectedOrientation || 'main';
            const quantity = product.quantity || 1;

            let imageToShow = product.imageUrl;
            if (orientation === 'right' && product.rightOrientedImage) {
                imageToShow = product.rightOrientedImage;
            } else if (orientation === 'left' && product.leftOrientedImage) {
                imageToShow = product.leftOrientedImage;
            }

            return `
                <div class="package-review-item">
                    <div class="package-review-item-image">
                        <img src="${imageToShow}" alt="${product.name}">
                        ${quantity > 1 ? `<span class="package-review-quantity">${quantity}x</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Show package review modal
    function showPackageReviewModal() {
        if (selectedPackage.length === 0) {
            alert(t('js.packageEmpty'));
            return;
        }

        renderPackageReviewItems();

        const deliveryOptions = document.querySelector('.delivery-options');
        const extraRoomOptions = document.querySelector('.extra-room-options');

        if (activePackageMode === 'ready') {
            if (deliveryOptions) deliveryOptions.style.display = 'none';
            if (extraRoomOptions) extraRoomOptions.style.display = 'block';
            document.querySelectorAll('.extra-room-option-btn').forEach(btn => {
                btn.classList.remove('active');
                if ((btn.dataset.extraRoom === 'yes') === extraRoomSelected) {
                    btn.classList.add('active');
                }
            });
        } else {
            if (deliveryOptions) deliveryOptions.style.display = 'block';
            if (extraRoomOptions) extraRoomOptions.style.display = 'none';
            const deliveryButtons = document.querySelectorAll('.delivery-option-btn');
            deliveryButtons.forEach(btn => {
                if (btn.classList.contains('extra-room-option-btn')) return;
                btn.classList.remove('active');
                if (btn.dataset.delivery === selectedDeliveryOption.type) {
                    btn.classList.add('active');
                }
            });
        }
        
        // Update totals with current selection
        updatePackageReviewTotals();
        
        if (packageReviewModal) {
            packageReviewModal.style.display = 'flex';
        }
    }
    
    // Update package review totals including delivery option
    function updatePackageReviewTotals() {
        const packageReviewTotals = document.getElementById('packageReviewTotals');
        if (!packageReviewTotals) return;

        if (activePackageMode === 'ready' && readyPackagePricing) {
            const extraRoomMonthly = extraRoomSelected ? 1250 : 0;
            const monthlyTotal = readyPackagePricing.monthly + extraRoomMonthly;

            packageReviewTotals.innerHTML = `
                <div class="package-review-total-section">
                    <h3>${t('js.total')}</h3>
                    <div class="review-total-row">
                        <span>${t('js.review.setupLogistics')}</span>
                        <span>${readyPackagePricing.startup.toFixed(2)} DKK</span>
                    </div>
                    <div class="review-total-row">
                        <span>${t('js.review.month14')}</span>
                        <span>${monthlyTotal.toFixed(2)} DKK</span>
                    </div>
                    <div class="review-total-row">
                        <span>${t('js.review.month512')}</span>
                        <span>${monthlyTotal.toFixed(2)} DKK</span>
                    </div>
                    <div class="review-total-row">
                        <span>${t('js.review.month13')}</span>
                        <span>${monthlyTotal.toFixed(2)} DKK</span>
                    </div>
                    <div class="review-total-row">
                        <span>${t('js.review.removal')}</span>
                        <span>${readyPackagePricing.removal.toFixed(2)} DKK</span>
                    </div>
                </div>
            `;
            return;
        }

        // Calculate base totals from products
        const totalStartupBase = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.startupCost || 0) * quantity);
        }, 0);
        const totalMonth1to4 = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month1to4 || 0) * quantity);
        }, 0);
        const totalMonth5to12 = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month5to12 || 0) * quantity);
        }, 0);
        const totalMonth13plus = selectedPackage.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month13plus || 0) * quantity);
        }, 0);

        // Add delivery option price and logistics fee to startup cost
        const logisticsFee = 3000; // Logistics, coordination and handling fee
        const totalStartup = totalStartupBase + selectedDeliveryOption.price + logisticsFee;

        packageReviewTotals.innerHTML = `
            <div class="package-review-total-section">
                <h3>${t('js.total')}</h3>
                <div class="review-total-row">
                    <span>${t('js.review.startupFull')}</span>
                    <span>${totalStartup.toFixed(2)} DKK</span>
                </div>
                <div class="review-total-row">
                    <span>${t('js.review.month14')}</span>
                    <span>${totalMonth1to4.toFixed(2)} DKK</span>
                </div>
                <div class="review-total-row">
                    <span>${t('js.review.month512')}</span>
                    <span>${totalMonth5to12.toFixed(2)} DKK</span>
                </div>
                <div class="review-total-row">
                    <span>${t('js.review.month13')}</span>
                    <span>${totalMonth13plus.toFixed(2)} DKK</span>
                </div>
            </div>
        `;
    }
    
    // Close package review modal
    function closePackageReviewModal() {
        if (packageReviewModal) {
            packageReviewModal.style.display = 'none';
        }
        
        // Reset to review step
        const reviewStep = document.getElementById('packageReviewStep');
        const formStep = document.getElementById('packageFormStep');
        if (reviewStep) reviewStep.style.display = 'block';
        if (formStep) formStep.style.display = 'none';
        
        // Reset form
        const packageSubmitForm = document.getElementById('packageSubmitForm');
        if (packageSubmitForm) {
            packageSubmitForm.reset();
            updateWeekDisplay(''); // Reset week display
        }
        
        // Reset delivery option to default (setup)
        selectedDeliveryOption = {
            type: 'setup',
            price: 2000
        };

        if (activePackageMode === 'ready') {
            selectedPackage = [...builderSelectedPackage];
            builderSelectedPackage = [];
            readyPackagePricing = null;
            readyPackageId = null;
            extraRoomSelected = false;
            activePackageMode = 'builder';
            updatePackageSummary();
        }
    }
    
    // Submit package from review modal - switch to form step
    function submitPackageFromReview() {
        const reviewStep = document.getElementById('packageReviewStep');
        const formStep = document.getElementById('packageFormStep');
        const packageFormTotals = document.getElementById('packageFormTotals');
        
        if (!reviewStep || !formStep) return;
        
        // Copy totals to form step
        const packageReviewTotals = document.getElementById('packageReviewTotals');
        if (packageReviewTotals && packageFormTotals) {
            packageFormTotals.innerHTML = packageReviewTotals.innerHTML;
        }
        
        // Set minimum date for installation date (2 weeks from today) when switching to form step
        const installationDateInputForForm = document.getElementById('installationDate');
        if (installationDateInputForForm) {
            setInstallationDateMin(installationDateInputForForm);
            installationDateInputForForm.value = ''; // Clear any previous value
            updateWeekDisplay(''); // Reset week display
        }
        
        // Switch to form step
        reviewStep.style.display = 'none';
        formStep.style.display = 'block';
    }
    
    // Go back to review step
    function backToReviewStep() {
        const reviewStep = document.getElementById('packageReviewStep');
        const formStep = document.getElementById('packageFormStep');
        
        if (!reviewStep || !formStep) return;
        
        formStep.style.display = 'none';
        reviewStep.style.display = 'block';
    }
    
    // Final submit package
    async function finalSubmitPackage(formData) {
        // Calculate totals
        let totalStartup = 0;
        let deliveryOption = selectedDeliveryOption;

        if (activePackageMode === 'ready' && readyPackagePricing) {
            totalStartup = readyPackagePricing.startup;
            deliveryOption = {
                type: 'extra-room',
                price: extraRoomSelected ? 1250 : 0
            };
        } else {
            const totalStartupBase = selectedPackage.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.startupCost || 0) * quantity);
            }, 0);
            const logisticsFee = 3000; // Logistics, coordination and handling fee
            totalStartup = totalStartupBase + selectedDeliveryOption.price + logisticsFee;
        }
        
        // Get week number from installation date
        const installationDate = formData.installationDate;
        const weekNumber = installationDate ? getWeekNumber(installationDate) : '';
        
        // Create order object
        const order = {
            id: Date.now(), // Unique ID based on timestamp
            name: formData.fullName,
            address: formData.address,
            installationWeek: weekNumber ? `${t('js.week')} ${weekNumber}` : '',
            installationDate: installationDate,
            firstPayment: totalStartup.toFixed(2),
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            language: (window.LF_i18n && window.LF_i18n.getLang ? window.LF_i18n.getLang() : 'da'),
            products: selectedPackage,
            deliveryOption: deliveryOption,
            packageType: activePackageMode,
            readyPackagePricing: readyPackagePricing,
            extraRoomSelected: extraRoomSelected,
            createdAt: new Date().toISOString()
        };
        
        // Validate order has all required fields (check for empty strings too)
        const hasValidName = order.name && order.name.trim() !== '';
        const hasValidAddress = order.address && order.address.trim() !== '';
        const hasValidEmail = order.email && order.email.trim() !== '';
        const hasValidPhone = order.phoneNumber && order.phoneNumber.trim() !== '';
        
        if (!hasValidName || !hasValidAddress || !hasValidEmail || !hasValidPhone) {
            console.error('Order missing required fields:', {
                hasName: hasValidName,
                hasAddress: hasValidAddress,
                hasEmail: hasValidEmail,
                hasPhoneNumber: hasValidPhone,
                formData: formData,
                order: order
            });
            alert(t('js.orderMissingFields'));
            return;
        }
        
        // Merge with server then append (avoids overwriting Postgres with stale empty local cache)
        let orders = await mergeOrdersWithServer(await fetchOrdersFromServer());
        if (!Array.isArray(orders)) {
            orders = [];
        }
        
        // Ensure order has all required fields with non-empty values
        const validOrder = {
            id: order.id,
            name: order.name.trim(),
            address: order.address.trim(),
            email: order.email.trim(),
            phoneNumber: order.phoneNumber.trim(),
            installationWeek: order.installationWeek || '',
            installationDate: order.installationDate || '',
            firstPayment: order.firstPayment || '0.00',
            language: order.language || 'da',
            products: order.products || [],
            deliveryOption: order.deliveryOption || { type: 'curbside', price: 0 },
            packageType: order.packageType || 'builder',
            readyPackagePricing: order.readyPackagePricing || null,
            extraRoomSelected: order.extraRoomSelected || false,
            createdAt: order.createdAt || new Date().toISOString()
        };
        
        orders.push(validOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        saveOrdersToServer(orders);
        
        console.log('Order saved successfully:', validOrder);
        console.log('Total orders in localStorage:', orders.length);
        
        // Show order confirmation modal
        showOrderConfirmationModal(order);
        sendOrderConfirmationEmail(order);

        const wasReadyPackage = activePackageMode === 'ready';

        // Close package review modal
        closePackageReviewModal();

        // Clear the package for builder flow only
        if (!wasReadyPackage) {
            selectedPackage = [];
            updatePackageSummary();
        }
    }
    
    function calculateOrderTotals(order) {
        let totalStartup = 0;
        let totalMonth1to4 = 0;
        let totalMonth5to12 = 0;
        let totalMonth13plus = 0;

        if (order.packageType === 'ready' && order.readyPackagePricing) {
            const extraRoomMonthly = order.extraRoomSelected ? 1250 : 0;
            totalStartup = order.readyPackagePricing.startup;
            totalMonth1to4 = order.readyPackagePricing.monthly + extraRoomMonthly;
            totalMonth5to12 = order.readyPackagePricing.monthly + extraRoomMonthly;
            totalMonth13plus = order.readyPackagePricing.monthly + extraRoomMonthly;
        } else {
            const totalStartupBase = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.startupCost || 0) * quantity);
            }, 0);
            const deliveryPrice = order.deliveryOption ? order.deliveryOption.price : 0;
            const logisticsFee = 3000; // Logistics, coordination and handling fee
            totalStartup = totalStartupBase + deliveryPrice + logisticsFee;

            totalMonth1to4 = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.month1to4 || 0) * quantity);
            }, 0);

            totalMonth5to12 = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.month5to12 || 0) * quantity);
            }, 0);

            totalMonth13plus = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.month13plus || 0) * quantity);
            }, 0);
        }

        return {
            startup: totalStartup.toFixed(2),
            month1to4: totalMonth1to4.toFixed(2),
            month5to12: totalMonth5to12.toFixed(2),
            month13plus: totalMonth13plus.toFixed(2)
        };
    }

    async function sendOrderConfirmationEmail(order) {
        if (!order || !order.email) return;

        const totals = calculateOrderTotals(order);

        try {
            const candidates = getBackendApiCandidates();
            const tried = new Set();
            let lastError = null;

            for (const baseUrl of candidates) {
                if (tried.has(baseUrl)) continue;
                tried.add(baseUrl);

                try {
                    const response = await fetch(`${baseUrl}/send-order-confirmation`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order, totals })
                    });

                    if (response.ok) {
                        return;
                    }

                    const error = await response.json().catch(() => ({}));
                    lastError = error;
                    console.error('Order confirmation email failed:', error);
                } catch (error) {
                    lastError = error;
                    console.error('Order confirmation email error:', error);
                }
            }

            const detail = lastError && lastError.detail ? '\n' + lastError.detail : '';
            alert(t('js.orderEmailFail') + detail);
        } catch (error) {
            console.error('Order confirmation email error:', error);
            alert(t('js.orderEmailFailServer'));
        }
    }

    // Show order confirmation modal
    function showOrderConfirmationModal(order) {
        const modal = document.getElementById('orderConfirmationModal');
        if (!modal) return;

        lastConfirmationOrder = order;
        
        // Set order number (same format as in admin panel)
        const orderNumberEl = document.getElementById('confirmationOrderNumber');
        if (orderNumberEl) {
            orderNumberEl.textContent = `#${order.id}`;
        }
        
        // Set customer information
        document.getElementById('confirmationCustomerName').textContent = order.name || t('js.na');
        document.getElementById('confirmationCustomerEmail').textContent = order.email || t('js.na');
        document.getElementById('confirmationCustomerPhone').textContent = order.phoneNumber || t('js.na');
        document.getElementById('confirmationCustomerAddress').textContent = order.address || t('js.na');
        document.getElementById('confirmationInstallationWeek').textContent = order.installationWeek || t('js.confirm.notSpecified');
        
        // Set delivery option / extra room
        const deliveryOptionEl = document.getElementById('confirmationDeliveryOption');
        if (deliveryOptionEl) {
            if (order.packageType === 'ready') {
                deliveryOptionEl.textContent = order.extraRoomSelected
                    ? t('js.confirm.extraRoom')
                    : t('js.confirm.noExtraRoom');
            } else if (order.deliveryOption && order.deliveryOption.type === 'setup') {
                deliveryOptionEl.textContent = t('js.confirm.setup');
            } else {
                deliveryOptionEl.textContent = t('js.confirm.curbside');
            }
        }
        
        // Set order items
        const orderItemsEl = document.getElementById('confirmationOrderItems');
        if (orderItemsEl && order.products) {
            orderItemsEl.innerHTML = order.products.map(product => {
                const quantity = product.quantity || 1;
                const imageUrl = product.selectedOrientation === 'right' && product.rightOrientedImage 
                    ? product.rightOrientedImage 
                    : product.selectedOrientation === 'left' && product.leftOrientedImage
                    ? product.leftOrientedImage
                    : product.imageUrl;
                
                const orientationText = product.selectedOrientation === 'right' ? ' ' + t('js.orientationRightShort') :
                    product.selectedOrientation === 'left' ? ' ' + t('js.orientationLeftShort') : '';
                
                return `
                    <div class="confirmation-order-item">
                        <div class="confirmation-order-item-image">
                            <img src="${imageUrl}" alt="${product.name}">
                        </div>
                        <div class="confirmation-order-item-info">
                            <div class="confirmation-order-item-name">${product.name}${orientationText}</div>
                            <div class="confirmation-order-item-details">${t('js.sku')}: ${product.sku || t('js.na')}</div>
                        </div>
                        <div class="confirmation-order-item-quantity">x${quantity}</div>
                    </div>
                `;
            }).join('');
        }
        
        // Calculate and set pricing
        const totals = calculateOrderTotals(order);
        document.getElementById('confirmationStartupCost').textContent = `${totals.startup} DKK`;
        document.getElementById('confirmationMonth1to4').textContent = `${totals.month1to4} DKK`;
        document.getElementById('confirmationMonth5to12').textContent = `${totals.month5to12} DKK`;
        document.getElementById('confirmationMonth13plus').textContent = `${totals.month13plus} DKK`;
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    // Close order confirmation modal
    function closeOrderConfirmationModal() {
        const modal = document.getElementById('orderConfirmationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Event listeners for order confirmation modal
    const closeOrderConfirmationModalBtn = document.getElementById('closeOrderConfirmationModal');
    const closeConfirmationBtn = document.getElementById('closeConfirmationBtn');
    const orderConfirmationModal = document.getElementById('orderConfirmationModal');
    
    if (closeOrderConfirmationModalBtn) {
        closeOrderConfirmationModalBtn.addEventListener('click', closeOrderConfirmationModal);
    }
    
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', closeOrderConfirmationModal);
    }
    
    if (orderConfirmationModal) {
        orderConfirmationModal.addEventListener('click', function(e) {
            if (e.target === orderConfirmationModal) {
                closeOrderConfirmationModal();
            }
        });
    }
    
    // Event listeners
    if (submitPackageBtn) {
        submitPackageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showPackageReviewModal();
        });
    }
    
    if (closePackageReviewModalBtn) {
        closePackageReviewModalBtn.addEventListener('click', closePackageReviewModal);
    }
    
    if (closePackageReviewBtn) {
        closePackageReviewBtn.addEventListener('click', closePackageReviewModal);
    }
    
    if (submitPackageFromReviewBtn) {
        submitPackageFromReviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            submitPackageFromReview();
        });
    }
    
    // Back to review button
    const backToReviewBtn = document.getElementById('backToReviewBtn');
    if (backToReviewBtn) {
        backToReviewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            backToReviewStep();
        });
    }
    
    // Function to set minimum date for installation date input
    function setInstallationDateMin(inputElement) {
        if (!inputElement) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 14); // 2 weeks from now
        minDate.setHours(0, 0, 0, 0);
        
        // Format date as YYYY-MM-DD (use local date)
        const year = minDate.getFullYear();
        const month = String(minDate.getMonth() + 1).padStart(2, '0');
        const day = String(minDate.getDate()).padStart(2, '0');
        const minDateString = `${year}-${month}-${day}`;
        
        inputElement.setAttribute('min', minDateString);
        return minDateString;
    }
    
    // Set minimum date (2 weeks from now) on page load
    const installationDateInput = document.getElementById('installationDate');
    if (installationDateInput) {
        setInstallationDateMin(installationDateInput);
        
        // Calculate and display week number when date changes
        installationDateInput.addEventListener('change', function() {
            updateWeekDisplay(this.value);
            
            // Validate that selected date is at least 14 days from today
            if (this.value) {
                const selectedDate = new Date(this.value + 'T12:00:00');
                selectedDate.setHours(0, 0, 0, 0);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const minAllowedDate = new Date(today);
                minAllowedDate.setDate(today.getDate() + 14);
                minAllowedDate.setHours(0, 0, 0, 0);
                
                if (selectedDate < minAllowedDate) {
                    alert(t('js.installDateMin'));
                    this.value = '';
                    updateWeekDisplay('');
                    setInstallationDateMin(this); // Re-set min date
                }
            }
        });
    }
    
    // Function to get week number of year (ISO 8601 standard)
    function getWeekNumber(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString + 'T12:00:00'); // Add time to avoid timezone issues
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7); // Get to Thursday of the week
        const week1 = new Date(date.getFullYear(), 0, 4); // Week 1 is the week with Jan 4th
        week1.setDate(week1.getDate() + 3 - (week1.getDay() + 6) % 7);
        return 1 + Math.round(((date - week1) / 86400000) / 7);
    }
    
    // Update week display
    function updateWeekDisplay(dateString) {
        const weekDisplay = document.getElementById('weekNumber');
        if (weekDisplay && dateString) {
            const weekNumber = getWeekNumber(dateString);
            weekDisplay.textContent = `${t('js.week')} ${weekNumber}`;
        } else if (weekDisplay) {
            weekDisplay.textContent = '';
        }
    }
    
    // Final submit form
    const packageSubmitForm = document.getElementById('packageSubmitForm');
    if (packageSubmitForm) {
        packageSubmitForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate installation date is at least 14 days from today
            const installationDateInput = document.getElementById('installationDate');
            if (installationDateInput && installationDateInput.value) {
                const selectedDate = new Date(installationDateInput.value);
                selectedDate.setHours(0, 0, 0, 0);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const minDate = new Date(today);
                minDate.setDate(today.getDate() + 14);
                minDate.setHours(0, 0, 0, 0);
                
                if (selectedDate < minDate) {
                    alert(t('js.installDateMin'));
                    return;
                }
            }
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                installationDate: document.getElementById('installationDate').value,
                deliveryOption: selectedDeliveryOption
            };
            
            await finalSubmitPackage(formData);
        });
    }
    
    // Close modal when clicking outside
    if (packageReviewModal) {
        packageReviewModal.addEventListener('click', function(e) {
            if (e.target === packageReviewModal) {
                closePackageReviewModal();
            }
        });
    }
    
    // Initialize delivery option / extra room buttons
    document.addEventListener('click', function(e) {
        const extraRoomBtn = e.target.closest('.extra-room-option-btn');
        if (extraRoomBtn) {
            extraRoomSelected = extraRoomBtn.dataset.extraRoom === 'yes';
            applyExtraRoomSelection();
            renderPackageReviewItems();
            document.querySelectorAll('.extra-room-option-btn').forEach(b => {
                b.classList.remove('active');
            });
            extraRoomBtn.classList.add('active');
            updatePackageReviewTotals();
            return;
        }

        const deliveryBtn = e.target.closest('.delivery-option-btn');
        if (deliveryBtn && !deliveryBtn.classList.contains('extra-room-option-btn')) {
            const deliveryType = deliveryBtn.dataset.delivery;
            const deliveryPrice = parseFloat(deliveryBtn.dataset.price) || 0;

            // Update selected delivery option
            selectedDeliveryOption = {
                type: deliveryType,
                price: deliveryPrice
            };

            // Update button states
            document.querySelectorAll('.delivery-option-btn').forEach(b => {
                if (!b.classList.contains('extra-room-option-btn')) {
                    b.classList.remove('active');
                }
            });
            deliveryBtn.classList.add('active');

            // Update totals
            updatePackageReviewTotals();
        }
    });

    // Send Floor Plan functionality
    const floorPlanForm = document.getElementById('floorPlanForm');
    const floorPlanImageInput = document.getElementById('floorPlanImage');
    const floorPlanDropZone = document.getElementById('floorPlanDropZone');
    const floorPlanPreview = document.getElementById('floorPlanPreview');
    const floorPlanPreviewImg = document.getElementById('floorPlanPreviewImg');
    const removeFloorPlanImageBtn = document.getElementById('removeFloorPlanImage');
    const browseLink = floorPlanDropZone ? floorPlanDropZone.querySelector('.browse-link') : null;
    let selectedFloorPlanFile = null;

    // Handle file input change
    if (floorPlanImageInput) {
        floorPlanImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleFloorPlanFileSelect(file);
            }
        });
    }

    // Handle browse link click
    if (browseLink) {
        browseLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (floorPlanImageInput) {
                floorPlanImageInput.click();
            }
        });
    }

    // Handle drop zone click
    if (floorPlanDropZone) {
        floorPlanDropZone.addEventListener('click', function(e) {
            if (e.target === floorPlanDropZone || e.target.closest('.drop-zone')) {
                if (floorPlanImageInput && !floorPlanPreview.style.display || floorPlanPreview.style.display === 'none') {
                    floorPlanImageInput.click();
                }
            }
        });

        // Handle drag and drop
        floorPlanDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            floorPlanDropZone.classList.add('drag-over');
        });

        floorPlanDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            floorPlanDropZone.classList.remove('drag-over');
        });

        floorPlanDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            floorPlanDropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFloorPlanFileSelect(files[0]);
            }
        });
    }

    // Handle file selection
    function handleFloorPlanFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert(t('js.pickImageFile'));
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert(t('js.imageTooLarge'));
            return;
        }

        selectedFloorPlanFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            floorPlanPreviewImg.src = e.target.result;
            floorPlanDropZone.style.display = 'none';
            floorPlanPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Handle remove image
    if (removeFloorPlanImageBtn) {
        removeFloorPlanImageBtn.addEventListener('click', function() {
            selectedFloorPlanFile = null;
            floorPlanDropZone.style.display = 'block';
            floorPlanPreview.style.display = 'none';
            floorPlanPreviewImg.src = '';
            if (floorPlanImageInput) floorPlanImageInput.value = '';
        });
    }

    // Handle form submission
    async function sendFloorPlanConfirmation(formData, imageBase64, imageFilename) {
        const candidates = getBackendApiCandidates();
        let lastError = null;

        for (const baseUrl of candidates) {
            try {
                const response = await fetch(`${baseUrl}/send-floor-plan-confirmation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        notes: formData.notes || '',
                        imageBase64: imageBase64 || '',
                        imageFilename: imageFilename || ''
                    })
                });

                if (response.ok) {
                    return true;
                }

                const error = await response.json().catch(() => ({}));
                lastError = error;
                console.error('Floor plan confirmation failed:', error);
            } catch (error) {
                lastError = error;
                console.error('Floor plan confirmation error:', error);
            }
        }

        const detail = lastError && lastError.detail ? '\n' + lastError.detail : '';
        alert(t('js.floorConfirmFail') + detail);
        return false;
    }

    if (floorPlanForm) {
        floorPlanForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate image
            if (!selectedFloorPlanFile) {
                alert(t('js.floorUploadImage'));
                return;
            }

            // Get form data
            const formData = {
                name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                phone: document.getElementById('customerPhone').value,
                address: document.getElementById('customerAddress').value,
                notes: document.getElementById('additionalNotes').value,
                image: selectedFloorPlanFile
            };

            const reader = new FileReader();
            reader.onload = async function(loadEvent) {
                const imageBase64 = loadEvent.target.result;
                const imageFilename = selectedFloorPlanFile ? selectedFloorPlanFile.name : 'plantegning';
                const wasSent = await sendFloorPlanConfirmation(formData, imageBase64, imageFilename);
                if (!wasSent) {
                    return;
                }

                alert(t('js.floorThanks'));

                // Reset form
                floorPlanForm.reset();
                selectedFloorPlanFile = null;
                floorPlanDropZone.style.display = 'block';
                floorPlanPreview.style.display = 'none';
                floorPlanPreviewImg.src = '';
            };
            reader.readAsDataURL(selectedFloorPlanFile);
        });
    }

    // Cancel Subscription functionality
    const cancelSearchForm = document.getElementById('cancelSearchForm');
    const orderSearchError = document.getElementById('orderSearchError');
    const orderFoundSection = document.getElementById('orderFoundSection');
    const cancelSubscriptionBtn = document.getElementById('cancelSubscriptionBtn');
    let foundOrder = null;

    // Handle order search
    if (cancelSearchForm) {
        cancelSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const orderNumber = document.getElementById('orderNumberSearch').value.trim();
            const orderName = document.getElementById('orderNameSearch').value.trim();
            
            // Validate inputs
            if (!orderNumber || !orderName) {
                showOrderSearchError(t('js.cancelEnterBoth'));
                return;
            }
            
            const orders = await mergeOrdersWithServer(await fetchOrdersFromServer());
            const completedOrdersList = await mergeCompletedOrdersWithServer(await fetchCompletedOrdersFromServer());
            
            const combined = orders.concat(completedOrdersList);
            
            // Find order by number and name (case-insensitive name comparison)
            const orderNumberInt = parseInt(orderNumber, 10);
            foundOrder = combined.find(order => {
                const orderIdMatch = order.id === orderNumberInt || order.id.toString() === orderNumber;
                const nameMatch = order.name && order.name.trim().toLowerCase() === orderName.toLowerCase();
                return orderIdMatch && nameMatch;
            });
            
            if (foundOrder) {
                // Show order details
                displayFoundOrder(foundOrder);
                hideOrderSearchError();
            } else {
                // Show error
                showOrderSearchError(t('js.cancelNotFound'));
                hideFoundOrder();
            }
        });
    }
    
    // Display found order
    function displayFoundOrder(order) {
        document.getElementById('foundOrderNumber').textContent = `#${order.id}`;
        document.getElementById('foundOrderName').textContent = order.name || t('js.na');
        document.getElementById('foundOrderAddress').textContent = order.address || t('js.na');
        
        // Display products
        const productsContainer = document.getElementById('foundOrderProducts');
        if (productsContainer && order.products && order.products.length > 0) {
            productsContainer.innerHTML = order.products.map(product => {
                const quantity = product.quantity || 1;
                const imageUrl = product.selectedOrientation === 'right' && product.rightOrientedImage 
                    ? product.rightOrientedImage 
                    : product.selectedOrientation === 'left' && product.leftOrientedImage
                    ? product.leftOrientedImage
                    : product.imageUrl;
                
                return `
                    <div class="found-order-product-item">
                        <img src="${imageUrl}" alt="${product.name}" class="found-order-product-image">
                        <span class="found-order-product-quantity">x${quantity}</span>
                    </div>
                `;
            }).join('');
        } else if (productsContainer) {
            productsContainer.innerHTML = '<p data-i18n="js.cancelNoProducts" style="color: #6b7280; font-size: 0.875rem;">' + t('js.cancelNoProducts') + '</p>';
        }
        
        orderFoundSection.style.display = 'block';
        
        // Scroll to found order section
        orderFoundSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Hide found order section
    function hideFoundOrder() {
        orderFoundSection.style.display = 'none';
        foundOrder = null;
    }
    
    // Show error message
    function showOrderSearchError(message) {
        if (orderSearchError) {
            orderSearchError.textContent = message;
            orderSearchError.style.display = 'block';
        }
    }
    
    // Hide error message
    function hideOrderSearchError() {
        if (orderSearchError) {
            orderSearchError.style.display = 'none';
        }
    }
    
    // Handle cancel subscription button
    if (cancelSubscriptionBtn) {
        cancelSubscriptionBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!foundOrder) {
                alert(t('js.cancelSearchFirst'));
                return;
            }
            
            // Confirm cancellation
            if (confirm(t('js.cancelConfirm'))) {
                await cancelOrderSubscription(foundOrder);
            }
        });
    }
    
    // Cancel order subscription
    async function cancelOrderSubscription(order) {
        let orders = await mergeOrdersWithServer(await fetchOrdersFromServer());
        let completedOrders = await mergeCompletedOrdersWithServer(await fetchCompletedOrdersFromServer());
        
        // Check if order is in completedOrders (means it's been activated)
        const orderInCompleted = completedOrders.find(o => o.id === order.id);
        let newStatus = '';
        let statusMessage = '';
        
        if (orderInCompleted) {
            // Order is in completedOrders - check if it's active
            if (orderInCompleted.status === 'active') {
                // Order is active in Overview - move to Cancelled, Pending Pickup
                newStatus = 'cancelled_pending';
                statusMessage = t('js.statusPending');
                
                // Remove order from completedOrders
                completedOrders = completedOrders.filter(o => o.id !== order.id);
                
                // Update order status and add back to completedOrders
                order.status = newStatus;
                completedOrders.push(order);
            } else {
                // Order is already cancelled, just update it
                newStatus = orderInCompleted.status;
                statusMessage = newStatus === 'cancelled_pending' ? t('js.statusPending') : t('js.statusCollected');
                
                // Order is already in the right place, nothing to do
                // But we'll refresh it to ensure consistency
                completedOrders = completedOrders.map(o => o.id === order.id ? order : o);
            }
        } else {
            // Order is only in Tasks (orders array) - never been activated
            // Move to Cancelled and Collected
            newStatus = 'cancelled_collected';
            statusMessage = t('js.statusCollected');
            
            // Remove order from active orders (Tasks)
            orders = orders.filter(o => o.id !== order.id);
            
            // Add order to completedOrders with cancelled_collected status
            order.status = newStatus;
            completedOrders.push(order);
        }
        
        // Save back to localStorage and Postgres (via API)
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        await saveOrdersToServer(orders);
        await saveCompletedOrdersToServer(completedOrders);
        
        // Show success message
        alert(t('js.cancelSuccess').replace('{status}', statusMessage));
        
        // Reset form and hide found order
        cancelSearchForm.reset();
        hideFoundOrder();
        hideOrderSearchError();
    }

    window.addEventListener('lf-lang-changed', function() {
        const buildPage = document.getElementById('build-your-own-home-page');
        if (buildPage && buildPage.classList.contains('active') && builderProducts && builderProducts.length > 0) {
            const cat = selectedCategory || builderProducts[0].category;
            displayCategories(builderProducts);
            selectCategory(cat, builderProducts);
        }
        updatePackageSummary();
        const prModal = document.getElementById('packageReviewModal');
        if (prModal && prModal.style.display === 'flex') {
            renderPackageReviewItems();
            updatePackageReviewTotals();
        }
        const inst = document.getElementById('installationDate');
        if (inst && inst.value) {
            updateWeekDisplay(inst.value);
        }
        const ocModal = document.getElementById('orderConfirmationModal');
        if (ocModal && ocModal.style.display === 'flex' && lastConfirmationOrder) {
            showOrderConfirmationModal(lastConfirmationOrder);
        }
        if (orderFoundSection && orderFoundSection.style.display !== 'none' && foundOrder) {
            displayFoundOrder(foundOrder);
        }
    });
});


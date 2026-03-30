// Product storage and management
let products = [];

function getBackendBaseUrl() {
    const meta = document.querySelector('meta[name="backend-base-url"]');
    const fromMeta = meta ? (meta.getAttribute('content') || '').trim() : '';
    if (fromMeta) {
        return fromMeta.replace(/\/+$/, '');
    }
    return window.location.origin;
}

function getProductApiCandidates() {
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

async function fetchOrdersFromServer() {
    const candidates = getProductApiCandidates();
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

async function saveOrdersToServer(orders) {
    const candidates = getProductApiCandidates();
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

async function fetchCompletedOrdersFromServer() {
    const candidates = getProductApiCandidates();
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
    const candidates = getProductApiCandidates();
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

function readProductsFromLocalStorage() {
    const stored = localStorage.getItem('products');
    if (!stored) return [];
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error parsing products from localStorage:', error);
        return [];
    }
}

async function fetchProductsFromServer() {
    const candidates = getProductApiCandidates();
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

async function saveProductsToServer(nextProducts) {
    const candidates = getProductApiCandidates();
    for (const baseUrl of candidates) {
        try {
            const response = await fetch(`${baseUrl}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: nextProducts })
            });
            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.warn('Failed to save products to server:', error);
        }
    }
    return false;
}

// Load products from server (fallback to localStorage)
async function loadProducts() {
    const serverProducts = await fetchProductsFromServer();
    if (serverProducts) {
        if (serverProducts.length === 0) {
            const localProducts = readProductsFromLocalStorage();
            if (localProducts.length > 0) {
                products = localProducts;
                displayProducts();
                await saveProductsToServer(localProducts);
                return;
            }
        }
        products = serverProducts;
        displayProducts();
        return;
    }

    products = readProductsFromLocalStorage();
    displayProducts();
}

// Save products to server (fallback to localStorage)
function saveProducts() {
    try {
        const productsJson = JSON.stringify(products);
        localStorage.setItem('products', productsJson);
        displayProducts();
    } catch (error) {
        console.error('Error saving products to localStorage:', error);
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            alert('Der er ikke nok plads i browserens lager. Prøv at slette nogle gamle produkter eller billeder.');
        } else {
            alert('Der opstod en fejl under gemning af produkter. Prøv igen.');
        }
        throw error;
    }

    saveProductsToServer(products);
}

// Global function to edit product (will be defined in DOMContentLoaded)
let editProduct = null;

// Display products grouped by category
function displayProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">Ingen produkter endnu. Klik + for at tilføje et produkt.</p>';
        return;
    }
    
    // Group products by category
    const grouped = {};
    products.forEach(product => {
        if (!grouped[product.category]) {
            grouped[product.category] = [];
        }
        grouped[product.category].push(product);
    });
    
    // Build HTML
    let html = '';
    Object.keys(grouped).forEach(category => {
        html += `<div class="category-section">
            <h3 class="category-title">${category}</h3>
            <div class="products-grid">`;
        
        grouped[category].forEach(product => {
            const hasOrientation = product.rightOrientedImage || product.leftOrientedImage;
            // Handle image URLs - if it's a reference to ProduktB, use it directly, otherwise use the stored URL
            const mainImageSrc = product.imageUrl;
            const rightImageSrc = product.rightOrientedImage || null;
            const leftImageSrc = product.leftOrientedImage || null;
            
            // Determine initial display: if has orientation images, start with left (or right if no left), hide main
            let initialDisplay = 'main';
            let mainImageDisplay = 'block';
            if (hasOrientation) {
                if (leftImageSrc) {
                    initialDisplay = 'left';
                    mainImageDisplay = 'none';
                } else if (rightImageSrc) {
                    initialDisplay = 'right';
                    mainImageDisplay = 'none';
                }
            }
            
            // Check if product is hidden
            const isHidden = product.hidden === true;
            const borderStyle = isHidden ? '3px solid #fbbf24' : '1px solid #e5e7eb';
            
            html += `
                <div class="product-card" data-product-id="${product.id}" style="cursor: pointer; border: ${borderStyle};">
                    <div class="product-image-container">
                        <div class="product-image" data-product-id="${product.id}">
                            <img src="${mainImageSrc}" alt="${product.name}" class="product-main-image" data-orientation="main" style="display: ${mainImageDisplay};">
                            ${rightImageSrc ? `<img src="${rightImageSrc}" alt="${product.name} - Højreorienteret" class="product-orientation-image" data-orientation="right" style="display: ${initialDisplay === 'right' ? 'block' : 'none'};">` : ''}
                            ${leftImageSrc ? `<img src="${leftImageSrc}" alt="${product.name} - Venstreorienteret" class="product-orientation-image" data-orientation="left" style="display: ${initialDisplay === 'left' ? 'block' : 'none'};">` : ''}
                        </div>
                        ${hasOrientation ? `
                            <button class="image-nav-btn image-nav-left" data-product-id="${product.id}" data-direction="left" aria-label="Venstreorienteret">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <button class="image-nav-btn image-nav-right" data-product-id="${product.id}" data-direction="right" aria-label="Højreorienteret">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                    <div class="product-info">
                        <h4 class="product-name">${product.name}</h4>
                        <div class="product-prices">
                            <div class="price-item">
                                <span class="price-label">Opstart:</span>
                                <span class="price-value">${parseFloat(product.startupCost).toFixed(2)} DKK</span>
                            </div>
                            <div class="price-item">
                                <span class="price-label">Måned 1-4:</span>
                                <span class="price-value">${parseFloat(product.month1to4).toFixed(2)} DKK</span>
                            </div>
                            <div class="price-item">
                                <span class="price-label">Måned 5-12:</span>
                                <span class="price-value">${parseFloat(product.month5to12).toFixed(2)} DKK</span>
                            </div>
                            <div class="price-item">
                                <span class="price-label">Måned 13+:</span>
                                <span class="price-value">${parseFloat(product.month13plus).toFixed(2)} DKK</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    });
    
    container.innerHTML = html;
    
    // Add click handlers to product cards
    const productCards = container.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger edit if clicking on navigation buttons
            if (e.target.closest('.image-nav-btn')) {
                return;
            }
            const productId = parseInt(this.getAttribute('data-product-id'));
            
            // Get current visible orientation
            const productImageContainer = this.querySelector('.product-image');
            let currentOrientation = 'main';
            if (productImageContainer) {
                const visibleImage = productImageContainer.querySelector('img[style*="block"], img:not([style*="none"])');
                if (visibleImage) {
                    currentOrientation = visibleImage.getAttribute('data-orientation') || 'main';
                }
            }
            
            if (editProduct) {
                editProduct(productId, currentOrientation);
            } else {
                console.error('editProduct function not available');
            }
        });
    });
    
    // Add navigation button handlers and initialize visibility
    const navButtons = container.querySelectorAll('.image-nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const productId = parseInt(this.getAttribute('data-product-id'));
            const direction = this.getAttribute('data-direction');
            navigateProductImage(productId, direction);
        });
    });
    
    // Initialize button visibility for products with orientation images
    productCards.forEach(card => {
        const productId = parseInt(card.getAttribute('data-product-id'));
        const product = products.find(p => p.id === productId);
        if (product && (product.rightOrientedImage || product.leftOrientedImage)) {
            const leftBtn = container.querySelector(`.image-nav-left[data-product-id="${productId}"]`);
            const rightBtn = container.querySelector(`.image-nav-right[data-product-id="${productId}"]`);
            
            // Initially show both buttons if both images exist, otherwise show only the relevant one
            if (leftBtn && rightBtn) {
                if (product.leftOrientedImage && product.rightOrientedImage) {
                    // Both exist - show both buttons
                    leftBtn.style.display = 'flex';
                    rightBtn.style.display = 'flex';
                } else if (product.leftOrientedImage) {
                    // Only left exists - show left button
                    leftBtn.style.display = 'flex';
                    rightBtn.style.display = 'none';
                } else if (product.rightOrientedImage) {
                    // Only right exists - show right button
                    leftBtn.style.display = 'none';
                    rightBtn.style.display = 'flex';
                }
            }
        }
    });
}

// Navigate between product images
function navigateProductImage(productId, direction) {
    const productImageContainer = document.querySelector(`.product-image[data-product-id="${productId}"]`);
    if (!productImageContainer) return;
    
    const images = productImageContainer.querySelectorAll('img');
    let currentOrientation = 'main';
    
    // Find current visible image
    images.forEach(img => {
        if (img.style.display !== 'none') {
            currentOrientation = img.getAttribute('data-orientation');
        }
    });
    
    // Determine next orientation
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
    
    // Show/hide images
    images.forEach(img => {
        if (img.getAttribute('data-orientation') === nextOrientation) {
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    });
    
    // Update button visibility
    const product = products.find(p => p.id === productId);
    if (product) {
        const leftBtn = document.querySelector(`.image-nav-left[data-product-id="${productId}"]`);
        const rightBtn = document.querySelector(`.image-nav-right[data-product-id="${productId}"]`);
        const hasLeft = product.leftOrientedImage;
        const hasRight = product.rightOrientedImage;
        
        // Show left button if not on left image (or if left doesn't exist and we're on main)
        if (nextOrientation === 'left') {
            leftBtn.style.display = 'none';
        } else if (nextOrientation === 'main' && !hasLeft) {
            leftBtn.style.display = 'none';
        } else {
            leftBtn.style.display = 'flex';
        }
        
        // Show right button if not on right image (or if right doesn't exist and we're on main)
        if (nextOrientation === 'right') {
            rightBtn.style.display = 'none';
        } else if (nextOrientation === 'main' && !hasRight) {
            rightBtn.style.display = 'none';
        } else {
            rightBtn.style.display = 'flex';
        }
    }
}

// Admin page navigation
document.addEventListener('DOMContentLoaded', function() {
    // Load products on page load
    loadProducts();
    
    const menuItems = document.querySelectorAll('.menu-item');
    const pageContents = document.querySelectorAll('.page-content');
    const pageTitle = document.getElementById('pageTitle');
    const accessMode = new URLSearchParams(window.location.search).get('access');
    const isOverviewOnly = accessMode === 'overview';
    const REFERRALS_STORAGE_KEY = 'referrals';
    
    // Page titles mapping
    const pageTitles = {
        'produkter': 'Produkter',
        'oversigt': 'Oversigt',
        'opgaver': 'Opgaver',
        'referrals': 'Referrals'
    };
    
    // Menu navigation
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all pages
            pageContents.forEach(page => page.classList.remove('active'));
            
            // Show selected page
            const targetPage = this.getAttribute('data-page');
            const targetPageElement = document.getElementById(targetPage);
            if (targetPageElement) {
                targetPageElement.classList.add('active');
            }
            
            // Update page title
            if (pageTitle && pageTitles[targetPage]) {
                pageTitle.textContent = pageTitles[targetPage];
            }
            
            // Reload products if navigating to products page
            if (targetPage === 'produkter') {
                loadProducts();
            }
            
            // Load orders if navigating to opgaver page
            if (targetPage === 'opgaver') {
                loadOrders();
            }
            
            // Load completed orders if navigating to oversigt page
            if (targetPage === 'oversigt') {
                loadCompletedOrders();
            }

            if (targetPage === 'referrals') {
                loadReferrals();
            }
        });
    });

    // Limited access: only show "Oversigt"
    if (isOverviewOnly) {
        const productsMenuItem = document.querySelector('.menu-item[data-page="produkter"]');
        const tasksMenuItem = document.querySelector('.menu-item[data-page="opgaver"]');
        const referralsMenuItem = document.querySelector('.menu-item[data-page="referrals"]');
        if (productsMenuItem) productsMenuItem.style.display = 'none';
        if (tasksMenuItem) tasksMenuItem.style.display = 'none';
        if (referralsMenuItem) referralsMenuItem.style.display = 'none';

        const productsPage = document.getElementById('produkter');
        const tasksPage = document.getElementById('opgaver');
        const referralsPage = document.getElementById('referrals');
        const overviewPage = document.getElementById('oversigt');
        if (productsPage) productsPage.classList.remove('active');
        if (tasksPage) tasksPage.classList.remove('active');
        if (referralsPage) referralsPage.classList.remove('active');
        if (overviewPage) overviewPage.classList.add('active');

        menuItems.forEach(i => i.classList.remove('active'));
        const overviewMenuItem = document.querySelector('.menu-item[data-page="oversigt"]');
        if (overviewMenuItem) overviewMenuItem.classList.add('active');

        if (pageTitle) pageTitle.textContent = pageTitles.oversigt;
        const contactRequestBtn = document.getElementById('contactRequestBtn');
        if (contactRequestBtn) {
            contactRequestBtn.style.display = 'inline-flex';
            contactRequestBtn.addEventListener('click', function() {
                // Placeholder: functionality will be implemented later.
            });
        }
        loadCompletedOrders();
    }

    // Referrals
    function getReferrals() {
        const stored = localStorage.getItem(REFERRALS_STORAGE_KEY);
        if (!stored) return [];
        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error parsing referrals:', error);
            return [];
        }
    }

    function saveReferrals(referrals) {
        localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(referrals));
    }

    function formatMoveInDate(dateString) {
        if (!dateString) return 'Ikke angivet';
        const d = new Date(dateString + 'T00:00:00');
        if (Number.isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('da-DK');
    }

    function loadReferrals() {
        const container = document.getElementById('referralsContainer');
        if (!container) return;

        const referrals = getReferrals();
        referrals.sort((a, b) => {
            const aTime = a.moveInDate ? new Date(a.moveInDate + 'T00:00:00').getTime() : Number.MAX_SAFE_INTEGER;
            const bTime = b.moveInDate ? new Date(b.moveInDate + 'T00:00:00').getTime() : Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
        });

        if (referrals.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 1rem;">Ingen referrals endnu.</p>';
            return;
        }

        container.innerHTML = `
            <div class="referral-list">
                ${referrals.map((ref) => `
                    <div class="referral-item">
                        <div class="referral-item-header">
                            <span class="referral-name">${ref.customerName}</span>
                            <span class="referral-date">Move-in: ${formatMoveInDate(ref.moveInDate)}</span>
                        </div>
                        <div class="referral-meta">
                            <div><strong>Kontakt:</strong> ${ref.contact}</div>
                            <div><strong>Adresse/område:</strong> ${ref.addressArea || 'Ikke angivet'}</div>
                            <div><strong>Type:</strong> ${ref.type || 'Ready-to-go'}</div>
                        </div>
                        ${ref.notes ? `<div class="referral-notes"><strong>Notes:</strong> ${ref.notes}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    const addReferralBtn = document.getElementById('addReferralBtn');
    const referralModal = document.getElementById('referralModal');
    const closeReferralModal = document.getElementById('closeReferralModal');
    const cancelReferralBtn = document.getElementById('cancelReferralBtn');
    const referralForm = document.getElementById('referralForm');

    function closeReferralModalFunc() {
        if (!referralModal) return;
        referralModal.style.display = 'none';
        if (referralForm) referralForm.reset();
    }

    if (addReferralBtn) {
        addReferralBtn.addEventListener('click', function() {
            if (referralModal) referralModal.style.display = 'flex';
        });
    }
    if (closeReferralModal) {
        closeReferralModal.addEventListener('click', closeReferralModalFunc);
    }
    if (cancelReferralBtn) {
        cancelReferralBtn.addEventListener('click', closeReferralModalFunc);
    }
    if (referralModal) {
        referralModal.addEventListener('click', function(e) {
            if (e.target === referralModal) closeReferralModalFunc();
        });
    }
    if (referralForm) {
        referralForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const customerName = document.getElementById('referralCustomerName').value.trim();
            const contact = document.getElementById('referralContact').value.trim();
            if (!customerName || !contact) return;

            const referral = {
                id: Date.now(),
                customerName,
                contact,
                addressArea: document.getElementById('referralAddressArea').value.trim(),
                moveInDate: document.getElementById('referralMoveInDate').value,
                type: document.getElementById('referralType').value,
                notes: document.getElementById('referralNotes').value.trim(),
                createdAt: new Date().toISOString()
            };

            const referrals = getReferrals();
            referrals.push(referral);
            saveReferrals(referrals);
            closeReferralModalFunc();
            loadReferrals();
        });
    }
    
    // Update badge count on page load
    updateOpgaverBadge();
    
    // Check if "Opgaver" page is active on load and load orders if so
    // Also add a listener to check when admin page becomes visible (in case user navigates from order confirmation)
    const opgaverPage = document.getElementById('opgaver');
    if (opgaverPage && opgaverPage.classList.contains('active')) {
        loadOrders();
    }
    
    // Listen for visibility change to reload orders when admin page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Check if we're on the opgaver page
            const currentOpgaverPage = document.getElementById('opgaver');
            if (currentOpgaverPage && currentOpgaverPage.classList.contains('active')) {
                loadOrders();
            }
        }
    });
    
    // Also listen for focus event to reload orders when window regains focus
    window.addEventListener('focus', function() {
        const currentOpgaverPage = document.getElementById('opgaver');
        if (currentOpgaverPage && currentOpgaverPage.classList.contains('active')) {
            loadOrders();
        }
    });
    
    // Listen for storage changes (when orders are saved from other tabs/pages)
    window.addEventListener('storage', function(e) {
        if (e.key === 'orders') {
            console.log('Storage event detected - orders updated');
            const currentOpgaverPage = document.getElementById('opgaver');
            if (currentOpgaverPage && currentOpgaverPage.classList.contains('active')) {
                loadOrders();
            }
            // Also update badge
            updateOpgaverBadge();
        }
    });
    
    // Also check for localStorage changes using a custom event (for same-tab updates)
    // This will be triggered when orders are saved from the same window
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
        originalSetItem.apply(this, [key, value]);
        if (key === 'orders') {
            // Dispatch custom event for same-tab updates
            window.dispatchEvent(new Event('localStorageUpdated'));
        }
    };
    
    window.addEventListener('localStorageUpdated', function() {
        console.log('LocalStorage updated - reloading orders');
        const currentOpgaverPage = document.getElementById('opgaver');
        if (currentOpgaverPage && currentOpgaverPage.classList.contains('active')) {
            loadOrders();
        }
        // Also update badge
        updateOpgaverBadge();
    });

    // Load referrals if page is active on load
    const referralsPage = document.getElementById('referrals');
    if (referralsPage && referralsPage.classList.contains('active')) {
        loadReferrals();
    }
    
    // Load and display orders
    async function loadOrders() {
        const container = document.getElementById('ordersContainer');
        const cancelledPendingTasksContainer = document.getElementById('cancelledPendingTasksContainer');
        const cancelledPendingTasksSection = document.getElementById('cancelledPendingTasksSection');
        
        if (!container) {
            console.log('Orders container not found');
            return;
        }
        
        let orders = [];
        const serverOrders = await fetchOrdersFromServer();
        if (serverOrders) {
            orders = serverOrders;
        } else {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
                console.log('Loaded orders from localStorage:', orders.length);
            } else {
                console.log('No orders found in localStorage');
            }
        }
        
        // Check if there are example orders before filtering
        const hasExamples = orders.some(order => {
            if (!order.name || !order.address || !order.email || !order.phoneNumber) {
                return true;
            }
            const testNames = ['test', 'example', 'eksempel', 'demo', 'sample'];
            const nameLower = (order.name || '').toLowerCase();
            if (testNames.some(test => nameLower.includes(test))) {
                return true;
            }
            return false;
        });
        
        // Show/hide clear examples button
        const clearExamplesBtn = document.getElementById('clearExamplesBtn');
        if (clearExamplesBtn) {
            clearExamplesBtn.style.display = hasExamples ? 'block' : 'none';
        }
        
        // Filter out example/test orders (orders without proper customer info or with test data)
        const originalCount = orders.length;
        console.log('Total orders before filtering:', originalCount);
        orders = orders.filter(order => {
            // Keep only orders with valid customer information
            // Check if fields are present and not empty strings
            const hasName = order.name && order.name.trim() !== '';
            const hasAddress = order.address && order.address.trim() !== '';
            const hasEmail = order.email && order.email.trim() !== '';
            const hasPhoneNumber = order.phoneNumber && order.phoneNumber.trim() !== '';
            
            if (!hasName || !hasAddress || !hasEmail || !hasPhoneNumber) {
                console.log('Order filtered out - missing fields:', {
                    id: order.id,
                    hasName: hasName,
                    hasAddress: hasAddress,
                    hasEmail: hasEmail,
                    hasPhoneNumber: hasPhoneNumber,
                    order: order
                });
                return false;
            }
            // Filter out obvious test data
            const testNames = ['test', 'example', 'eksempel', 'demo', 'sample'];
            const nameLower = (order.name || '').toLowerCase();
            if (testNames.some(test => nameLower.includes(test))) {
                console.log('Order filtered out - test data:', order.id, order.name);
                return false;
            }
            return true;
        });
        
        console.log('Orders after filtering:', orders.length, 'out of', originalCount);
        if (orders.length > 0) {
            console.log('Orders that passed filter:', orders.map(o => ({ id: o.id, name: o.name })));
        }
        
        // Save filtered orders back to localStorage if any were removed
        if (orders.length !== originalCount) {
            localStorage.setItem('orders', JSON.stringify(orders));
            saveOrdersToServer(orders);
        }
        
        // Get filter value
        const filterSelect = document.getElementById('orderFilter');
        const filterValue = filterSelect ? filterSelect.value : 'upcoming';
        
        // Apply filter based on selected option
        if (filterValue === 'setup') {
            orders = orders.filter(order => {
                return order.deliveryOption && order.deliveryOption.type === 'setup';
            });
        } else if (filterValue === 'curbside') {
            orders = orders.filter(order => {
                return !order.deliveryOption || order.deliveryOption.type === 'curbside';
            });
        }
        
        // Sort orders based on filter
        if (filterValue === 'upcoming') {
            // Sort by installation week (earliest first)
            orders.sort((a, b) => {
                const dateA = a.installationDate ? new Date(a.installationDate) : new Date(a.createdAt);
                const dateB = b.installationDate ? new Date(b.installationDate) : new Date(b.createdAt);
                return dateA - dateB;
            });
        } else {
            // Sort by creation date (newest first) for other filters
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        // Display active orders
        console.log('Displaying orders:', orders.length);
        console.log('All orders data:', orders);
        
        if (orders.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">Ingen ordrer endnu.</p>';
        } else {
            container.innerHTML = orders.map(order => {
                console.log('Rendering order:', order.id, order.name, order);
                // Check if order has delivery and setup
                const hasSetup = order.deliveryOption && order.deliveryOption.type === 'setup';
                const setupClass = hasSetup ? 'order-card-setup' : '';
                
                return `
                    <div class="order-card ${setupClass}" data-order-id="${order.id}" style="cursor: pointer;">
                        <div class="order-header">
                            <div class="order-id">Ordre #${order.id}</div>
                            <div class="order-date">${new Date(order.createdAt).toLocaleDateString('da-DK')}</div>
                        </div>
                        <div class="order-details">
                            <div class="order-detail-row">
                                <span class="order-label">Navn:</span>
                                <span class="order-value">${order.name}</span>
                            </div>
                            <div class="order-detail-row">
                                <span class="order-label">Adresse:</span>
                                <span class="order-value">${order.address}</span>
                            </div>
                            <div class="order-detail-row">
                                <span class="order-label">Ønsket installationsuge:</span>
                                <span class="order-value">${order.installationWeek || 'Ikke angivet'}</span>
                            </div>
                            <div class="order-detail-row">
                                <span class="order-label">Første betaling:</span>
                                <span class="order-value order-price">${order.firstPayment} DKK</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add click event listeners to order cards
            container.querySelectorAll('.order-card').forEach(card => {
                card.addEventListener('click', function() {
                    const orderId = parseInt(this.dataset.orderId);
                    showOrderDetail(orderId);
                });
            });
        }
        
        // Load and display cancelled pending orders from completedOrders
        let cancelledPendingOrders = [];
        const serverCompletedOrders = await fetchCompletedOrdersFromServer();
        if (serverCompletedOrders) {
            cancelledPendingOrders = serverCompletedOrders.filter(order => order.status === 'cancelled_pending');
        } else {
            const storedCompletedOrders = localStorage.getItem('completedOrders');
            if (storedCompletedOrders) {
                const completedOrders = JSON.parse(storedCompletedOrders);
                cancelledPendingOrders = completedOrders.filter(order => order.status === 'cancelled_pending');
            }
        }
        
        // Display cancelled pending orders section
        if (cancelledPendingTasksSection && cancelledPendingTasksContainer) {
            if (cancelledPendingOrders.length === 0) {
                cancelledPendingTasksSection.style.display = 'none';
            } else {
                cancelledPendingTasksSection.style.display = 'block';
                
                cancelledPendingTasksContainer.innerHTML = cancelledPendingOrders.map(order => {
                    // All cancelled pending orders should have red border
                    return `
                        <div class="order-card order-card-cancelled-pending" data-order-id="${order.id}" style="cursor: pointer;">
                            <div class="order-header">
                            <div class="order-id">Ordre #${order.id}</div>
                                <div class="order-date">${new Date(order.createdAt).toLocaleDateString('da-DK')}</div>
                            </div>
                            <div class="order-details">
                                <div class="order-detail-row">
                                    <span class="order-label">Navn:</span>
                                    <span class="order-value">${order.name}</span>
                                </div>
                                <div class="order-detail-row">
                                    <span class="order-label">Adresse:</span>
                                    <span class="order-value">${order.address}</span>
                                </div>
                                <div class="order-detail-row">
                                    <span class="order-label">Ønsket installationsuge:</span>
                                    <span class="order-value">${order.installationWeek || 'Ikke angivet'}</span>
                                </div>
                                <div class="order-detail-row">
                                    <span class="order-label">Første betaling:</span>
                                    <span class="order-value order-price">${order.firstPayment} DKK</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                // Add click event listeners to cancelled pending order cards
                cancelledPendingTasksContainer.querySelectorAll('.order-card').forEach(card => {
                    card.addEventListener('click', function() {
                        const orderId = parseInt(this.dataset.orderId);
                        showOrderDetail(orderId);
                    });
                });
            }
        }
        
        // Update badge count
        updateOpgaverBadge();
    }
    
    // Calculate and update badge count for Opgaver menu item
    async function updateOpgaverBadge() {
        const badge = document.getElementById('opgaverBadge');
        if (!badge) return;
        
        let count = 0;
        
        // Count cancelled pending orders
        const serverCompletedOrders = await fetchCompletedOrdersFromServer();
        if (serverCompletedOrders) {
            const cancelledPendingOrders = serverCompletedOrders.filter(order => order.status === 'cancelled_pending');
            count += cancelledPendingOrders.length;
        } else {
            const storedCompletedOrders = localStorage.getItem('completedOrders');
            if (storedCompletedOrders) {
                const completedOrders = JSON.parse(storedCompletedOrders);
                const cancelledPendingOrders = completedOrders.filter(order => order.status === 'cancelled_pending');
                count += cancelledPendingOrders.length;
            }
        }
        
        // Count orders that need to be completed within 2 weeks
        const serverOrders = await fetchOrdersFromServer();
        if (serverOrders) {
            const orders = serverOrders;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const twoWeeksFromNow = new Date(today);
            twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
            
            const urgentOrders = orders.filter(order => {
                // Filter out example/test orders
                if (!order.name || !order.address || !order.email || !order.phoneNumber) {
                    return false;
                }
                const testNames = ['test', 'example', 'eksempel', 'demo', 'sample'];
                const nameLower = (order.name || '').toLowerCase();
                if (testNames.some(test => nameLower.includes(test))) {
                    return false;
                }
                
                // Check if installation date is within 2 weeks
                if (order.installationDate) {
                    const installationDate = new Date(order.installationDate);
                    installationDate.setHours(0, 0, 0, 0);
                    return installationDate >= today && installationDate <= twoWeeksFromNow;
                }
                return false;
            });
            
            count += urgentOrders.length;
        } else {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
                const orders = JSON.parse(storedOrders);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const twoWeeksFromNow = new Date(today);
                twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

                const urgentOrders = orders.filter(order => {
                    if (!order.name || !order.address || !order.email || !order.phoneNumber) {
                        return false;
                    }
                    const testNames = ['test', 'example', 'eksempel', 'demo', 'sample'];
                    const nameLower = (order.name || '').toLowerCase();
                    if (testNames.some(test => nameLower.includes(test))) {
                        return false;
                    }

                    if (order.installationDate) {
                        const installationDate = new Date(order.installationDate);
                        installationDate.setHours(0, 0, 0, 0);
                        return installationDate >= today && installationDate <= twoWeeksFromNow;
                    }
                    return false;
                });

                count += urgentOrders.length;
            }
        }
        
        // Update badge
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Clear example orders
    async function clearExampleOrders() {
        let orders = [];
        const serverOrders = await fetchOrdersFromServer();
        if (serverOrders) {
            orders = serverOrders;
        } else {
            const storedOrders = localStorage.getItem('orders');
            if (!storedOrders) return;
            orders = JSON.parse(storedOrders);
        }
        const originalCount = orders.length;
        
        // Filter out example/test orders
        orders = orders.filter(order => {
            // Keep only orders with valid customer information
            if (!order.name || !order.address || !order.email || !order.phoneNumber) {
                return false;
            }
            // Filter out obvious test data
            const testNames = ['test', 'example', 'eksempel', 'demo', 'sample'];
            const nameLower = (order.name || '').toLowerCase();
            if (testNames.some(test => nameLower.includes(test))) {
                return false;
            }
            return true;
        });
        
        // Save filtered orders
        localStorage.setItem('orders', JSON.stringify(orders));
        saveOrdersToServer(orders);
        
        // Reload orders display
        loadOrders();
        
        const removedCount = originalCount - orders.length;
        if (removedCount > 0) {
            alert(`${removedCount} eksempelordre er blevet fjernet.`);
        } else {
            alert('Ingen eksempelordrer fundet.');
        }
    }
    
    // Show order detail modal
    async function showOrderDetail(orderId) {
        // Check both orders and completedOrders
        let order = null;
        let isFromOrders = false;
        let isCancelledPending = false;

        const serverOrders = await fetchOrdersFromServer();
        if (serverOrders) {
            order = serverOrders.find(o => o.id === orderId);
            if (order) {
                isFromOrders = true;
            }
        } else {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
                const orders = JSON.parse(storedOrders);
                order = orders.find(o => o.id === orderId);
                if (order) {
                    isFromOrders = true;
                }
            }
        }

        if (!order) {
            const serverCompletedOrders = await fetchCompletedOrdersFromServer();
            if (serverCompletedOrders) {
                order = serverCompletedOrders.find(o => o.id === orderId);
                if (order && order.status === 'cancelled_pending') {
                    isCancelledPending = true;
                }
            } else {
                const storedCompletedOrders = localStorage.getItem('completedOrders');
                if (storedCompletedOrders) {
                    const completedOrders = JSON.parse(storedCompletedOrders);
                    order = completedOrders.find(o => o.id === orderId);
                    if (order && order.status === 'cancelled_pending') {
                        isCancelledPending = true;
                    }
                }
            }
        }
        
        if (!order) return;
        
        const modal = document.getElementById('orderDetailModal');
        if (!modal) return;
        
        // Set installation week
        const installationWeekEl = document.getElementById('orderInstallationWeek');
        if (installationWeekEl) {
            installationWeekEl.textContent = order.installationWeek || 'Ikke angivet';
        }
        
        // Set delivery type
        const deliveryTypeEl = document.getElementById('orderDeliveryType');
        if (deliveryTypeEl) {
            if (order.deliveryOption && order.deliveryOption.type === 'setup') {
                deliveryTypeEl.textContent = 'Levering og opsætning - 2.000 DKK';
            } else {
                deliveryTypeEl.textContent = 'Kantstenslevering - 0 DKK';
            }
        }
        
        // Set buttons based on whether order is from "Opgaver" or "Oversigt"
        const orderActions = document.getElementById('orderActions');
        if (orderActions) {
            if (isFromOrders || isCancelledPending) {
                // Order is from "Opgaver" (active or cancelled pending) - show single "Complete" button for active, or one button for cancelled pending
                if (isCancelledPending) {
                    // Order is cancelled pending - show button to move to collected
                    const cancelCollectedBtn = document.createElement('button');
                    cancelCollectedBtn.type = 'button';
                    cancelCollectedBtn.className = 'cancel-order-btn cancel-collected-btn';
                    cancelCollectedBtn.id = 'cancelCollectedBtn';
                    cancelCollectedBtn.textContent = 'Annulleret og afhentet';
                    cancelCollectedBtn.dataset.orderId = order.id;
                    
                    orderActions.innerHTML = '';
                    orderActions.appendChild(cancelCollectedBtn);
                } else {
                    // Order is active - show single "Complete" button
                    const completeOrderBtn = document.createElement('button');
                    completeOrderBtn.type = 'button';
                    completeOrderBtn.className = 'complete-order-btn';
                    completeOrderBtn.id = 'completeOrderBtn';
                    
                    if (order.deliveryOption && order.deliveryOption.type === 'setup') {
                        completeOrderBtn.textContent = 'Afsluttet - Installeret';
                    } else {
                        completeOrderBtn.textContent = 'Afsluttet - Leveret';
                    }
                    completeOrderBtn.dataset.orderId = order.id;
                    
                    orderActions.innerHTML = '';
                    orderActions.appendChild(completeOrderBtn);
                }
            } else {
                // Order is from "Oversigt" (active or cancelled collected) - show two cancel buttons
                const cancelPendingBtn = document.createElement('button');
                cancelPendingBtn.type = 'button';
                cancelPendingBtn.className = 'cancel-order-btn cancel-pending-btn';
                cancelPendingBtn.id = 'cancelPendingBtn';
                cancelPendingBtn.textContent = 'Annulleret, afventer afhentning';
                cancelPendingBtn.dataset.orderId = order.id;
                
                const cancelCollectedBtn = document.createElement('button');
                cancelCollectedBtn.type = 'button';
                cancelCollectedBtn.className = 'cancel-order-btn cancel-collected-btn';
                cancelCollectedBtn.id = 'cancelCollectedBtn';
                cancelCollectedBtn.textContent = 'Annulleret og afhentet';
                cancelCollectedBtn.dataset.orderId = order.id;
                
                orderActions.innerHTML = '';
                orderActions.appendChild(cancelPendingBtn);
                orderActions.appendChild(cancelCollectedBtn);
            }
        }
        
        // Display all products
        const productsList = document.getElementById('orderProductsList');
        if (productsList && order.products && order.products.length > 0) {
            productsList.innerHTML = order.products.map(product => {
                const orientation = product.selectedOrientation || 'main';
                const quantity = product.quantity || 1;
                let imageToShow = product.imageUrl;
                
                if (orientation === 'right' && product.rightOrientedImage) {
                    imageToShow = product.rightOrientedImage;
                } else if (orientation === 'left' && product.leftOrientedImage) {
                    imageToShow = product.leftOrientedImage;
                }
                
                const orientationText = orientation === 'right' ? ' (Højreorienteret)' : 
                                      orientation === 'left' ? ' (Venstreorienteret)' : '';
                const quantityText = quantity > 1 ? ` x${quantity}` : '';
                
                return `
                    <div class="order-product-item">
                        <div class="order-product-image-container">
                            <img src="${imageToShow}" alt="${product.name}">
                        </div>
                        <div class="order-product-info">
                            <h3>${product.name}${orientationText}${quantityText}</h3>
                            <p>SKU: ${product.sku || 'Ikke angivet'}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else if (productsList) {
            productsList.innerHTML = '<p style="color: #6b7280;">Ingen produkter i denne ordre.</p>';
        }
        
        // Set customer information
        document.getElementById('orderCustomerName').textContent = order.name || 'Ikke angivet';
        document.getElementById('orderCustomerAddress').textContent = order.address || 'Ikke angivet';
        document.getElementById('orderCustomerPhone').textContent = order.phoneNumber || 'Ikke angivet';
        document.getElementById('orderCustomerEmail').textContent = order.email || 'Ikke angivet';
        
        // Calculate and display pricing
        const pricingDetails = document.getElementById('orderPricingDetails');
        if (pricingDetails) {
            const totalStartupBase = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.startupCost || 0) * quantity);
            }, 0);
            const deliveryPrice = order.deliveryOption ? parseFloat(order.deliveryOption.price || 0) : 0;
            const logisticsFee = 3000; // Logistics, coordination and handling fee
            const totalStartup = totalStartupBase + deliveryPrice + logisticsFee;
            
            const totalMonth1to4 = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.month1to4 || 0) * quantity);
            }, 0);
            const totalMonth5to12 = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.month5to12 || 0) * quantity);
            }, 0);
            const totalMonth13plus = order.products.reduce((sum, p) => {
                const quantity = p.quantity || 1;
                return sum + (parseFloat(p.month13plus || 0) * quantity);
            }, 0);
            
            const deliveryOptionText = order.deliveryOption && order.deliveryOption.type === 'setup' 
                ? 'Levering og opsætning' 
                : 'Kantstenslevering';
            
            pricingDetails.innerHTML = `
                <div class="pricing-row">
                    <span class="pricing-label">Opstart (inkl. ${deliveryOptionText} og logistik, koordinering & håndtering):</span>
                    <span class="pricing-value">${totalStartup.toFixed(2)} DKK</span>
                </div>
                <div class="pricing-row">
                    <span class="pricing-label">Måned 1-4:</span>
                    <span class="pricing-value">${totalMonth1to4.toFixed(2)} DKK</span>
                </div>
                <div class="pricing-row">
                    <span class="pricing-label">Måned 5-12:</span>
                    <span class="pricing-value">${totalMonth5to12.toFixed(2)} DKK</span>
                </div>
                <div class="pricing-row">
                    <span class="pricing-label">Måned 13+:</span>
                    <span class="pricing-value">${totalMonth13plus.toFixed(2)} DKK</span>
                </div>
            `;
        }
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    // Close order detail modal
    function closeOrderDetailModal() {
        const modal = document.getElementById('orderDetailModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Complete order - move from Opgaver to Oversigt
    async function completeOrder(orderId) {
        let orders = [];
        let completedOrders = [];
        const serverOrders = await fetchOrdersFromServer();
        const serverCompletedOrders = await fetchCompletedOrdersFromServer();

        if (serverOrders) {
            orders = serverOrders;
        } else {
            const storedOrders = localStorage.getItem('orders');
            if (!storedOrders) return;
            orders = JSON.parse(storedOrders);
        }

        if (serverCompletedOrders) {
            completedOrders = serverCompletedOrders;
        } else {
            const storedCompletedOrders = localStorage.getItem('completedOrders');
            completedOrders = storedCompletedOrders ? JSON.parse(storedCompletedOrders) : [];
        }
        
        // Find the order
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const order = orders[orderIndex];
        
        // Set status to active when moving to completedOrders
        order.status = 'active';
        
        // Remove from orders and add to completedOrders
        orders.splice(orderIndex, 1);
        completedOrders.push(order);
        
        // Save to localStorage and server
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        saveOrdersToServer(orders);
        saveCompletedOrdersToServer(completedOrders);
        
        // Close modal
        closeOrderDetailModal();
        
        // Reload orders if on opgaver page
        const opgaverPage = document.getElementById('opgaver');
        if (opgaverPage && opgaverPage.classList.contains('active')) {
            loadOrders();
        }
        
        // Reload completed orders if on oversigt page
        const oversigtPage = document.getElementById('oversigt');
        if (oversigtPage && oversigtPage.classList.contains('active')) {
            loadCompletedOrders();
        }
        
        // Update badge count
        updateOpgaverBadge();
    }
    
    // Load and display completed orders (now called "Aktive")
    async function loadCompletedOrders() {
        const activeContainer = document.getElementById('activeOrdersContainer');
        const cancelledPendingContainer = document.getElementById('cancelledPendingOrdersContainer');
        const cancelledCollectedContainer = document.getElementById('cancelledCollectedOrdersContainer');
        
        if (!activeContainer || !cancelledPendingContainer || !cancelledCollectedContainer) return;
        
        let completedOrders = [];
        const serverCompletedOrders = await fetchCompletedOrdersFromServer();
        if (serverCompletedOrders) {
            completedOrders = serverCompletedOrders;
        } else {
            const storedCompletedOrders = localStorage.getItem('completedOrders');
            if (storedCompletedOrders) {
                completedOrders = JSON.parse(storedCompletedOrders);
            }
        }
        
        // Filter orders by status
        const activeOrders = completedOrders.filter(order => !order.status || order.status === 'active');
        const cancelledPendingOrders = completedOrders.filter(order => order.status === 'cancelled_pending');
        const cancelledCollectedOrders = completedOrders.filter(order => order.status === 'cancelled_collected');
        
        // Sort active orders by creation date (newest first)
        activeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        cancelledPendingOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        cancelledCollectedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Display active orders
        // Keep the header row and only replace the content after it
        const activeHeader = activeContainer.querySelector('.overview-order-header');
        const activeContent = activeOrders.length === 0 
            ? '<p style="color: #6b7280; text-align: center; padding: 2rem;">Ingen aktive ordrer.</p>'
            : activeOrders.map(order => {
                // Calculate current monthly rent based on installation date
                const monthlyRent = calculateCurrentMonthlyRent(order);
                
                return `
                    <div class="overview-order-row" data-order-id="${order.id}" style="cursor: ${isOverviewOnly ? 'default' : 'pointer'};">
                        <div class="overview-order-number">Ordre #${order.id}</div>
                        <div class="overview-order-name">${order.name}</div>
                        <div class="overview-order-address">${order.address}</div>
                        <div class="overview-order-rent">${monthlyRent.toFixed(2)} DKK</div>
                    </div>
                `;
            }).join('');
        
        // Remove all rows except header, then add new content
        const activeRows = activeContainer.querySelectorAll('.overview-order-row');
        activeRows.forEach(row => row.remove());
        const activeEmptyMsg = activeContainer.querySelector('p');
        if (activeEmptyMsg) activeEmptyMsg.remove();
        
        if (activeOrders.length > 0) {
            activeContainer.insertAdjacentHTML('beforeend', activeContent);
            
            // Add click event listeners to active order rows
            if (!isOverviewOnly) {
                activeContainer.querySelectorAll('.overview-order-row').forEach(row => {
                    row.addEventListener('click', function() {
                        const orderId = parseInt(this.dataset.orderId);
                        showOrderDetail(orderId);
                    });
                });
            }
        } else {
            activeContainer.insertAdjacentHTML('beforeend', activeContent);
        }
        
        // Display cancelled pending orders
        const cancelledPendingContent = cancelledPendingOrders.length === 0 
            ? '<p style="color: #6b7280; text-align: center; padding: 2rem;">Ingen ordrer i denne kategori.</p>'
            : cancelledPendingOrders.map(order => {
                // Calculate current monthly rent based on installation date
                const monthlyRent = calculateCurrentMonthlyRent(order);
                
                return `
                    <div class="overview-order-row" data-order-id="${order.id}" style="cursor: ${isOverviewOnly ? 'default' : 'pointer'};">
                        <div class="overview-order-number">Ordre #${order.id}</div>
                        <div class="overview-order-name">${order.name}</div>
                        <div class="overview-order-address">${order.address}</div>
                        <div class="overview-order-rent">${monthlyRent.toFixed(2)} DKK</div>
                    </div>
                `;
            }).join('');
        
        // Remove all rows except header, then add new content
        const cancelledPendingRows = cancelledPendingContainer.querySelectorAll('.overview-order-row');
        cancelledPendingRows.forEach(row => row.remove());
        const cancelledPendingEmptyMsg = cancelledPendingContainer.querySelector('p');
        if (cancelledPendingEmptyMsg) cancelledPendingEmptyMsg.remove();
        
        if (cancelledPendingOrders.length > 0) {
            cancelledPendingContainer.insertAdjacentHTML('beforeend', cancelledPendingContent);
            
            // Add click event listeners (disabled for overview-only access)
            if (!isOverviewOnly) {
                cancelledPendingContainer.querySelectorAll('.overview-order-row').forEach(row => {
                    row.addEventListener('click', function() {
                        const orderId = parseInt(this.dataset.orderId);
                        showOrderDetail(orderId);
                    });
                });
            }
        } else {
            cancelledPendingContainer.insertAdjacentHTML('beforeend', cancelledPendingContent);
        }
        
        // Display cancelled collected orders
        const cancelledCollectedContent = cancelledCollectedOrders.length === 0 
            ? '<p style="color: #6b7280; text-align: center; padding: 2rem;">Ingen ordrer i denne kategori.</p>'
            : cancelledCollectedOrders.map(order => {
                // Calculate current monthly rent based on installation date
                const monthlyRent = calculateCurrentMonthlyRent(order);
                
                return `
                    <div class="overview-order-row" data-order-id="${order.id}" style="cursor: ${isOverviewOnly ? 'default' : 'pointer'};">
                        <div class="overview-order-number">Ordre #${order.id}</div>
                        <div class="overview-order-name">${order.name}</div>
                        <div class="overview-order-address">${order.address}</div>
                        <div class="overview-order-rent">${monthlyRent.toFixed(2)} DKK</div>
                    </div>
                `;
            }).join('');
        
        // Remove all rows except header, then add new content
        const cancelledCollectedRows = cancelledCollectedContainer.querySelectorAll('.overview-order-row');
        cancelledCollectedRows.forEach(row => row.remove());
        const cancelledCollectedEmptyMsg = cancelledCollectedContainer.querySelector('p');
        if (cancelledCollectedEmptyMsg) cancelledCollectedEmptyMsg.remove();
        
        if (cancelledCollectedOrders.length > 0) {
            cancelledCollectedContainer.insertAdjacentHTML('beforeend', cancelledCollectedContent);
            
            // Add click event listeners (disabled for overview-only access)
            if (!isOverviewOnly) {
                cancelledCollectedContainer.querySelectorAll('.overview-order-row').forEach(row => {
                    row.addEventListener('click', function() {
                        const orderId = parseInt(this.dataset.orderId);
                        showOrderDetail(orderId);
                    });
                });
            }
        } else {
            cancelledCollectedContainer.insertAdjacentHTML('beforeend', cancelledCollectedContent);
        }
    }
    
    // Calculate current monthly rent based on installation date
    function calculateCurrentMonthlyRent(order) {
        if (!order.products || order.products.length === 0) {
            return 0;
        }
        
        // Calculate total monthly rent for all products
        const totalMonth1to4 = order.products.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month1to4 || 0) * quantity);
        }, 0);
        const totalMonth5to12 = order.products.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month5to12 || 0) * quantity);
        }, 0);
        const totalMonth13plus = order.products.reduce((sum, p) => {
            const quantity = p.quantity || 1;
            return sum + (parseFloat(p.month13plus || 0) * quantity);
        }, 0);
        
        // If no installation date, return month 1-4 price
        if (!order.installationDate) {
            return totalMonth1to4;
        }
        
        // Calculate months since installation
        // Parse installation date (could be in different formats)
        let installationDate = new Date(order.installationDate);
        
        // If date is invalid, try to parse from installationWeek
        if (isNaN(installationDate.getTime())) {
            // Try to extract date from installationWeek or use createdAt as fallback
            installationDate = order.createdAt ? new Date(order.createdAt) : new Date();
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        installationDate.setHours(0, 0, 0, 0);
        
        // Calculate difference in months
        // Month 1 starts from the installation month itself
        const yearDiff = today.getFullYear() - installationDate.getFullYear();
        const monthDiff = today.getMonth() - installationDate.getMonth();
        const monthsDiff = yearDiff * 12 + monthDiff;
        
        // If installation date is in the future, use month 1-4 price
        if (monthsDiff < 0) {
            return totalMonth1to4;
        }
        
        // Determine which price tier applies
        // Month 1-4: months 0-3 (installation month is month 1)
        // Month 5-12: months 4-11
        // Month 13+: months 12+
        if (monthsDiff <= 3) {
            return totalMonth1to4;
        } else if (monthsDiff <= 11) {
            return totalMonth5to12;
        } else {
            return totalMonth13plus;
        }
    }
    
    // Order detail modal close button
    const closeOrderDetailModalBtn = document.getElementById('closeOrderDetailModal');
    if (closeOrderDetailModalBtn) {
        closeOrderDetailModalBtn.addEventListener('click', closeOrderDetailModal);
    }
    
    // Close modal when clicking outside
    const orderDetailModal = document.getElementById('orderDetailModal');
    if (orderDetailModal) {
        orderDetailModal.addEventListener('click', function(e) {
            if (e.target === orderDetailModal) {
                closeOrderDetailModal();
            }
        });
    }
    
    // Complete order button (using event delegation since button is created dynamically)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'completeOrderBtn') {
            const orderId = parseInt(e.target.dataset.orderId);
            if (orderId) {
                if (confirm('Er du sikker på, at du vil markere ordren som afsluttet?')) {
                    completeOrder(orderId);
                }
            }
        } else if (e.target && e.target.id === 'cancelPendingBtn') {
            const orderId = parseInt(e.target.dataset.orderId);
            if (orderId) {
                if (confirm('Er du sikker på, at du vil markere ordren som annulleret og afventer afhentning?')) {
                    cancelOrderPending(orderId);
                }
            }
        } else if (e.target && e.target.id === 'cancelCollectedBtn') {
            const orderId = parseInt(e.target.dataset.orderId);
            if (orderId) {
                if (confirm('Er du sikker på, at du vil markere ordren som annulleret og afhentet?')) {
                    cancelOrderCollected(orderId);
                }
            }
        }
    });
    
    // Cancel order - move to "Opsagt, mangler afhentning" group
    async function cancelOrderPending(orderId) {
        let completedOrders = [];
        const serverCompletedOrders = await fetchCompletedOrdersFromServer();
        if (serverCompletedOrders) {
            completedOrders = serverCompletedOrders;
        } else {
            const storedCompletedOrders = localStorage.getItem('completedOrders');
            if (!storedCompletedOrders) return;
            completedOrders = JSON.parse(storedCompletedOrders);
        }
        
        // Find the order
        const orderIndex = completedOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const order = completedOrders[orderIndex];
        
        // Set status to cancelled_pending
        order.status = 'cancelled_pending';
        
        // Update order in array
        completedOrders[orderIndex] = order;
        
        // Save to localStorage and server
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        saveCompletedOrdersToServer(completedOrders);
        
        // Close modal
        closeOrderDetailModal();
        
        // Reload orders if on opgaver page (to show in cancelled pending section)
        const opgaverPage = document.getElementById('opgaver');
        if (opgaverPage && opgaverPage.classList.contains('active')) {
            loadOrders();
        }
        
        // Reload completed orders if on oversigt page
        const oversigtPage = document.getElementById('oversigt');
        if (oversigtPage && oversigtPage.classList.contains('active')) {
            loadCompletedOrders();
        }
        
        // Update badge count
        updateOpgaverBadge();
    }
    
    // Cancel order - move to "Opsagt og hentet" group
    async function cancelOrderCollected(orderId) {
        let completedOrders = [];
        const serverCompletedOrders = await fetchCompletedOrdersFromServer();
        if (serverCompletedOrders) {
            completedOrders = serverCompletedOrders;
        } else {
            const storedCompletedOrders = localStorage.getItem('completedOrders');
            if (!storedCompletedOrders) return;
            completedOrders = JSON.parse(storedCompletedOrders);
        }
        
        // Find the order
        const orderIndex = completedOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const order = completedOrders[orderIndex];
        
        // Set status to cancelled_collected
        order.status = 'cancelled_collected';
        
        // Update order in array
        completedOrders[orderIndex] = order;
        
        // Save to localStorage and server
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        saveCompletedOrdersToServer(completedOrders);
        
        // Close modal
        closeOrderDetailModal();
        
        // Reload orders if on opgaver page (to remove from cancelled pending section)
        const opgaverPage = document.getElementById('opgaver');
        if (opgaverPage && opgaverPage.classList.contains('active')) {
            loadOrders();
        }
        
        // Reload completed orders if on oversigt page
        const oversigtPage = document.getElementById('oversigt');
        if (oversigtPage && oversigtPage.classList.contains('active')) {
            loadCompletedOrders();
        }
        
        // Update badge count
        updateOpgaverBadge();
    }
    
    // Clear examples button
    const clearExamplesBtn = document.getElementById('clearExamplesBtn');
    if (clearExamplesBtn) {
        clearExamplesBtn.addEventListener('click', function() {
            if (confirm('Er du sikker på, at du vil fjerne alle eksempelordrer?')) {
                clearExampleOrders();
            }
        });
    }
    
    // Order filter
    const orderFilter = document.getElementById('orderFilter');
    if (orderFilter) {
        orderFilter.addEventListener('change', function() {
            loadOrders();
        });
    }
    
    // Add Product Modal
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const dropZone = imageUploadArea ? imageUploadArea.querySelector('.drop-zone') : null;
    const fileInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const hideBtn = document.getElementById('hideBtn');
    const productCategorySelect = document.getElementById('productCategory');
    const sofaOrientationSection = document.getElementById('sofaOrientationSection');
    const enableOrientationCheckbox = document.getElementById('enableOrientation');
    const orientationImages = document.getElementById('orientationImages');
    let selectedImageFile = null; // Store the selected file
    let selectedRightImageFile = null; // Store right oriented image
    let selectedLeftImageFile = null; // Store left oriented image
    let editingProductId = null; // Store the ID of product being edited
    let editingOrientation = 'main'; // Store which orientation is being edited
    let imageReferenceMode = false; // Track if using file reference mode
    let imageReferenceValue = null; // Store the image reference filename
    let rightImageReferenceMode = false; // Track if using file reference mode for right image
    let rightImageReferenceValue = null; // Store the right image reference filename
    let leftImageReferenceMode = false; // Track if using file reference mode for left image
    let leftImageReferenceValue = null; // Store the left image reference filename
    
    // Image upload option tabs - main image
    const uploadOptionTabs = document.querySelectorAll('.option-tab[data-option="upload"], .option-tab[data-option="reference"]');
    const uploadOption = document.getElementById('uploadOption');
    const referenceOption = document.getElementById('referenceOption');
    const imageReferenceInput = document.getElementById('imageReference');
    const imageReferencePreview = document.getElementById('imageReferencePreview');
    const referencePreviewImg = document.getElementById('referencePreviewImg');
    const removeReferenceImageBtn = document.getElementById('removeReferenceImage');
    
    // Switch between upload and reference options for main image
    if (uploadOptionTabs.length > 0) {
        uploadOptionTabs.forEach(tab => {
            if (tab.dataset.option === 'upload' || tab.dataset.option === 'reference') {
                tab.addEventListener('click', function() {
                    const option = this.dataset.option;
                    
                    // Update active tab (only for main image tabs)
                    if (!this.dataset.orientation) {
                        document.querySelectorAll('.option-tab[data-option="upload"], .option-tab[data-option="reference"]').forEach(t => {
                            if (!t.dataset.orientation) t.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        // Show/hide options
                        if (option === 'upload') {
                            uploadOption.classList.add('active');
                            referenceOption.classList.remove('active');
                            imageReferenceMode = false;
                            imageReferenceValue = null;
                        } else {
                            uploadOption.classList.remove('active');
                            referenceOption.classList.add('active');
                            imageReferenceMode = true;
                        }
                    }
                });
            }
        });
    }
    
    // Handle image reference input - main image
    if (imageReferenceInput) {
        imageReferenceInput.addEventListener('input', function() {
            const filename = this.value.trim();
            if (filename) {
                // Try to load preview from ProduktB folder
                const imagePath = `ProduktB/${filename}`;
                referencePreviewImg.src = imagePath;
                referencePreviewImg.onload = function() {
                    imageReferencePreview.style.display = 'block';
                    imageReferenceValue = filename;
                };
                referencePreviewImg.onerror = function() {
                    imageReferencePreview.style.display = 'none';
                    imageReferenceValue = null;
                };
            } else {
                imageReferencePreview.style.display = 'none';
                imageReferenceValue = null;
            }
        });
    }
    
    // Remove reference image - main image
    if (removeReferenceImageBtn) {
        removeReferenceImageBtn.addEventListener('click', function() {
            if (imageReferenceInput) imageReferenceInput.value = '';
            imageReferencePreview.style.display = 'none';
            imageReferenceValue = null;
        });
    }
    
    // Right image reference handling
    const rightImageReferenceInput = document.getElementById('rightImageReference');
    const rightImageReferencePreview = document.getElementById('rightImageReferencePreview');
    const rightReferencePreviewImg = document.getElementById('rightReferencePreviewImg');
    const removeRightReferenceImageBtn = document.getElementById('removeRightReferenceImage');
    const uploadOptionRight = document.getElementById('uploadOptionRight');
    const referenceOptionRight = document.getElementById('referenceOptionRight');
    
            // Switch between upload and reference options for right image
    document.querySelectorAll('.option-tab[data-option="upload-right"], .option-tab[data-option="reference-right"]').forEach(tab => {
        tab.addEventListener('click', function() {
            const option = this.dataset.option;
            
            // Update active tab
            document.querySelectorAll('.option-tab[data-orientation="right"]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide options
            if (option === 'upload-right') {
                uploadOptionRight.classList.add('active');
                referenceOptionRight.classList.remove('active');
                rightImageReferenceMode = false;
                rightImageReferenceValue = null;
            } else {
                uploadOptionRight.classList.remove('active');
                referenceOptionRight.classList.add('active');
                rightImageReferenceMode = true;
                // Clear uploaded image when switching to reference mode
                selectedRightImageFile = null;
                const rightFileInput = document.getElementById('rightOrientedImage');
                if (rightFileInput) rightFileInput.value = '';
                const rightImagePreview = document.getElementById('rightImagePreview');
                const rightDropZone = document.getElementById('rightDropZone');
                if (rightImagePreview) rightImagePreview.style.display = 'none';
                if (rightDropZone) rightDropZone.style.display = 'block';
            }
        });
    });
    
    // Handle right image reference input
    if (rightImageReferenceInput) {
        rightImageReferenceInput.addEventListener('input', function() {
            const filename = this.value.trim();
            if (filename) {
                const imagePath = `ProduktB/${filename}`;
                rightReferencePreviewImg.src = imagePath;
                rightReferencePreviewImg.onload = function() {
                    rightImageReferencePreview.style.display = 'block';
                    rightImageReferenceValue = filename;
                    // Clear uploaded image when reference is set (reference has priority)
                    selectedRightImageFile = null;
                    const rightFileInput = document.getElementById('rightOrientedImage');
                    if (rightFileInput) rightFileInput.value = '';
                    const rightImagePreview = document.getElementById('rightImagePreview');
                    const rightDropZone = document.getElementById('rightDropZone');
                    if (rightImagePreview) rightImagePreview.style.display = 'none';
                    if (rightDropZone) rightDropZone.style.display = 'block';
                };
                rightReferencePreviewImg.onerror = function() {
                    rightImageReferencePreview.style.display = 'none';
                    rightImageReferenceValue = null;
                };
            } else {
                rightImageReferencePreview.style.display = 'none';
                rightImageReferenceValue = null;
            }
        });
    }
    
    // Remove right reference image
    if (removeRightReferenceImageBtn) {
        removeRightReferenceImageBtn.addEventListener('click', function() {
            if (rightImageReferenceInput) rightImageReferenceInput.value = '';
            rightImageReferencePreview.style.display = 'none';
            rightImageReferenceValue = null;
        });
    }
    
    // Left image reference handling
    const leftImageReferenceInput = document.getElementById('leftImageReference');
    const leftImageReferencePreview = document.getElementById('leftImageReferencePreview');
    const leftReferencePreviewImg = document.getElementById('leftReferencePreviewImg');
    const removeLeftReferenceImageBtn = document.getElementById('removeLeftReferenceImage');
    const uploadOptionLeft = document.getElementById('uploadOptionLeft');
    const referenceOptionLeft = document.getElementById('referenceOptionLeft');
    
    // Switch between upload and reference options for left image
    document.querySelectorAll('.option-tab[data-option="upload-left"], .option-tab[data-option="reference-left"]').forEach(tab => {
        tab.addEventListener('click', function() {
            const option = this.dataset.option;
            
            // Update active tab
            document.querySelectorAll('.option-tab[data-orientation="left"]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide options
            if (option === 'upload-left') {
                uploadOptionLeft.classList.add('active');
                referenceOptionLeft.classList.remove('active');
                leftImageReferenceMode = false;
                leftImageReferenceValue = null;
            } else {
                uploadOptionLeft.classList.remove('active');
                referenceOptionLeft.classList.add('active');
                leftImageReferenceMode = true;
                // Clear uploaded image when switching to reference mode
                selectedLeftImageFile = null;
                const leftFileInput = document.getElementById('leftOrientedImage');
                if (leftFileInput) leftFileInput.value = '';
                const leftImagePreview = document.getElementById('leftImagePreview');
                const leftDropZone = document.getElementById('leftDropZone');
                if (leftImagePreview) leftImagePreview.style.display = 'none';
                if (leftDropZone) leftDropZone.style.display = 'block';
            }
        });
    });
    
    // Handle left image reference input
    if (leftImageReferenceInput) {
        leftImageReferenceInput.addEventListener('input', function() {
            const filename = this.value.trim();
            if (filename) {
                const imagePath = `ProduktB/${filename}`;
                leftReferencePreviewImg.src = imagePath;
                leftReferencePreviewImg.onload = function() {
                    leftImageReferencePreview.style.display = 'block';
                    leftImageReferenceValue = filename;
                    // Clear uploaded image when reference is set (reference has priority)
                    selectedLeftImageFile = null;
                    const leftFileInput = document.getElementById('leftOrientedImage');
                    if (leftFileInput) leftFileInput.value = '';
                    const leftImagePreview = document.getElementById('leftImagePreview');
                    const leftDropZone = document.getElementById('leftDropZone');
                    if (leftImagePreview) leftImagePreview.style.display = 'none';
                    if (leftDropZone) leftDropZone.style.display = 'block';
                };
                leftReferencePreviewImg.onerror = function() {
                    leftImageReferencePreview.style.display = 'none';
                    leftImageReferenceValue = null;
                };
            } else {
                leftImageReferencePreview.style.display = 'none';
                leftImageReferenceValue = null;
            }
        });
    }
    
    // Remove left reference image
    if (removeLeftReferenceImageBtn) {
        removeLeftReferenceImageBtn.addEventListener('click', function() {
            if (leftImageReferenceInput) leftImageReferenceInput.value = '';
            leftImageReferencePreview.style.display = 'none';
            leftImageReferenceValue = null;
        });
    }
    
    // Open modal for adding new product
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add product button clicked');
            
            if (!addProductModal) {
                console.error('addProductModal is not defined');
                alert('Fejl: Modal ikke fundet. Genindlæs siden.');
                return;
            }
            
            if (!modalTitle || !submitBtn) {
                console.error('Modal elements not found');
                alert('Fejl: Modal-elementer ikke fundet. Genindlæs siden.');
                return;
            }
            
            editingProductId = null;
            editingOrientation = 'main';
            modalTitle.textContent = 'Tilføj produkt';
            submitBtn.textContent = 'Gem produkt';
            if (deleteBtn) deleteBtn.style.display = 'none';
            
            // Reset form
            if (productForm) {
                productForm.reset();
            }
            
            // Reset image previews
            if (dropZone) dropZone.style.display = 'block';
            if (imagePreview) imagePreview.style.display = 'none';
            if (previewImg) previewImg.src = '';
            if (fileInput) fileInput.value = '';
            selectedImageFile = null;
            selectedRightImageFile = null;
            selectedLeftImageFile = null;
            
            // Reset reference mode
            imageReferenceMode = false;
            imageReferenceValue = null;
            rightImageReferenceMode = false;
            rightImageReferenceValue = null;
            leftImageReferenceMode = false;
            leftImageReferenceValue = null;
            if (imageReferenceInput) imageReferenceInput.value = '';
            if (imageReferencePreview) imageReferencePreview.style.display = 'none';
            if (rightImageReferenceInput) rightImageReferenceInput.value = '';
            if (rightImageReferencePreview) rightImageReferencePreview.style.display = 'none';
            if (leftImageReferenceInput) leftImageReferenceInput.value = '';
            if (leftImageReferencePreview) leftImageReferencePreview.style.display = 'none';
            
            // Reset to upload tab for main image
            const mainUploadTab = document.querySelector('.option-tab[data-option="upload"]');
            const mainReferenceTab = document.querySelector('.option-tab[data-option="reference"]');
            if (mainUploadTab) mainUploadTab.classList.add('active');
            if (mainReferenceTab) mainReferenceTab.classList.remove('active');
            if (uploadOption) uploadOption.classList.add('active');
            if (referenceOption) referenceOption.classList.remove('active');
            
            // Reset to upload tab for right image
            const rightUploadTab = document.querySelector('.option-tab[data-option="upload-right"]');
            const rightReferenceTab = document.querySelector('.option-tab[data-option="reference-right"]');
            if (rightUploadTab) rightUploadTab.classList.add('active');
            if (rightReferenceTab) rightReferenceTab.classList.remove('active');
            if (uploadOptionRight) uploadOptionRight.classList.add('active');
            if (referenceOptionRight) referenceOptionRight.classList.remove('active');
            
            // Reset to upload tab for left image
            const leftUploadTab = document.querySelector('.option-tab[data-option="upload-left"]');
            const leftReferenceTab = document.querySelector('.option-tab[data-option="reference-left"]');
            if (leftUploadTab) leftUploadTab.classList.add('active');
            if (leftReferenceTab) leftReferenceTab.classList.remove('active');
            if (uploadOptionLeft) uploadOptionLeft.classList.add('active');
            if (referenceOptionLeft) referenceOptionLeft.classList.remove('active');
            
            // Reset orientation images
            if (sofaOrientationSection) sofaOrientationSection.style.display = 'none';
            if (orientationImages) orientationImages.style.display = 'none';
            if (enableOrientationCheckbox) enableOrientationCheckbox.checked = false;
            
            // Show modal
            addProductModal.style.display = 'flex';
            console.log('Modal should be visible now');
        });
    } else {
        console.error('addProductBtn not found');
    }
    
    // Show/hide sofa orientation section based on category
    if (productCategorySelect) {
        productCategorySelect.addEventListener('change', function() {
            if (this.value === 'Sofa') {
                if (sofaOrientationSection) sofaOrientationSection.style.display = 'block';
            } else {
                if (sofaOrientationSection) sofaOrientationSection.style.display = 'none';
                if (orientationImages) orientationImages.style.display = 'none';
                if (enableOrientationCheckbox) enableOrientationCheckbox.checked = false;
                
                // Clear all orientation image data
                selectedRightImageFile = null;
                selectedLeftImageFile = null;
                rightImageReferenceMode = false;
                rightImageReferenceValue = null;
                leftImageReferenceMode = false;
                leftImageReferenceValue = null;
                
                // Reset right image upload
                const rightDropZone = document.getElementById('rightDropZone');
                const rightImagePreview = document.getElementById('rightImagePreview');
                const rightPreviewImg = document.getElementById('rightPreviewImg');
                const rightFileInput = document.getElementById('rightOrientedImage');
                if (rightDropZone) rightDropZone.style.display = 'block';
                if (rightImagePreview) rightImagePreview.style.display = 'none';
                if (rightPreviewImg) rightPreviewImg.src = '';
                if (rightFileInput) rightFileInput.value = '';
                
                // Reset right image reference
                const rightImageReferenceInput = document.getElementById('rightImageReference');
                const rightImageReferencePreview = document.getElementById('rightImageReferencePreview');
                if (rightImageReferenceInput) rightImageReferenceInput.value = '';
                if (rightImageReferencePreview) rightImageReferencePreview.style.display = 'none';
                
                // Reset left image upload
                const leftDropZone = document.getElementById('leftDropZone');
                const leftImagePreview = document.getElementById('leftImagePreview');
                const leftPreviewImg = document.getElementById('leftPreviewImg');
                const leftFileInput = document.getElementById('leftOrientedImage');
                if (leftDropZone) leftDropZone.style.display = 'block';
                if (leftImagePreview) leftImagePreview.style.display = 'none';
                if (leftPreviewImg) leftPreviewImg.src = '';
                if (leftFileInput) leftFileInput.value = '';
                
                // Reset left image reference
                const leftImageReferenceInput = document.getElementById('leftImageReference');
                const leftImageReferencePreview = document.getElementById('leftImageReferencePreview');
                if (leftImageReferenceInput) leftImageReferenceInput.value = '';
                if (leftImageReferencePreview) leftImageReferencePreview.style.display = 'none';
            }
        });
    }
    
    // Show/hide orientation images based on checkbox
    if (enableOrientationCheckbox) {
        enableOrientationCheckbox.addEventListener('change', function() {
            if (orientationImages) {
                orientationImages.style.display = this.checked ? 'block' : 'none';
            }
            if (!this.checked) {
                // Clear all orientation image data
                selectedRightImageFile = null;
                selectedLeftImageFile = null;
                rightImageReferenceMode = false;
                rightImageReferenceValue = null;
                leftImageReferenceMode = false;
                leftImageReferenceValue = null;
                
                // Reset right image upload
                const rightDropZone = document.getElementById('rightDropZone');
                const rightImagePreview = document.getElementById('rightImagePreview');
                const rightPreviewImg = document.getElementById('rightPreviewImg');
                const rightFileInput = document.getElementById('rightOrientedImage');
                if (rightDropZone) rightDropZone.style.display = 'block';
                if (rightImagePreview) rightImagePreview.style.display = 'none';
                if (rightPreviewImg) rightPreviewImg.src = '';
                if (rightFileInput) rightFileInput.value = '';
                
                // Reset right image reference
                const rightImageReferenceInput = document.getElementById('rightImageReference');
                const rightImageReferencePreview = document.getElementById('rightImageReferencePreview');
                if (rightImageReferenceInput) rightImageReferenceInput.value = '';
                if (rightImageReferencePreview) rightImageReferencePreview.style.display = 'none';
                
                // Reset left image upload
                const leftDropZone = document.getElementById('leftDropZone');
                const leftImagePreview = document.getElementById('leftImagePreview');
                const leftPreviewImg = document.getElementById('leftPreviewImg');
                const leftFileInput = document.getElementById('leftOrientedImage');
                if (leftDropZone) leftDropZone.style.display = 'block';
                if (leftImagePreview) leftImagePreview.style.display = 'none';
                if (leftPreviewImg) leftPreviewImg.src = '';
                if (leftFileInput) leftFileInput.value = '';
                
                // Reset left image reference
                const leftImageReferenceInput = document.getElementById('leftImageReference');
                const leftImageReferencePreview = document.getElementById('leftImageReferencePreview');
                if (leftImageReferenceInput) leftImageReferenceInput.value = '';
                if (leftImageReferencePreview) leftImageReferencePreview.style.display = 'none';
                
                // Reset tabs to upload
                const rightUploadTab = document.querySelector('.option-tab[data-option="upload-right"]');
                const rightReferenceTab = document.querySelector('.option-tab[data-option="reference-right"]');
                if (rightUploadTab) rightUploadTab.classList.add('active');
                if (rightReferenceTab) rightReferenceTab.classList.remove('active');
                const uploadOptionRight = document.getElementById('uploadOptionRight');
                const referenceOptionRight = document.getElementById('referenceOptionRight');
                if (uploadOptionRight) uploadOptionRight.classList.add('active');
                if (referenceOptionRight) referenceOptionRight.classList.remove('active');
                
                const leftUploadTab = document.querySelector('.option-tab[data-option="upload-left"]');
                const leftReferenceTab = document.querySelector('.option-tab[data-option="reference-left"]');
                if (leftUploadTab) leftUploadTab.classList.add('active');
                if (leftReferenceTab) leftReferenceTab.classList.remove('active');
                const uploadOptionLeft = document.getElementById('uploadOptionLeft');
                const referenceOptionLeft = document.getElementById('referenceOptionLeft');
                if (uploadOptionLeft) uploadOptionLeft.classList.add('active');
                if (referenceOptionLeft) referenceOptionLeft.classList.remove('active');
            }
        });
    }
    
    // Function to open modal for editing product
    editProduct = function(productId, selectedOrientation = 'main') {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        editingProductId = productId;
        editingOrientation = selectedOrientation;
        
        modalTitle.textContent = 'Edit Product';
        submitBtn.textContent = 'Gem ændringer';
        if (deleteBtn) deleteBtn.style.display = 'block';
        if (hideBtn) hideBtn.style.display = 'block';
        
        // Populate form with product data
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productName').value = product.name;
        document.getElementById('productSKU').value = product.sku;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('startupCost').value = product.startupCost;
        document.getElementById('month1to4').value = product.month1to4;
        document.getElementById('month5to12').value = product.month5to12;
        document.getElementById('month13plus').value = product.month13plus;
        document.getElementById('productLength').value = product.length || '';
        document.getElementById('productWidth').value = product.width || '';
        document.getElementById('productHeight').value = product.height || '';
        
        // Determine which image to show based on editing orientation
        let imageToShow = product.imageUrl;
        if (selectedOrientation === 'right' && product.rightOrientedImage) {
            imageToShow = product.rightOrientedImage;
        } else if (selectedOrientation === 'left' && product.leftOrientedImage) {
            imageToShow = product.leftOrientedImage;
        }
        
        // Check if image is a reference to ProduktB folder
        if (imageToShow && imageToShow.startsWith('ProduktB/')) {
            // Using file reference - show in reference mode
            imageReferenceMode = true;
            imageReferenceValue = imageToShow.replace('ProduktB/', '');
            if (imageReferenceInput) imageReferenceInput.value = imageReferenceValue;
            if (referencePreviewImg) {
                referencePreviewImg.src = imageToShow;
                referencePreviewImg.onload = function() {
                    if (imageReferencePreview) imageReferencePreview.style.display = 'block';
                };
            }
            if (uploadOption) uploadOption.classList.remove('active');
            if (referenceOption) referenceOption.classList.add('active');
            // Update tabs
            const uploadTab = document.querySelector('.option-tab[data-option="upload"]');
            const referenceTab = document.querySelector('.option-tab[data-option="reference"]');
            if (uploadTab) uploadTab.classList.remove('active');
            if (referenceTab) referenceTab.classList.add('active');
            // Hide upload preview
            if (dropZone) dropZone.style.display = 'none';
            if (imagePreview) imagePreview.style.display = 'none';
        } else {
            // Using uploaded image - show in upload mode
            imageReferenceMode = false;
            imageReferenceValue = null;
            if (previewImg) previewImg.src = imageToShow;
            if (dropZone) dropZone.style.display = 'none';
            if (imagePreview) imagePreview.style.display = 'block';
            if (imageReferenceInput) imageReferenceInput.value = '';
            if (imageReferencePreview) imageReferencePreview.style.display = 'none';
            // Update tabs
            const uploadTab = document.querySelector('.option-tab[data-option="upload"]');
            const referenceTab = document.querySelector('.option-tab[data-option="reference"]');
            if (uploadTab) uploadTab.classList.add('active');
            if (referenceTab) referenceTab.classList.remove('active');
            if (uploadOption) uploadOption.classList.add('active');
            if (referenceOption) referenceOption.classList.remove('active');
        }
        selectedImageFile = null; // Reset file input since we're using existing image
        
        // Handle sofa orientation images
        if (product.category === 'Sofa') {
            if (sofaOrientationSection) sofaOrientationSection.style.display = 'block';
            if (product.rightOrientedImage) {
                if (enableOrientationCheckbox) enableOrientationCheckbox.checked = true;
                if (orientationImages) orientationImages.style.display = 'block';
                
                // Check if right image is a reference
                if (product.rightOrientedImage.startsWith('ProduktB/')) {
                    rightImageReferenceMode = true;
                    rightImageReferenceValue = product.rightOrientedImage.replace('ProduktB/', '');
                    if (rightImageReferenceInput) rightImageReferenceInput.value = rightImageReferenceValue;
                    if (rightReferencePreviewImg) {
                        rightReferencePreviewImg.src = product.rightOrientedImage;
                        rightReferencePreviewImg.onload = function() {
                            if (rightImageReferencePreview) rightImageReferencePreview.style.display = 'block';
                        };
                    }
                    // Switch to reference tab
                    const uploadTabRight = document.querySelector('.option-tab[data-option="upload-right"]');
                    const referenceTabRight = document.querySelector('.option-tab[data-option="reference-right"]');
                    if (uploadTabRight) uploadTabRight.classList.remove('active');
                    if (referenceTabRight) referenceTabRight.classList.add('active');
                    if (uploadOptionRight) uploadOptionRight.classList.remove('active');
                    if (referenceOptionRight) referenceOptionRight.classList.add('active');
                    // Hide upload preview
                    const rightDropZone = document.getElementById('rightDropZone');
                    const rightImagePreview = document.getElementById('rightImagePreview');
                    if (rightDropZone) rightDropZone.style.display = 'none';
                    if (rightImagePreview) rightImagePreview.style.display = 'none';
                } else {
                    rightImageReferenceMode = false;
                    const rightPreviewImg = document.getElementById('rightPreviewImg');
                    const rightDropZone = document.getElementById('rightDropZone');
                    const rightImagePreview = document.getElementById('rightImagePreview');
                    if (rightPreviewImg) rightPreviewImg.src = product.rightOrientedImage;
                    if (rightDropZone) rightDropZone.style.display = 'none';
                    if (rightImagePreview) rightImagePreview.style.display = 'block';
                    if (rightImageReferenceInput) rightImageReferenceInput.value = '';
                    if (rightImageReferencePreview) rightImageReferencePreview.style.display = 'none';
                }
            }
            if (product.leftOrientedImage) {
                if (enableOrientationCheckbox) enableOrientationCheckbox.checked = true;
                if (orientationImages) orientationImages.style.display = 'block';
                
                // Check if left image is a reference
                if (product.leftOrientedImage.startsWith('ProduktB/')) {
                    leftImageReferenceMode = true;
                    leftImageReferenceValue = product.leftOrientedImage.replace('ProduktB/', '');
                    if (leftImageReferenceInput) leftImageReferenceInput.value = leftImageReferenceValue;
                    if (leftReferencePreviewImg) {
                        leftReferencePreviewImg.src = product.leftOrientedImage;
                        leftReferencePreviewImg.onload = function() {
                            if (leftImageReferencePreview) leftImageReferencePreview.style.display = 'block';
                        };
                    }
                    // Switch to reference tab
                    const uploadTabLeft = document.querySelector('.option-tab[data-option="upload-left"]');
                    const referenceTabLeft = document.querySelector('.option-tab[data-option="reference-left"]');
                    if (uploadTabLeft) uploadTabLeft.classList.remove('active');
                    if (referenceTabLeft) referenceTabLeft.classList.add('active');
                    if (uploadOptionLeft) uploadOptionLeft.classList.remove('active');
                    if (referenceOptionLeft) referenceOptionLeft.classList.add('active');
                    // Hide upload preview
                    const leftDropZone = document.getElementById('leftDropZone');
                    const leftImagePreview = document.getElementById('leftImagePreview');
                    if (leftDropZone) leftDropZone.style.display = 'none';
                    if (leftImagePreview) leftImagePreview.style.display = 'none';
                } else {
                    leftImageReferenceMode = false;
                    const leftPreviewImg = document.getElementById('leftPreviewImg');
                    const leftDropZone = document.getElementById('leftDropZone');
                    const leftImagePreview = document.getElementById('leftImagePreview');
                    if (leftPreviewImg) leftPreviewImg.src = product.leftOrientedImage;
                    if (leftDropZone) leftDropZone.style.display = 'none';
                    if (leftImagePreview) leftImagePreview.style.display = 'block';
                    if (leftImageReferenceInput) leftImageReferenceInput.value = '';
                    if (leftImageReferencePreview) leftImageReferencePreview.style.display = 'none';
                }
            }
        } else {
            if (sofaOrientationSection) sofaOrientationSection.style.display = 'none';
            if (orientationImages) orientationImages.style.display = 'none';
            selectedRightImageFile = null;
            selectedLeftImageFile = null;
        }
        
        addProductModal.style.display = 'flex';
    }
    
    // Close modal
    function closeModalFunc() {
        if (addProductModal) {
            addProductModal.style.display = 'none';
        }
        if (productForm) {
            productForm.reset();
        }
        if (dropZone) {
            dropZone.style.display = 'block';
        }
        if (imagePreview) {
            imagePreview.style.display = 'none';
        }
        if (previewImg) {
            previewImg.src = '';
        }
        if (fileInput) {
            fileInput.value = '';
        }
        selectedImageFile = null; // Reset selected file
        selectedRightImageFile = null;
        selectedLeftImageFile = null;
        editingProductId = null; // Reset editing mode
        editingOrientation = 'main'; // Reset editing orientation
        imageReferenceMode = false; // Reset reference mode
        imageReferenceValue = null; // Reset reference value
        if (imageReferenceInput) imageReferenceInput.value = '';
        if (imageReferencePreview) imageReferencePreview.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (hideBtn) hideBtn.style.display = 'none';
        if (sofaOrientationSection) sofaOrientationSection.style.display = 'none';
        if (orientationImages) orientationImages.style.display = 'none';
        if (enableOrientationCheckbox) enableOrientationCheckbox.checked = false;
        
        // Reset to upload tab
        if (uploadOptionTabs.length > 0) {
            uploadOptionTabs.forEach(t => t.classList.remove('active'));
            const uploadTab = document.querySelector('.option-tab[data-option="upload"]');
            if (uploadTab) uploadTab.classList.add('active');
        }
        if (uploadOption) uploadOption.classList.add('active');
        if (referenceOption) referenceOption.classList.remove('active');
        // Reset right image
        const rightDropZone = document.getElementById('rightDropZone');
        const rightImagePreview = document.getElementById('rightImagePreview');
        const rightPreviewImg = document.getElementById('rightPreviewImg');
        if (rightDropZone) rightDropZone.style.display = 'block';
        if (rightImagePreview) rightImagePreview.style.display = 'none';
        if (rightPreviewImg) rightPreviewImg.src = '';
        // Reset left image
        const leftDropZone = document.getElementById('leftDropZone');
        const leftImagePreview = document.getElementById('leftImagePreview');
        const leftPreviewImg = document.getElementById('leftPreviewImg');
        if (leftDropZone) leftDropZone.style.display = 'block';
        if (leftImagePreview) leftImagePreview.style.display = 'none';
        if (leftPreviewImg) leftPreviewImg.src = '';
    }
    
    // Delete product function
    function deleteProduct() {
        if (!editingProductId) return;
        
        if (confirm('Er du sikker på at du vil slette dette produkt? Denne handling kan ikke fortrydes.')) {
            // Remove product from array
            products = products.filter(p => p.id !== editingProductId);
            
            // Save to localStorage and update display
            saveProducts();
            
            // Close modal
            closeModalFunc();
        }
    }
    
    // Delete button event listener
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            deleteProduct();
        });
    }
    
    // Hide/show product function
    function toggleHideProduct() {
        if (!editingProductId) return;
        
        const product = products.find(p => p.id === editingProductId);
        if (product) {
            product.hidden = !product.hidden;
            saveProducts();
            if (hideBtn) {
                hideBtn.textContent = product.hidden ? 'Vis' : 'Skjul';
            }
        }
    }
    
    // Hide button event listener
    if (hideBtn) {
        hideBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleHideProduct();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModalFunc);
    }
    
    if (addProductModal) {
        addProductModal.addEventListener('click', function(e) {
            if (e.target === addProductModal) {
                closeModalFunc();
            }
        });
    }
    
    // File input click
    if (dropZone) {
        dropZone.addEventListener('click', function(e) {
            if (e.target.classList.contains('browse-link')) {
                fileInput.click();
            } else if (!imagePreview.style.display || imagePreview.style.display === 'none') {
                fileInput.click();
            }
        });
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFileSelect(e.target.files[0]);
        });
    }
    
    // Drag and drop
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }
    
    // Handle file select
    function handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Vælg venligst et billede');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            alert('Billedet er for stort. Maksimal størrelse er 10MB');
            return;
        }
        
        // Store the file
        selectedImageFile = file;
        
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            dropZone.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    // Remove image
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            dropZone.style.display = 'block';
            imagePreview.style.display = 'none';
            previewImg.src = '';
            fileInput.value = '';
            selectedImageFile = null; // Clear selected file
        });
    }
    
    // Handle orientation images (right and left)
    function handleOrientationFileSelect(file, orientation) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Vælg venligst et billede');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            alert('Billedet er for stort. Maksimal størrelse er 10MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (orientation === 'right') {
                selectedRightImageFile = file;
                const rightPreviewImg = document.getElementById('rightPreviewImg');
                const rightDropZone = document.getElementById('rightDropZone');
                const rightImagePreview = document.getElementById('rightImagePreview');
                if (rightPreviewImg) rightPreviewImg.src = e.target.result;
                if (rightDropZone) rightDropZone.style.display = 'none';
                if (rightImagePreview) rightImagePreview.style.display = 'block';
            } else if (orientation === 'left') {
                selectedLeftImageFile = file;
                const leftPreviewImg = document.getElementById('leftPreviewImg');
                const leftDropZone = document.getElementById('leftDropZone');
                const leftImagePreview = document.getElementById('leftImagePreview');
                if (leftPreviewImg) leftPreviewImg.src = e.target.result;
                if (leftDropZone) leftDropZone.style.display = 'none';
                if (leftImagePreview) leftImagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
    
    // Right oriented image handlers
    const rightFileInput = document.getElementById('rightOrientedImage');
    const rightDropZone = document.getElementById('rightDropZone');
    const removeRightImageBtn = document.getElementById('removeRightImage');
    
    if (rightFileInput) {
        rightFileInput.addEventListener('change', function(e) {
            handleOrientationFileSelect(e.target.files[0], 'right');
        });
    }
    
    if (rightDropZone) {
        rightDropZone.addEventListener('click', function(e) {
            if (e.target.classList.contains('browse-link')) {
                rightFileInput.click();
            } else if (!document.getElementById('rightImagePreview').style.display || document.getElementById('rightImagePreview').style.display === 'none') {
                rightFileInput.click();
            }
        });
        
        rightDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            rightDropZone.classList.add('drag-over');
        });
        
        rightDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            rightDropZone.classList.remove('drag-over');
        });
        
        rightDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            rightDropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleOrientationFileSelect(files[0], 'right');
            }
        });
    }
    
    if (removeRightImageBtn) {
        removeRightImageBtn.addEventListener('click', function() {
            const rightDropZone = document.getElementById('rightDropZone');
            const rightImagePreview = document.getElementById('rightImagePreview');
            const rightPreviewImg = document.getElementById('rightPreviewImg');
            if (rightDropZone) rightDropZone.style.display = 'block';
            if (rightImagePreview) rightImagePreview.style.display = 'none';
            if (rightPreviewImg) rightPreviewImg.src = '';
            if (rightFileInput) rightFileInput.value = '';
            selectedRightImageFile = null;
        });
    }
    
    // Left oriented image handlers
    const leftFileInput = document.getElementById('leftOrientedImage');
    const leftDropZone = document.getElementById('leftDropZone');
    const removeLeftImageBtn = document.getElementById('removeLeftImage');
    
    if (leftFileInput) {
        leftFileInput.addEventListener('change', function(e) {
            handleOrientationFileSelect(e.target.files[0], 'left');
        });
    }
    
    if (leftDropZone) {
        leftDropZone.addEventListener('click', function(e) {
            if (e.target.classList.contains('browse-link')) {
                leftFileInput.click();
            } else if (!document.getElementById('leftImagePreview').style.display || document.getElementById('leftImagePreview').style.display === 'none') {
                leftFileInput.click();
            }
        });
        
        leftDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            leftDropZone.classList.add('drag-over');
        });
        
        leftDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            leftDropZone.classList.remove('drag-over');
        });
        
        leftDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            leftDropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleOrientationFileSelect(files[0], 'left');
            }
        });
    }
    
    if (removeLeftImageBtn) {
        removeLeftImageBtn.addEventListener('click', function() {
            const leftDropZone = document.getElementById('leftDropZone');
            const leftImagePreview = document.getElementById('leftImagePreview');
            const leftPreviewImg = document.getElementById('leftPreviewImg');
            if (leftDropZone) leftDropZone.style.display = 'block';
            if (leftImagePreview) leftImagePreview.style.display = 'none';
            if (leftPreviewImg) leftPreviewImg.src = '';
            if (leftFileInput) leftFileInput.value = '';
            selectedLeftImageFile = null;
        });
    }
    
    // Auto-calculate prices based on base price
    const productPriceInput = document.getElementById('productPrice');
    const startupCostInput = document.getElementById('startupCost');
    const month1to4Input = document.getElementById('month1to4');
    const month5to12Input = document.getElementById('month5to12');
    const month13plusInput = document.getElementById('month13plus');
    
    function calculatePrices() {
        const basePrice = parseFloat(productPriceInput.value) || 0;
        
        if (basePrice > 0) {
            // Calculate prices
            const startupCost = basePrice * 0.10; // 10%
            const month1to4 = basePrice * 0.04; // 4%
            const month5to12 = basePrice * 0.03; // 3%
            const month13plus = basePrice * 0.02; // 2%
            
            // Update fields (round to 2 decimal places)
            startupCostInput.value = startupCost.toFixed(2);
            month1to4Input.value = month1to4.toFixed(2);
            month5to12Input.value = month5to12.toFixed(2);
            month13plusInput.value = month13plus.toFixed(2);
        } else {
            // Clear fields if base price is 0 or empty
            startupCostInput.value = '';
            month1to4Input.value = '';
            month5to12Input.value = '';
            month13plusInput.value = '';
        }
    }
    
    // Calculate prices when base price changes
    if (productPriceInput) {
        productPriceInput.addEventListener('input', calculatePrices);
        productPriceInput.addEventListener('change', calculatePrices);
    }
    
    // Form submission
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                category: document.getElementById('productCategory').value,
                name: document.getElementById('productName').value,
                sku: document.getElementById('productSKU').value,
                price: document.getElementById('productPrice').value,
                startupCost: document.getElementById('startupCost').value,
                month1to4: document.getElementById('month1to4').value,
                month5to12: document.getElementById('month5to12').value,
                month13plus: document.getElementById('month13plus').value,
                length: document.getElementById('productLength').value,
                width: document.getElementById('productWidth').value,
                height: document.getElementById('productHeight').value
            };
            
            // Get image - use new file if selected, otherwise use existing image
            const imageFile = selectedImageFile || (fileInput ? fileInput.files[0] : null);
            
            // Additional validation for new products
            if (!editingProductId && !imageFile && !imageReferenceValue) {
                alert('Vælg et produktbillede eller indtast et filnavn');
                return;
            }
            
            // Handle orientation images
            const rightImageFile = selectedRightImageFile || (rightFileInput ? rightFileInput.files[0] : null);
            const leftImageFile = selectedLeftImageFile || (leftFileInput ? leftFileInput.files[0] : null);
            
            // Function to process all images and save product
            function processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl) {
                try {
                    // Ensure products array is loaded
                    if (!products || !Array.isArray(products)) {
                        const stored = localStorage.getItem('products');
                        products = stored ? JSON.parse(stored) : [];
                    }
                    
                    // Validate required fields
                    if (!formData.name || !formData.category || !formData.sku) {
                        alert('Udfyld venligst alle krævede felter (Navn, kategori, SKU)');
                        return;
                    }
                    
                    if (!mainImageUrl) {
                        alert('Produktbillede er påkrævet');
                        return;
                    }
                    
                    // Ensure all numeric values are properly formatted
                    const productData = {
                        category: formData.category || '',
                        name: formData.name || '',
                        sku: formData.sku || '',
                        price: formData.price || '0',
                        startupCost: formData.startupCost || '0',
                        month1to4: formData.month1to4 || '0',
                        month5to12: formData.month5to12 || '0',
                        month13plus: formData.month13plus || '0',
                        length: formData.length || '',
                        width: formData.width || '',
                        height: formData.height || '',
                        id: editingProductId || Date.now(),
                        imageUrl: mainImageUrl
                    };
                    
                    if (editingProductId) {
                        // When editing, preserve existing data
                        const existingProduct = products.find(p => p.id === editingProductId);
                        if (existingProduct) {
                            // If editing a specific orientation, update that specific image
                            if (editingOrientation === 'right' && imageFile) {
                                // Updating right oriented image
                                productData.rightOrientedImage = mainImageUrl;
                                productData.imageUrl = existingProduct.imageUrl; // Keep main image
                            } else if (editingOrientation === 'left' && imageFile) {
                                // Updating left oriented image
                                productData.leftOrientedImage = mainImageUrl;
                                productData.imageUrl = existingProduct.imageUrl; // Keep main image
                            } else if (editingOrientation === 'main' && imageFile) {
                                // Updating main image
                                productData.imageUrl = mainImageUrl;
                            }
                            
                            // Update orientation images only if checkbox is checked
                            if (enableOrientationCheckbox && enableOrientationCheckbox.checked) {
                                // Preserve existing orientation images if no new ones provided
                                if (rightImageUrl) {
                                    productData.rightOrientedImage = rightImageUrl;
                                } else if (!productData.rightOrientedImage) {
                                    // If no new right image provided and not already set, keep existing
                                    productData.rightOrientedImage = existingProduct.rightOrientedImage || null;
                                }
                                if (leftImageUrl) {
                                    productData.leftOrientedImage = leftImageUrl;
                                } else if (!productData.leftOrientedImage) {
                                    // If no new left image provided and not already set, keep existing
                                    productData.leftOrientedImage = existingProduct.leftOrientedImage || null;
                                }
                            } else {
                                // Checkbox is not checked - remove orientation images
                                productData.rightOrientedImage = null;
                                productData.leftOrientedImage = null;
                            }
                        }
                        
                        // Update existing product
                        const index = products.findIndex(p => p.id === editingProductId);
                        if (index !== -1) {
                            products[index] = productData;
                            console.log('Product updated:', productData);
                        } else {
                            console.error('Product not found for editing:', editingProductId);
                            alert('Fejl: Produkt ikke fundet');
                            return;
                        }
                    } else {
                        // Add new product - add orientation images only if checkbox is checked
                        if (enableOrientationCheckbox && enableOrientationCheckbox.checked) {
                            if (rightImageUrl) {
                                productData.rightOrientedImage = rightImageUrl;
                            }
                            if (leftImageUrl) {
                                productData.leftOrientedImage = leftImageUrl;
                            }
                        } else {
                            // Checkbox is not checked - no orientation images
                            productData.rightOrientedImage = null;
                            productData.leftOrientedImage = null;
                        }
                        
                        // Add new product to array
                        products.push(productData);
                        console.log('New product added:', productData);
                    }
                    
                    // Save to localStorage and update display
                    saveProducts();
                    
                    // Close modal and reset form
                    closeModalFunc();
                } catch (error) {
                    console.error('Error saving product:', error);
                    console.error('Error stack:', error.stack);
                    console.error('Error details:', {
                        mainImageUrl: !!mainImageUrl,
                        formData: formData,
                        editingProductId: editingProductId,
                        productsLength: products ? products.length : 'products is not defined'
                    });
                    alert('Der opstod en fejl under gemning af produktet. Prøv igen. Se konsollen for detaljer.');
                }
            }
            
            // Process main image
            if (editingProductId) {
                const existingProduct = products.find(p => p.id === editingProductId);
                if (!imageFile && !imageReferenceValue && existingProduct) {
                    // Determine which image to use based on editing orientation
                    let imageToUse = existingProduct.imageUrl;
                    if (editingOrientation === 'right' && existingProduct.rightOrientedImage) {
                        imageToUse = existingProduct.rightOrientedImage;
                    } else if (editingOrientation === 'left' && existingProduct.leftOrientedImage) {
                        imageToUse = existingProduct.leftOrientedImage;
                    }
                    
                    // Check if using reference mode
                    if (imageReferenceMode && imageReferenceValue) {
                        imageToUse = `ProduktB/${imageReferenceValue}`;
                    }
                    
                    let rightImageUrl = null;
                    let leftImageUrl = null;
                    
                    // Process right image - reference has priority
                    if (rightImageReferenceMode && rightImageReferenceValue) {
                        rightImageUrl = `ProduktB/${rightImageReferenceValue}`;
                        // Process left image - reference has priority
                        if (leftImageReferenceMode && leftImageReferenceValue) {
                            leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                            processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                        } else if (leftImageFile) {
                            const leftReader = new FileReader();
                            leftReader.onload = function(e) {
                                leftImageUrl = e.target.result;
                                processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                            };
                            leftReader.readAsDataURL(leftImageFile);
                        } else {
                            processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                        }
                    } else if (rightImageFile) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            rightImageUrl = e.target.result;
                            // Process left image - reference has priority
                            if (leftImageReferenceMode && leftImageReferenceValue) {
                                leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                                processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                            } else if (leftImageFile) {
                                const leftReader = new FileReader();
                                leftReader.onload = function(e) {
                                    leftImageUrl = e.target.result;
                                    processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                                };
                                leftReader.readAsDataURL(leftImageFile);
                            } else {
                                processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                            }
                        };
                        reader.readAsDataURL(rightImageFile);
                    } else if (leftImageReferenceMode && leftImageReferenceValue) {
                        // Only left image reference
                        leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                        processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                    } else if (leftImageFile) {
                        // Only left image upload
                        const leftReader = new FileReader();
                        leftReader.onload = function(e) {
                            leftImageUrl = e.target.result;
                            processAndSaveProduct(imageToUse, rightImageUrl, leftImageUrl);
                        };
                        leftReader.readAsDataURL(leftImageFile);
                    } else {
                        // No new images - just save with existing images
                        processAndSaveProduct(imageToUse, null, null);
                    }
                    return;
                }
            }
            
            // Check if using reference mode or upload mode
            if (imageReferenceMode && imageReferenceValue) {
                // Using file reference mode
                const imagePath = `ProduktB/${imageReferenceValue}`;
                let rightImageUrl = null;
                let leftImageUrl = null;
                
                // Process right image - reference has priority
                if (rightImageReferenceMode && rightImageReferenceValue) {
                    rightImageUrl = `ProduktB/${rightImageReferenceValue}`;
                    // Process left image - reference has priority
                    if (leftImageReferenceMode && leftImageReferenceValue) {
                        leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                        processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                    } else if (leftImageFile) {
                        const leftReader = new FileReader();
                        leftReader.onload = function(e) {
                            leftImageUrl = e.target.result;
                            processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                        };
                        leftReader.readAsDataURL(leftImageFile);
                    } else {
                        processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                    }
                } else if (rightImageFile) {
                    const rightReader = new FileReader();
                    rightReader.onload = function(e) {
                        rightImageUrl = e.target.result;
                        // Process left image - reference has priority
                        if (leftImageReferenceMode && leftImageReferenceValue) {
                            leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                            processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                        } else if (leftImageFile) {
                            const leftReader = new FileReader();
                            leftReader.onload = function(e) {
                                leftImageUrl = e.target.result;
                                processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                            };
                            leftReader.readAsDataURL(leftImageFile);
                        } else {
                            processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                        }
                    };
                    rightReader.readAsDataURL(rightImageFile);
                } else if (leftImageReferenceMode && leftImageReferenceValue) {
                    // Only left image reference
                    leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                    processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                } else if (leftImageFile) {
                    // Only left image upload
                    const leftReader = new FileReader();
                    leftReader.onload = function(e) {
                        leftImageUrl = e.target.result;
                        processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                    };
                    leftReader.readAsDataURL(leftImageFile);
                } else {
                    // No orientation images - just save with main image reference
                    processAndSaveProduct(imagePath, rightImageUrl, leftImageUrl);
                }
                return;
            }
            
            // If new main image is selected, convert it
            if (!imageFile && !imageReferenceValue && !editingProductId) {
                alert('Vælg et produktbillede eller indtast et filnavn');
                return;
            }
            
            if (imageFile) {
                // Convert main image to base64
                const reader = new FileReader();
                reader.onload = function(e) {
                    const mainImageUrl = e.target.result;
                    let rightImageUrl = null;
                    let leftImageUrl = null;
                    
                    // Process right image - check if using reference or upload
                    if (rightImageReferenceMode && rightImageReferenceValue) {
                        rightImageUrl = `ProduktB/${rightImageReferenceValue}`;
                        // Process left image
                        if (leftImageReferenceMode && leftImageReferenceValue) {
                            leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                            processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                        } else if (leftImageFile) {
                            const leftReader = new FileReader();
                            leftReader.onload = function(e) {
                                leftImageUrl = e.target.result;
                                processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                            };
                            leftReader.readAsDataURL(leftImageFile);
                        } else {
                            processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                        }
                    } else if (rightImageFile) {
                        const rightReader = new FileReader();
                        rightReader.onload = function(e) {
                            rightImageUrl = e.target.result;
                            // Process left image
                            if (leftImageReferenceMode && leftImageReferenceValue) {
                                leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                                processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                            } else if (leftImageFile) {
                                const leftReader = new FileReader();
                                leftReader.onload = function(e) {
                                    leftImageUrl = e.target.result;
                                    processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                                };
                                leftReader.readAsDataURL(leftImageFile);
                            } else {
                                processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                            }
                        };
                        rightReader.readAsDataURL(rightImageFile);
                    } else if (leftImageReferenceMode && leftImageReferenceValue) {
                        // Only left image reference
                        leftImageUrl = `ProduktB/${leftImageReferenceValue}`;
                        processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                    } else if (leftImageFile) {
                        // Only left image upload
                        const leftReader = new FileReader();
                        leftReader.onload = function(e) {
                            leftImageUrl = e.target.result;
                            processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                        };
                        leftReader.readAsDataURL(leftImageFile);
                    } else {
                        // No orientation images - just save with main image
                        processAndSaveProduct(mainImageUrl, rightImageUrl, leftImageUrl);
                    }
                };
                
                reader.onerror = function() {
                    alert('Fejl ved indlæsning af billede. Prøv igen.');
                };
                
                reader.readAsDataURL(imageFile);
            } else {
                // This should not happen for new products, but handle it just in case
                console.error('No image file found for new product');
                alert('Vælg et produktbillede eller indtast et filnavn');
            }
        });
    }
});


// ============ SCRIPT.JS - VERSION COMPLÈTE ============

let products = [];
let categories = {};
let cart = [];
let currentTable = null;
let currentFilter = 'all';
let cartListenerRef = null;
let currentRestaurantId = null;
let restaurantData = null;
let sessionId = null;

// ============ RÉFÉRENCES ============
const restaurantsRef = database.ref('restaurants');

// ============ GÉNÉRER UN IDENTIFIANT DE SESSION UNIQUE ============
function generateSessionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + '-' + Date.now().toString(36).slice(-4);
}

function getSessionId() {
    let session = localStorage.getItem('session_id');
    if (!session) {
        session = generateSessionId();
        localStorage.setItem('session_id', session);
        console.log('🔑 Nouvelle session créée:', session);
    }
    return session;
}

// ============ CHARGER LA TABLE ============
function loadTableInfo() {
    currentTable = localStorage.getItem('current_table');
    if (!currentTable) {
        const urlParams = new URLSearchParams(window.location.search);
        currentTable = urlParams.get('table') || '1';
        localStorage.setItem('current_table', currentTable);
    }
    
    sessionId = getSessionId();
    
    const tableNumberSpan = document.getElementById('tableNumber');
    if (tableNumberSpan) {
        tableNumberSpan.textContent = currentTable;
    }
    
    console.log('🪑 Table actuelle:', currentTable);
    console.log('🔑 Session ID:', sessionId);
}

// ============ CHARGER LE RESTAURANT ============
function loadRestaurant() {
    const urlParams = new URLSearchParams(window.location.search);
    let restaurantId = urlParams.get('restaurant') || 'default';
    
    if (restaurantId === 'default' && !urlParams.get('restaurant')) {
        const saved = localStorage.getItem('current_restaurant');
        if (saved) restaurantId = saved;
    }
    
    currentRestaurantId = restaurantId;
    localStorage.setItem('current_restaurant', restaurantId);
    
    console.log('🏪 Restaurant demandé:', restaurantId);
    
    restaurantsRef.child(restaurantId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            restaurantData = data;
            console.log('✅ Restaurant chargé:', data.name);
            console.log('📱 WhatsApp configuré:', data.whatsapp || 'Non configuré');
            updateRestaurantUI(data);
        } else {
            console.warn('⚠️ Restaurant non trouvé, utilisation des valeurs par défaut');
            restaurantData = getDefaultRestaurant();
            updateRestaurantUI(restaurantData);
        }
    }, (error) => {
        console.error('❌ Erreur chargement restaurant:', error);
        restaurantData = getDefaultRestaurant();
        updateRestaurantUI(restaurantData);
    });
}

function getDefaultRestaurant() {
    return {
        name: "Mon Restaurant",
        logo: "images/logo.png",
        address: "123 Rue de la Paix, 75001 Paris",
        phone: "01 23 45 67 89",
        phoneLink: "+33123456789",
        whatsapp: "1234567890",
        deliveryPrice: 5,
        deliveryAvailable: true,
        facebook: "https://facebook.com/votre-page",
        instagram: "https://instagram.com/votre-compte",
        website: "https://votre-site.com",
        mapsUrl: "https://maps.google.com/maps?q=123+Rue+de+la+Paix+75001+Paris",
        active: true
    };
}

// ============ METTRE À JOUR L'UI DU RESTAURANT ============
function updateRestaurantUI(data) {
    document.getElementById('restaurantName').textContent = data.name || 'Mon Restaurant';
    
    const logoImg = document.querySelector('.header-left .logo');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    
    if (data.logo) {
        logoImg.src = data.logo;
        logoImg.style.display = 'block';
        logoPlaceholder.style.display = 'none';
        logoImg.onerror = function() {
            this.style.display = 'none';
            logoPlaceholder.style.display = 'flex';
            logoPlaceholder.textContent = (data.name || 'R').charAt(0).toUpperCase();
        };
    } else {
        logoImg.style.display = 'none';
        logoPlaceholder.style.display = 'flex';
        logoPlaceholder.textContent = (data.name || 'R').charAt(0).toUpperCase();
    }
    
    document.getElementById('restaurantAddress').textContent = data.address ? '📍 ' + data.address : '';
    document.getElementById('restaurantPhone').textContent = data.phone ? '📞 ' + data.phone : '';
    
    const deliveryBadge = document.getElementById('deliveryBadge');
    if (data.deliveryAvailable !== false && data.deliveryPrice !== undefined) {
        deliveryBadge.className = 'delivery-badge';
        deliveryBadge.innerHTML = `🚚 Livraison <span class="price">${data.deliveryPrice}€</span>`;
    } else {
        deliveryBadge.className = 'delivery-badge disabled';
        deliveryBadge.textContent = '🚫 Livraison non disponible';
    }
    
    const callBtn = document.getElementById('callBtn');
    if (data.phoneLink) {
        callBtn.href = 'tel:' + data.phoneLink;
        callBtn.style.display = 'inline-flex';
    } else if (data.phone) {
        callBtn.href = 'tel:' + data.phone.replace(/\s/g, '');
        callBtn.style.display = 'inline-flex';
    } else {
        callBtn.style.display = 'none';
    }
    
    const directionsBtn = document.getElementById('directionsBtn');
    if (data.mapsUrl) {
        directionsBtn.href = data.mapsUrl;
        directionsBtn.style.display = 'inline-flex';
    } else if (data.address) {
        directionsBtn.href = 'https://maps.google.com/maps?q=' + encodeURIComponent(data.address);
        directionsBtn.style.display = 'inline-flex';
    } else {
        directionsBtn.style.display = 'none';
    }
    
    document.getElementById('facebookBtn').style.display = data.facebook ? 'inline-flex' : 'none';
    document.getElementById('instagramBtn').style.display = data.instagram ? 'inline-flex' : 'none';
    document.getElementById('websiteBtn').style.display = data.website ? 'inline-flex' : 'none';
    document.getElementById('footerName').textContent = data.name || 'Mon Restaurant';
}

// ============ ÉCOUTER LES CATÉGORIES ============
function listenToCategories() {
    database.ref('categories').on('value', (snapshot) => {
        const data = snapshot.val();
        categories = data || {};
        console.log('📂 Catégories chargées:', Object.keys(categories).length);
        generateFilters();
    });
}

// ============ GÉNÉRER LES FILTRES ============
function generateFilters() {
    const container = document.getElementById('filtersContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.category = 'all';
    allBtn.textContent = '📊 Tous';
    allBtn.onclick = function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.category;
        displayMenu();
    };
    container.appendChild(allBtn);
    
    const sortedKeys = Object.keys(categories).sort((a, b) => 
        (categories[a].order || 0) - (categories[b].order || 0)
    );
    
    sortedKeys.forEach(key => {
        const cat = categories[key];
        if (cat.active === false) return;
        
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = key;
        btn.textContent = `${cat.icon || '📁'} ${cat.name}`;
        btn.onclick = function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            displayMenu();
        };
        container.appendChild(btn);
    });
}

// ============ ÉCOUTER LES PRODUITS ============
function listenToProducts() {
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            products = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } else {
            products = [];
        }
        
        displayMenu();
    }, (error) => {
        console.error('❌ Erreur produits:', error);
        document.getElementById('menuGrid').innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <h3>Erreur de connexion</h3>
                <p>${error.message}</p>
                <button onclick="reconnectMenu()" style="margin-top: 20px; padding: 10px 30px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Reconnecter
                </button>
            </div>
        `;
    });
}

// ============ AFFICHER LE MENU ============
function displayMenu() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    
    let filteredProducts = products.filter(p => p.visible !== false);
    
    if (currentFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentFilter);
    }
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="icon">🍽️</div>
                <h3>Aucun produit disponible</h3>
                <p>${products.length === 0 ? 'Le menu est en cours de préparation...' : 'Aucun produit dans cette catégorie'}</p>
            </div>
        `;
        return;
    }
    
    if (currentFilter === 'all') {
        const groupedProducts = {};
        const categoryOrder = {};
        
        Object.keys(categories).forEach(key => {
            if (categories[key].active !== false) {
                groupedProducts[key] = [];
                categoryOrder[key] = categories[key].order || 0;
            }
        });
        
        filteredProducts.forEach(product => {
            const catKey = product.category;
            if (groupedProducts[catKey]) {
                groupedProducts[catKey].push(product);
            } else {
                if (!groupedProducts['autres']) {
                    groupedProducts['autres'] = [];
                    categoryOrder['autres'] = 999;
                }
                groupedProducts['autres'].push(product);
            }
        });
        
        const sortedCategoryKeys = Object.keys(groupedProducts).sort((a, b) => 
            (categoryOrder[a] || 0) - (categoryOrder[b] || 0)
        );
        
        let html = '';
        sortedCategoryKeys.forEach(catKey => {
            const catProducts = groupedProducts[catKey];
            if (catProducts.length === 0) return;
            
            const cat = categories[catKey];
            const catName = cat ? cat.name : (catKey === 'autres' ? 'Autres' : catKey);
            const catIcon = cat ? (cat.icon || '📁') : '📁';
            
            html += `
                <div class="category-section">
                    <div class="category-title">
                        <span class="icon">${catIcon}</span>
                        ${catName}
                        <span class="count">(${catProducts.length})</span>
                    </div>
                    <div class="category-products">
            `;
            
            catProducts.forEach(product => {
                html += createProductCardHTML(product);
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    } else {
        let html = '';
        filteredProducts.forEach(product => {
            html += createProductCardHTML(product);
        });
        grid.innerHTML = html;
    }
}

function createProductCardHTML(product) {
    const categoryIcon = categories[product.category]?.icon || '📁';
    const categoryName = categories[product.category]?.name || product.category || 'Non catégorisé';
    
    let imageHTML = '';
    if (product.image) {
        imageHTML = `
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.style.display='none'; this.parentElement.querySelector('.placeholder').style.display='flex';">
                <div class="placeholder" style="display: none;">🍽️</div>
            </div>
        `;
    } else {
        imageHTML = `
            <div class="product-image-wrapper">
                <div class="placeholder">🍽️</div>
            </div>
        `;
    }
    
    return `
        <div class="product-card">
            ${imageHTML}
            <div class="product-body">
                <div class="product-header">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-category-badge">${categoryIcon} ${categoryName}</span>
                </div>
                <div class="product-price">${product.price.toFixed(2)} €</div>
                <div class="product-description">${product.description || 'Aucune description'}</div>
                <button class="btn-add" onclick="addToCart('${product.id}')">
                    🛒 Ajouter au panier
                </button>
            </div>
        </div>
    `;
}

// ============ GESTION DU PANIER ============
function loadCart() {
    if (currentTable && sessionId) {
        const cartPath = `carts/table_${currentTable}/session_${sessionId}`;
        console.log('📥 Chargement du panier depuis:', cartPath);
        
        if (cartListenerRef) {
            cartsRef.child(cartPath).off('value');
            cartListenerRef = null;
        }
        
        cartListenerRef = cartsRef.child(cartPath).on('value', (snapshot) => {
            const data = snapshot.val();
            
            if (data && Array.isArray(data) && data.length > 0) {
                cart = data;
            } else {
                cart = [];
            }
            
            updateCartCount();
            if (document.getElementById('cartItems')) {
                displayCart();
            }
        }, (error) => {
            console.error('❌ Erreur chargement panier:', error);
        });
    }
}

function saveCart() {
    if (currentTable && sessionId) {
        const cartPath = `carts/table_${currentTable}/session_${sessionId}`;
        return cartsRef.child(cartPath).set(cart)
            .then(() => console.log('✅ Panier sauvegardé'))
            .catch(error => console.error('❌ Erreur sauvegarde panier:', error));
    }
}

function clearCart() {
    console.log('🗑️ VIDAGE DU PANIER...');
    cart = [];
    
    if (currentTable && sessionId) {
        const cartPath = `carts/table_${currentTable}/session_${sessionId}`;
        
        if (cartListenerRef) {
            cartsRef.child(cartPath).off('value');
            cartListenerRef = null;
        }
        
        return cartsRef.child(cartPath).remove()
            .then(() => {
                updateCartCount();
                if (document.getElementById('cartItems')) {
                    displayCart();
                }
                showToast('🗑️ Panier vidé', 'info');
                setTimeout(() => loadCart(), 300);
            })
            .catch(error => {
                return cartsRef.child(cartPath).set([])
                    .then(() => {
                        updateCartCount();
                        if (document.getElementById('cartItems')) {
                            displayCart();
                        }
                        showToast('🗑️ Panier vidé', 'info');
                        setTimeout(() => loadCart(), 300);
                    });
            });
    }
    return Promise.resolve();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('❌ Produit non trouvé', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ 
            id: product.id,
            name: product.name, 
            price: product.price, 
            quantity: 1,
            notes: ''
        });
    }
    
    saveCart();
    updateCartCount();
    showToast(`✅ ${product.name} ajouté au panier !`, 'success');
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        displayCart();
        updateCartCount();
        showToast(`🗑 ${item.name} retiré`, 'info');
    }
}

function updateCartItem(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    displayCart();
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        cartCountSpan.textContent = count;
        if (count > 0) {
            cartCountSpan.style.animation = 'none';
            setTimeout(() => {
                cartCountSpan.style.animation = 'bounce 0.5s ease';
            }, 10);
        }
    }
}

function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="cart-empty">
                <div class="icon">🛒</div>
                <p>Votre panier est vide</p>
                <p class="sub">Ajoutez des produits depuis le menu</p>
            </div>
        `;
        if (cartTotalSpan) cartTotalSpan.textContent = '0';
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach((item) => {
        total += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${(item.price * item.quantity).toFixed(2)} €</div>
            </div>
            <div class="item-controls">
                <button class="btn-minus" onclick="updateCartItem('${item.id}', -1)">−</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="btn-plus" onclick="updateCartItem('${item.id}', 1)">+</button>
                <button class="btn-remove" onclick="removeFromCart('${item.id}')">✕</button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    if (cartTotalSpan) cartTotalSpan.textContent = total.toFixed(2);
}

// ============ COMMANDES ============
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `CMD-${year}${month}${day}-${hours}${minutes}-${random}`;
}

function createOrder() {
    return new Promise((resolve, reject) => {
        if (cart.length === 0) {
            reject(new Error('Panier vide'));
            return;
        }
        
        let total = 0;
        const orderItems = cart.map(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            return {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: subtotal,
                notes: item.notes || ''
            };
        });
        
        const orderNumber = generateOrderNumber();
        const orderData = {
            orderNumber: orderNumber,
            table: parseInt(currentTable),
            sessionId: sessionId,
            items: orderItems,
            total: total,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            status: 'en_attente',
            paymentMethod: 'sur_place',
            customerName: '',
            customerPhone: '',
            notes: '',
            restaurant: currentRestaurantId || 'default',
            restaurantName: restaurantData?.name || 'Mon Restaurant'
        };
        
        console.log('📝 Création de la commande:', orderData);
        
        ordersRef.child('commandes').push(orderData)
            .then((ref) => {
                console.log('✅ Commande créée avec ID:', ref.key);
                resolve({
                    id: ref.key,
                    ...orderData
                });
            })
            .catch(error => {
                console.error('❌ Erreur création commande:', error);
                reject(error);
            });
    });
}

// ============ ENVOYER SUR WHATSAPP ============
function sendOrderToWhatsApp(order) {
    if (!order) {
        showToast('❌ Aucune commande à envoyer', 'error');
        return;
    }
    
    console.log('📱 Envoi de la commande sur WhatsApp...');
    console.log('📦 Commande:', order);
    
    const restaurantName = restaurantData?.name || 'Mon Restaurant';
    
    // Récupérer le numéro WhatsApp
    let whatsappNumber = restaurantData?.whatsapp || '1234567890';
    
    // Nettoyer le numéro
    whatsappNumber = whatsappNumber.replace(/[\s\-+]/g, '');
    
    console.log('📱 Numéro WhatsApp utilisé:', whatsappNumber);
    
    // Vérifier le numéro
    if (!whatsappNumber || whatsappNumber.length < 6) {
        whatsappNumber = '1234567890';
        console.warn('⚠️ Numéro WhatsApp invalide, utilisation du numéro par défaut');
    }
    
    // Construire le message
    let message = `🍽️ *${restaurantName}*\n`;
    message += `📋 Réf: ${order.orderNumber}\n`;
    message += `📌 Table: ${order.table}\n`;
    message += `⏰ ${new Date(order.timestamp).toLocaleString('fr-FR')}\n\n`;
    message += `*DÉTAILS DE LA COMMANDE:*\n`;
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            message += `• ${item.name} x${item.quantity} = ${item.subtotal.toFixed(2)}€\n`;
            if (item.notes) {
                message += `  📝 ${item.notes}\n`;
            }
        });
    } else {
        message += `• Aucun article\n`;
    }
    
    message += `\n*Total: ${order.total.toFixed(2)}€*`;
    message += `\n\nMerci de confirmer cette commande.`;
    
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    console.log('🔗 URL WhatsApp:', url);
    
    // Ouvrir WhatsApp
    window.open(url, '_blank');
    
    // Mettre à jour le statut
    ordersRef.child(`commandes/${order.id}`).update({
        status: 'envoye_whatsapp',
        whatsappSent: true,
        whatsappSentAt: Date.now(),
        whatsappNumber: whatsappNumber
    })
    .then(() => {
        console.log('✅ Statut de la commande mis à jour');
    })
    .catch(error => {
        console.error('❌ Erreur mise à jour statut:', error);
    });
    
    showToast(`📱 Commande envoyée sur WhatsApp`, 'success');
}

// ============ PROCESSUS COMPLET DE COMMANDE ============
function processOrder() {
    console.log('🔥🔥🔥 DÉBUT PROCESSUS COMMANDE 🔥🔥🔥');
    
    if (cart.length === 0) {
        showToast('❌ Votre panier est vide !', 'error');
        return;
    }
    
    // Vérifier le numéro WhatsApp
    const whatsappNumber = restaurantData?.whatsapp || '1234567890';
    console.log('📱 Numéro WhatsApp configuré:', whatsappNumber);
    
    if (!whatsappNumber || whatsappNumber.length < 6) {
        showToast('⚠️ Numéro WhatsApp non configuré dans l\'administration', 'warning');
    }
    
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '⏳ Traitement...';
    }
    
    showToast('⏳ Création de la commande...', 'info');
    
    createOrder()
        .then((order) => {
            console.log('📦 Commande créée:', order);
            showToast('✅ Commande créée !', 'success');
            return clearCart().then(() => order);
        })
        .then((order) => {
            console.log('📱 Envoi sur WhatsApp...');
            sendOrderToWhatsApp(order);
            
            const modal = document.getElementById('cartModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            
            console.log('🔥🔥🔥 FIN PROCESSUS COMMANDE 🔥🔥🔥');
        })
        .catch((error) => {
            console.error('❌ Erreur:', error);
            showToast('❌ Erreur: ' + error.message, 'error');
        })
        .finally(() => {
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '📱 Commander';
            }
        });
}

function sendToWhatsApp() {
    processOrder();
}

// ============ CONFIGURATION DU MODAL ============
function setupCartModal() {
    const modal = document.getElementById('cartModal');
    const cartIcon = document.getElementById('cartIcon');
    const closeBtn = document.querySelector('.close');
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    const clearBtn = document.getElementById('clearCartBtn');
    
    if (cartIcon) {
        cartIcon.onclick = () => {
            displayCart();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };
    }
    
    if (sendBtn) {
        sendBtn.onclick = sendToWhatsApp;
        sendBtn.textContent = '📱 Commander';
    }
    
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('🗑️ Vider le panier ?')) {
                clearCart();
            }
        };
    }
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// ============ FILTRES ============
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            displayMenu();
        });
    });
}

// ============ TOAST ============
function showToast(message, type = 'info') {
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196F3'
    };
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const existing = document.querySelector('.menu-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `menu-toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '📢'}</span> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDownToast 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ============ RECONNEXION ============
function reconnectMenu() {
    showToast('🔄 Reconnexion en cours...', 'info');
    database.ref('.info/connected').once('value')
        .then((snapshot) => {
            if (snapshot.val()) {
                showToast('✅ Reconnecté !', 'success');
                listenToProducts();
                listenToCategories();
                loadCart();
                loadRestaurant();
            } else {
                showToast('❌ Impossible de se connecter', 'error');
            }
        })
        .catch(error => {
            showToast('❌ Erreur: ' + error.message, 'error');
        });
}

// ============ INITIALISATION ============
console.log('🚀 Démarrage du menu...');
console.log('📋 Firebase Database:', database.ref().toString());

loadTableInfo();
loadRestaurant();
listenToProducts();
listenToCategories();
loadCart();
setupCartModal();
setupFilters();

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItem = updateCartItem;
window.clearCart = clearCart;
window.sendToWhatsApp = sendToWhatsApp;
window.processOrder = processOrder;
window.reconnectMenu = reconnectMenu;

console.log('✅ Menu initialisé - Table', currentTable);
console.log('🔑 Session ID:', sessionId);
console.log('🏪 Restaurant:', currentRestaurantId);

// ============ ANIMATIONS CSS ============
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUpToast {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDownToast {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100px); opacity: 0; }
    }
    @keyframes bounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

console.log('✅ Script.js chargé avec succès');

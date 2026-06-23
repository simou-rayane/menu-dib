// ============ SCRIPT.JS - VERSION COMPLÈTE AVEC SESSION UNIQUE ============

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
    // Générer un ID unique de 8 caractères
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + '-' + Date.now().toString(36).slice(-4);
}

function getSessionId() {
    // Récupérer ou créer un ID de session
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
    
    // Générer l'ID de session
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
    // Nom
    document.getElementById('restaurantName').textContent = data.name || 'Mon Restaurant';
    
    // Logo
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
    
    // Adresse
    document.getElementById('restaurantAddress').textContent = data.address ? '📍 ' + data.address : '';
    
    // Téléphone
    document.getElementById('restaurantPhone').textContent = data.phone ? '📞 ' + data.phone : '';
    
    // Livraison
    const deliveryBadge = document.getElementById('deliveryBadge');
    const deliveryPrice = document.getElementById('deliveryPrice');
    
    if (data.deliveryAvailable !== false && data.deliveryPrice !== undefined) {
        deliveryBadge.className = 'delivery-badge';
        deliveryBadge.innerHTML = `🚚 Livraison <span class="price">${data.deliveryPrice}€</span>`;
    } else {
        deliveryBadge.className = 'delivery-badge disabled';
        deliveryBadge.textContent = '🚫 Livraison non disponible';
    }
    
    // Bouton Appeler
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
    
    // Bouton Itinéraire
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
    
    // Bouton Facebook
    const facebookBtn = document.getElementById('facebookBtn');
    if (data.facebook) {
        facebookBtn.href = data.facebook;
        facebookBtn.style.display = 'inline-flex';
    } else {
        facebookBtn.style.display = 'none';
    }
    
    // Bouton Instagram
    const instagramBtn = document.getElementById('instagramBtn');
    if (data.instagram) {
        instagramBtn.href = data.instagram;
        instagramBtn.style.display = 'inline-flex';
    } else {
        instagramBtn.style.display = 'none';
    }
    
    // Bouton Site web
    const websiteBtn = document.getElementById('websiteBtn');
    if (data.website) {
        websiteBtn.href = data.website;
        websiteBtn.style.display = 'inline-flex';
    } else {
        websiteBtn.style.display = 'none';
    }
    
    // Footer
    document.getElementById('footerName').textContent = data.name || 'Mon Restaurant';
    
    console.log('✅ UI du restaurant mise à jour');
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
    
    // Bouton "Tous"
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
    
    // Trier les catégories par ordre
    const sortedKeys = Object.keys(categories).sort((a, b) => 
        (categories[a].order || 0) - (categories[b].order || 0)
    );
    
    // Ajouter les filtres pour chaque catégorie active
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
    
    console.log('✅ Filtres générés:', container.children.length);
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
    
    // Si le filtre est "tous", organiser par catégorie
    if (currentFilter === 'all') {
        const groupedProducts = {};
        const categoryOrder = {};
        
        // Initialiser les groupes avec les catégories existantes
        Object.keys(categories).forEach(key => {
            if (categories[key].active !== false) {
                groupedProducts[key] = [];
                categoryOrder[key] = categories[key].order || 0;
            }
        });
        
        // Ajouter les produits à leur catégorie respective
        filteredProducts.forEach(product => {
            const catKey = product.category;
            if (groupedProducts[catKey]) {
                groupedProducts[catKey].push(product);
            } else {
                // Si la catégorie n'existe pas dans les catégories configurées
                if (!groupedProducts['autres']) {
                    groupedProducts['autres'] = [];
                    categoryOrder['autres'] = 999;
                }
                groupedProducts['autres'].push(product);
            }
        });
        
        // Trier les catégories par order
        const sortedCategoryKeys = Object.keys(groupedProducts).sort((a, b) => 
            (categoryOrder[a] || 0) - (categoryOrder[b] || 0)
        );
        
        // Construire le HTML
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
        // Mode filtre simple (une seule catégorie)
        let html = '';
        filteredProducts.forEach(product => {
            html += createProductCardHTML(product);
        });
        grid.innerHTML = html;
    }
    
    console.log(`✅ ${filteredProducts.length} produits affichés`);
}

// ============ CRÉER LE HTML D'UNE CARTE PRODUIT ============
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

// ============ GESTION DU PANIER (SESSION ISOLÉE) ============

// Charger le panier depuis Firebase (session isolée)
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
            console.log('📥 Données du panier reçues:', data);
            
            if (data && Array.isArray(data) && data.length > 0) {
                cart = data;
                console.log('✅ Panier chargé:', cart);
            } else {
                cart = [];
                console.log('📭 Panier vide');
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

// Sauvegarder le panier dans Firebase (session isolée)
function saveCart() {
    if (currentTable && sessionId) {
        const cartPath = `carts/table_${currentTable}/session_${sessionId}`;
        console.log('💾 Sauvegarde du panier dans:', cartPath);
        
        return cartsRef.child(cartPath).set(cart)
            .then(() => {
                console.log('✅ Panier sauvegardé');
            })
            .catch(error => {
                console.error('❌ Erreur sauvegarde panier:', error);
                showToast('❌ Erreur sauvegarde: ' + error.message, 'error');
            });
    }
}

// Vider le panier (session isolée)
function clearCart() {
    console.log('🗑️ VIDAGE DU PANIER...');
    
    // Vider le tableau local
    cart = [];
    
    if (currentTable && sessionId) {
        const cartPath = `carts/table_${currentTable}/session_${sessionId}`;
        console.log('🗑️ Suppression dans Firebase:', cartPath);
        
        // Arrêter l'écouteur pendant le vidage
        if (cartListenerRef) {
            cartsRef.child(cartPath).off('value');
            cartListenerRef = null;
        }
        
        return cartsRef.child(cartPath).remove()
            .then(() => {
                console.log('✅ Panier supprimé de Firebase');
                updateCartCount();
                if (document.getElementById('cartItems')) {
                    displayCart();
                }
                showToast('🗑️ Panier vidé', 'info');
                setTimeout(() => {
                    loadCart();
                }, 300);
            })
            .catch(error => {
                console.error('❌ Erreur vidage:', error);
                return cartsRef.child(cartPath).set([])
                    .then(() => {
                        console.log('✅ Panier vidé avec set([])');
                        updateCartCount();
                        if (document.getElementById('cartItems')) {
                            displayCart();
                        }
                        showToast('🗑️ Panier vidé', 'info');
                        setTimeout(() => {
                            loadCart();
                        }, 300);
                    })
                    .catch(err => {
                        console.error('❌ Erreur alternative:', err);
                        showToast('❌ Erreur vidage: ' + err.message, 'error');
                    });
            });
    }
    
    return Promise.resolve();
}

// Ajouter au panier
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

// Supprimer du panier
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

// Mettre à jour la quantité
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

// Mettre à jour le compteur
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

// Afficher le panier
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

// Générer un numéro de commande
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

// Créer une commande avec l'ID de session
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
        
        console.log('📝 Création de la commande avec session:', sessionId);
        console.log('📦 Commande:', orderData);
        
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

// Envoyer la commande sur WhatsApp
function sendOrderToWhatsApp(order) {
    if (!order) return;
    
    const restaurantName = restaurantData?.name || 'Mon Restaurant';
    let whatsappNumber = restaurantData?.whatsapp || '1234567890';
    whatsappNumber = whatsappNumber.replace(/[\s\-+]/g, '');
    
    console.log('📱 Numéro WhatsApp utilisé:', whatsappNumber);
    
    let message = `🍽️ *${restaurantName}*\n`;
    message += `📋 Réf: ${order.orderNumber}\n`;
    message += `📌 Table: ${order.table}\n`;
    message += `⏰ ${new Date(order.timestamp).toLocaleString('fr-FR')}\n\n`;
    message += `*DÉTAILS DE LA COMMANDE:*\n`;
    
    order.items.forEach(item => {
        message += `• ${item.name} x${item.quantity} = ${item.subtotal.toFixed(2)}€\n`;
        if (item.notes) {
            message += `  📝 ${item.notes}\n`;
        }
    });
    
    message += `\n*Total: ${order.total.toFixed(2)}€*`;
    message += `\n\nMerci de confirmer cette commande.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    ordersRef.child(`commandes/${order.id}`).update({
        status: 'envoye_whatsapp',
        whatsappSent: true,
        whatsappSentAt: Date.now()
    });
}

// Processus complet d'envoi de commande
function processOrder() {
    console.log('🔥🔥🔥 DÉBUT PROCESSUS COMMANDE 🔥🔥🔥');
    
    if (cart.length === 0) {
        showToast('❌ Votre panier est vide !', 'error');
        return;
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
            showToast(`✅ Commande ${order.orderNumber} envoyée !`, 'success');
            
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

// Point d'entrée pour l'envoi de commande
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
            
            const grid = document.getElementById('menuGrid');
            grid.style.opacity = '0';
            setTimeout(() => {
                grid.style.transition = 'opacity 0.3s ease';
                grid.style.opacity = '1';
            }, 50);
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

// Exposer les fonctions globalement
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

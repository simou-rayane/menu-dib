// ============ SCRIPT.JS - VERSION FINALE ============

let products = [];
let cart = [];
let currentTable = null;
let currentFilter = 'all';
let currentOrderId = null;

// ============ CHARGER LA TABLE ============
function loadTableInfo() {
    currentTable = localStorage.getItem('current_table');
    if (!currentTable) {
        const urlParams = new URLSearchParams(window.location.search);
        currentTable = urlParams.get('table') || '1';
        localStorage.setItem('current_table', currentTable);
    }
    
    const tableNumberSpan = document.getElementById('tableNumber');
    if (tableNumberSpan) {
        tableNumberSpan.textContent = currentTable;
    }
    
    console.log('🪑 Table actuelle:', currentTable);
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
        grid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #999;">Aucun produit disponible</p>`;
        return;
    }
    
    grid.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cssText = 'background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <div style="color: #667eea; font-size: 20px; font-weight: bold; margin: 10px 0;">${product.price.toFixed(2)} €</div>
            <div style="color: #666; font-size: 14px; margin-bottom: 15px;">${product.description || ''}</div>
            <button onclick="addToCart('${product.id}')" style="background: #667eea; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; cursor: pointer; font-size: 16px;">
                🛒 Ajouter au panier
            </button>
        `;
        grid.appendChild(card);
    });
}

// ============ GESTION DU PANIER (localStorage uniquement) ============

// Charger le panier depuis localStorage
function loadCart() {
    try {
        const saved = localStorage.getItem(`cart_${currentTable}`);
        if (saved) {
            cart = JSON.parse(saved);
            console.log('📦 Panier chargé depuis localStorage:', cart);
        } else {
            cart = [];
            console.log('📭 Panier vide');
        }
    } catch (error) {
        console.error('❌ Erreur chargement panier:', error);
        cart = [];
    }
    updateCartCount();
    if (document.getElementById('cartItems')) {
        displayCart();
    }
}

// Sauvegarder le panier dans localStorage
function saveCart() {
    try {
        localStorage.setItem(`cart_${currentTable}`, JSON.stringify(cart));
        console.log('💾 Panier sauvegardé dans localStorage:', cart);
    } catch (error) {
        console.error('❌ Erreur sauvegarde panier:', error);
    }
}

// Vider le panier (localStorage uniquement)
function clearCart() {
    console.log('🗑️ VIDAGE DU PANIER...');
    cart = [];
    localStorage.removeItem(`cart_${currentTable}`);
    console.log('✅ Panier vidé du localStorage');
    updateCartCount();
    if (document.getElementById('cartItems')) {
        displayCart();
    }
    showToast('🗑️ Panier vidé', 'info');
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
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🛒</div>
                <p style="color: #999; font-size: 16px;">Votre panier est vide</p>
                <p style="color: #bbb; font-size: 14px;">Ajoutez des produits depuis le menu</p>
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
        itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee;';
        itemDiv.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 600; color: #333;">${item.name}</span>
                    <span style="color: #999; font-size: 13px;">×${item.quantity}</span>
                </div>
                <div style="color: #667eea; font-weight: 600; margin-top: 5px;">
                    ${(item.price * item.quantity).toFixed(2)} €
                </div>
            </div>
            <div style="display: flex; gap: 5px; align-items: center;">
                <button onclick="updateCartItem('${item.id}', -1)" 
                        style="background: #f0f0f0; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; color: #666;">
                    -
                </button>
                <span style="min-width: 25px; text-align: center; font-weight: 600;">${item.quantity}</span>
                <button onclick="updateCartItem('${item.id}', 1)" 
                        style="background: #667eea; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; color: white;">
                    +
                </button>
                <button onclick="removeFromCart('${item.id}')" 
                        style="background: #f44336; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: white; margin-left: 5px;">
                    ✕
                </button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    if (cartTotalSpan) cartTotalSpan.textContent = total.toFixed(2);
}

// ============ GÉNÉRER UN NUMÉRO DE COMMANDE ============
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

// ============ CRÉER UNE COMMANDE DANS FIREBASE ============
function createOrder() {
    return new Promise((resolve, reject) => {
        if (cart.length === 0) {
            reject(new Error('Panier vide'));
            return;
        }
        
        // Calculer le total
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
        
        // Créer la commande
        const orderNumber = generateOrderNumber();
        const orderData = {
            orderNumber: orderNumber,
            table: parseInt(currentTable),
            items: orderItems,
            total: total,
            subtotal: total,
            tax: 0,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            status: 'en_attente',
            paymentMethod: 'sur_place',
            customerName: '',
            customerPhone: '',
            notes: ''
        };
        
        console.log('📝 Création de la commande:', orderData);
        
        // Sauvegarder dans Firebase
        ordersRef.child('commandes').push(orderData)
            .then((ref) => {
                currentOrderId = ref.key;
                console.log('✅ Commande créée avec ID:', currentOrderId);
                console.log('📋 Numéro de commande:', orderNumber);
                resolve({
                    id: currentOrderId,
                    ...orderData
                });
            })
            .catch(error => {
                console.error('❌ Erreur création commande:', error);
                reject(error);
            });
    });
}

// ============ ENVOYER LA COMMANDE SUR WHATSAPP ============
function sendOrderToWhatsApp(order) {
    if (!order) {
        showToast('❌ Aucune commande à envoyer', 'error');
        return;
    }
    
    let message = `🍽️ *NOUVELLE COMMANDE*\n`;
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
    
    // Encoder pour WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "1234567890"; // Remplacez par votre numéro
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp
    window.open(url, '_blank');
    
    // Mettre à jour le statut de la commande
    ordersRef.child(`commandes/${order.id}`).update({
        status: 'envoye_whatsapp',
        whatsappSent: true,
        whatsappSentAt: Date.now()
    });
    
    return true;
}

// ============ PROCESSUS COMPLET D'ENVOI DE COMMANDE ============
function processOrder() {
    console.log('🔥🔥🔥 DÉBUT PROCESSUS COMMANDE 🔥🔥🔥');
    
    if (cart.length === 0) {
        showToast('❌ Votre panier est vide !', 'error');
        return;
    }
    
    // Désactiver le bouton
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '⏳ Traitement...';
    }
    
    showToast('⏳ Création de la commande...', 'info');
    
    // ÉTAPE 1: Créer la commande dans Firebase
    createOrder()
        .then((order) => {
            console.log('📦 Commande créée:', order);
            showToast('✅ Commande créée !', 'success');
            
            // ÉTAPE 2: VIDER LE PANIER (localStorage uniquement)
            clearCart();
            
            // ÉTAPE 3: Envoyer sur WhatsApp
            console.log('📱 Envoi sur WhatsApp...');
            sendOrderToWhatsApp(order);
            
            // ÉTAPE 4: Afficher la confirmation
            showToast(`✅ Commande ${order.orderNumber} envoyée !`, 'success');
            
            // Fermer le modal
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

// ============ ENVOYER SUR WHATSAPP (Point d'entrée) ============
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
    toast.className = 'menu-toast';
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        padding: 15px 30px; background: ${colors[type] || '#667eea'}; 
        color: white; border-radius: 12px; z-index: 10000;
        font-weight: 500; animation: slideUp 0.5s ease;
        max-width: 90%; text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex; align-items: center; gap: 10px;
    `;
    toast.innerHTML = `<span>${icons[type] || '📢'}</span> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ============ INITIALISATION ============
console.log('🚀 Démarrage du menu...');

loadTableInfo();
listenToProducts();
loadCart();
setupCartModal();
setupFilters();

// Exposer les fonctions
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItem = updateCartItem;
window.clearCart = clearCart;
window.sendToWhatsApp = sendToWhatsApp;
window.processOrder = processOrder;

console.log('✅ Menu initialisé - Table', currentTable);
console.log('📦 Panier:', cart);

// Styles d'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp { from { transform: translateX(-50%) translateY(100px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
    @keyframes slideDown { from { transform: translateX(-50%) translateY(0); opacity: 1; } to { transform: translateX(-50%) translateY(100px); opacity: 0; } }
    @keyframes bounce { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }
`;
document.head.appendChild(style);

console.log('✅ Script.js chargé avec succès');

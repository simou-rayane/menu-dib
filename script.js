// ============ SCRIPT.JS - MENU ET PANIER AVEC FIREBASE ============

let products = [];
let cart = [];
let currentTable = null;
let currentFilter = 'all';

// ============ CHARGER LA TABLE ============
function loadTableInfo() {
    currentTable = localStorage.getItem('current_table');
    if (!currentTable) {
        // Si pas de table, essayer de récupérer de l'URL
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

// ============ ÉCOUTER LES PRODUITS EN TEMPS RÉEL ============
function listenToProducts() {
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📦 Menu - Données Firebase:', data);
        
        if (data) {
            products = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            console.log(`✅ Menu - ${products.length} produits chargés`);
        } else {
            products = [];
            console.log('ℹ️ Menu - Aucun produit disponible');
        }
        
        displayMenu();
        updateMenuStatus();
    }, (error) => {
        console.error('❌ Menu - Erreur Firebase:', error);
        document.getElementById('menuGrid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 10px;">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h3 style="color: #f44336;">Erreur de connexion</h3>
                <p style="color: #999; margin-top: 10px;">${error.message}</p>
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
    
    // Filtrer les produits visibles
    let filteredProducts = products.filter(p => p.visible !== false);
    
    // Appliquer le filtre de catégorie
    if (currentFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentFilter);
    }
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 10px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🍽️</div>
                <h3 style="color: #999;">Aucun produit disponible</h3>
                <p style="color: #bbb; margin-top: 10px;">
                    ${products.length === 0 ? 'Le menu est en cours de préparation...' : 'Aucun produit dans cette catégorie'}
                </p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.cssText = `
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: default;
        `;
        card.onmouseover = () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 5px 25px rgba(0,0,0,0.15)';
        };
        card.onmouseout = () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
        };
        
        // Image du produit
        let imageHTML = '';
        if (product.image) {
            imageHTML = `
                <img src="${product.image}" alt="${product.name}" 
                     style="width: 100%; height: 200px; object-fit: cover;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 100%; height: 200px; background: #f5f7fa; align-items: center; justify-content: center; color: #999; font-size: 48px;">
                    📷
                </div>
            `;
        } else {
            imageHTML = `
                <div style="width: 100%; height: 200px; background: #f5f7fa; display: flex; align-items: center; justify-content: center; color: #ddd; font-size: 64px;">
                    🍽️
                </div>
            `;
        }
        
        // Badge de catégorie
        const categoryLabels = {
            'entrees': '🥗 Entrée',
            'plats': '🍽️ Plat',
            'desserts': '🍰 Dessert',
            'boissons': '🥤 Boisson'
        };
        const categoryLabel = categoryLabels[product.category] || product.category;
        
        card.innerHTML = `
            ${imageHTML}
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 18px; color: #333;">${product.name}</h3>
                    <span style="background: #f0f4ff; color: #667eea; padding: 2px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">${categoryLabel}</span>
                </div>
                <div style="color: #667eea; font-size: 22px; font-weight: bold; margin: 10px 0;">
                    ${product.price.toFixed(2)} €
                </div>
                <div style="color: #666; font-size: 14px; margin-bottom: 15px; min-height: 40px;">
                    ${product.description || 'Aucune description'}
                </div>
                <button onclick="addToCart('${product.id}')" 
                        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                               color: white; border: none; padding: 12px; 
                               width: 100%; border-radius: 8px; cursor: pointer; 
                               font-size: 16px; font-weight: 600;
                               transition: transform 0.2s;"
                        onmouseover="this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'">
                    🛒 Ajouter au panier
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    console.log(`✅ Menu - ${filteredProducts.length} produits affichés`);
}

// ============ AJOUTER AU PANIER ============
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

// ============ SAUVEGARDER LE PANIER ============
function saveCart() {
    if (currentTable) {
        cartsRef.child(`table_${currentTable}`).set(cart)
            .then(() => {
                console.log('✅ Panier sauvegardé');
            })
            .catch(error => {
                console.error('❌ Erreur sauvegarde panier:', error);
            });
    }
}

// ============ CHARGER LE PANIER ============
function loadCart() {
    if (currentTable) {
        cartsRef.child(`table_${currentTable}`).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                cart = data;
                console.log('✅ Panier chargé:', cart);
            } else {
                cart = [];
            }
            updateCartCount();
            if (document.getElementById('cartItems')) {
                displayCart();
            }
        });
    }
}

// ============ METTRE À JOUR LE COMPTEUR ============
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        cartCountSpan.textContent = count;
        // Animation du badge
        if (count > 0) {
            cartCountSpan.style.animation = 'none';
            setTimeout(() => {
                cartCountSpan.style.animation = 'bounce 0.5s ease';
            }, 10);
        }
    }
}

// ============ AFFICHER LE PANIER ============
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
        cartTotalSpan.textContent = '0';
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px; 
            border-bottom: 1px solid #eee;
            animation: slideIn 0.3s ease;
        `;
        itemDiv.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 600; color: #333;">${item.name}</span>
                    <span style="color: #999; font-size: 13px;">×${item.quantity}</span>
                </div>
                <div style="color: #667eea; font-weight: 600; margin-top: 5px;">
                    ${(item.price * item.quantity).toFixed(2)} €
                </div>
                ${item.notes ? `<div style="color: #999; font-size: 12px; margin-top: 3px;">📝 ${item.notes}</div>` : ''}
            </div>
            <div style="display: flex; gap: 5px; align-items: center;">
                <button onclick="updateCartItem('${item.id}', -1)" 
                        style="background: #f0f0f0; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; color: #666; transition: background 0.2s;"
                        onmouseover="this.style.background='#e0e0e0'"
                        onmouseout="this.style.background='#f0f0f0'">
                    -
                </button>
                <span style="min-width: 25px; text-align: center; font-weight: 600;">${item.quantity}</span>
                <button onclick="updateCartItem('${item.id}', 1)" 
                        style="background: #667eea; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold; color: white; transition: background 0.2s;"
                        onmouseover="this.style.background='#764ba2'"
                        onmouseout="this.style.background='#667eea'">
                    +
                </button>
                <button onclick="removeFromCart('${item.id}')" 
                        style="background: #f44336; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: white; margin-left: 5px; transition: background 0.2s;"
                        onmouseover="this.style.background='#c62828'"
                        onmouseout="this.style.background='#f44336'">
                    ✕
                </button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    cartTotalSpan.textContent = total.toFixed(2);
}

// ============ METTRE À JOUR UN ARTICLE DU PANIER ============
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

// ============ SUPPRIMER DU PANIER ============
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        displayCart();
        updateCartCount();
        showToast(`🗑 ${item.name} retiré du panier`, 'info');
    }
}

// ============ VIDER LE PANIER ============
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Vider le panier ?')) {
        cart = [];
        saveCart();
        displayCart();
        updateCartCount();
        showToast('🗑 Panier vidé', 'info');
    }
}

// ============ ENVOYER SUR WHATSAPP AVEC VIDAGE AUTOMATIQUE ============
function sendToWhatsApp() {
    if (cart.length === 0) {
        showToast('❌ Votre panier est vide !', 'error');
        return;
    }
    
    // Désactiver le bouton pour éviter les doubles envois
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '⏳ Envoi en cours...';
    }
    
    let message = `🍽️ *NOUVELLE COMMANDE*\n`;
    message += `📌 Table: ${currentTable}\n`;
    message += `⏰ ${new Date().toLocaleString('fr-FR')}\n\n`;
    message += `*DÉTAILS DE LA COMMANDE:*\n`;
    let total = 0;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€\n`;
        if (item.notes) {
            message += `  📝 ${item.notes}\n`;
        }
        total += item.price * item.quantity;
    });
    
    message += `\n*Total: ${total.toFixed(2)}€*`;
    message += `\n\nMerci de confirmer cette commande.`;
    
    // Sauvegarder la commande dans Firebase
    const orderData = {
        table: parseInt(currentTable),
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || ''
        })),
        total: total,
        timestamp: Date.now(),
        status: 'en_attente',
        customerName: '',
        customerPhone: ''
    };
    
    ordersRef.child('commandes').push(orderData)
        .then(() => {
            console.log('✅ Commande sauvegardée dans Firebase');
            
            // ========== VIDER LE PANIER AUTOMATIQUEMENT ==========
            cart = [];
            saveCart();
            displayCart();
            updateCartCount();
            
            // Fermer le modal
            const modal = document.getElementById('cartModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            
            // Afficher un message de confirmation
            showToast('✅ Commande envoyée avec succès ! Panier vidé.', 'success');
        })
        .catch(error => {
            console.error('❌ Erreur:', error);
            showToast('❌ Erreur: ' + error.message, 'error');
        })
        .finally(() => {
            // Réactiver le bouton
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '📱 Envoyer sur WhatsApp';
            }
        });
    
    // Encoder le message pour WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "1234567890"; // Remplacez par votre numéro WhatsApp
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp
    window.open(url, '_blank');
        }
    
    // Proposer de vider le panier
    setTimeout(() => {
        if (confirm('✅ Commande envoyée ! Vider le panier ?')) {
            cart = [];
            saveCart();
            displayCart();
            updateCartCount();
            document.getElementById('cartModal').style.display = 'none';
        }
    }, 1000);
}

// ============ AJOUTER UNE NOTE SUR UN ARTICLE ============
function addNoteToItem(productId) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    const note = prompt('Ajouter une note pour ce produit (ex: "Sans oignons") :', item.notes || '');
    if (note !== null) {
        item.notes = note.trim();
        saveCart();
        displayCart();
        showToast('✅ Note ajoutée', 'success');
    }
}

// ============ CONFIGURATION DU MODAL PANIER ============
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
    }
    
    if (clearBtn) {
        clearBtn.onclick = clearCart;
    }
    
    // Fermer en cliquant à l'extérieur
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
    
    // Fermer avec la touche ESC
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
            
            // Animation de transition
            const grid = document.getElementById('menuGrid');
            grid.style.opacity = '0';
            setTimeout(() => {
                grid.style.transition = 'opacity 0.3s ease';
                grid.style.opacity = '1';
            }, 50);
        });
    });
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info') {
    // Supprimer les toasts existants
    const existing = document.querySelector('.menu-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'menu-toast';
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
    
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        padding: 15px 30px;
        background: ${colors[type] || '#667eea'}; 
        color: white;
        border-radius: 12px; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        font-size: 16px;
        animation: slideUp 0.5s ease;
        max-width: 90%;
        text-align: center;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    toast.innerHTML = `<span>${icons[type] || '📢'}</span> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// ============ METTRE À JOUR LE STATUT DU MENU ============
function updateMenuStatus() {
    const statusEl = document.getElementById('menuStatus');
    if (!statusEl) return;
    
    const visibleCount = products.filter(p => p.visible).length;
    if (visibleCount === 0) {
        statusEl.textContent = '📭 Menu vide';
        statusEl.style.color = '#ff9800';
    } else {
        statusEl.textContent = `📋 ${visibleCount} plats disponibles`;
        statusEl.style.color = '#4caf50';
    }
}

// ============ RECONNEXION MANUELLE ============
function reconnectMenu() {
    showToast('🔄 Reconnexion en cours...', 'info');
    database.ref('.info/connected').once('value')
        .then((snapshot) => {
            if (snapshot.val()) {
                showToast('✅ Reconnecté avec succès !', 'success');
                listenToProducts();
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

// Charger les infos de la table
loadTableInfo();

// Démarrer l'écoute des produits
listenToProducts();

// Charger le panier
loadCart();

// Configurer le modal panier
setupCartModal();

// Configurer les filtres
setupFilters();

// Exposer les fonctions globalement
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItem = updateCartItem;
window.clearCart = clearCart;
window.sendToWhatsApp = sendToWhatsApp;
window.addNoteToItem = addNoteToItem;
window.reconnectMenu = reconnectMenu;

console.log('✅ Menu initialisé - Table', currentTable);

// ============ ANIMATIONS CSS ============
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100px); opacity: 0; }
    }
    @keyframes slideIn {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
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

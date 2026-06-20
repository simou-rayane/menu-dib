// ============ SCRIPT.JS - VERSION ULTRA-SIMPLE AVEC VIDAGE DIRECT ============

let products = [];
let cart = [];
let currentTable = null;
let currentFilter = 'all';

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
            <button onclick="addToCart('${product.id}')" style="background: #667eea; color: white; border: none; padding: 10px; width: 100%; border-radius: 8px; cursor: pointer;">
                🛒 Ajouter au panier
            </button>
        `;
        grid.appendChild(card);
    });
}

// ============ AJOUTER AU PANIER ============
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
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
    
    // Sauvegarder directement dans Firebase
    database.ref(`carts/table_${currentTable}`).set(cart)
        .then(() => {
            console.log('✅ Panier sauvegardé');
            updateCartCount();
            showToast(`✅ ${product.name} ajouté au panier !`, 'success');
        })
        .catch(error => {
            console.error('❌ Erreur:', error);
            showToast('❌ Erreur: ' + error.message, 'error');
        });
}

// ============ VIDER LE PANIER - DIRECT ============
function clearCart() {
    console.log('🔥 VIDAGE DIRECT DU PANIER...');
    
    // 1. Vider le tableau local
    cart = [];
    
    // 2. Supprimer de Firebase DIRECTEMENT
    database.ref(`carts/table_${currentTable}`).remove()
        .then(() => {
            console.log('✅ Panier supprimé de Firebase');
            
            // 3. Mettre à jour l'affichage
            updateCartCount();
            if (document.getElementById('cartItems')) {
                displayCart();
            }
            
            showToast('🗑️ Panier vidé', 'success');
        })
        .catch(error => {
            console.error('❌ Erreur:', error);
            
            // Tentative alternative
            database.ref(`carts/table_${currentTable}`).set([])
                .then(() => {
                    console.log('✅ Panier vidé avec set([])');
                    updateCartCount();
                    if (document.getElementById('cartItems')) {
                        displayCart();
                    }
                    showToast('🗑️ Panier vidé', 'success');
                })
                .catch(err => {
                    console.error('❌ Erreur alternative:', err);
                    showToast('❌ Erreur: ' + err.message, 'error');
                });
        });
}

// ============ CHARGER LE PANIER ============
function loadCart() {
    database.ref(`carts/table_${currentTable}`).on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📥 Panier chargé:', data);
        if (data && Array.isArray(data) && data.length > 0) {
            cart = data;
        } else {
            cart = [];
        }
        updateCartCount();
        if (document.getElementById('cartItems')) {
            displayCart();
        }
    });
}

// ============ METTRE À JOUR LE COMPTEUR ============
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        cartCountSpan.textContent = count;
    }
}

// ============ AFFICHER LE PANIER ============
function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `<p style="text-align: center; padding: 40px 20px; color: #999;">🛒 Votre panier est vide</p>`;
        cartTotalSpan.textContent = '0';
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach((item) => {
        total += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;';
        itemDiv.innerHTML = `
            <div>
                <strong>${item.name}</strong> × ${item.quantity}
                <br>${(item.price * item.quantity).toFixed(2)} €
            </div>
            <button onclick="removeFromCart('${item.id}')" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✕</button>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    cartTotalSpan.textContent = total.toFixed(2);
}

// ============ SUPPRIMER DU PANIER ============
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        database.ref(`carts/table_${currentTable}`).set(cart);
        displayCart();
        updateCartCount();
    }
}

// ============ ENVOYER SUR WHATSAPP ============
function sendToWhatsApp() {
    if (cart.length === 0) {
        showToast('❌ Votre panier est vide !', 'error');
        return;
    }
    
    let message = `🍽️ *NOUVELLE COMMANDE*\n`;
    message += `📌 Table: ${currentTable}\n`;
    message += `⏰ ${new Date().toLocaleString('fr-FR')}\n\n`;
    message += `*DÉTAILS:*\n`;
    let total = 0;
    
    const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes || ''
    }));
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€\n`;
        total += item.price * item.quantity;
    });
    
    message += `\n*Total: ${total.toFixed(2)}€*`;
    
    const orderData = {
        table: parseInt(currentTable),
        items: orderItems,
        total: total,
        timestamp: Date.now(),
        status: 'en_attente'
    };
    
    // Sauvegarder la commande
    ordersRef.child('commandes').push(orderData)
        .then(() => {
            showToast('✅ Commande envoyée !', 'success');
            
            // VIDER LE PANIER DIRECTEMENT
            clearCart();
            
            // Fermer le modal
            const modal = document.getElementById('cartModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        })
        .catch(error => {
            showToast('❌ Erreur: ' + error.message, 'error');
        });
    
    // Ouvrir WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "1234567890";
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
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
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        padding: 15px 30px; background: ${colors[type] || '#667eea'}; 
        color: white; border-radius: 12px; z-index: 10000;
        font-weight: 500; animation: slideUp 0.5s ease;
        max-width: 90%; text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// ============ INITIALISATION ============
loadTableInfo();
listenToProducts();
loadCart();
setupCartModal();
setupFilters();

// Exposer les fonctions
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.sendToWhatsApp = sendToWhatsApp;

console.log('✅ Menu initialisé - Table', currentTable);

// Styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp { from { transform: translateX(-50%) translateY(100px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
    @keyframes slideDown { from { transform: translateX(-50%) translateY(0); opacity: 1; } to { transform: translateX(-50%) translateY(100px); opacity: 0; } }
`;
document.head.appendChild(style);

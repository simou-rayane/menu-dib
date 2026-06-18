// ============ SCRIPT PRINCIPAL AVEC FIREBASE ============

let products = [];
let cart = [];
let currentTable = null;

// Écouter les changements en temps réel
function listenToProducts() {
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            products = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
        } else {
            // Premier lancement - créer des produits par défaut
            createDefaultProducts();
        }
        
        // Mettre à jour l'affichage si on est sur menu.html
        if (window.location.pathname.includes('menu.html')) {
            displayMenu();
        }
    });
}

// Créer des produits par défaut
function createDefaultProducts() {
    const defaultProducts = {
        prod1: {
            name: "Salade César",
            price: 12,
            category: "entrees",
            description: "Salade, poulet, parmesan, sauce césar",
            visible: true,
            createdAt: Date.now()
        },
        prod2: {
            name: "Steak Frites",
            price: 18,
            category: "plats",
            description: "Steak grillé 200g, frites maison",
            visible: true,
            createdAt: Date.now()
        },
        prod3: {
            name: "Tiramisu",
            price: 7,
            category: "desserts",
            description: "Café, mascarpone, cacao",
            visible: true,
            createdAt: Date.now()
        },
        prod4: {
            name: "Coca-Cola",
            price: 3,
            category: "boissons",
            description: "33cl",
            visible: true,
            createdAt: Date.now()
        },
        prod5: {
            name: "Pizza Margherita",
            price: 14,
            category: "plats",
            description: "Tomate, mozzarella, basilic",
            visible: true,
            createdAt: Date.now()
        }
    };
    
    productsRef.set(defaultProducts);
}

// Sauvegarder le panier dans Firebase
function saveCart() {
    if (currentTable) {
        ordersRef.child(`cart_${currentTable}`).set(cart);
    }
}

// Charger le panier depuis Firebase
function loadCart() {
    if (currentTable) {
        ordersRef.child(`cart_${currentTable}`).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
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
}

// Envoyer commande sur WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('Votre panier est vide !');
        return;
    }
    
    let message = `🍽️ *NOUVELLE COMMANDE*\n`;
    message += `📌 Table: ${currentTable}\n`;
    message += `⏰ Heure: ${new Date().toLocaleString()}\n\n`;
    message += `*DÉTAILS DE LA COMMANDE:*\n`;
    let total = 0;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€\n`;
        total += item.price * item.quantity;
    });
    
    message += `\n*Total: ${total.toFixed(2)}€*\n`;
    message += `\n_Merci de préparer cette commande_`;
    
    // Sauvegarder la commande dans Firebase
    const orderData = {
        table: currentTable,
        items: cart,
        total: total,
        timestamp: Date.now(),
        status: 'en_attente'
    };
    ordersRef.child('commandes').push(orderData);
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "1234567890"; // Remplacez par votre numéro
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
    
    // Optionnel: vider le panier après envoi
    if (confirm('Commande envoyée ! Vider le panier ?')) {
        cart = [];
        saveCart();
        updateCartCount();
        displayCart();
    }
}

// Ajouter au panier
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ 
            id: product.id,
            name: product.name, 
            price: product.price, 
            quantity: 1 
        });
    }
    
    saveCart();
    updateCartCount();
    
    // Animation de confirmation
    const btn = event.target;
    btn.textContent = '✓ Ajouté !';
    setTimeout(() => {
        btn.textContent = 'Ajouter au panier';
    }, 1000);
}

// Supprimer du panier
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        saveCart();
        displayCart();
        updateCartCount();
    }
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) cartCountSpan.textContent = count;
}

// Afficher le menu
function displayMenu() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    
    const filter = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    
    let filteredProducts = products.filter(p => p.visible);
    if (filter !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filter);
    }
    
    grid.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <div class="price">${product.price.toFixed(2)} €</div>
            <div class="description">${product.description || ''}</div>
            <button class="btn-add" onclick="addToCart('${product.id}')">🛒 Ajouter au panier</button>
        `;
        grid.appendChild(card);
    });
}

// Afficher les tables
function displayTables() {
    const grid = document.getElementById('tableGrid');
    if (!grid) return;
    
    for (let i = 1; i <= 10; i++) {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table-card';
        tableDiv.innerHTML = `
            🪑 Table ${i}
            <div style="font-size: 12px; margin-top: 10px;">Scannez le QR code</div>
        `;
        tableDiv.onclick = () => {
            localStorage.setItem('current_table', i);
            window.location.href = 'menu.html';
        };
        grid.appendChild(tableDiv);
    }
}

// Configuration du modal panier
function setupCartModal() {
    const modal = document.getElementById('cartModal');
    const cartIcon = document.getElementById('cartIcon');
    const closeBtn = document.querySelector('.close');
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    
    if (cartIcon) {
        cartIcon.onclick = () => {
            displayCart();
            modal.style.display = 'block';
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
    
    if (sendBtn) {
        sendBtn.onclick = sendToWhatsApp;
    }
}

function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center;">🛒 Votre panier est vide</p>';
        cartTotalSpan.textContent = '0';
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ${item.price.toFixed(2)}€ x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€
            </div>
            <div>
                <button onclick="removeFromCart('${item.id}')" style="background: #ff4444;">🗑 Supprimer</button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    cartTotalSpan.textContent = total.toFixed(2);
}

// Initialisation selon la page
if (window.location.pathname.includes('menu.html')) {
    currentTable = localStorage.getItem('current_table');
    if (!currentTable) {
        window.location.href = 'index.html';
    }
    document.getElementById('tableNumber').textContent = currentTable;
    listenToProducts();
    loadCart();
    setupCartModal();
    
    // Filtres
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            displayMenu();
        });
    });
} else if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    displayTables();
}

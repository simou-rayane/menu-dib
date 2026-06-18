// Initialisation
let products = [];
let cart = [];
let currentTable = null;

// Charger les produits
function loadProducts() {
    const stored = localStorage.getItem('restaurant_products');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        // Produits par défaut
        products = [
            { id: 1, name: "Salade César", price: 12, category: "entrees", description: "Salade, poulet, parmesan", visible: true },
            { id: 2, name: "Steak Frites", price: 18, category: "plats", description: "Steak grillé, frites maison", visible: true },
            { id: 3, name: "Tiramisu", price: 7, category: "desserts", description: "Café, mascarpone", visible: true },
            { id: 4, name: "Coca-Cola", price: 3, category: "boissons", description: "33cl", visible: true }
        ];
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('restaurant_products', JSON.stringify(products));
}

// Sauvegarder le panier
function saveCart() {
    localStorage.setItem(`cart_${currentTable}`, JSON.stringify(cart));
}

function loadCart() {
    const stored = localStorage.getItem(`cart_${currentTable}`);
    if (stored) {
        cart = JSON.parse(stored);
    } else {
        cart = [];
    }
    updateCartCount();
}

// Pages
if (window.location.pathname.includes('menu.html')) {
    currentTable = localStorage.getItem('current_table');
    if (!currentTable) {
        window.location.href = 'index.html';
    }
    document.getElementById('tableNumber').textContent = currentTable;
    loadProducts();
    loadCart();
    displayMenu();
    setupCartModal();
} else if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    displayTables();
}

function displayTables() {
    const grid = document.getElementById('tableGrid');
    if (!grid) return;
    
    for (let i = 1; i <= 10; i++) {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table-card';
        tableDiv.innerHTML = `Table ${i}`;
        tableDiv.onclick = () => {
            localStorage.setItem('current_table', i);
            window.location.href = 'menu.html';
        };
        grid.appendChild(tableDiv);
    }
}

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
            <div class="price">${product.price} €</div>
            <div class="description">${product.description}</div>
            <button class="btn-add" onclick="addToCart(${product.id})">Ajouter au panier</button>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    alert(`${product.name} ajouté au panier !`);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) cartCountSpan.textContent = count;
}

function setupCartModal() {
    const modal = document.getElementById('cartModal');
    const cartIcon = document.getElementById('cartIcon');
    const closeBtn = document.querySelector('.close');
    const sendBtn = document.getElementById('sendWhatsAppBtn');
    
    cartIcon.onclick = () => {
        displayCart();
        modal.style.display = 'block';
    };
    
    closeBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
    
    sendBtn.onclick = sendToWhatsApp;
}

function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Votre panier est vide</p>';
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
                ${item.price}€ x ${item.quantity}
            </div>
            <div>
                <button onclick="removeFromCart(${item.id})">Supprimer</button>
            </div>
        `;
        cartItemsDiv.appendChild(itemDiv);
    });
    
    cartTotalSpan.textContent = total.toFixed(2);
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1);
        saveCart();
        displayCart();
        updateCartCount();
    }
}

function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('Votre panier est vide !');
        return;
    }
    
    let message = `🍽️ *Commande Table ${currentTable}*\n\n`;
    let total = 0;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€\n`;
        total += item.price * item.quantity;
    });
    
    message += `\n*Total: ${total.toFixed(2)}€*`;
    message += `\n\nMerci de confirmer ma commande.`;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "1234567890"; // Remplacez par votre numéro WhatsApp
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
}

// Filtres
if (document.querySelectorAll('.filter-btn').length) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            displayMenu();
        });
    });
}

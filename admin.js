let products = [];

function loadProducts() {
    const stored = localStorage.getItem('restaurant_products');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        products = [
            { id: 1, name: "Salade César", price: 12, category: "entrees", description: "Salade, poulet, parmesan", visible: true },
            { id: 2, name: "Steak Frites", price: 18, category: "plats", description: "Steak grillé, frites maison", visible: true },
            { id: 3, name: "Tiramisu", price: 7, category: "desserts", description: "Café, mascarpone", visible: true },
            { id: 4, name: "Coca-Cola", price: 3, category: "boissons", description: "33cl", visible: true }
        ];
        saveProducts();
    }
    displayProducts();
}

function saveProducts() {
    localStorage.setItem('restaurant_products', JSON.stringify(products));
}

function displayProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    container.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
            <div>
                <strong>${product.name}</strong> - ${product.price}€ (${product.category})
                <br><small>${product.description}</small>
            </div>
            <div>
                <span class="status ${product.visible ? 'visible' : 'hidden'}" onclick="toggleVisibility(${product.id})">
                    ${product.visible ? '✓ Visible' : '✗ Masqué'}
                </span>
                <button onclick="editProduct(${product.id})">✏️ Modifier</button>
            </div>
        `;
        container.appendChild(productDiv);
    });
}

document.getElementById('productForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDesc').value,
        visible: true
    };
    
    products.push(newProduct);
    saveProducts();
    displayProducts();
    this.reset();
    alert('Produit ajouté avec succès !');
});

function toggleVisibility(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.visible = !product.visible;
        saveProducts();
        displayProducts();
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('Nouveau nom:', product.name);
    const newPrice = prompt('Nouveau prix:', product.price);
    const newDesc = prompt('Nouvelle description:', product.description);
    
    if (newName) product.name = newName;
    if (newPrice) product.price = parseFloat(newPrice);
    if (newDesc) product.description = newDesc;
    
    saveProducts();
    displayProducts();
}

loadProducts();

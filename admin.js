// ============ ADMIN AVEC FIREBASE ============

let products = [];

// Écouter les changements en temps réel
function listenToProducts() {
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            products = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            displayProducts();
        }
    });
}

// Ajouter un produit
function addProduct(product) {
    const newProductRef = productsRef.push();
    newProductRef.set({
        name: product.name,
        price: parseFloat(product.price),
        category: product.category,
        description: product.description,
        visible: true,
        createdAt: Date.now()
    }).then(() => {
        alert('✅ Produit ajouté avec succès !');
        document.getElementById('productForm').reset();
    }).catch(error => {
        alert('❌ Erreur : ' + error.message);
    });
}

// Modifier un produit
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('Nouveau nom:', product.name);
    const newPrice = prompt('Nouveau prix:', product.price);
    const newDesc = prompt('Nouvelle description:', product.description);
    
    if (newName && newPrice) {
        productsRef.child(id).update({
            name: newName,
            price: parseFloat(newPrice),
            description: newDesc || ''
        }).then(() => {
            alert('✅ Produit modifié !');
        }).catch(error => {
            alert('❌ Erreur : ' + error.message);
        });
    }
}

// Masquer/Afficher un produit
function toggleVisibility(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        productsRef.child(id).update({
            visible: !product.visible
        }).then(() => {
            console.log('Visibilité modifiée');
        });
    }
}

// Supprimer un produit
function deleteProduct(id) {
    if (confirm('Supprimer définitivement ce produit ?')) {
        productsRef.child(id).remove().then(() => {
            alert('✅ Produit supprimé !');
        }).catch(error => {
            alert('❌ Erreur : ' + error.message);
        });
    }
}

// Afficher les produits dans l'admin
function displayProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Aucun produit. Ajoutez-en un !</p>';
        return;
    }
    
    container.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
            <div style="flex: 1;">
                <strong>${product.name}</strong> - ${product.price.toFixed(2)}€ 
                <span style="color: #666;">(${getCategoryName(product.category)})</span>
                <br><small>${product.description || 'Pas de description'}</small>
            </div>
            <div>
                <span class="status ${product.visible ? 'visible' : 'hidden'}" 
                      onclick="toggleVisibility('${product.id}')" 
                      style="cursor: pointer;">
                    ${product.visible ? '✓ Visible' : '✗ Masqué'}
                </span>
                <button onclick="editProduct('${product.id}')" style="background: #2196F3;">✏️</button>
                <button onclick="deleteProduct('${product.id}')" style="background: #f44336;">🗑</button>
            </div>
        `;
        container.appendChild(productDiv);
    });
}

// Helper: nom de catégorie en français
function getCategoryName(category) {
    const categories = {
        'entrees': 'Entrées',
        'plats': 'Plats',
        'desserts': 'Desserts',
        'boissons': 'Boissons'
    };
    return categories[category] || category;
}

// Gestion du formulaire d'ajout
document.getElementById('productForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newProduct = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDesc').value || ''
    };
    
    addProduct(newProduct);
});

// Afficher les commandes en temps réel (optionnel)
function listenToOrders() {
    ordersRef.child('commandes').on('value', (snapshot) => {
        const orders = snapshot.val();
        if (orders && document.getElementById('ordersList')) {
            displayOrders(orders);
        }
    });
}

function displayOrders(orders) {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    const ordersArray = Object.keys(orders).map(key => ({
        id: key,
        ...orders[key]
    })).reverse(); // Les plus récentes d'abord
    
    container.innerHTML = '<h3>📋 Commandes en temps réel</h3>';
    
    ordersArray.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <div style="border: 1px solid #ddd; margin: 10px 0; padding: 10px; border-radius: 5px;">
                <strong>Table ${order.table}</strong> - ${new Date(order.timestamp).toLocaleString()}
                <br>Total: ${order.total.toFixed(2)}€
                <br>Status: ${order.status}
                <br><button onclick="updateOrderStatus('${order.id}')">✓ Marquer préparé</button>
            </div>
        `;
        container.appendChild(orderDiv);
    });
}

function updateOrderStatus(orderId) {
    ordersRef.child(`commandes/${orderId}`).update({
        status: 'préparé'
    });
}

// Initialiser l'admin
listenToProducts();
// listenToOrders(); // Décommentez pour voir les commandes

// Statistiques en temps réel (optionnel)
function displayStats() {
    productsRef.on('value', (snapshot) => {
        const count = snapshot.numChildren();
        document.getElementById('statsCount')?.setAttribute('data-count', count);
    });
}

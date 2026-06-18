// Configuration Firebase
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    databaseURL: "https://VOTRE_PROJECT-default-rtdb.firebaseio.com",
    projectId: "VOTRE_PROJECT",
    storageBucket: "VOTRE_PROJECT.appspot.com",
    messagingSenderId: "VOTRE_ID",
    appId: "VOTRE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ============ RÉFÉRENCES ============
const productsRef = database.ref('products');
const tablesRef = database.ref('tables');
const ordersRef = database.ref('orders/commandes');
const ordersHistoryRef = database.ref('orders/history');
const cartsRef = database.ref('carts');
const categoriesRef = database.ref('categories');
const settingsRef = database.ref('settings');
const promotionsRef = database.ref('promotions');

// ============ FONCTIONS UTILITAIRES ============

// Générer un ID unique (comme Firebase)
function generateId() {
    return database.ref().push().key;
}

// Ajouter un produit
function addProduct(productData) {
    const newRef = productsRef.push();
    return newRef.set({
        ...productData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        visible: true
    });
}

// Mettre à jour un produit
function updateProduct(productId, updates) {
    return productsRef.child(productId).update({
        ...updates,
        updatedAt: Date.now()
    });
}

// Supprimer un produit
function deleteProduct(productId) {
    return productsRef.child(productId).remove();
}

// Masquer/afficher un produit
function toggleProductVisibility(productId) {
    return productsRef.child(productId).once('value')
        .then(snapshot => {
            const current = snapshot.val();
            return productsRef.child(productId).update({
                visible: !current.visible,
                updatedAt: Date.now()
            });
        });
}

// Ajouter une commande
function addOrder(orderData) {
    const newOrderRef = ordersRef.push();
    return newOrderRef.set({
        ...orderData,
        timestamp: Date.now(),
        status: 'en_attente'
    });
}

// Mettre à jour le statut d'une commande
function updateOrderStatus(orderId, status) {
    return ordersRef.child(orderId).update({
        status: status,
        updatedAt: Date.now()
    });
}

// Sauvegarder le panier d'une table
function saveCart(tableNumber, cartData) {
    return cartsRef.child(`table_${tableNumber}`).set(cartData);
}

// Charger le panier d'une table
function loadCart(tableNumber) {
    return cartsRef.child(`table_${tableNumber}`).once('value');
}

// Écouter les changements en temps réel
function listenToProducts(callback) {
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Convertir en tableau avec les clés
            const products = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            callback(products);
        } else {
            callback([]);
        }
    });
}

// Écouter les commandes en temps réel
function listenToOrders(callback) {
    ordersRef.orderByChild('timestamp').limitToLast(50).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const orders = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).reverse(); // Les plus récentes en premier
            callback(orders);
        } else {
            callback([]);
        }
    });
}

// Écouter l'état des tables
function listenToTables(callback) {
    tablesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const tables = Object.keys(data).map(key => ({
                number: parseInt(key),
                ...data[key]
            }));
            callback(tables);
        } else {
            callback([]);
        }
    });
}

// ============ EXEMPLES D'UTILISATION ============

// 1. Ajouter un nouveau produit
addProduct({
    name: "Pizza Regina",
    price: 16.00,
    category: "plats",
    description: "Tomate, mozzarella, jambon, champignons",
    allergens: ["gluten", "lait"]
}).then(() => {
    console.log('Produit ajouté !');
}).catch(error => {
    console.error('Erreur:', error);
});

// 2. Modifier un produit
updateProduct('-NkX7Y9zQwE5rT2uI8oP', {
    price: 14.00,
    isPromotion: true,
    promotionPrice: 12.00
});

// 3. Passer une commande
addOrder({
    table: 2,
    items: [
        {
            productId: '-NkX7Y9zQwE5rT2uI8oP',
            name: 'Salade César',
            price: 12.00,
            quantity: 2,
            specialInstructions: 'Sans croutons'
        }
    ],
    total: 24.00,
    customerName: 'Jean Dupont',
    customerPhone: '0612345678',
    paymentMethod: 'sur_place',
    note: 'Arrive dans 5 minutes'
});

// 4. Écouter les commandes en temps réel
listenToOrders((orders) => {
    console.log('Nouvelles commandes:', orders);
    // Mettre à jour l'UI
    updateOrdersUI(orders);
});

// 5. Mettre à jour une table
tablesRef.child('2').update({
    status: 'occupied',
    occupiedSince: Date.now(),
    currentOrder: '-NkX8zY9wQeR5tU2iOp'
});

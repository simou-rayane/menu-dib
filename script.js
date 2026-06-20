<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔧 Administration - Gestion du menu</title>
    
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            background: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        header h1 {
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .header-actions button {
            padding: 8px 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .header-actions button:hover {
            transform: scale(1.05);
        }
        
        .btn-export {
            background: #2196F3;
            color: white;
        }
        
        .btn-import {
            background: #ff9800;
            color: white;
        }
        
        .btn-reset {
            background: #f44336;
            color: white;
        }
        
        .btn-clear-carts {
            background: #9C27B0;
            color: white;
        }
        
        #connectionStatus {
            padding: 10px 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        #connectionStatus.connected {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        #connectionStatus.disconnected {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .admin-section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            margin-bottom: 25px;
        }
        
        .admin-section h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f2f5;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
            font-size: 14px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            border-color: #667eea;
            outline: none;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 60px;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            width: 100%;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .image-upload {
            margin: 15px 0;
        }
        
        .image-upload input[type="file"] {
            padding: 10px;
            border: 2px dashed #ccc;
            border-radius: 8px;
            width: 100%;
            cursor: pointer;
        }
        
        .image-upload input[type="file"]:hover {
            border-color: #667eea;
            background: #f8f9ff;
        }
        
        #imagePreview {
            display: none;
            margin: 10px 0;
            padding: 15px;
            background: #f8f9ff;
            border-radius: 8px;
            align-items: center;
            gap: 15px;
        }
        
        #imagePreview img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #667eea;
        }
        
        #imagePreview button {
            background: #f44336;
            color: white;
            border: none;
            padding: 5px 15px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .products-list {
            margin-top: 20px;
        }
        
        .product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
            transition: background 0.3s;
        }
        
        .product-item:hover {
            background: #f8f9ff;
        }
        
        .product-item .product-info {
            display: flex;
            align-items: center;
            gap: 15px;
            flex: 1;
        }
        
        .product-item .product-info img {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .product-item .product-info .placeholder-image {
            width: 50px;
            height: 50px;
            background: #f0f0f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 24px;
        }
        
        .product-item .product-details {
            flex: 1;
        }
        
        .product-item .product-details .name {
            font-weight: 600;
            color: #333;
        }
        
        .product-item .product-details .price {
            color: #667eea;
            font-weight: 600;
        }
        
        .product-item .product-details .category {
            color: #666;
            font-size: 13px;
        }
        
        .product-item .product-details .description {
            color: #999;
            font-size: 13px;
        }
        
        .product-item .product-actions {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }
        
        .product-item .product-actions button {
            padding: 5px 12px;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .product-item .product-actions button:hover {
            transform: scale(1.05);
        }
        
        .status-visible {
            background: #4caf50;
            color: white;
        }
        
        .status-hidden {
            background: #f44336;
            color: white;
        }
        
        .btn-edit {
            background: #2196F3;
            color: white;
        }
        
        .btn-photo {
            background: #4CAF50;
            color: white;
        }
        
        .btn-delete {
            background: #f44336;
            color: white;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        
        .empty-state .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        
        .stats-bar {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        
        .stat-item {
            background: #f8f9ff;
            padding: 10px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stat-item .number {
            font-weight: bold;
            color: #667eea;
            font-size: 20px;
        }
        
        .stat-item .label {
            color: #666;
            font-size: 14px;
        }
        
        /* Modal d'édition */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-overlay .modal-content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 90%;
            overflow-y: auto;
        }
        
        .modal-overlay .modal-content h2 {
            margin-bottom: 20px;
            color: #333;
        }
        
        .modal-overlay .modal-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .modal-overlay .modal-actions button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .modal-overlay .modal-actions .btn-save {
            background: #667eea;
            color: white;
        }
        
        .modal-overlay .modal-actions .btn-cancel {
            background: #f44336;
            color: white;
        }
        
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideUp 0.5s ease;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .toast.success { background: #4caf50; }
        .toast.error { background: #f44336; }
        .toast.info { background: #2196F3; }
        .toast.warning { background: #ff9800; }
        
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(100px); opacity: 0; }
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            header {
                flex-direction: column;
                text-align: center;
            }
            
            .product-item {
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
            }
            
            .product-item .product-actions {
                justify-content: center;
            }
            
            .stats-bar {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔧 Administration du Menu</h1>
            <div class="header-actions">
                <button class="btn-export" onclick="exportProducts()">📤 Exporter</button>
                <button class="btn-import" onclick="importProducts()">📥 Importer</button>
                <button class="btn-clear-carts" onclick="clearAllCarts()">🗑️ Paniers</button>
                <button class="btn-reset" onclick="resetFirebaseProducts()">🔄 Réinitialiser</button>
            </div>
        </header>
        
        <div id="connectionStatus" class="connected">✅ Connecté à Firebase</div>
        
        <div class="stats-bar">
            <div class="stat-item">
                <span class="number" id="productCount">0</span>
                <span class="label">produits</span>
            </div>
            <div class="stat-item">
                <span class="number" id="visibleCount">0</span>
                <span class="label">visibles</span>
            </div>
            <div class="stat-item">
                <span class="number" id="hiddenCount">0</span>
                <span class="label">masqués</span>
            </div>
            <div class="stat-item">
                <span class="label" id="lastSync">🔄 Synchronisé</span>
            </div>
        </div>
        
        <!-- Formulaire d'ajout -->
        <div class="admin-section">
            <h2>➕ Ajouter un produit</h2>
            <form id="productForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="productName">Nom du produit *</label>
                        <input type="text" id="productName" placeholder="Ex: Pizza Margherita" required>
                    </div>
                    <div class="form-group">
                        <label for="productPrice">Prix (€) *</label>
                        <input type="number" id="productPrice" placeholder="14.00" step="0.01" min="0" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="productCategory">Catégorie *</label>
                        <select id="productCategory" required>
                            <option value="entrees">🥗 Entrées</option>
                            <option value="plats" selected>🍽️ Plats</option>
                            <option value="desserts">🍰 Desserts</option>
                            <option value="boissons">🥤 Boissons</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="productImage">📷 Photo (optionnel)</label>
                        <input type="file" id="productImage" accept="image/*" onchange="previewImage(event)">
                    </div>
                </div>
                <div class="form-group full-width">
                    <label for="productDesc">Description</label>
                    <textarea id="productDesc" placeholder="Description du produit..." rows="2"></textarea>
                </div>
                <div id="imagePreview">
                    <img id="previewImg" src="" alt="Aperçu">
                    <button type="button" onclick="removeImage()">🗑 Supprimer</button>
                </div>
                <button type="submit" class="btn-primary" id="addBtn">➕ Ajouter le produit</button>
            </form>
        </div>
        
        <!-- Liste des produits -->
        <div class="admin-section">
            <h2>📋 Gestion des produits (<span id="productCountLabel">0</span>)</h2>
            <div id="productsList" class="products-list">
                <div class="empty-state">
                    <div class="icon">📦</div>
                    <p>Aucun produit. Ajoutez votre premier produit !</p>
                </div>
            </div>
        </div>
        
        <!-- Informations -->
        <div style="background: #f8f9ff; padding: 15px; border-radius: 10px; text-align: center; color: #666; font-size: 13px;">
            💡 Les produits sont synchronisés en temps réel sur tous les appareils via Firebase.
            <br>Les paniers sont stockés dans Firebase et sont vidés après chaque commande.
        </div>
    </div>
    
    <!-- ============ FIREBASE CONFIG ============ -->
    <script src="firebase-config.js"></script>
    
    <!-- ============ ADMIN.JS ============ -->
    <script>
        // ============ ADMIN.JS COMPLET ============
        
        let products = [];
        let isConnected = false;
        
        // ============ ÉTAT DE CONNEXION ============
        function updateConnectionStatus(connected) {
            const statusEl = document.getElementById('connectionStatus');
            if (!statusEl) return;
            
            if (connected) {
                statusEl.className = 'connected';
                statusEl.innerHTML = '✅ Connecté à Firebase - Synchronisation en temps réel active';
                isConnected = true;
            } else {
                statusEl.className = 'disconnected';
                statusEl.innerHTML = '❌ Déconnecté - Vérifiez votre configuration Firebase';
                isConnected = false;
            }
        }
        
        database.ref('.info/connected').on('value', (snapshot) => {
            updateConnectionStatus(snapshot.val());
        });
        
        // ============ VALIDATION ============
        function validateProduct(product) {
            const errors = [];
            
            if (!product.name || product.name.trim() === '') {
                errors.push('❌ Le nom du produit est requis');
            }
            
            if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
                errors.push('❌ Le prix doit être un nombre positif');
            }
            
            if (parseFloat(product.price) > 1000) {
                errors.push('❌ Le prix ne peut pas dépasser 1000€');
            }
            
            const validCategories = ['entrees', 'plats', 'desserts', 'boissons'];
            if (!product.category || !validCategories.includes(product.category)) {
                errors.push(`❌ Catégorie invalide. Choisissez: ${validCategories.join(', ')}`);
            }
            
            if (product.name && product.name.length < 2) {
                errors.push('❌ Le nom doit contenir au moins 2 caractères');
            }
            
            if (product.name && product.name.length > 50) {
                errors.push('❌ Le nom ne peut pas dépasser 50 caractères');
            }
            
            if (errors.length > 0) {
                showToast(errors.join('\n'), 'error');
                return false;
            }
            return true;
        }
        
        // ============ ÉCOUTER LES PRODUITS ============
        function listenToProducts() {
            productsRef.on('value', (snapshot) => {
                const data = snapshot.val();
                console.log('📦 Données reçues de Firebase:', data);
                
                if (data) {
                    products = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    console.log(`✅ ${products.length} produits chargés`);
                } else {
                    products = [];
                    console.log('ℹ️ Aucun produit, création par défaut...');
                    createDefaultProducts();
                }
                
                displayProducts();
                updateStats();
                updateLastSyncTime();
            }, (error) => {
                console.error('❌ Erreur Firebase:', error);
                showToast('❌ Erreur: ' + error.message, 'error');
                document.getElementById('productsList').innerHTML = `
                    <div class="empty-state" style="color: #f44336;">
                        <div class="icon">❌</div>
                        <p>Erreur de connexion: ${error.message}</p>
                        <button onclick="listenToProducts()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            🔄 Réessayer
                        </button>
                    </div>
                `;
            });
        }
        
        // ============ CRÉER PRODUITS PAR DÉFAUT ============
        function createDefaultProducts() {
            console.log('🔄 Création des produits par défaut...');
            
            const defaultProducts = {
                'salade_cesar': {
                    name: "Salade César",
                    price: 12,
                    category: "entrees",
                    description: "Salade, poulet, parmesan, sauce césar",
                    visible: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },
                'steak_frites': {
                    name: "Steak Frites",
                    price: 18,
                    category: "plats",
                    description: "Steak grillé 200g, frites maison",
                    visible: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },
                'tiramisu': {
                    name: "Tiramisu",
                    price: 7,
                    category: "desserts",
                    description: "Café, mascarpone, cacao",
                    visible: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },
                'coca_cola': {
                    name: "Coca-Cola",
                    price: 3,
                    category: "boissons",
                    description: "33cl",
                    visible: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },
                'pizza_margherita': {
                    name: "Pizza Margherita",
                    price: 14,
                    category: "plats",
                    description: "Tomate, mozzarella, basilic",
                    visible: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
            };
            
            productsRef.set(defaultProducts)
                .then(() => {
                    console.log('✅ Produits par défaut créés');
                    showToast('✅ Produits par défaut créés !', 'success');
                })
                .catch(error => {
                    console.error('❌ Erreur:', error);
                    showToast('❌ Erreur: ' + error.message, 'error');
                });
        }
        
        // ============ AFFICHER LES PRODUITS ============
        function displayProducts() {
            const container = document.getElementById('productsList');
            if (!container) return;
            
            if (products.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📦</div>
                        <p>Aucun produit. Ajoutez votre premier produit !</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = '';
            products.forEach((product) => {
                const item = document.createElement('div');
                item.className = 'product-item';
                
                // Image
                let imageHTML = '';
                if (product.image) {
                    imageHTML = `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">`;
                }
                if (!product.image || imageHTML === '') {
                    imageHTML = `<div class="placeholder-image">📷</div>`;
                }
                
                // Status label
                const statusClass = product.visible ? 'status-visible' : 'status-hidden';
                const statusText = product.visible ? '👁️ Visible' : '🚫 Masqué';
                
                item.innerHTML = `
                    <div class="product-info">
                        ${imageHTML}
                        <div class="product-details">
                            <div>
                                <span class="name">${product.name}</span>
                                <span class="price">${product.price.toFixed(2)} €</span>
                                <span class="category">(${getCategoryLabel(product.category)})</span>
                            </div>
                            <div class="description">${product.description || 'Pas de description'}</div>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="${statusClass}" onclick="toggleVisibility('${product.id}')">
                            ${statusText}
                        </button>
                        <button class="btn-edit" onclick="editProduct('${product.id}')">✏️ Modifier</button>
                        <button class="btn-photo" onclick="changeImage('${product.id}')">📷 Photo</button>
                        <button class="btn-delete" onclick="deleteProduct('${product.id}')">🗑 Supprimer</button>
                    </div>
                `;
                container.appendChild(item);
            });
        }
        
        // ============ CATÉGORIE EN FRANÇAIS ============
        function getCategoryLabel(category) {
            const labels = {
                'entrees': '🥗 Entrées',
                'plats': '🍽️ Plats',
                'desserts': '🍰 Desserts',
                'boissons': '🥤 Boissons'
            };
            return labels[category] || category;
        }
        
        // ============ STATISTIQUES ============
        function updateStats() {
            const total = products.length;
            const visible = products.filter(p => p.visible !== false).length;
            const hidden = total - visible;
            
            document.getElementById('productCount').textContent = total;
            document.getElementById('visibleCount').textContent = visible;
            document.getElementById('hiddenCount').textContent = hidden;
            document.getElementById('productCountLabel').textContent = total;
        }
        
        function updateLastSyncTime() {
            const now = new Date();
            document.getElementById('lastSync').textContent = `🔄 ${now.toLocaleTimeString()}`;
        }
        
        // ============ AJOUTER UN PRODUIT ============
        function addProduct(productData) {
            if (!validateProduct(productData)) {
                return Promise.reject(new Error('Validation échouée'));
            }
            
            const newProduct = {
                name: productData.name.trim(),
                price: parseFloat(productData.price),
                category: productData.category,
                description: productData.description ? productData.description.trim() : '',
                visible: true,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            return productsRef.push().set(newProduct)
                .then((ref) => {
                    console.log('✅ Produit ajouté avec ID:', ref.key);
                    showToast('✅ Produit ajouté avec succès !', 'success');
                    
                    const fileInput = document.getElementById('productImage');
                    if (fileInput && fileInput.files.length > 0) {
                        uploadProductImage(fileInput.files[0], ref.key)
                            .then(() => console.log('✅ Image uploadée'))
                            .catch(error => console.warn('⚠️ Erreur upload:', error));
                    }
                    return true;
                })
                .catch((error) => {
                    console.error('❌ Erreur:', error);
                    showToast('❌ Erreur: ' + error.message, 'error');
                    throw error;
                });
        }
        
        // ============ MODIFIER UN PRODUIT ============
        function editProduct(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) {
                showToast('❌ Produit non trouvé', 'error');
                return;
            }
            
            // Créer le modal
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-content">
                    <h2>✏️ Modifier le produit</h2>
                    <form id="editForm">
                        <div class="form-group">
                            <label>Nom *</label>
                            <input type="text" id="editName" value="${product.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Prix (€) *</label>
                            <input type="number" id="editPrice" value="${product.price}" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>Catégorie *</label>
                            <select id="editCategory">
                                <option value="entrees" ${product.category === 'entrees' ? 'selected' : ''}>🥗 Entrées</option>
                                <option value="plats" ${product.category === 'plats' ? 'selected' : ''}>🍽️ Plats</option>
                                <option value="desserts" ${product.category === 'desserts' ? 'selected' : ''}>🍰 Desserts</option>
                                <option value="boissons" ${product.category === 'boissons' ? 'selected' : ''}>🥤 Boissons</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="editDesc" rows="3">${product.description || ''}</textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn-save">✅ Sauvegarder</button>
                            <button type="button" class="btn-cancel" onclick="this.closest('.modal-overlay').remove()">❌ Annuler</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(overlay);
            
            document.getElementById('editForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const updates = {
                    name: document.getElementById('editName').value.trim(),
                    price: parseFloat(document.getElementById('editPrice').value),
                    category: document.getElementById('editCategory').value,
                    description: document.getElementById('editDesc').value.trim(),
                    updatedAt: Date.now()
                };
                
                if (!validateProduct(updates)) return;
                
                productsRef.child(productId).update(updates)
                    .then(() => {
                        showToast('✅ Produit modifié avec succès !', 'success');
                        overlay.remove();
                    })
                    .catch(error => {
                        showToast('❌ Erreur: ' + error.message, 'error');
                    });
            });
        }
        
        // ============ SUPPRIMER UN PRODUIT ============
        function deleteProduct(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            if (!confirm(`⚠️ Supprimer "${product.name}" définitivement ?`)) return;
            
            productsRef.child(productId).remove()
                .then(() => {
                    showToast('✅ Produit supprimé !', 'success');
                })
                .catch(error => {
                    showToast('❌ Erreur: ' + error.message, 'error');
                });
        }
        
        // ============ MASQUER/AFFICHER ============
        function toggleVisibility(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            const newStatus = !product.visible;
            const action = newStatus ? 'affiché' : 'masqué';
            
            productsRef.child(productId).update({
                visible: newStatus,
                updatedAt: Date.now()
            })
            .then(() => {
                showToast(`✅ Produit ${action}`, 'success');
            })
            .catch(error => {
                showToast('❌ Erreur: ' + error.message, 'error');
            });
        }
        
        // ============ GESTION DES IMAGES ============
        function previewImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    const img = document.getElementById('previewImg');
                    if (preview && img) {
                        img.src = e.target.result;
                        preview.style.display = 'flex';
                    }
                };
                reader.readAsDataURL(file);
            }
        }
        
        function removeImage() {
            const input = document.getElementById('productImage');
            const preview = document.getElementById('imagePreview');
            if (input) input.value = '';
            if (preview) preview.style.display = 'none';
        }
        
        function uploadProductImage(file, productId) {
            return new Promise((resolve, reject) => {
                try {
                    const storage = firebase.storage();
                    const storageRef = storage.ref();
                    const imageRef = storageRef.child(`products/${productId}/${file.name}`);
                    
                    imageRef.put(file)
                        .then((snapshot) => snapshot.ref.getDownloadURL())
                        .then((downloadURL) => {
                            return productsRef.child(productId).update({
                                image: downloadURL,
                                updatedAt: Date.now()
                            });
                        })
                        .then(resolve)
                        .catch(reject);
                } catch (error) {
                    console.warn('⚠️ Firebase Storage non disponible:', error);
                    reject(error);
                }
            });
        }
        
        function changeImage(productId) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    showToast('⏳ Upload...', 'info');
                    
                    uploadProductImage(file, productId)
                        .then(() => showToast('✅ Image mise à jour !', 'success'))
                        .catch(error => showToast('❌ Erreur: ' + error.message, 'error'));
                }
            };
            input.click();
        }
        
        // ============ VIDER TOUS LES PANIERS (Firebase) ============
        function clearAllCarts() {
            if (!confirm('⚠️ Supprimer tous les paniers (Firebase) ?')) return;
            
            cartsRef.once('value')
                .then((snapshot) => {
                    const data = snapshot.val();
                    if (!data) {
                        showToast('ℹ️ Aucun panier trouvé', 'info');
                        return;
                    }
                    
                    const promises = [];
                    let count = 0;
                    for (let key in data) {
                        if (key.startsWith('table_')) {
                            promises.push(cartsRef.child(key).remove());
                            count++;
                        }
                    }
                    
                    return Promise.all(promises)
                        .then(() => {
                            showToast(`✅ ${count} paniers vidés !`, 'success');
                        });
                })
                .catch(error => {
                    showToast('❌ Erreur: ' + error.message, 'error');
                });
        }
        
        // ============ EXPORTER ============
        function exportProducts() {
            if (products.length === 0

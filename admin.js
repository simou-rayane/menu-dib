// ============ ADMIN.JS - GESTION DES PRODUITS AVEC FIREBASE ============

let products = [];
let isConnected = false;
let currentEditId = null;

// ============ ÉTAT DE CONNEXION ============
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    if (connected) {
        statusEl.innerHTML = '✅ Connecté à Firebase - Synchronisation en temps réel active';
        statusEl.style.background = '#d4edda';
        statusEl.style.color = '#155724';
        statusEl.style.border = '1px solid #c3e6cb';
        isConnected = true;
    } else {
        statusEl.innerHTML = '❌ Déconnecté - Vérifiez votre configuration Firebase';
        statusEl.style.background = '#f8d7da';
        statusEl.style.color = '#721c24';
        statusEl.style.border = '1px solid #f5c6cb';
        isConnected = false;
    }
}

// Vérifier la connexion en temps réel
database.ref('.info/connected').on('value', (snapshot) => {
    updateConnectionStatus(snapshot.val());
});

// ============ VALIDATION DES PRODUITS ============
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
        alert(errors.join('\n'));
        return false;
    }
    return true;
}

// ============ ÉCOUTER LES PRODUITS EN TEMPS RÉEL ============
function listenToProducts() {
    productsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📦 Données reçues de Firebase:', data);
        
        if (data) {
            products = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            console.log(`✅ ${products.length} produits chargés depuis Firebase`);
        } else {
            products = [];
            console.log('ℹ️ Aucun produit dans Firebase, création des produits par défaut...');
            createDefaultProducts();
        }
        
        displayProducts();
        updateProductCount();
        updateLastSyncTime();
    }, (error) => {
        console.error('❌ Erreur Firebase:', error);
        document.getElementById('productsList').innerHTML = `
            <div style="text-align: center; padding: 20px; color: red;">
                ❌ Erreur de connexion: ${error.message}
                <br><br>
                <button onclick="reconnectFirebase()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Reconnecter
                </button>
            </div>
        `;
    });
}

// ============ CRÉER DES PRODUITS PAR DÉFAUT ============
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
            description: "Steak grillé 200g, frites maison, sauce au choix",
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
            console.log('✅ Produits par défaut créés dans Firebase');
            showToast('✅ Produits par défaut créés avec succès !', 'success');
        })
        .catch(error => {
            console.error('❌ Erreur création produits:', error);
            showToast('❌ Erreur: ' + error.message, 'error');
        });
}

// ============ AFFICHER LES PRODUITS ============
function displayProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                <h3>Aucun produit</h3>
                <p>Ajoutez votre premier produit ci-dessus</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    products.forEach((product) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 15px; 
            border-bottom: 1px solid #eee;
            background: ${product.visible ? 'white' : '#f9f9f9'};
            transition: background 0.3s;
        `;
        productDiv.onmouseover = () => productDiv.style.background = '#f0f4ff';
        productDiv.onmouseout = () => productDiv.style.background = product.visible ? 'white' : '#f9f9f9';
        
        // Affichage de l'image si présente
        let imageHTML = '';
        if (product.image) {
            imageHTML = `<img src="${product.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 15px;">`;
        } else {
            imageHTML = `<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #999;">📷</div>`;
        }
        
        productDiv.innerHTML = `
            <div style="display: flex; align-items: center; flex: 1;">
                ${imageHTML}
                <div>
                    <strong>${product.name}</strong> - ${product.price.toFixed(2)}€ 
                    <span style="color: #666; font-size: 14px;">(${getCategoryLabel(product.category)})</span>
                    ${!product.visible ? '<span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 10px;">MASQUÉ</span>' : ''}
                    <br><small style="color: #999;">${product.description || 'Pas de description'}</small>
                </div>
            </div>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                <span class="status ${product.visible ? 'visible' : 'hidden'}" 
                      onclick="toggleVisibility('${product.id}')" 
                      style="cursor: pointer; padding: 5px 12px; border-radius: 15px; 
                             background: ${product.visible ? '#4caf50' : '#f44336'}; 
                             color: white; font-size: 12px; display: inline-flex; align-items: center; gap: 5px;
                             transition: all 0.3s;">
                    ${product.visible ? '👁️ Visible' : '🚫 Masqué'}
                </span>
                <button onclick="editProduct('${product.id}')" style="background: #2196F3; color: white; border: none; padding: 5px 12px; border-radius: 15px; cursor: pointer; transition: all 0.3s;">
                    ✏️ Modifier
                </button>
                <button onclick="changeImage('${product.id}')" style="background: #4CAF50; color: white; border: none; padding: 5px 12px; border-radius: 15px; cursor: pointer; transition: all 0.3s;">
                    📷 Photo
                </button>
                <button onclick="deleteProduct('${product.id}')" style="background: #f44336; color: white; border: none; padding: 5px 12px; border-radius: 15px; cursor: pointer; transition: all 0.3s;">
                    🗑 Supprimer
                </button>
            </div>
        `;
        container.appendChild(productDiv);
    });
}

// ============ AJOUTER UN PRODUIT ============
function addProduct(productData) {
    // Valider les données
    if (!validateProduct(productData)) {
        return Promise.reject(new Error('Validation échouée'));
    }
    
    // Préparer le produit
    const newProduct = {
        name: productData.name.trim(),
        price: parseFloat(productData.price),
        category: productData.category,
        description: productData.description ? productData.description.trim() : '',
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    // Ajouter à Firebase
    return productsRef.push().set(newProduct)
        .then((ref) => {
            console.log('✅ Produit ajouté à Firebase avec ID:', ref.key);
            showToast('✅ Produit ajouté avec succès !', 'success');
            
            // Si une image est présente, l'uploader
            const fileInput = document.getElementById('productImage');
            if (fileInput && fileInput.files.length > 0) {
                uploadProductImage(fileInput.files[0], ref.key)
                    .then(() => {
                        console.log('✅ Image uploadée avec succès');
                    })
                    .catch(error => {
                        console.warn('⚠️ Erreur upload image:', error);
                    });
            }
            
            return true;
        })
        .catch((error) => {
            console.error('❌ Erreur Firebase:', error);
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
    
    // Créer un formulaire de modification personnalisé
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
        z-index: 9999; animation: fadeIn 0.3s ease;
    `;
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; max-height: 90%; overflow-y: auto;">
            <h2 style="margin-bottom: 20px;">✏️ Modifier le produit</h2>
            <form id="editForm">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nom *</label>
                    <input type="text" id="editName" value="${product.name}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" required>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Prix (€) *</label>
                    <input type="number" id="editPrice" value="${product.price}" step="0.01" min="0" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" required>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Catégorie *</label>
                    <select id="editCategory" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        <option value="entrees" ${product.category === 'entrees' ? 'selected' : ''}>Entrées</option>
                        <option value="plats" ${product.category === 'plats' ? 'selected' : ''}>Plats</option>
                        <option value="desserts" ${product.category === 'desserts' ? 'selected' : ''}>Desserts</option>
                        <option value="boissons" ${product.category === 'boissons' ? 'selected' : ''}>Boissons</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Description</label>
                    <textarea id="editDesc" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">${product.description || ''}</textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="submit" style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                        ✅ Sauvegarder
                    </button>
                    <button type="button" onclick="this.closest('div').parentElement.remove()" style="flex: 1; padding: 12px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        ❌ Annuler
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gérer la soumission du formulaire
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
                console.log('✅ Produit modifié');
                showToast('✅ Produit modifié avec succès !', 'success');
                modal.remove();
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                showToast('❌ Erreur: ' + error.message, 'error');
            });
    });
}

// ============ SUPPRIMER UN PRODUIT ============
function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (!confirm(`⚠️ Supprimer "${product.name}" définitivement ?\nCette action est irréversible.`)) {
        return;
    }
    
    // Supprimer l'image si présente
    if (product.image) {
        deleteProductImage(productId).catch(error => {
            console.warn('⚠️ Erreur suppression image:', error);
        });
    }
    
    productsRef.child(productId).remove()
        .then(() => {
            console.log('✅ Produit supprimé');
            showToast('✅ Produit supprimé !', 'success');
        })
        .catch(error => {
            console.error('❌ Erreur:', error);
            showToast('❌ Erreur: ' + error.message, 'error');
        });
}

// ============ MASQUER/AFFICHER UN PRODUIT ============
function toggleVisibility(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newStatus = !product.visible;
    const action = newStatus ? 'afficher' : 'masquer';
    
    productsRef.child(productId).update({
        visible: newStatus,
        updatedAt: Date.now()
    })
    .then(() => {
        console.log(`✅ Produit ${action}é`);
        showToast(`✅ Produit ${action}é avec succès !`, 'success');
    })
    .catch(error => {
        console.error('❌ Erreur:', error);
        showToast('❌ Erreur: ' + error.message, 'error');
    });
}

// ============ GESTION DES IMAGES (Firebase Storage) ============
function uploadProductImage(file, productId) {
    // Note: Cette fonction nécessite Firebase Storage
    // Si vous ne l'avez pas activée, elle renverra une erreur
    return new Promise((resolve, reject) => {
        try {
            const storage = firebase.storage();
            const storageRef = storage.ref();
            const imageRef = storageRef.child(`products/${productId}/${file.name}`);
            
            imageRef.put(file)
                .then((snapshot) => {
                    return snapshot.ref.getDownloadURL();
                })
                .then((downloadURL) => {
                    return productsRef.child(productId).update({
                        image: downloadURL,
                        updatedAt: Date.now()
                    });
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        } catch (error) {
            console.warn('⚠️ Firebase Storage non disponible:', error);
            reject(error);
        }
    });
}

function deleteProductImage(productId) {
    return new Promise((resolve, reject) => {
        try {
            const storage = firebase.storage();
            productsRef.child(productId).once('value')
                .then((snapshot) => {
                    const product = snapshot.val();
                    if (product && product.image) {
                        const imagePath = decodeURIComponent(product.image.split('/o/')[1].split('?')[0]);
                        return storage.ref().child(imagePath).delete();
                    }
                    return Promise.resolve();
                })
                .then(() => {
                    return productsRef.child(productId).update({
                        image: null,
                        updatedAt: Date.now()
                    });
                })
                .then(resolve)
                .catch(reject);
        } catch (error) {
            console.warn('⚠️ Firebase Storage non disponible:', error);
            resolve(); // Continuer même si storage n'est pas disponible
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
            
            // Compresser l'image avant upload
            if (file.size > 1024 * 1024) { // > 1MB
                if (!confirm('L\'image fait plus de 1MB. Voulez-vous la compresser ?')) {
                    return;
                }
            }
            
            showToast('⏳ Upload en cours...', 'info');
            
            uploadProductImage(file, productId)
                .then(() => {
                    showToast('✅ Image mise à jour avec succès !', 'success');
                })
                .catch(error => {
                    console.error('❌ Erreur upload:', error);
                    showToast('❌ Erreur: ' + error.message, 'error');
                });
        }
    };
    input.click();
}

// ============ PRÉVISUALISATION D'IMAGE ============
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

// ============ METTRE À JOUR LE COMPTEUR ============
function updateProductCount() {
    const countEl = document.getElementById('productCount');
    if (countEl) {
        const visibleCount = products.filter(p => p.visible).length;
        countEl.textContent = `${products.length} (${visibleCount} visibles)`;
    }
}

// ============ METTRE À JOUR L'HEURE DE SYNC ============
function updateLastSyncTime() {
    const timeEl = document.getElementById('lastSync');
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = `Dernière sync: ${now.toLocaleTimeString()}`;
    }
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info') {
    // Supprimer les toasts existants
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196F3'
    };
    
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px;
        background: ${colors[type] || '#667eea'}; color: white;
        border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000; animation: slideInRight 0.5s ease;
        max-width: 400px; font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// ============ RECONNEXION MANUELLE ============
function reconnectFirebase() {
    showToast('🔄 Tentative de reconnexion...', 'info');
    database.ref('.info/connected').once('value')
        .then((snapshot) => {
            if (snapshot.val()) {
                showToast('✅ Reconnecté avec succès !', 'success');
                listenToProducts();
            } else {
                showToast('❌ Impossible de se connecter. Vérifiez vos clés Firebase.', 'error');
            }
        })
        .catch(error => {
            showToast('❌ Erreur: ' + error.message, 'error');
        });
}

// ============ RÉINITIALISER LES PRODUITS ============
function resetFirebaseProducts() {
    if (!confirm('⚠️ Supprimer TOUS les produits et les réinitialiser ?\nCette action est irréversible.')) {
        return;
    }
    
    productsRef.set(null)
        .then(() => {
            createDefaultProducts();
        })
        .catch(error => {
            console.error('❌ Erreur réinitialisation:', error);
            showToast('❌ Erreur: ' + error.message, 'error');
        });
}

// ============ EXPORTER LES PRODUITS (Backup) ============
function exportProducts() {
    if (products.length === 0) {
        showToast('❌ Aucun produit à exporter', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produits_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Export terminé !', 'success');
}

// ============ IMPORTER DES PRODUITS (Restore) ============
function importProducts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const imported = JSON.parse(event.target.result);
                if (!Array.isArray(imported)) {
                    throw new Error('Format invalide');
                }
                
                if (!confirm(`Importer ${imported.length} produits ?\nLes produits existants seront conservés.`)) {
                    return;
                }
                
                const promises = imported.map(product => {
                    const newProduct = {
                        name: product.name,
                        price: product.price,
                        category: product.category || 'plats',
                        description: product.description || '',
                        visible: product.visible !== undefined ? product.visible : true,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    return productsRef.push().set(newProduct);
                });
                
                Promise.all(promises)
                    .then(() => {
                        showToast(`✅ ${imported.length} produits importés avec succès !`, 'success');
                    })
                    .catch(error => {
                        showToast('❌ Erreur: ' + error.message, 'error');
                    });
            } catch (error) {
                showToast('❌ Fichier invalide: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ============ FORMULAIRE D'AJOUT ============
document.getElementById('productForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('📝 Formulaire soumis');
    
    const productData = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDesc').value
    };
    
    console.log('Données du formulaire:', productData);
    
    const btn = document.getElementById('addBtn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Ajout en cours...';
    
    addProduct(productData)
        .then(() => {
            this.reset();
            removeImage();
        })
        .catch(() => {
            // Erreur déjà gérée dans addProduct
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '➕ Ajouter';
        });
});

// ============ INITIALISATION ============
console.log('🚀 Démarrage de l\'administration Firebase...');
console.log('📋 Firebase Database:', database.ref().toString());

// Démarrer l'écoute des produits
listenToProducts();

// Exposer les fonctions globalement
window.toggleVisibility = toggleVisibility;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.changeImage = changeImage;
window.previewImage = previewImage;
window.removeImage = removeImage;
window.reconnectFirebase = reconnectFirebase;
window.resetFirebaseProducts = resetFirebaseProducts;
window.exportProducts = exportProducts;
window.importProducts = importProducts;

console.log('✅ Administration initialisée');

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

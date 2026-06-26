// ============================================
// 🔥 FIREBASE CONFIGURATION - EXEMPLE
// ============================================
// 📝 Copiez ce fichier en config.js localement
// ou configurez les secrets GitHub pour le déploiement

const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    databaseURL: "https://VOTRE_PROJECT-default-rtdb.firebaseio.com",
    projectId: "VOTRE_PROJECT",
    storageBucket: "VOTRE_PROJECT.appspot.com",
    messagingSenderId: "VOTRE_SENDER_ID",
    appId: "VOTRE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const productsRef = database.ref('products');
const ordersRef = database.ref('orders');
const cartsRef = database.ref('carts');
const tablesRef = database.ref('tables');
const categoriesRef = database.ref('categories');
const restaurantsRef = database.ref('restaurants');

console.log('✅ Firebase initialisé');

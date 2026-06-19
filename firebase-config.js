// ============ CONFIGURATION FIREBASE ============
// Remplacez par VOS vraies clés Firebase
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    databaseURL: "https://VOTRE_PROJECT-default-rtdb.firebaseio.com",
    projectId: "VOTRE_PROJECT",
    storageBucket: "VOTRE_PROJECT.appspot.com",
    messagingSenderId: "VOTRE_ID",
    appId: "VOTRE_APP_ID"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Références aux collections
const productsRef = database.ref('products');
const ordersRef = database.ref('orders');
const cartsRef = database.ref('carts');
const tablesRef = database.ref('tables');

console.log('✅ Firebase initialisé');

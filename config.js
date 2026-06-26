// ============ firebase-config.js ============
// ⚠️ NE PAS METTRE SUR GITHUB ! Utilisez config.js généré

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
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

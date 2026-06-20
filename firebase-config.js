// ============ CONFIGURATION FIREBASE ============
// Remplacez par VOS vraies clés Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "restaurant-menu-9179b.firebaseapp.com",
  databaseURL: "https://restaurant-menu-9179b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "restaurant-menu-9179b",
  storageBucket: "restaurant-menu-9179b.firebasestorage.app",
  messagingSenderId: "57456460201",
  appId: "1:57456460201:web:8b40ceeffe81eea918c4b8"
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

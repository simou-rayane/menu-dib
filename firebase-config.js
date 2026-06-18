import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyAp9akZE9yGLmZAVkcZ7YB4pM1kUP8cJWM",
  authDomain: "restaurant-menu-9179b.firebaseapp.com",
  projectId: "restaurant-menu-9179b",
  storageBucket: "restaurant-menu-9179b.firebasestorage.app",
  messagingSenderId: "57456460201",
  appId: "1:57456460201:web:8b40ceeffe81eea918c4b8"
};

const app = initializeApp(firebaseConfig);
const database = firebase.database();

const productsRef = database.ref('products');
const ordersRef = database.ref('orders');
const tablesRef = database.ref('tables');

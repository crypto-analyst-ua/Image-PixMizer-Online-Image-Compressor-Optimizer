// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCFt14JeU4qGlPScGGXnFdKRwZ8iV8oZQY",
  authDomain: "image-pixmizer.firebaseapp.com",
  projectId: "image-pixmizer",
  storageBucket: "image-pixmizer.firebasestorage.app",
  messagingSenderId: "310177828908",
  appId: "1:310177828908:web:264aa42b38b5cbb50fc189"
};

// Проверка инициализации Firebase
let app;
let auth;
let db;

if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

auth = firebase.auth();
db = firebase.firestore();

// Экспорт для использования в других файлах
window.auth = auth;
window.db = db;
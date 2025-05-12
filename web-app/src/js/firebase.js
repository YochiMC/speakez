// Importar desde Firebase (usando ES Modules correctamente)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB7S24-eWxAgZPSylbzGwzSdtR2U4L--hE",
    authDomain: "sistemas-programables-b4-d5995.firebaseapp.com",
    databaseURL: "https://sistemas-programables-b4-d5995-default-rtdb.firebaseio.com",
    projectId: "sistemas-programables-b4-d5995",
    storageBucket: "sistemas-programables-b4-d5995.firebasestorage.app",
    messagingSenderId: "967331639215",
    appId: "1:967331639215:web:f743dcf1554659f4c5495a",
    measurementId: "G-EDNN9CSXPT"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, set };
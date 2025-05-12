// Importar desde Firebase (usando ES Modules correctamente)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBX9IIVowjXno6sNHelFnC89mM3kObex-M",
    authDomain: "sistemas-programables-b4541.firebaseapp.com",
    databaseURL: "https://sistemas-programables-b4541-default-rtdb.firebaseio.com",
    projectId: "sistemas-programables-b4541",
    storageBucket: "sistemas-programables-b4541.firebasestorage.app",
    messagingSenderId: "332221123941",
    appId: "1:332221123941:web:f351e73812f2303211a58c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue, set };
// Importar desde Firebase (usando ES Modules correctamente)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

// Referencia a elementos del DOM
const loaderContainer = document.getElementById('loaderContainer');
const languageSelect = document.getElementById('languageSelect');

// Referencia al nodo en Realtime Database
const loaderRef = ref(database, 'sistemas-programables-b4541-default-rtdb/Sensores/camara');

// Escuchar cambios en tiempo real
onValue(loaderRef, (snapshot) => {
  const value = snapshot.val();
  console.log("[Firebase] Valor recibido:", value);
  if (value === true) {
    ocultarLoader();
  } else {
    mostrarLoader();
  }
});

function mostrarLoader() {
    console.log("[Loader] Activando loader...");
    setTimeout(function() {
        document.getElementById('loaderContainer').style.display = 'flex';
        document.getElementById('languageSelect').style.display = 'none';
    }, 2000);
  }
  
  function ocultarLoader() {
    console.log("[Loader] Desactivando loader...");
    setTimeout(function() {
        document.getElementById('loaderContainer').style.display = 'none';
        document.getElementById('languageSelect').style.display = 'flex';
    }, 2000);
  }

  
  
//importamos firebae
import { database, ref, onValue } from './firebase.js';

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
  setTimeout(function () {
    document.getElementById('loaderContainer').style.display = 'flex';
  }, 2000);
}

function ocultarLoader() {
  console.log("[Loader] Desactivando loader...");
  setTimeout(function () {
    document.getElementById('loaderContainer').style.display = 'none';
  }, 2000);
}



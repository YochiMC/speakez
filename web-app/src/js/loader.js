//importamos firebae
import { database, ref, onValue, set } from './firebase.js';

// Referencia al nodo en Realtime Database
const comando = ref(database, 'Voz/texto_reconocido');
const sensoresRef = ref(database, 'Sensores');

onValue(sensoresRef, (snapshot) => {
  const data = snapshot.val();
  const sensorProx = data?.deteccion_proximidad;
  const sensorRostro = data?.rostro_detectado;

  console.log("[Firebase] Sensor proximidad:", sensorProx);
  console.log("[Firebase] Sensor rostro:", sensorRostro);

  if (sensorProx === true && sensorRostro === true) {
    ocultarLoader();
  } else if (sensorProx === true && sensorRostro === false || sensorProx === false && sensorRostro === true) {
    //No hace nada más que esperar 10 segundos, esto debido a que puede fallar un sensor
    esperarYOcultarLoader();
  }else{
    mostrarLoader();
  }
});

onValue(comando, (snapshot) => {
  const value = snapshot.val();
  console.log("[Firebase] Valor comando:", value);
  if (value === "hola" || value === "quetal" || value === "buenas") {
    resetComandoValue();
    ocultarLoader();
  } else if (value === "adios" || value === "hastaluego" ) {
    resetComandoValue();
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

function resetComandoValue() {
    set(comando, "")
        .then(() => {
            console.log('El valor de "comando" se ha restablecido a una cadena vacía.');
        })
        .catch((error) => {
            console.error('Error al restablecer el valor de "comando":', error);
        });
}

function esperarYOcultarLoader() {
  console.log("[Loader] Esperando 10 segundos antes de quitar el loader...");
  setTimeout(() => {
    ocultarLoader();
  }, 10000); // 10 segundos = 10000 milisegundos
}



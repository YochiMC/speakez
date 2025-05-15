// Importamos Firebase
import { database, ref, onValue, set } from './firebase.js';

// Referencia a la ruta del sensor
const temperatura = ref(database, 'Sensores/dht');

// Actualizar reloj
function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');

    if (timeElement) {
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Actualizar temperatura
function updateTemperature(value) {
    const temperatureElement = document.getElementById('currentTemp');
    if (temperatureElement) {
        temperatureElement.textContent = `${value} °C`;
    } else {
        console.log("[Firebase] Elemento de temperatura no encontrado.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
});

// Escuchar cambios en tiempo real
onValue(temperatura, (snapshot) => {
    const value = snapshot.val();
    console.log("[Firebase] Valor sensor_dht:", value);
    updateSensorValues(value);
});


function updateSensorValues(rawText) {
    const temperatureElement = document.getElementById('currentTemp');
    const humidityElement = document.getElementById('currentHumidity');

    if (!rawText || typeof rawText !== "string") {
        console.log("[Error] Valor inválido recibido:", rawText);
        return;
    }

    const parts = rawText.split('/');
    if (parts.length >= 2) {
        // Limpia y convierte
        const tempRaw = parseFloat(parts[0]);
        const humRaw = parseFloat(parts[1]);

        // Si vienen en décimas, divide entre 10
        const temp = (tempRaw / 10).toFixed(1);
        const hum = (humRaw / 10).toFixed(1);

        if (temperatureElement) temperatureElement.textContent = `${temp} °C`;
        if (humidityElement) humidityElement.textContent = `${hum} %`;
    } else {
        console.log("[Error] Formato inesperado:", rawText);
    }
}


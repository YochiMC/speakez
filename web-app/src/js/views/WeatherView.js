/**
 * WeatherView.js - Maneja la visualización de datos del clima
 */

class WeatherView {
    /**
     * Actualiza el reloj en la interfaz
     */
    updateClock() {
        const now = new Date();
        const timeElement = document.getElementById('currentTime');
        
        if (timeElement) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        } else {
            console.log("[WeatherView] Elemento de tiempo no encontrado.");
        }
    }
    
    /**
     * Actualiza los valores de temperatura en la interfaz
     * @param {object} data - Datos del clima (temperatura y humedad)
     */
    updateWeatherDisplay(data) {
        const temperatureElement = document.getElementById('currentTemp');
        const humidityElement = document.getElementById('currentHumidity');
        
        if (temperatureElement && data.temperature) {
            temperatureElement.textContent = `${data.temperature} °C`;
        } else {
            console.log("[WeatherView] Elemento de temperatura no encontrado o sin datos.");
        }
        
        if (humidityElement && data.humidity) {
            humidityElement.textContent = `${data.humidity} %`;
        } else {
            console.log("[WeatherView] Elemento de humedad no encontrado o sin datos.");
        }
    }
    
    /**
     * Inicia el reloj con actualizaciones periódicas
     */
    startClock() {
        // Actualizar inmediatamente
        this.updateClock();
        
        // Configurar actualización periódica
        setInterval(() => this.updateClock(), 1000);
    }
}

// Exporta una instancia única de WeatherView (Singleton)
const weatherView = new WeatherView();
export default weatherView;
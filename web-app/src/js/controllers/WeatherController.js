/**
 * WeatherController.js - Controla la visualización del clima
 */

import weatherModel from '../models/WeatherModel.js';
import weatherView from '../views/WeatherView.js';

class WeatherController {
    constructor() {
        // Inicializar controlador
        this.initController();
    }
    
    /**
     * Inicializa el controlador del clima
     */
    initController() {
        // Iniciar el reloj
        document.addEventListener('DOMContentLoaded', () => {
            weatherView.startClock();
        });
        
        // Registrar observador para datos del clima
        weatherModel.registerObserver((data) => {
            this.handleWeatherData(data);
        });
    }
    
    /**
     * Maneja los datos del clima
     * @param {object} data - Datos del clima (temperatura y humedad)
     */
    handleWeatherData(data) {
        console.log("[WeatherController] Temperatura:", data.temperature);
        console.log("[WeatherController] Humedad:", data.humidity);
        
        // Actualizar la vista con los nuevos datos
        weatherView.updateWeatherDisplay(data);
    }
}

// Exporta una instancia única de WeatherController (Singleton)
const weatherController = new WeatherController();
export default weatherController;
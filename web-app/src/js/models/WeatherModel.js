/**
 * WeatherModel.js - Maneja los datos meteorológicos
 */

import firebaseModel from './FirebaseModel.js';

class WeatherModel {
    constructor() {
        // Inicializar propiedades
        this.temperature = null;
        this.humidity = null;
        this.lastUpdate = null;
        
        // Inicializar listeners
        this.initListeners();
    }
    
    /**
     * Inicializa los listeners para datos meteorológicos
     */
    initListeners() {
        // Escuchar cambios en la temperatura y humedad
        firebaseModel.listenToChanges(firebaseModel.temperatureRef, (snapshot) => {
            const rawText = snapshot.val();
            this.updateWeatherData(rawText);
        });
    }
    
    /**
     * Actualiza los datos meteorológicos basados en el valor recibido
     * @param {string} rawText - Texto crudo del sensor
     */
    updateWeatherData(rawText) {
        if (!rawText || typeof rawText !== "string") {
            console.log("[WeatherModel] Valor inválido recibido:", rawText);
            return;
        }
        
        const parts = rawText.split('/');
        if (parts.length >= 2) {
            // Limpia y convierte
            const tempRaw = parseFloat(parts[0]);
            const humRaw = parseFloat(parts[1]);
            
            // Si vienen en décimas, divide entre 10
            this.temperature = (tempRaw / 10).toFixed(1);
            this.humidity = (humRaw / 10).toFixed(1);
            
            // Actualizar timestamp
            this.lastUpdate = new Date();
            
            // Notificar a los observadores
            this.notifyObservers();
        } else {
            console.log("[WeatherModel] Formato inesperado:", rawText);
        }
    }
    
    // Lista de callbacks para notificar sobre cambios
    observers = [];
    
    /**
     * Registra un observador para ser notificado de cambios
     * @param {function} callback - Función a llamar cuando hay cambios
     */
    registerObserver(callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
        }
    }
    
    /**
     * Elimina un observador de la lista
     * @param {function} callback - Función a eliminar
     */
    removeObserver(callback) {
        this.observers = this.observers.filter(observer => observer !== callback);
    }
    
    /**
     * Notifica a todos los observadores de cambios en los datos
     */
    notifyObservers() {
        this.observers.forEach(callback => {
            callback({
                temperature: this.temperature,
                humidity: this.humidity,
                lastUpdate: this.lastUpdate
            });
        });
    }
    
    /**
     * Obtiene los datos meteorológicos actuales
     * @returns {object} Datos meteorológicos
     */
    getCurrentWeatherData() {
        return {
            temperature: this.temperature,
            humidity: this.humidity,
            lastUpdate: this.lastUpdate
        };
    }
    
    /**
     * Formatea la temperatura para visualización
     * @returns {string} Temperatura formateada
     */
    getFormattedTemperature() {
        return this.temperature ? `${this.temperature} °C` : 'N/A';
    }
    
    /**
     * Formatea la humedad para visualización
     * @returns {string} Humedad formateada
     */
    getFormattedHumidity() {
        return this.humidity ? `${this.humidity} %` : 'N/A';
    }
}

// Exporta una instancia única de WeatherModel (Singleton)
const weatherModel = new WeatherModel();
export default weatherModel;
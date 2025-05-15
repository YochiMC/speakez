/**
 * SensorsModel.js - Maneja los datos de los sensores
 */

import firebaseModel from './FirebaseModel.js';

class SensorsModel {
    constructor() {
        this.proximityDetected = false;
        this.faceDetected = false;
        this.temperatureData = null;
        this.humidityData = null;
        
        // Inicializar listeners de sensores
        this.initSensorsListeners();
    }
    
    /**
     * Inicializa los listeners para los datos de sensores
     */
    initSensorsListeners() {
        // Escuchar cambios en los sensores de proximidad y rostro
        firebaseModel.listenToChanges(firebaseModel.sensorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.proximityDetected = data.deteccion_proximidad || false;
                this.faceDetected = data.rostro_detectado || false;
                
                // Notificar a los observadores
                this.notifySensorObservers();
            }
        });
        
        // Escuchar cambios en el sensor de temperatura/humedad
        firebaseModel.listenToChanges(firebaseModel.temperatureRef, (snapshot) => {
            const rawText = snapshot.val();
            this.parseTemperatureData(rawText);
            
            // Notificar a los observadores
            this.notifyWeatherObservers();
        });
    }
    
    /**
     * Analiza los datos de temperatura y humedad
     * @param {string} rawText - Texto crudo del sensor
     */
    parseTemperatureData(rawText) {
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
            this.temperatureData = (tempRaw / 10).toFixed(1);
            this.humidityData = (humRaw / 10).toFixed(1);
        } else {
            console.log("[Error] Formato inesperado:", rawText);
        }
    }
    
    // Lista de callbacks para notificar sobre cambios en los sensores
    sensorObservers = [];
    weatherObservers = [];
    
    /**
     * Registra un observador para cambios en los sensores de proximidad/rostro
     * @param {function} callback - Función a llamar cuando hay cambios
     */
    registerSensorObserver(callback) {
        if (typeof callback === 'function') {
            this.sensorObservers.push(callback);
        }
    }
    
    /**
     * Registra un observador para cambios en los datos meteorológicos
     * @param {function} callback - Función a llamar cuando hay cambios
     */
    registerWeatherObserver(callback) {
        if (typeof callback === 'function') {
            this.weatherObservers.push(callback);
        }
    }
    
    /**
     * Notifica a todos los observadores de sensores
     */
    notifySensorObservers() {
        this.sensorObservers.forEach(callback => {
            callback({
                proximityDetected: this.proximityDetected,
                faceDetected: this.faceDetected
            });
        });
    }
    
    /**
     * Notifica a todos los observadores del clima
     */
    notifyWeatherObservers() {
        this.weatherObservers.forEach(callback => {
            callback({
                temperature: this.temperatureData,
                humidity: this.humidityData
            });
        });
    }
    
    /**
     * Obtiene el estado actual de los sensores
     * @returns {object} Estado de los sensores
     */
    getSensorState() {
        return {
            proximityDetected: this.proximityDetected,
            faceDetected: this.faceDetected,
            temperature: this.temperatureData,
            humidity: this.humidityData
        };
    }
}

// Exporta una instancia única de SensorsModel (Singleton)
const sensorsModel = new SensorsModel();
export default sensorsModel;
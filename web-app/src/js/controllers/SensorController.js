/**
 * SensorController.js - Controla los sensores y sus eventos
 */

import sensorsModel from '../models/SensorsModel.js';
import loaderView from '../views/LoaderView.js';

class SensorController {
    constructor() {
        // Inicializar controlador
        this.initController();
    }
    
    /**
     * Inicializa el controlador de sensores
     */
    initController() {
        // Registrar observador para sensores de proximidad/rostro
        sensorsModel.registerSensorObserver((data) => {
            this.handleSensorsData(data);
        });
    }
    
    /**
     * Maneja los datos de los sensores
     * @param {object} data - Datos de los sensores
     */
    handleSensorsData(data) {
        console.log("[SensorController] Sensor proximidad:", data.proximityDetected);
        console.log("[SensorController] Sensor rostro:", data.faceDetected);
        
        // Lógica para mostrar/ocultar el loader según el estado de los sensores
        if (data.proximityDetected === true && data.faceDetected === true) {
            // Ambos sensores detectados, ocultar loader
            loaderView.hideLoader();
        } else if (
            (data.proximityDetected === true && data.faceDetected === false) || 
            (data.proximityDetected === false && data.faceDetected === true)
        ) {
            // Solo un sensor detectado, esperar 10 segundos
            this.waitAndHideLoader();
        } else {
            // Ningún sensor detectado, mostrar loader
            loaderView.showLoader();
        }
    }
    
    /**
     * Espera 10 segundos y luego oculta el loader
     */
    waitAndHideLoader() {
        console.log("[SensorController] Esperando 10 segundos antes de quitar el loader...");
        setTimeout(() => {
            loaderView.hideLoader();
        }, 10000); // 10 segundos = 10000 milisegundos
    }
}

// Exporta una instancia única de SensorController (Singleton)
const sensorController = new SensorController();
export default sensorController;
/**
 * app.js - Punto de entrada de la aplicación
 */

import appController from './controllers/AppController.js';
import './legacy-compatibility.js'; // Cargar compatibilidad con código antiguo

// Cuando se cargue la ventana, inicializar la aplicación
window.onload = () => {
    // Inicializar la aplicación
    appController.init().catch(error => {
        console.error("[App] Error al inicializar la aplicación:", error);
    });
};
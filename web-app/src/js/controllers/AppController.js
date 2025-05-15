/**
 * AppController.js - Controlador principal de la aplicación
 */

import contentModel from '../models/ContentModel.js';
import uiView from '../views/UIView.js';
import sectionView from '../views/SectionView.js';
import navigationController from './NavigationController.js';
import voiceController from './VoiceController.js';
import sensorController from './SensorController.js';
import weatherController from './WeatherController.js';
import eventListenerController from './EventListenerController.js';

class AppController {
    constructor() {
        // Registro de los controladores (no es necesario asignarlos a variables,
        // ya que los singletons ya han sido inicializados al importarlos)
        this.navigationController = navigationController;
        this.voiceController = voiceController;
        this.sensorController = sensorController;
        this.weatherController = weatherController;
        this.eventListenerController = eventListenerController;
    }
    
    /**
     * Inicializa la aplicación
     */
    async init() {
        console.log("[AppController] Inicializando aplicación...");
        
        // Cargar la interfaz de usuario
        await this.loadUI();
        
        // Inicializar el controlador de eventos
        this.eventListenerController.init();
        
        console.log("[AppController] Aplicación inicializada correctamente.");
    }
    
    /**
     * Carga la interfaz de usuario
     */
    async loadUI() {
        try {
            // Función para cargar contenido
            const loadContentCallback = async (path) => {
                return await contentModel.loadContent(path);
            };
            
            // Cargar todos los componentes y secciones
            await uiView.loadUI(loadContentCallback);
        } catch (error) {
            console.error("[AppController] Error al cargar la interfaz:", error);
        }
    }
}

// Exporta una instancia única de AppController (Singleton)
const appController = new AppController();
export default appController;
/**
 * VoiceController.js - Controla los comandos de voz y su procesamiento
 */

import firebaseModel from '../models/FirebaseModel.js';
import contentModel from '../models/ContentModel.js';
import navigationView from '../views/NavigationView.js';
import loaderView from '../views/LoaderView.js';

class VoiceController {
    constructor() {
        // Inicializa el listener para comandos de voz
        this.initVoiceCommandListener();
    }
    
    /**
     * Inicializa el listener para comandos de voz en Firebase
     */
    initVoiceCommandListener() {
        firebaseModel.listenToChanges(firebaseModel.voiceCommandRef, (snapshot) => {
            const commandValue = snapshot.val();
            
            if (commandValue && commandValue !== "") {
                console.log(`[VoiceController] Comando de voz recibido: ${commandValue}`);
                this.processVoiceCommand(commandValue);
            }
        });
    }
    
    /**
     * Procesa un comando de voz y ejecuta la acción correspondiente
     * @param {string} command - Comando de voz recibido
     */
    async processVoiceCommand(command) {
        // Obtener la acción asociada al comando
        const action = contentModel.getCommandAction(command);
        
        // Resetear el valor del comando en Firebase
        await firebaseModel.resetVoiceCommand();
        
        // Si no hay acción asociada, salir
        if (!action) {
            console.log(`[VoiceController] Comando no reconocido: ${command}`);
            return;
        }
        
        // Procesar según el tipo de acción
        if (action.action === 'close') {
            this.handleCloseCommand();
        } else if (action.action === 'greeting') {
            loaderView.hideLoader();
        } else if (action.action === 'farewell') {
            loaderView.showLoader();
        } else if (action.action === 'show') {
            // Mostrar sección principal
            navigationView.showSubsection(action.section);
            
            // Si tiene una sección padre, mostrarla también
            if (action.parent) {
                navigationView.showSubsection(action.parent);
            }
        } else if (action.content) {
            // Es un comando para mostrar contenido específico
            
            // Mostrar sección principal primero
            navigationView.showSubsection(action.section);
            
            // Si tiene una sección padre, mostrarla también
            if (action.parent) {
                navigationView.showSubsection(action.parent);
            }
            
            // Cargar y mostrar el contenido específico
            await this.loadAndShowSpecificContent(action.section, action.content);
        }
    }
    
    /**
     * Maneja el comando de cierre
     */
    handleCloseCommand() {
        const sections = contentModel.getAllSections();
        sections.forEach(section => {
            navigationView.closeSubsection(section + '-section');
        });
    }
    
    /**
     * Carga y muestra contenido específico
     * @param {string} section - Sección del contenido
     * @param {string} contentName - Nombre del contenido
     */
    async loadAndShowSpecificContent(section, contentName) {
        const contentId = `${contentName}-content`;
        const path = contentModel.getContentPath(section, contentName);
        
        try {
            // Cargar el contenido
            const htmlContent = await contentModel.loadContent(path);
            
            // Actualizar el contenedor
            navigationView.updateContentContainer(contentId, htmlContent);
            
            // Mostrar el contenido
            navigationView.showContent(contentId);
        } catch (error) {
            console.error(`[VoiceController] Error cargando ${path}:`, error);
        }
    }
}

// Exporta una instancia única de VoiceController (Singleton)
const voiceController = new VoiceController();
export default voiceController;
/**
 * NavigationController.js - Controla la navegación entre secciones
 */

import contentModel from '../models/ContentModel.js';
import navigationView from '../views/NavigationView.js';

class NavigationController {
    constructor() {
        // Inicializar controlador
        this.initController();
    }
    
    /**
     * Inicializa el controlador de navegación
     */
    initController() {
        // Configurar eventos para cerrar contenido
        navigationView.setupCloseEvents();
        
        // Podría agregar más inicializaciones aquí
    }
    
    /**
     * Muestra una subsección específica
     * @param {string} section - Nombre de la sección
     */
    showSection(section) {
        navigationView.showSubsection(section);
    }
    
    /**
     * Cierra una sección específica
     * @param {string} sectionId - ID de la sección
     */
    closeSection(sectionId) {
        navigationView.closeSubsection(sectionId);
    }
    
    /**
     * Cierra todas las secciones
     */
    closeAllSections() {
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
    async loadAndShowContent(section, contentName) {
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
            console.error(`[NavigationController] Error cargando ${path}:`, error);
        }
    }
}

// Exporta una instancia única de NavigationController (Singleton)
const navigationController = new NavigationController();
export default navigationController;
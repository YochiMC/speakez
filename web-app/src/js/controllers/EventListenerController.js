/**
 * EventListenerController.js - Gestiona los eventos de la interfaz de usuario
 */

import navigationController from './NavigationController.js';
import contentModel from '../models/ContentModel.js';

class EventListenerController {
    constructor() {
        // Lista de los eventos que serán adjuntados después de cargar el DOM
        this.eventSetupFunctions = [
            this.setupNavigationEvents,
            this.setupSectionEvents,
            this.setupContentEvents,
            this.setupCloseEvents
        ];
    }
    
    /**
     * Inicializa todos los eventos
     */
    init() {
        console.log("[EventListenerController] Inicializando eventos...");
        
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAllEvents());
        } else {
            this.setupAllEvents();
        }
        
        // También configurar un observador de mutaciones para capturar elementos añadidos dinámicamente
        this.setupMutationObserver();
    }
    
    /**
     * Configura todos los eventos registrados
     */
    setupAllEvents() {
        this.eventSetupFunctions.forEach(setupFn => setupFn.call(this));
        console.log("[EventListenerController] Todos los eventos configurados.");
    }
    
    /**
     * Configura eventos de navegación principal
     */
    setupNavigationEvents() {
        // Ejemplo: Eventos para botones de navegación principal
        document.querySelectorAll('[data-section]').forEach(button => {
            button.addEventListener('click', (event) => {
                const section = event.currentTarget.getAttribute('data-section');
                navigationController.showSection(section);
                
                // Si el botón tiene un atributo data-parent, mostrar también esa sección
                const parent = event.currentTarget.getAttribute('data-parent');
                if (parent) {
                    navigationController.showSection(parent);
                }
            });
        });
    }
    
    /**
     * Configura eventos para secciones específicas
     */
    setupSectionEvents() {
        // Ejemplo: Eventos para subsecciones
        document.querySelectorAll('[data-subsection]').forEach(button => {
            button.addEventListener('click', (event) => {
                const section = event.currentTarget.getAttribute('data-section');
                const subsection = event.currentTarget.getAttribute('data-subsection');
                navigationController.showSection(section);
                navigationController.showSection(subsection);
            });
        });
    }
    
    /**
     * Configura eventos para contenido específico
     */
    setupContentEvents() {
        // Ejemplo: Eventos para mostrar contenido específico
        document.querySelectorAll('[data-content]').forEach(button => {
            button.addEventListener('click', (event) => {
                const section = event.currentTarget.getAttribute('data-section');
                const content = event.currentTarget.getAttribute('data-content');
                
                // Mostrar la sección si es necesario
                if (section) {
                    navigationController.showSection(section);
                }
                
                // Cargar y mostrar el contenido
                navigationController.loadAndShowContent(section, content);
            });
        });
    }
    
    /**
     * Configura eventos para cerrar elementos
     */
    setupCloseEvents() {
        // Configurar eventos para botones de cierre
        document.querySelectorAll('[data-close]').forEach(button => {
            button.addEventListener('click', (event) => {
                const target = event.currentTarget.getAttribute('data-close');
                
                if (target === 'all') {
                    // Cerrar todas las secciones
                    navigationController.closeAllSections();
                } else if (target) {
                    // Cerrar la sección específica
                    navigationController.closeSection(target);
                }
            });
        });
        
        // Cerrar contenido al hacer clic fuera de él
        document.addEventListener('click', (event) => {
            const contentElements = document.querySelectorAll('.subsection-content');
            contentElements.forEach(content => {
                if (content.style.display === 'flex' && event.target === content) {
                    const contentId = content.id;
                    navigationController.closeContent(contentId);
                }
            });
        });
        
        // Cerrar contenido con la tecla Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const contentElements = document.querySelectorAll('.subsection-content');
                contentElements.forEach(content => {
                    if (content.style.display === 'flex') {
                        const contentId = content.id;
                        navigationController.closeContent(contentId);
                    }
                });
            }
        });
    }
    
    /**
     * Configura un observador de mutaciones para capturar elementos añadidos dinámicamente
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldRefreshEvents = false;
            
            // Verificar si se agregaron nodos que podrían necesitar eventos
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Verificar si algún nodo agregado necesita eventos
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Solo nodos de elementos
                            if (
                                node.hasAttribute('data-section') ||
                                node.hasAttribute('data-subsection') ||
                                node.hasAttribute('data-content') ||
                                node.hasAttribute('data-close') ||
                                node.querySelector('[data-section], [data-subsection], [data-content], [data-close]')
                            ) {
                                shouldRefreshEvents = true;
                            }
                        }
                    });
                }
            });
            
            // Si se encontraron elementos que necesitan eventos, configurarlos
            if (shouldRefreshEvents) {
                console.log("[EventListenerController] Detectados nuevos elementos, reconfigurando eventos...");
                this.setupAllEvents();
            }
        });
        
        // Observar todo el documento para cambios en el árbol DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Exporta una instancia única de EventListenerController (Singleton)
const eventListenerController = new EventListenerController();
export default eventListenerController;
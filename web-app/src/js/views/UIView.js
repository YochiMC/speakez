/**
 * UIView.js - Maneja la interfaz de usuario general
 */

class UIView {
    constructor() {
        // Componentes principales de la UI
        this.components = [
            { id: 'loader-container', path: 'loader' },
            { id: 'header-container', path: 'header' },
            { id: 'info-bar-container', path: 'info-bar' },
            { id: 'dashboard-container', path: 'dashboard' }
        ];
        
        // Secciones principales
        this.sections = [
            { id: 'explora-section-container', section: 'explora-section' },
            { id: 'saborea-section-container', section: 'saborea-section' },
            { id: 'comida-tipica-section-container', section: 'comida-tipica-section' },
            { id: 'restaurantes-section-container', section: 'restaurantes-section' },
            { id: 'visita-section-container', section: 'visita-section' },
            { id: 'eventos-section-container', section: 'eventos-section' },
            { id: 'shopping-section-container', section: 'shopping-section' },
            { id: 'hospedaje-section-container', section: 'hospedaje-section' }
        ];
    }
    
    /**
     * Carga componentes y secciones en la interfaz
     * @param {function} loadContentCallback - Función para cargar contenido
     */
    async loadUI(loadContentCallback) {
        // Cargar componentes
        for (const component of this.components) {
            await this.loadComponent(component.id, component.path, loadContentCallback);
        }
        
        // Cargar secciones
        for (const section of this.sections) {
            await this.loadSection(section.id, section.section, loadContentCallback);
        }
    }
    
    /**
     * Carga un componente en su contenedor
     * @param {string} id - ID del contenedor
     * @param {string} path - Ruta al componente
     * @param {function} loadContentCallback - Función para cargar contenido
     */
    async loadComponent(id, path, loadContentCallback) {
        const container = document.getElementById(id);
        if (!container) {
            console.error(`Contenedor no encontrado: ${id}`);
            return;
        }
        
        try {
            const content = await loadContentCallback(`views/components/${path}.html`);
            container.innerHTML = content;
        } catch (error) {
            console.error(`Error cargando componente ${path}:`, error);
            container.innerHTML = `<p>Error al cargar el componente.</p>`;
        }
    }
    
    /**
     * Carga una sección en su contenedor
     * @param {string} id - ID del contenedor
     * @param {string} section - Nombre de la sección
     * @param {function} loadContentCallback - Función para cargar contenido
     */
    async loadSection(id, section, loadContentCallback) {
        const container = document.getElementById(id);
        if (!container) {
            console.error(`Contenedor de sección no encontrado: ${id}`);
            return;
        }
        
        try {
            const content = await loadContentCallback(`views/sections/${section}.html`);
            container.innerHTML = content;
        } catch (error) {
            console.error(`Error cargando sección ${section}:`, error);
            container.innerHTML = `<p>Error al cargar sección.</p>`;
        }
    }
}

// Exporta una instancia única de UIView (Singleton)
const uiView = new UIView();
export default uiView;
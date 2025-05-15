/**
 * ContentModel.js - Gestiona la carga y el contenido dinámico
 */

class ContentModel {
    constructor() {
        // Mapea comandos de voz a acciones
        this.voiceCommands = {
            // Exploraciones
            'explora': { section: 'explora', action: 'show' },
            'saborea': { section: 'saborea', action: 'show', parent: 'explora' },
            'visita': { section: 'visita', action: 'show', parent: 'explora' },
            
            // Lugares para visitar
            'catedral': { section: 'visita', content: 'catedral-basilica', parent: 'explora' },
            'arco': { section: 'visita', content: 'arco-triunfal', parent: 'explora' },
            'forum': { section: 'visita', content: 'forum-cultural', parent: 'explora' },
            'zonapiel': { section: 'visita', content: 'zona-piel', parent: 'explora' },
            'parque': { section: 'visita', content: 'parque-metropolitano', parent: 'explora' },
            
            // Eventos
            'eventos': { section: 'eventos', action: 'show' },
            'globo': { section: 'eventos', content: 'festival-globo' },
            'feria': { section: 'eventos', content: 'feria-leon' },
            'rally': { section: 'eventos', content: 'rally-mexico' },
            'arte': { section: 'eventos', content: 'festival-arte' },
            
            // Shopping
            'shopping': { section: 'shopping', action: 'show' },
            'piel': { section: 'shopping', content: 'zona-piel-shopping' },
            'centromax': { section: 'shopping', content: 'centro-max' },
            'mayor': { section: 'shopping', content: 'plaza-mayor' },
            'artesanias': { section: 'shopping', content: 'mercado-artesanias' },
            
            // Hospedaje
            'hospedaje': { section: 'hospedaje', action: 'show' },
            'hotsson': { section: 'hospedaje', content: 'hs-hotsson' },
            'minas': { section: 'hospedaje', content: 'real-minas' },
            'victoria': { section: 'hospedaje', content: 'hotel-victoria' },
            
            // Restaurantes
            'restaurantes': { section: 'restaurantes', action: 'show' },
            'tequila': { section: 'restaurantes', content: 'la-tequila' },
            'amarello': { section: 'restaurantes', content: 'amarello' },
            'gastro': { section: 'restaurantes', content: 'gastro-bar' },
            'campomar': { section: 'restaurantes', content: 'campomar' },
            'matgo': { section: 'restaurantes', content: 'matgo' },
            
            // Comida Típica
            'comida': { section: 'comida-tipica', action: 'show' },
            'guacamayas': { section: 'comida-tipica', content: 'guacamayas' },
            'caldo': { section: 'comida-tipica', content: 'caldo-oso' },
            'enchiladas': { section: 'comida-tipica', content: 'enchiladas-mineras' },
            'tacos': { section: 'comida-tipica', content: 'tacos-pastor' },
            'carnitas': { section: 'comida-tipica', content: 'carnitas' },
            
            // Controles
            'cerrar': { action: 'close' },
            'hola': { action: 'greeting' },
            'quetal': { action: 'greeting' },
            'buenas': { action: 'greeting' },
            'adios': { action: 'farewell' },
            'hastaluego': { action: 'farewell' }
        };
        
        // Lista de todas las secciones disponibles
        this.sections = [
            'explora', 'eventos', 'shopping', 'hospedaje', 
            'comida-tipica', 'saborea', 'visita', 'restaurantes'
        ];
    }
    
    /**
     * Obtiene la acción asociada a un comando de voz
     * @param {string} command - Comando de voz
     * @returns {object|null} Acción asociada o null si no existe
     */
    getCommandAction(command) {
        return this.voiceCommands[command] || null;
    }
    
    /**
     * Carga el contenido desde una URL
     * @param {string} path - Ruta al contenido
     * @returns {Promise} Promesa que resuelve al contenido HTML
     */
    async loadContent(path) {
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.text();
        } catch (error) {
            console.error(`Error cargando ${path}:`, error);
            return `<p>Error al cargar el contenido.</p>`;
        }
    }
    
    /**
     * Obtiene la ruta para un contenido específico
     * @param {string} section - Sección
     * @param {string} contentName - Nombre del contenido
     * @returns {string} Ruta al contenido
     */
    getContentPath(section, contentName) {
        return `views/content/${section}/${contentName}-content.html`;
    }
    
    /**
     * Obtiene la ruta para una sección específica
     * @param {string} section - Nombre de la sección
     * @returns {string} Ruta a la sección
     */
    getSectionPath(section) {
        return `views/sections/${section}-section.html`;
    }
    
    /**
     * Obtiene la ruta para un componente específico
     * @param {string} component - Nombre del componente
     * @returns {string} Ruta al componente
     */
    getComponentPath(component) {
        return `views/components/${component}.html`;
    }
    
    /**
     * Obtiene la lista de todas las secciones
     * @returns {array} Lista de secciones
     */
    getAllSections() {
        return this.sections;
    }
}

// Exporta una instancia única de ContentModel (Singleton)
const contentModel = new ContentModel();
export default contentModel;
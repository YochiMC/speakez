/**
 * SectionView.js - Maneja la visualización de secciones específicas
 */

class SectionView {
    /**
     * Carga y muestra una sección en un contenedor específico
     * @param {string} containerId - ID del contenedor donde se cargará la sección
     * @param {string} sectionPath - Ruta al archivo HTML de la sección
     * @param {function} loadContentCallback - Función para cargar contenido
     */
    async loadSection(containerId, sectionPath, loadContentCallback) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[SectionView] Contenedor no encontrado: ${containerId}`);
            return;
        }
        
        try {
            const content = await loadContentCallback(sectionPath);
            container.innerHTML = content;
        } catch (error) {
            console.error(`[SectionView] Error cargando sección ${sectionPath}:`, error);
            container.innerHTML = `<p>Error al cargar la sección.</p>`;
        }
    }
    
    /**
     * Actualiza el contenido de una sección específica
     * @param {string} sectionId - ID de la sección
     * @param {string} content - Contenido HTML para actualizar la sección
     */
    updateSectionContent(sectionId, content) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.innerHTML = content;
        } else {
            console.error(`[SectionView] Sección no encontrada: ${sectionId}`);
        }
    }
    
    /**
     * Agrega elementos a una sección específica
     * @param {string} sectionId - ID de la sección
     * @param {string} content - Contenido HTML para agregar a la sección
     */
    addToSection(sectionId, content) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            // Crear un div temporal para interpretar el HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            
            // Agregar cada nodo hijo a la sección
            while (tempDiv.firstChild) {
                sectionElement.appendChild(tempDiv.firstChild);
            }
        } else {
            console.error(`[SectionView] Sección no encontrada: ${sectionId}`);
        }
    }
    
    /**
     * Oculta todos los elementos de una sección excepto los especificados
     * @param {string} sectionId - ID de la sección
     * @param {array} exceptIds - Array de IDs de elementos que no se ocultarán
     */
    hideAllExcept(sectionId, exceptIds = []) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const children = sectionElement.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (exceptIds.includes(child.id)) {
                    child.style.display = '';
                } else {
                    child.style.display = 'none';
                }
            }
        } else {
            console.error(`[SectionView] Sección no encontrada: ${sectionId}`);
        }
    }
}

// Exporta una instancia única de SectionView (Singleton)
const sectionView = new SectionView();
export default sectionView;
/**
 * NavigationView.js - Maneja la navegación y visualización de contenido
 */

class NavigationView {
    /**
     * Muestra una subsección
     * @param {string} section - Nombre de la sección
     */
    showSubsection(section) {
        const sectionElement = document.getElementById(section + '-section');
        if (sectionElement) {
            sectionElement.style.display = 'flex';
            sectionElement.classList.add('animate-in');
        } else {
            console.error(`[NavigationView] Sección no encontrada: ${section}-section`);
        }
    }
    
    /**
     * Cierra una subsección
     * @param {string} sectionId - ID de la sección
     */
    closeSubsection(sectionId) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.classList.remove('animate-in');
            sectionElement.style.display = 'none';
        } else {
            console.error(`[NavigationView] Sección no encontrada para cerrar: ${sectionId}`);
        }
    }
    
    /**
     * Muestra contenido específico
     * @param {string} contentId - ID del contenido
     */
    showContent(contentId) {
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            contentElement.style.display = 'flex';
            contentElement.classList.add('animate-in');
            
            // Prevenir scroll del body cuando el contenido está abierto
            document.body.style.overflow = 'hidden';
        } else {
            console.error(`[NavigationView] Contenido no encontrado: ${contentId}`);
        }
    }
    
    /**
     * Cierra contenido específico
     * @param {string} contentId - ID del contenido
     */
    closeContent(contentId) {
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            contentElement.classList.remove('animate-in');
            
            // Pequeño delay para permitir que la animación de salida se complete
            setTimeout(() => {
                contentElement.style.display = 'none';
            }, 300);
            
            // Restaurar scroll del body
            document.body.style.overflow = 'auto';
        } else {
            console.error(`[NavigationView] Contenido no encontrado para cerrar: ${contentId}`);
        }
    }
    
    /**
     * Crea o actualiza un contenedor para contenido
     * @param {string} contentId - ID del contenido
     * @param {string} htmlContent - Contenido HTML
     */
    updateContentContainer(contentId, htmlContent) {
        // Verificar si ya existe el contenedor
        let container = document.getElementById(contentId + '-container');
        
        // Si no existe, crearlo
        if (!container) {
            container = document.createElement('div');
            container.id = contentId + '-container';
            document.body.appendChild(container);
        }
        
        // Actualizar el contenido
        container.innerHTML = htmlContent;
    }
    
    /**
     * Configura eventos para cerrar contenido al hacer clic fuera
     */
    setupCloseEvents() {
        // Cerrar contenido al hacer clic fuera de él
        document.addEventListener('click', (event) => {
            const contentElements = document.querySelectorAll('.subsection-content');
            contentElements.forEach(content => {
                if (content.style.display === 'flex' && event.target === content) {
                    this.closeContent(content.id);
                }
            });
        });
        
        // Cerrar contenido con la tecla Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const contentElements = document.querySelectorAll('.subsection-content');
                contentElements.forEach(content => {
                    if (content.style.display === 'flex') {
                        this.closeContent(content.id);
                    }
                });
            }
        });
    }
}

// Exporta una instancia única de NavigationView (Singleton)
const navigationView = new NavigationView();
export default navigationView;
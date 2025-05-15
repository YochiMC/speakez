export class UIView {
    constructor() {
        // Estado de la interfaz
        this.state = {
            activeSection: null,
            activeContent: null,
            loaderVisible: true
        };
    }

    /**
     * Inicializar los event listeners de la UI
     */
    init() {
        // Cerrar contenido al hacer clic fuera de él
        document.addEventListener('click', event => {
            const contentElements = document.querySelectorAll('.subsection-content');
            contentElements.forEach(content => {
                if (content.style.display === 'flex' && event.target === content) {
                    this.closeContent(content.id);
                }
            });
        });

        // Cerrar contenido con la tecla Escape
        document.addEventListener('keydown', event => {
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

    /**
     * Cargar todos los componentes y secciones al iniciar
     */
    async loadAllComponents() {
        // Cargar componentes
        await this.loadComponent('loader-container', 'views/components/loader.html');
        await this.loadComponent('header-container', 'views/components/header.html');
        await this.loadComponent('info-bar-container', 'views/components/info-bar.html');
        await this.loadComponent('dashboard-container', 'views/components/dashboard.html');

        // Cargar secciones
        await this.loadSection('explora-section-container', 'views/sections/explora-section.html');
        await this.loadSection('saborea-section-container', 'views/sections/saborea-section.html');
        await this.loadSection('comida-tipica-section-container', 'views/sections/comida-tipica-section.html');
        await this.loadSection('restaurantes-section-container', 'views/sections/restaurantes-section.html');
        await this.loadSection('visita-section-container', 'views/sections/visita-section.html');
        await this.loadSection('eventos-section-container', 'views/sections/eventos-section.html');
        await this.loadSection('shopping-section-container', 'views/sections/shopping-section.html');
        await this.loadSection('hospedaje-section-container', 'views/sections/hospedaje-section.html');
    }

    /**
     * Cargar un componente HTML
     * @param {string} id - ID del contenedor
     * @param {string} path - Ruta al archivo HTML
     */
    async loadComponent(id, path) {
        const container = document.getElementById(id);
        if (!container) return;

        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            container.innerHTML = await res.text();
        } catch (error) {
            console.error(`Error cargando ${path}:`, error);
            container.innerHTML = `<p>Error al cargar el componente.</p>`;
        }
    }

    /**
     * Cargar una sección HTML
     * @param {string} id - ID del contenedor
     * @param {string} path - Ruta al archivo HTML
     */
    async loadSection(id, path) {
        const container = document.getElementById(id);
        if (!container) return;

        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            container.innerHTML = await res.text();
        } catch (error) {
            console.error(`Error cargando ${path}:`, error);
            container.innerHTML = `<p>Error al cargar sección.</p>`;
        }
    }

    /**
     * Mostrar una subsección
     * @param {string} section - Nombre de la sección
     */
    showSubsection(section) {
        const sectionElement = document.getElementById(section + '-section');
        if (sectionElement) {
            sectionElement.style.display = 'flex';
            sectionElement.classList.add('animate-in');
            this.state.activeSection = section;
        }
    }

    /**
     * Cerrar una subsección
     * @param {string} sectionId - ID de la sección a cerrar
     */
    closeSubsection(sectionId) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.classList.remove('animate-in');
            sectionElement.style.display = 'none';
            if (this.state.activeSection + '-section' === sectionId) {
                this.state.activeSection = null;
            }
        }
    }

    /**
     * Cargar y mostrar contenido dinámicamente
     * @param {string} section - Sección padre
     * @param {string} contentName - Nombre del contenido
     */
    async loadAndShowContent(section, contentName) {
        const contentId = `${contentName}-content`;
        const path = `views/content/${section}/${contentName}-content.html`;

        try {
            // Verificar si ya existe el contenedor
            let container = document.getElementById(contentId + '-container');

            // Si no existe, crearlo
            if (!container) {
                container = document.createElement('div');
                container.id = contentId + '-container';
                document.body.appendChild(container);
            }

            // Cargar el contenido
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            container.innerHTML = await res.text();

            // Mostrar el contenido
            this.showContent(contentId);
        } catch (error) {
            console.error(`Error cargando ${path}:`, error);
        }
    }

    /**
     * Mostrar un contenido
     * @param {string} contentId - ID del contenido
     */
    showContent(contentId) {
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            contentElement.style.display = 'flex';
            contentElement.classList.add('animate-in');
            document.body.style.overflow = 'hidden';
            this.state.activeContent = contentId;
        }
    }

    /**
     * Cerrar un contenido
     * @param {string} contentId - ID del contenido
     */
    closeContent(contentId) {
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            contentElement.classList.remove('animate-in');
            setTimeout(() => {
                contentElement.style.display = 'none';
            }, 300);
            document.body.style.overflow = 'auto';
            this.state.activeContent = null;
        }
    }

    /**
     * Establecer visibilidad del loader
     * @param {boolean} visible - Estado de visibilidad
     */
    setLoaderVisible(visible) {
        const loaderElement = document.getElementById('loaderContainer');
        if (loaderElement) {
            setTimeout(() => {
                loaderElement.style.display = visible ? 'flex' : 'none';
                this.state.loaderVisible = visible;
            }, 2000);
        }
    }
}
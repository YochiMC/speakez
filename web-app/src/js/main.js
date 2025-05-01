// Variables globales
let currentLanguage = 'es';
let componentsLoaded = 0;
let totalComponents = 11; // Actualiza este número si añades o quitas componentes

// Función para marcar el progreso de carga
function updateLoadingProgress() {
    componentsLoaded++;
    const progress = Math.floor((componentsLoaded / totalComponents) * 100);
    debugLog(`Progreso de carga: ${progress}%`);
    
    // Si todos los componentes se cargaron, ocultar el loader inicial
    if (componentsLoaded >= totalComponents) {
        setTimeout(() => {
            const initialLoader = document.getElementById('initial-loader');
            if (initialLoader) {
                initialLoader.style.opacity = '0';
                initialLoader.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    initialLoader.style.display = 'none';
                }, 500);
            }
            debugLog('Aplicación completamente cargada', 'success');
        }, 1000); // Esperar 1 segundo para mostrar el 100%
    }
}

// Función para cargar un componente HTML
function loadComponent(containerId, componentPath) {
    debugLog(`Cargando componente: ${componentPath}`);
    
    const container = document.getElementById(containerId);
    if (!container) {
        debugLog(`Contenedor no encontrado: ${containerId}`, 'error');
        updateLoadingProgress(); // Contar como cargado aunque haya fallado
        return;
    }
    
    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            container.classList.remove('component-placeholder');
            debugLog(`Componente cargado: ${componentPath}`, 'success');
            
            // Inicializar componente si es necesario
            if (containerId === 'loader-container' && typeof initCamera === 'function') {
                setTimeout(() => initCamera(), 500);
            }
            
            updateLoadingProgress();
        })
        .catch(error => {
            debugLog(`Error al cargar ${componentPath}: ${error.message}`, 'error');
            container.innerHTML = `<div class="error-message">Error al cargar componente: ${error.message}</div>`;
            updateLoadingProgress(); // Contar como cargado aunque haya fallado
        });
}

// Función para cargar las secciones
function loadSections() {
    debugLog('Iniciando carga de secciones');
    
    // Lista de todas las secciones a cargar
    const sections = [
        { id: 'explora-section', path: 'views/sections/explora-section.html' },
        { id: 'saborea-section', path: 'views/sections/saborea-section.html' },
        { id: 'comida-tipica-section', path: 'views/sections/comida-tipica-section.html' },
        { id: 'restaurantes-section', path: 'views/sections/restaurantes-section.html' },
        { id: 'visita-section', path: 'views/sections/visita-section.html' },
        { id: 'eventos-section', path: 'views/sections/eventos-section.html' },
        { id: 'shopping-section', path: 'views/sections/shopping-section.html' },
        { id: 'hospedaje-section', path: 'views/sections/hospedaje-section.html' }
    ];
    
    const sectionsContainer = document.getElementById('sections-container');
    if (!sectionsContainer) {
        debugLog('Contenedor de secciones no encontrado', 'error');
        return;
    }
    
    // Crear un elemento para mostrar el progreso de carga de secciones
    const progressElement = document.createElement('div');
    progressElement.className = 'sections-loading-progress';
    progressElement.innerHTML = 'Cargando secciones...';
    sectionsContainer.appendChild(progressElement);
    
    // Contar como un solo componente para el progreso general
    let sectionsLoaded = 0;
    
    // Cargar cada sección
    sections.forEach(section => {
        fetch(section.path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Crear el elemento de sección
                const sectionDiv = document.createElement('div');
                sectionDiv.innerHTML = html;
                sectionsContainer.appendChild(sectionDiv.firstChild);
                
                sectionsLoaded++;
                debugLog(`Sección cargada (${sectionsLoaded}/${sections.length}): ${section.path}`, 'success');
                
                // Actualizar progreso
                progressElement.innerHTML = `Cargando secciones: ${sectionsLoaded}/${sections.length}`;
                
                // Si todas las secciones están cargadas
                if (sectionsLoaded === sections.length) {
                    progressElement.remove();
                    updateLoadingProgress(); // Marcar las secciones como un componente cargado
                }
            })
            .catch(error => {
                debugLog(`Error al cargar sección ${section.id}: ${error.message}`, 'error');
                sectionsLoaded++;
                
                // Si todas las secciones se intentaron cargar (incluso con errores)
                if (sectionsLoaded === sections.length) {
                    progressElement.remove();
                    updateLoadingProgress(); // Marcar las secciones como un componente cargado
                }
            });
    });
}

// Función para inicializar la aplicación
function initApp() {
    debugLog('Inicializando aplicación');
    
    // Cargar componentes principales
    loadComponent('loader-container', 'views/components/loader.html');
    loadComponent('language-select', 'views/components/language-selector.html');
    loadComponent('welcome-video', 'views/components/welcome-video.html');
    loadComponent('main-header', 'views/components/header.html');
    loadComponent('info-bar', 'views/components/info-bar.html');
    loadComponent('dashboard-container', 'views/components/dashboard.html');
    
    // Cargar secciones como un grupo
    loadSections();
    
    // Iniciar funcionalidades básicas después de dar tiempo a la carga
    setTimeout(() => {
        debugLog('Iniciando funcionalidades básicas');
        
        // Inicializar el reloj si la función existe
        if (typeof updateClock === 'function') {
            updateClock();
            setInterval(updateClock, 1000);
            debugLog('Reloj iniciado', 'success');
        } else {
            debugLog('Función updateClock no encontrada', 'error');
        }
        
        // Inicializar el clima si la función existe
        if (typeof fetchWeather === 'function') {
            fetchWeather();
            setInterval(fetchWeather, 600000);
            debugLog('Servicio de clima iniciado', 'success');
        } else {
            debugLog('Función fetchWeather no encontrada', 'error');
        }
    }, 2000);
}

// Iniciar cuando todo esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // Si el DOM ya está cargado (puede ocurrir si el script se carga tarde)
    initApp();
}

// Función de depuración global (definida aquí por si no se carga en el HTML)
if (typeof debugLog !== 'function') {
    window.debugLog = function(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    };
}
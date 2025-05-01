// Variables para navegación
let currentSection = null;

// Seleccionar idioma
function selectLanguage(lang) {
    debugLog(`Seleccionando idioma: ${lang}`);
    
    if (!translations[lang]) {
        debugLog(`Idioma no soportado: ${lang}`, 'error');
        lang = 'es'; // Idioma por defecto
    }
    
    currentLanguage = lang;
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        languageSelect.style.display = 'none';
    } else {
        debugLog('Elemento de selección de idioma no encontrado', 'error');
    }
    
    // Mostrar video de bienvenida
    showWelcomeVideo(lang);
}

// Mostrar video de bienvenida
function showWelcomeVideo(lang) {
    debugLog('Preparando video de bienvenida');
    
    const welcomeVideo = document.getElementById('welcomeVideo');
    const videoPlayer = document.getElementById('welcomeVideoPlayer');
    
    if (!welcomeVideo || !videoPlayer) {
        debugLog('Elementos de video no encontrados', 'error');
        // Continuar directamente a la aplicación
        applyTranslations();
        return;
    }
    
    // Establecer la fuente del video según el idioma (simulado)
    // En un proyecto real, esta sería la ruta real al video
    videoPlayer.src = `assets/videos/welcome-${lang}.mp4`;
    
    welcomeVideo.style.display = 'flex';
    
    // Intentar reproducir el video
    try {
        videoPlayer.play()
            .then(() => {
                debugLog('Video reproduciendo correctamente', 'success');
            })
            .catch(error => {
                debugLog(`Error al reproducir video: ${error.message}`, 'error');
                // Continuar a la aplicación en caso de error
                setTimeout(() => {
                    welcomeVideo.style.display = 'none';
                    applyTranslations();
                }, 1000);
            });
    } catch (error) {
        debugLog(`Error con el video: ${error.message}`, 'error');
        // Continuar a la aplicación en caso de error
        setTimeout(() => {
            welcomeVideo.style.display = 'none';
            applyTranslations();
        }, 1000);
    }
    
    // Cuando termina el video, mostrar la página principal
    videoPlayer.onended = function() {
        debugLog('Video de bienvenida completado');
        welcomeVideo.style.display = 'none';
        applyTranslations();
    };
    
    // Por si no funciona el evento onended, establecer un tiempo máximo
    setTimeout(function() {
        if (welcomeVideo.style.display === 'flex') {
            debugLog('Tiempo máximo de video alcanzado');
            welcomeVideo.style.display = 'none';
            applyTranslations();
        }
    }, 10000); // 10 segundos máximo
}

// Aplicar traducciones
function applyTranslations() {
    debugLog(`Aplicando traducciones para: ${currentLanguage}`);
    
    const lang = currentLanguage;
    
    if (!translations[lang]) {
        debugLog('Traducciones no encontradas, usando español por defecto', 'error');
        lang = 'es'; // Idioma por defecto
    }
    
    let elementsTranslated = 0;
    let elementsNotFound = 0;
    
    // Iterar sobre las traducciones y aplicarlas
    for (const id in translations[lang]) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = translations[lang][id];
            elementsTranslated++;
        } else {
            elementsNotFound++;
        }
    }
    
    debugLog(`Traducciones aplicadas: ${elementsTranslated} elementos (${elementsNotFound} no encontrados)`);
}

// Actualizar reloj
function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    
    if (!timeElement) {
        // No mostrar error porque esta función se llama repetidamente
        return;
    }
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// Mostrar subsección
function showSubsection(section) {
    debugLog(`Mostrando subsección: ${section}`);
    
    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) {
        sectionElement.style.display = 'flex';
        sectionElement.classList.add('animate-in');
        currentSection = section + '-section';
        debugLog(`Subsección ${section} mostrada correctamente`, 'success');
    } else {
        debugLog(`Subsección ${section} no encontrada`, 'error');
    }
}

// Cerrar subsección
function closeSubsection(sectionId) {
    debugLog(`Cerrando subsección: ${sectionId}`);
    
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.remove('animate-in');
        sectionElement.style.display = 'none';
        currentSection = null;
        debugLog(`Subsección ${sectionId} cerrada correctamente`, 'success');
    } else {
        debugLog(`Subsección ${sectionId} no encontrada para cerrar`, 'error');
    }
}

// Función para registrar que este módulo se cargó correctamente
if (typeof debugLog === 'function') {
    debugLog('Módulo de navegación cargado', 'success');
}
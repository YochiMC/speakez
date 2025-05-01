// Función para inicializar la cámara
function initCamera() {
    debugLog('Inicializando cámara');
    
    const video = document.getElementById('cameraFeed');
    const detectionText = document.getElementById('detectionText');
    
    if (!video || !detectionText) {
        debugLog('Elementos de cámara no encontrados', 'error');
        return;
    }
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
                
                // Simular detección de usuario después de 3 segundos
                setTimeout(function() {
                    detectionText.textContent = 'Usuario detectado';
                    debugLog('Usuario detectado por la cámara', 'success');
                    
                    // Mostrar selector de idiomas después de 1 segundo
                    setTimeout(function() {
                        const loaderContainer = document.getElementById('loaderContainer');
                        const languageSelect = document.getElementById('languageSelect');
                        
                        if (loaderContainer) {
                            loaderContainer.style.display = 'none';
                            debugLog('Ocultando pantalla de detección');
                        }
                        
                        if (languageSelect) {
                            languageSelect.style.display = 'flex';
                            debugLog('Mostrando selector de idiomas');
                        }
                    }, 1000);
                }, 3000);
            })
            .catch(function(error) {
                debugLog(`Error al acceder a la cámara: ${error.message}`, 'error');
                
                // Fallback en caso de error
                detectionText.textContent = 'No se pudo acceder a la cámara';
                
                setTimeout(function() {
                    const loaderContainer = document.getElementById('loaderContainer');
                    const languageSelect = document.getElementById('languageSelect');
                    
                    if (loaderContainer) loaderContainer.style.display = 'none';
                    if (languageSelect) languageSelect.style.display = 'flex';
                }, 2000);
            });
    } else {
        debugLog('getUserMedia no está soportado en este navegador', 'error');
        detectionText.textContent = 'Cámara no soportada';
        
        setTimeout(function() {
            const loaderContainer = document.getElementById('loaderContainer');
            const languageSelect = document.getElementById('languageSelect');
            
            if (loaderContainer) loaderContainer.style.display = 'none';
            if (languageSelect) languageSelect.style.display = 'flex';
        }, 2000);
    }
}

// Función para registrar que este módulo se cargó correctamente
if (typeof debugLog === 'function') {
    debugLog('Módulo de cámara cargado', 'success');
}
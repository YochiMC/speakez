// Inicializar la cámara
function initCamera() {
    const video = document.getElementById('cameraFeed');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
                
                // Simular detección de usuario después de 3 segundos
                setTimeout(function() {
                    document.getElementById('detectionText').textContent = 'Usuario detectado';
                    
                    // Mostrar selector de idiomas después de 1 segundo
                    setTimeout(function() {
                        document.getElementById('loaderContainer').style.display = 'none';
                        document.getElementById('languageSelect').style.display = 'flex';
                    }, 1000);
                }, 3000);
            })
            .catch(function(error) {
                console.error('Error al acceder a la cámara:', error);
                // Fallback en caso de error
                document.getElementById('detectionText').textContent = 'No se pudo acceder a la cámara';
                setTimeout(function() {
                    document.getElementById('loaderContainer').style.display = 'none';
                    document.getElementById('languageSelect').style.display = 'flex';
                }, 2000);
            });
    } else {
        console.error('getUserMedia no está soportado en este navegador');
        document.getElementById('detectionText').textContent = 'Cámara no soportada';
        setTimeout(function() {
            document.getElementById('loaderContainer').style.display = 'none';
            document.getElementById('languageSelect').style.display = 'flex';
        }, 2000);
    }
}
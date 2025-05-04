// Inicializar la cámara con simulación de Firebase
function initCamera() {
    const video = document.getElementById('cameraFeed');
    
    // Variable para simular Firebase (como si fuera una referencia a la base de datos)
    let firebaseUserDetected = false;
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
                
                // Simular escucha de cambios en Firebase
                simulateFirebaseListener();
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
    
    // Función para simular escucha de cambios en Firebase
    function simulateFirebaseListener() {
        console.log('Escuchando cambios en Firebase...');
        document.getElementById('detectionText').textContent = 'Conectando con sistema externo...';
        
        // Simular tiempo de respuesta variable para la detección externa
        const detectionTime = Math.random() * 2000 + 1000; // Entre 1 y 3 segundos
        
        setTimeout(function() {
            // Simular que se recibió un valor de Firebase
            firebaseUserDetected = true;
            
            console.log('Firebase detectó usuario:', firebaseUserDetected);
            document.getElementById('detectionText').textContent = 'Usuario detectado';
            
            // Mostrar selector de idiomas después de recibir datos
            setTimeout(function() {
                document.getElementById('loaderContainer').style.display = 'none';
                document.getElementById('languageSelect').style.display = 'flex';
            }, 1000);
        }, detectionTime);
    }
}
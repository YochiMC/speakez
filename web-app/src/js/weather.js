// Función para obtener y mostrar el clima
function fetchWeather() {
    debugLog('Obteniendo información del clima');
    
    // Simulación de API de clima (en un proyecto real usarías una API real)
    const temperature = Math.floor(Math.random() * 10) + 20; // 20-30°C
    const tempElement = document.getElementById('currentTemp');
    
    if (tempElement) {
        tempElement.textContent = `${temperature}°C`;
        debugLog(`Clima actualizado: ${temperature}°C`, 'success');
    } else {
        debugLog('Elemento de temperatura no encontrado', 'error');
    }
    
    // En una implementación real, usar una API de clima como OpenWeatherMap
    /*
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Leon,mx&units=metric&appid=YOUR_API_KEY')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const temperature = Math.round(data.main.temp);
            const tempElement = document.getElementById('currentTemp');
            if (tempElement) {
                tempElement.textContent = `${temperature}°C`;
                debugLog(`Clima actualizado desde API: ${temperature}°C`, 'success');
            }
        })
        .catch(error => {
            debugLog(`Error al obtener el clima: ${error.message}`, 'error');
            // Fallback en caso de error
            const temperature = Math.floor(Math.random() * 10) + 20;
            const tempElement = document.getElementById('currentTemp');
            if (tempElement) {
                tempElement.textContent = `${temperature}°C`;
            }
        });
    */
}

// Función para registrar que este módulo se cargó correctamente
if (typeof debugLog === 'function') {
    debugLog('Módulo de clima cargado', 'success');
}
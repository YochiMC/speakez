// Actualizar reloj
function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// Actualizar cada segundo
setInterval(updateClock, 1000);

// Ejecutar inmediatamente al cargar
updateClock();

// Obtener clima
function fetchWeather() {
    // Simulación de API de clima
    const temperature = Math.floor(Math.random() * 10) + 20; // 20-30°C
    document.getElementById('currentTemp').textContent = `${temperature}°C`;
    
    // En una implementación real, usar una API de clima como OpenWeatherMap
    // fetch('https://api.openweathermap.org/data/2.5/weather?q=Leon,mx&units=metric&appid=YOUR_API_KEY')
    //     .then(response => response.json())
    //     .then(data => {
    //         document.getElementById('currentTemp').textContent = `${Math.round(data.main.temp)}°C`;
    //     })
    //     .catch(error => console.error('Error al obtener el clima:', error));
}
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar reloj
    function updateClock() {
        const now = new Date();
        const timeElement = document.getElementById('currentTime');

        if (timeElement) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');

            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    // Obtener clima
    function fetchWeather() {
        fetch('https://api.openweathermap.org/data/2.5/weather?q=Leon,mx&units=metric&appid=TU_API_KEY')
            .then(response => response.json())
            .then(data => {
                const tempElement = document.getElementById('currentTemp');
                if (tempElement) {
                    tempElement.textContent = `${Math.round(data.main.temp)}°C`;
                }
            })
            .catch(error => console.error('Error al obtener el clima:', error));
    }

    updateClock();
    fetchWeather();

    setInterval(updateClock, 1000); // Cada segundo
    setInterval(fetchWeather, 5 * 60 * 1000); // Cada 5 minutos
});

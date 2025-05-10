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
    }

    updateClock();
    fetchWeather();

    setInterval(updateClock, 1000); // Cada segundo
    setInterval(fetchWeather, 5 * 60 * 1000); // Cada 5 minutos
});

export class WeatherView {
    constructor() {
        this.timeElement = null;
        this.tempElement = null;
        this.humidityElement = null;
    }

    /**
     * Inicializar la vista del clima
     */
    init() {
        // Obtener referencias a los elementos
        this.timeElement = document.getElementById('currentTime');
        this.tempElement = document.getElementById('currentTemp');
        this.humidityElement = document.getElementById('currentHumidity');

        // Iniciar el reloj
        this.startClock();
    }

    /**
     * Actualizar la temperatura mostrada
     * @param {string|number} value - Valor de temperatura
     */
    updateTemperature(value) {
        if (this.tempElement) {
            this.tempElement.textContent = `${value} °C`;
        }
    }

    /**
     * Actualizar la humedad mostrada
     * @param {string|number} value - Valor de humedad
     */
    updateHumidity(value) {
        if (this.humidityElement) {
            this.humidityElement.textContent = `${value} %`;
        }
    }

    /**
     * Actualizar el reloj
     */
    updateClock() {
        if (!this.timeElement) return;

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        this.timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Iniciar el reloj
     */
    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
}
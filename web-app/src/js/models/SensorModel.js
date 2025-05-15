import { FirebaseModel } from './FirebaseModel.js';

export class SensorModel extends FirebaseModel {
    constructor() {
        super();
        this.sensores = {
            proximidad: false,
            rostro: false,
            temperatura: 0,
            humedad: 0
        };
    }

    /**
     * Inicializar las suscripciones a los sensores
     * @param {Function} proximidadCallback - Función a ejecutar cuando cambia proximidad
     * @param {Function} temperaturaCallback - Función a ejecutar cuando cambia temperatura
     */
    init(proximidadCallback, temperaturaCallback) {
        // Suscribirse a sensores de proximidad y rostro
        this.subscribe('Sensores', data => {
            this.sensores.proximidad = data?.deteccion_proximidad || false;
            this.sensores.rostro = data?.rostro_detectado || false;

            if (proximidadCallback) {
                proximidadCallback(this.sensores.proximidad, this.sensores.rostro);
            }
        });

        // Suscribirse a sensor de temperatura/humedad
        this.subscribe('Sensores/dht', rawText => {
            if (!rawText || typeof rawText !== "string") return;

            const parts = rawText.split('/');
            if (parts.length >= 2) {
                this.sensores.temperatura = (parseFloat(parts[0]) / 10).toFixed(1);
                this.sensores.humedad = (parseFloat(parts[1]) / 10).toFixed(1);

                if (temperaturaCallback) {
                    temperaturaCallback(this.sensores.temperatura, this.sensores.humedad);
                }
            }
        });
    }

    /**
     * Obtener el estado actual de los sensores
     * @returns {Object} - Estado actual de los sensores
     */
    getSensoresState() {
        return { ...this.sensores };
    }
}
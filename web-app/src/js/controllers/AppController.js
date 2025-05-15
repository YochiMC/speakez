import { SensorModel } from '../models/SensorModel.js';
import { VoiceController } from './VoiceController.js';

export class AppController {
    constructor(firebaseModel, uiView, weatherView) {
        this.firebaseModel = firebaseModel;
        this.uiView = uiView;
        this.weatherView = weatherView;
        this.sensorModel = new SensorModel();
        this.voiceController = new VoiceController(firebaseModel, uiView);
    }

    /**
     * Inicializar la aplicación
     */
    async init() {
        console.log('Inicializando aplicación...');

        // Inicializar vistas
        this.uiView.init();
        await this.uiView.loadAllComponents();
        this.weatherView.init();

        // Inicializar controlador de voz
        this.voiceController.init();

        // Inicializar modelo de sensores
        this.sensorModel.init(
            // Callback para sensores de proximidad/rostro
            (proximidad, rostro) => {
                this.handleProximidadSensor(proximidad, rostro);
            },
            // Callback para sensor de temperatura/humedad
            (temperatura, humedad) => {
                this.weatherView.updateTemperature(temperatura);
                this.weatherView.updateHumidity(humedad);
            }
        );

        console.log('Aplicación inicializada correctamente');
    }

    /**
     * Manejar cambios en los sensores de proximidad y rostro
     * @param {boolean} proximidad - Estado del sensor de proximidad
     * @param {boolean} rostro - Estado del sensor de rostro
     */
    handleProximidadSensor(proximidad, rostro) {
        if (proximidad && rostro) {
            // Ambos sensores activos
            this.uiView.setLoaderVisible(false);
        } else if ((proximidad && !rostro) || (!proximidad && rostro)) {
            // Un sensor activo pero el otro no - esperar 10 segundos
            setTimeout(() => this.uiView.setLoaderVisible(false), 10000);
        } else {
            // Ningún sensor activo
            this.uiView.setLoaderVisible(true);
        }
    }
}
export class VoiceController {
    constructor(firebaseModel, uiView) {
        this.model = firebaseModel;
        this.view = uiView;
        this.commandHandlers = this.initCommandHandlers();
    }

    /**
     * Inicializar el controlador
     */
    init() {
        // Suscribirse a cambios en el comando de voz
        this.model.subscribe('Voz/texto_reconocido', value => {
            if (value && value !== "") {
                this.handleCommand(value);
            }
        });
    }

    /**
     * Inicializar los manejadores de comandos
     * @returns {Object} - Mapa de comandos y sus funciones
     */
    initCommandHandlers() {
        // Command pattern implementation
        return {
            // Comandos de navegación principal
            'explora': () => this.view.showSubsection('explora'),
            'saborea': () => {
                this.view.showSubsection('explora');
                this.view.showSubsection('saborea');
            },
            'visita': () => {
                this.view.showSubsection('explora');
                this.view.showSubsection('visita');
            },
            'eventos': () => this.view.showSubsection('eventos'),
            'shopping': () => this.view.showSubsection('shopping'),
            'hospedaje': () => this.view.showSubsection('hospedaje'),
            'restaurantes': () => this.view.showSubsection('restaurantes'),
            'comida': () => this.view.showSubsection('comida-tipica'),

            // Comandos para lugares
            'catedral': () => {
                this.view.showSubsection('explora');
                this.view.showSubsection('visita');
                this.view.loadAndShowContent('visita', 'catedral-basilica');
            },
            'arco': () => {
                this.view.showSubsection('explora');
                this.view.showSubsection('visita');
                this.view.loadAndShowContent('visita', 'arco-triunfal');
            },
            'forum': () => {
                this.view.showSubsection('explora');
                this.view.showSubsection('visita');
                this.view.loadAndShowContent('visita', 'forum-cultural');
            },
            'zonapiel': () => {
                this.view.showSubsection('explora');
                this.view.showSubsection('visita');
                this.view.loadAndShowContent('visita', 'zona-piel');
            },
            'parque': () => {
                this.view.showSubsection('explora');
                this.view.showSubsection('visita');
                this.view.loadAndShowContent('visita', 'parque-metropolitano');
            },

            // Comandos para eventos
            'globo': () => {
                this.view.showSubsection('eventos');
                this.view.loadAndShowContent('eventos', 'festival-globo');
            },
            'feria': () => {
                this.view.showSubsection('eventos');
                this.view.loadAndShowContent('eventos', 'feria-leon');
            },
            'rally': () => {
                this.view.showSubsection('eventos');
                this.view.loadAndShowContent('eventos', 'rally-mexico');
            },
            'arte': () => {
                this.view.showSubsection('eventos');
                this.view.loadAndShowContent('eventos', 'festival-arte');
            },

            // Comandos para shopping
            'piel': () => {
                this.view.showSubsection('shopping');
                this.view.loadAndShowContent('shopping', 'zona-piel-shopping');
            },
            'centromax': () => {
                this.view.showSubsection('shopping');
                this.view.loadAndShowContent('shopping', 'centro-max');
            },
            'mayor': () => {
                this.view.showSubsection('shopping');
                this.view.loadAndShowContent('shopping', 'plaza-mayor');
            },
            'artesanias': () => {
                this.view.showSubsection('shopping');
                this.view.loadAndShowContent('shopping', 'mercado-artesanias');
            },

            // Comandos para hospedaje
            'hotsson': () => {
                this.view.showSubsection('hospedaje');
                this.view.loadAndShowContent('hospedaje', 'hs-hotsson');
            },
            'minas': () => {
                this.view.showSubsection('hospedaje');
                this.view.loadAndShowContent('hospedaje', 'real-minas');
            },
            'victoria': () => {
                this.view.showSubsection('hospedaje');
                this.view.loadAndShowContent('hospedaje', 'hotel-victoria');
            },

            // Comandos para restaurantes
            'tequila': () => {
                this.view.showSubsection('restaurantes');
                this.view.loadAndShowContent('restaurantes', 'la-tequila');
            },
            'amarello': () => {
                this.view.showSubsection('restaurantes');
                this.view.loadAndShowContent('restaurantes', 'amarello');
            },
            'gastro': () => {
                this.view.showSubsection('restaurantes');
                this.view.loadAndShowContent('restaurantes', 'gastro-bar');
            },
            'campomar': () => {
                this.view.showSubsection('restaurantes');
                this.view.loadAndShowContent('restaurantes', 'campomar');
            },
            'matgo': () => {
                this.view.showSubsection('restaurantes');
                this.view.loadAndShowContent('restaurantes', 'matgo');
            },

            // Comandos para comida típica
            'guacamayas': () => {
                this.view.showSubsection('comida-tipica');
                this.view.loadAndShowContent('comida-tipica', 'guacamayas');
            },
            'caldo': () => {
                this.view.showSubsection('comida-tipica');
                this.view.loadAndShowContent('comida-tipica', 'caldo-oso');
            },
            'enchiladas': () => {
                this.view.showSubsection('comida-tipica');
                this.view.loadAndShowContent('comida-tipica', 'enchiladas-mineras');
            },
            'tacos': () => {
                this.view.showSubsection('comida-tipica');
                this.view.loadAndShowContent('comida-tipica', 'tacos-pastor');
            },
            'carnitas': () => {
                this.view.showSubsection('comida-tipica');
                this.view.loadAndShowContent('comida-tipica', 'carnitas');
            },

            // Comandos de sistema
            'cerrar': () => {
                const sections = ['explora', 'eventos', 'shopping', 'hospedaje', 'comida-tipica', 'saborea', 'visita', 'restaurantes'];
                sections.forEach(section => this.view.closeSubsection(section + '-section'));
            },
            'hola': () => this.view.setLoaderVisible(false),
            'quetal': () => this.view.setLoaderVisible(false),
            'buenas': () => this.view.setLoaderVisible(false),
            'adios': () => this.view.setLoaderVisible(true),
            'hastaluego': () => this.view.setLoaderVisible(true),
        };
    }

    /**
     * Manejar un comando recibido
     * @param {string} command - Comando a procesar
     */
    handleCommand(command) {
        console.log(`Manejando comando: ${command}`);

        if (this.commandHandlers[command]) {
            this.commandHandlers[command]();
        }

        // Resetear el comando
        this.model.resetComando();
    }
}
//importamos firebae
import { database, ref, onValue, set } from './firebase.js';

const comandoVoz =  ref(database, 'Voz/texto_reconocido'); // Cambia 'ayuda' por la ruta correcta en tu base de datos

// Mostrar subsección
function showSubsection(section) {
    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) {
        sectionElement.style.display = 'flex';
        sectionElement.classList.add('animate-in');
    }
}

// Cerrar subsección
function closeSubsection(sectionId) {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.remove('animate-in');
        sectionElement.style.display = 'none';
    }
}

// Mostrar contenido
function showContent(contentId) {
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
        contentElement.style.display = 'flex';
        contentElement.classList.add('animate-in');

        // Prevenir scroll del body cuando el contenido está abierto
        document.body.style.overflow = 'hidden';
    }
}

// Cerrar contenido
function closeContent(contentId) {
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
        contentElement.classList.remove('animate-in');
        // Pequeño delay para permitir que la animación de salida se complete
        setTimeout(() => {
            contentElement.style.display = 'none';
        }, 300);

        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }
}

// Función para cargar y mostrar contenido dinámicamente
async function loadAndShowContent(section, contentName) {
    const contentId = `${contentName}-content`;
    const path = `views/content/${section}/${contentName}-content.html`;

    try {
        // Verificar si ya existe el contenedor
        let container = document.getElementById(contentId + '-container');

        // Si no existe, crearlo
        if (!container) {
            container = document.createElement('div');
            container.id = contentId + '-container';
            document.body.appendChild(container);
        }

        // Cargar el contenido
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        container.innerHTML = await res.text();

        // Mostrar el contenido
        showContent(contentId);
    } catch (error) {
        console.error(`Error cargando ${path}:`, error);
    }
}

// Cerrar contenido al hacer clic fuera de él
document.addEventListener('click', function (event) {
    const contentElements = document.querySelectorAll('.subsection-content');
    contentElements.forEach(content => {
        if (content.style.display === 'flex' && event.target === content) {
            const contentId = content.id;
            closeContent(contentId);
        }
    });
});

// Cerrar contenido con la tecla Escape
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const contentElements = document.querySelectorAll('.subsection-content');
        contentElements.forEach(content => {
            if (content.style.display === 'flex') {
                const contentId = content.id;
                closeContent(contentId);
            }
        });
    }
});

// Escuchar el valor "ayuda" en Firebase
function listenToComandoValue() {
    onValue(comandoVoz, (snapshot) => {
        const comandoValue = snapshot.val();
        console.log(`Valor de comando: ${comandoValue}`);
        if (comandoValue && comandoValue != null) {
            console.log(`Valor de comando: ${comandoValue}`);

            // Lógica para manejar el valor de ayuda
            if (comandoValue === 'explora') {
                resetComandoValue();
                showSubsection('explora');
            } else if (comandoValue === 'saborea') {
                resetComandoValue();
                showSubsection('explora');
                showSubsection('saborea');
            } else if (comandoValue === 'visita') {
                resetComandoValue();
                showSubsection('explora');
                showSubsection('visita');
            } else if (comandoValue === 'catedral') {
                resetComandoValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'catedral-basilica');
            } else if (comandoValue === 'arco') {
                resetComandoValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'arco-triunfal');
            } else if (comandoValue === 'forum') {
                resetComandoValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'forum-cultural');
            } else if (comandoValue === 'zonapiel') {
                resetComandoValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'zona-piel');
            } else if (comandoValue === 'parque') {
                resetComandoValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'parque-metropolitano');
            } else if (comandoValue === 'eventos') {
                resetComandoValue();
                showSubsection('eventos');
            } else if (comandoValue === 'globo') {
                resetComandoValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'festival-globo');
            } else if (comandoValue === 'feria') {
                resetComandoValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'feria-leon');
            } else if (comandoValue === 'rally') {
                resetComandoValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'rally-mexico');
            } else if (comandoValue === 'arte') {
                resetComandoValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'festival-arte');
            } else if (comandoValue === 'shopping') {
                resetComandoValue();
                showSubsection('shopping');
            } else if (comandoValue === 'piel') {
                resetComandoValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'zona-piel-shopping');
            } else if (comandoValue === 'centromax') {
                resetComandoValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'centro-max');
            } else if (comandoValue === 'mayor') {
                resetComandoValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'plaza-mayor');
            } else if (comandoValue === 'artesanias') {
                resetComandoValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'mercado-artesanias');
            } else if (comandoValue === 'hospedaje') {
                resetComandoValue();
                showSubsection('hospedaje');
            } else if (comandoValue === 'hotsson') {
                resetComandoValue();
                showSubsection('hospedaje');
                loadAndShowContent('hospedaje', 'hs-hotsson');
            } else if (comandoValue === 'minas') {
                resetComandoValue();
                showSubsection('hospedaje');
                loadAndShowContent('hospedaje', 'real-minas');
            } else if (comandoValue === 'victoria') {
                resetComandoValue();
                showSubsection('hospedaje');
                loadAndShowContent('hospedaje', 'hotel-victoria');
            } else if (comandoValue === 'restaurantes') {
                resetComandoValue();
                showSubsection('restaurantes');
            } else if (comandoValue === 'tequila') {
                resetComandoValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'la-tequila');
            } else if (comandoValue === 'amarello') {
                resetComandoValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'amarello');
            } else if (comandoValue === 'gastro') {
                resetComandoValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'gastro-bar');
            } else if (comandoValue === 'campomar') {
                resetComandoValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'campomar');
            } else if (comandoValue === 'matgo') {
                resetComandoValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'matgo');
            } else if (comandoValue === 'comida') {
                resetComandoValue();
                showSubsection('comida-tipica');
            } else if (comandoValue === 'guacamayas') {
                resetComandoValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'guacamayas');
            } else if (comandoValue === 'caldo') {
                resetComandoValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'caldo-oso');
            } else if (comandoValue === 'enchiladas') {
                resetComandoValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'enchiladas-mineras');
            } else if (comandoValue === 'tacos') {
                resetComandoValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'tacos-pastor');
            } else if (comandoValue === 'carnitas') {
                resetComandoValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'carnitas');
            } else if (comandoValue === 'cerrar') {
                resetComandoValue();
                const sections = ['explora', 'eventos', 'shopping', 'hospedaje', 'comida-tipica', 'saborea', 'visita', 'restaurantes'];
                sections.forEach(section => closeSubsection(section + '-section'));
            }
        }
    });
}

function resetComandoValue() {
    set(comandoVoz, "")
        .then(() => {
            console.log('El valor de "comando" se ha restablecido a una cadena vacía.');
        })
        .catch((error) => {
            console.error('Error al restablecer el valor de "comando":', error);
        });
}

// Iniciar la escucha en Firebase
listenToComandoValue();
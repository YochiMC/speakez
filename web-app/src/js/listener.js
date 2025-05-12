//importamos firebae
import { database, ref, onValue, set } from './firebase.js';

const ayudaRef = ref(database, 'sistemas-programables-b4541-default-rtdb/Sensores/ayuda'); // Cambia 'ayuda' por la ruta correcta en tu base de datos

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
function listenToHelpValue() {
    onValue(ayudaRef, (snapshot) => {
        const ayudaValue = snapshot.val();
        console.log(`Valor de ayuda: ${ayudaValue}`);
        if (ayudaValue && ayudaValue != null) {
            console.log(`Valor de ayuda: ${ayudaValue}`);

            // Lógica para manejar el valor de ayuda
            if (ayudaValue === 'explora') {
                resetHelpValue();
                showSubsection('explora');
            } else if (ayudaValue === 'saborea') {
                resetHelpValue();
                showSubsection('explora');
                showSubsection('saborea');
            } else if (ayudaValue === 'visita') {
                resetHelpValue();
                showSubsection('explora');
                showSubsection('visita');
            } else if (ayudaValue === 'catedral') {
                resetHelpValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'catedral-basilica');
            } else if (ayudaValue === 'arco') {
                resetHelpValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'arco-triunfal');
            } else if (ayudaValue === 'forum') {
                resetHelpValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'forum-cultural');
            } else if (ayudaValue === 'zonapiel') {
                resetHelpValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'zona-piel');
            } else if (ayudaValue === 'parque') {
                resetHelpValue();
                showSubsection('explora');
                showSubsection('visita');
                loadAndShowContent('visita', 'parque-metropolitano');
            } else if (ayudaValue === 'eventos') {
                resetHelpValue();
                showSubsection('eventos');
            } else if (ayudaValue === 'globo') {
                resetHelpValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'festival-globo');
            } else if (ayudaValue === 'feria') {
                resetHelpValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'feria-leon');
            } else if (ayudaValue === 'rally') {
                resetHelpValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'rally-mexico');
            } else if (ayudaValue === 'arte') {
                resetHelpValue();
                showSubsection('eventos');
                loadAndShowContent('eventos', 'festival-arte');
            } else if (ayudaValue === 'shopping') {
                resetHelpValue();
                showSubsection('shopping');
            } else if (ayudaValue === 'piel') {
                resetHelpValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'zona-piel-shopping');
            } else if (ayudaValue === 'centromax') {
                resetHelpValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'centro-max');
            } else if (ayudaValue === 'mayor') {
                resetHelpValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'plaza-mayor');
            } else if (ayudaValue === 'artesanias') {
                resetHelpValue();
                showSubsection('shopping');
                loadAndShowContent('shopping', 'mercado-artesanias');
            } else if (ayudaValue === 'hospedaje') {
                resetHelpValue();
                showSubsection('hospedaje');
            } else if (ayudaValue === 'hotsson') {
                resetHelpValue();
                showSubsection('hospedaje');
                loadAndShowContent('hospedaje', 'hs-hotsson');
            } else if (ayudaValue === 'minas') {
                resetHelpValue();
                showSubsection('hospedaje');
                loadAndShowContent('hospedaje', 'real-minas');
            } else if (ayudaValue === 'victoria') {
                resetHelpValue();
                showSubsection('hospedaje');
                loadAndShowContent('hospedaje', 'hotel-victoria');
            } else if (ayudaValue === 'restaurantes') {
                resetHelpValue();
                showSubsection('restaurantes');
            } else if (ayudaValue === 'tequila') {
                resetHelpValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'la-tequila');
            } else if (ayudaValue === 'amarello') {
                resetHelpValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'amarello');
            } else if (ayudaValue === 'gastro') {
                resetHelpValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'gastro-bar');
            } else if (ayudaValue === 'campomar') {
                resetHelpValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'campomar');
            } else if (ayudaValue === 'matgo') {
                resetHelpValue();
                showSubsection('restaurantes');
                loadAndShowContent('restaurantes', 'matgo');
            } else if (ayudaValue === 'comida') {
                resetHelpValue();
                showSubsection('comida-tipica');
            } else if (ayudaValue === 'guacamayas') {
                resetHelpValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'guacamayas');
            } else if (ayudaValue === 'caldo') {
                resetHelpValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'caldo-oso');
            } else if (ayudaValue === 'enchiladas') {
                resetHelpValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'enchiladas-mineras');
            } else if (ayudaValue === 'tacos') {
                resetHelpValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'tacos-pastor');
            } else if (ayudaValue === 'carnitas') {
                resetHelpValue();
                showSubsection('comida-tipica');
                loadAndShowContent('comida-tipica', 'carnitas');
            } else if (ayudaValue === 'cerrar') {
                resetHelpValue();
                const sections = ['explora', 'eventos', 'shopping', 'hospedaje', 'comida-tipica', 'saborea', 'visita', 'restaurantes'];
                sections.forEach(section => closeSubsection(section + '-section'));
            }
        }
    });
}

function resetHelpValue() {
    const ayudaRef = ref(database, 'sistemas-programables-b4541-default-rtdb/Sensores/ayuda'); // Cambia la ruta si es necesario

    set(ayudaRef, "")
        .then(() => {
            console.log('El valor de "ayuda" se ha restablecido a una cadena vacía.');
        })
        .catch((error) => {
            console.error('Error al restablecer el valor de "ayuda":', error);
        });
}

// Iniciar la escucha en Firebase
listenToHelpValue();
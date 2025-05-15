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
document.addEventListener('click', function(event) {
    const contentElements = document.querySelectorAll('.subsection-content');
    contentElements.forEach(content => {
        if (content.style.display === 'flex' && event.target === content) {
            const contentId = content.id;
            closeContent(contentId);
        }
    });
});

// Cerrar contenido con la tecla Escape
document.addEventListener('keydown', function(event) {
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


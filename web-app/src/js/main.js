async function loadComponent(id, path) {
    const container = document.getElementById(id);
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        container.innerHTML = await res.text();
    } catch (error) {
        console.error(`Error cargando ${path}:`, error);
        container.innerHTML = `<p>Error al cargar el componente.</p>`;
    }
}

async function loadSection(id, path) {
    const container = document.getElementById(id);
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        container.innerHTML = await res.text();
    } catch (error) {
        console.error(`Error cargando ${path}:`, error);
        container.innerHTML = `<p>Error al cargar sección.</p>`;
    }
}

window.onload = () => {
    loadComponent('loader-container', 'views/components/loader.html');
    loadComponent('language-container', 'views/components/language-selector.html');
    loadComponent('welcome-video-container', 'views/components/welcome-video.html');
    loadComponent('header-container', 'views/components/header.html');
    loadComponent('info-bar-container', 'views/components/info-bar.html');
    loadComponent('dashboard-container', 'views/components/dashboard.html');
    loadSection('explora-section-container', 'views/sections/explora-section.html');
    loadSection('saborea-section-container', 'views/sections/saborea-section.html');
    loadSection('comida-tipica-section-container', 'views/sections/comida-tipica-section.html');
    loadSection('restaurantes-section-container', 'views/sections/restaurantes-section.html');
    loadSection('visita-section-container', 'views/sections/visita-section.html');
    loadSection('eventos-section-container', 'views/sections/eventos-section.html');
    loadSection('shopping-section-container', 'views/sections/shopping-section.html');
    loadSection('hospedaje-section-container', 'views/sections/hospedaje-section.html');
};

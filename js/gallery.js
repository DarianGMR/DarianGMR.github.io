document.addEventListener('DOMContentLoaded', () => {
    loadSkins();
    setupEventListeners();
});

async function loadSkins() {
    try {
        const response = await fetch('skins/metadata.json');
        const data = await response.json();
        renderSkins(data.skins);
    } catch (error) {
        console.error('Error loading skins:', error);
    }
}

function renderSkins(skins) {
    const gallery = document.getElementById('skinGallery');
    gallery.innerHTML = '';

    skins.forEach(skin => {
        const card = createSkinCard(skin);
        gallery.appendChild(card);
    });
}

function createSkinCard(skin) {
    const card = document.createElement('div');
    card.className = 'skin-card';
    
    // Crear el visualizador 3D de la skin
    const skinPreview = document.createElement('div');
    skinPreview.className = 'skin-preview';
    const skinViewer = new skinview3d.SkinViewer({
        canvas: document.createElement('canvas'),
        width: 200,
        height: 300
    });
    skinViewer.loadSkin(`skins/${skin.file}`);
    skinPreview.appendChild(skinViewer.canvas);

    const info = document.createElement('div');
    info.className = 'skin-info';
    info.innerHTML = `
        <h3>${skin.name}</h3>
        <button class="btn-primary" onclick="downloadSkin('${skin.file}')">
            <i class="fas fa-download"></i> Descargar
        </button>
    `;

    card.appendChild(skinPreview);
    card.appendChild(info);
    return card;
}

function downloadSkin(fileName) {
    const link = document.createElement('a');
    link.href = `skins/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.skin-card');
        
        cards.forEach(card => {
            const skinName = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = skinName.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

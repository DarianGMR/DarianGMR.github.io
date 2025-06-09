document.addEventListener('DOMContentLoaded', () => {
    setupUploadModal();
});

function setupUploadModal() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const replaceModal = document.getElementById('replaceModal');
    const closeBtn = uploadModal.querySelector('.close');
    const uploadForm = document.getElementById('uploadForm');

    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const skinName = document.getElementById('skinName').value;
        const skinFile = document.getElementById('skinFile').files[0];

        // Verificar si ya existe una skin con ese nombre
        const exists = await checkSkinExists(skinName);
        if (exists) {
            showReplaceModal(skinName, skinFile);
        } else {
            uploadSkin(skinName, skinFile);
        }
    });

    document.getElementById('confirmReplace').addEventListener('click', () => {
        const skinName = document.getElementById('skinName').value;
        const skinFile = document.getElementById('skinFile').files[0];
        uploadSkin(skinName, skinFile, true);
        replaceModal.style.display = 'none';
    });

    document.getElementById('cancelReplace').addEventListener('click', () => {
        replaceModal.style.display = 'none';
    });
}

async function checkSkinExists(skinName) {
    try {
        const response = await fetch('skins/metadata.json');
        const data = await response.json();
        return data.skins.some(skin => skin.name.toLowerCase() === skinName.toLowerCase());
    } catch (error) {
        console.error('Error checking skin:', error);
        return false;
    }
}

function showReplaceModal(skinName, skinFile) {
    const replaceModal = document.getElementById('replaceModal');
    replaceModal.style.display = 'block';
}

async function uploadSkin(skinName, skinFile, replace = false) {
    // Aquí iría la lógica para subir la skin al servidor
    // Como GitHub Pages es estático, necesitarías un backend separado para esto
    // Este es un ejemplo conceptual
    
    try {
        const formData = new FormData();
        formData.append('name', skinName);
        formData.append('file', skinFile);
        formData.append('replace', replace);

        // Simular subida exitosa
        alert('Skin subida exitamente');
        document.getElementById('uploadModal').style.display = 'none';
        document.getElementById('uploadForm').reset();
        
        // Recargar la galería
        loadSkins();
    } catch (error) {
        console.error('Error uploading skin:', error);
        alert('Error al subir la skin');
    }
}

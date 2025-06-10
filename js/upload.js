document.addEventListener('DOMContentLoaded', () => {
    setupUploadModal();
});

function setupUploadModal() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const replaceModal = document.getElementById('replaceModal');
    const closeBtn = uploadModal.querySelector('.close');
    const uploadForm = document.getElementById('uploadForm');
    const skinFileInput = document.getElementById('skinFile');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    skinFileInput.parentNode.appendChild(errorDiv);

    // Cuando se hace clic en el botón de subir
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    // Cerrar modal
    closeBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        resetForm();
    });

    // Validar archivo al seleccionarlo
    skinFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        errorDiv.textContent = '';
        
        if (!file) return;

        // Validar tipo de archivo
        if (file.type !== 'image/png') {
            errorDiv.textContent = 'Error: La skin debe ser un archivo PNG';
            skinFileInput.value = '';
            return;
        }

        // Validar tamaño
        if (file.size > 1024 * 1024) { // 1MB
            errorDiv.textContent = 'Error: La skin no debe superar 1MB';
            skinFileInput.value = '';
            return;
        }

        // Validar dimensiones
        const dimensions = await getImageDimensions(file);
        if (dimensions.width !== 64 || dimensions.height !== 64) {
            errorDiv.textContent = 'Error: La skin debe ser de 64x64 píxeles';
            skinFileInput.value = '';
            return;
        }

        // Mostrar vista previa
        showSkinPreview(file);
    });

    // Manejar el envío del formulario
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const skinName = document.getElementById('skinName').value;
        const skinFile = document.getElementById('skinFile').files[0];

        if (!skinFile || !isValidSkinFile(skinFile)) {
            return;
        }

        try {
            const base64Data = await fileToBase64(skinFile);
            
            const response = await fetch(
                `https://api.github.com/repos/DarianGMR/DarianGMR.github.io/dispatches`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${await getGitHubToken()}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        event_type: 'upload-skin',
                        client_payload: {
                            skinName: skinName.toLowerCase().replace(/\s+/g, '-'),
                            skinData: base64Data
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Error al subir la skin');
            }

            alert('Skin subida exitosamente. Los cambios aparecerán en unos momentos.');
            uploadModal.style.display = 'none';
            resetForm();
            setTimeout(loadSkins, 5000);

        } catch (error) {
            console.error('Error:', error);
            alert('Error al subir la skin. Por favor, intenta de nuevo.');
        }
    });
}

// Funciones auxiliares
function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function isValidSkinFile(file) {
    const errorDiv = document.querySelector('.error-message');
    errorDiv.textContent = '';

    if (file.type !== 'image/png') {
        errorDiv.textContent = 'Error: La skin debe ser un archivo PNG';
        return false;
    }

    if (file.size > 1024 * 1024) {
        errorDiv.textContent = 'Error: La skin no debe superar 1MB';
        return false;
    }

    return true;
}

function showSkinPreview(file) {
    const preview = document.getElementById('skinPreview');
    preview.innerHTML = '';

    const skinViewer = new skinview3d.SkinViewer({
        canvas: document.createElement('canvas'),
        width: 200,
        height: 300
    });

    skinViewer.loadSkin(URL.createObjectURL(file));
    preview.appendChild(skinViewer.canvas);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = reject;
    });
}

function resetForm() {
    document.getElementById('uploadForm').reset();
    document.getElementById('skinPreview').innerHTML = '';
    document.querySelector('.error-message').textContent = '';
}

// Función para obtener el token (reemplaza esto con tu token)
function getGitHubToken() {
    return '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'; // Reemplaza con tu token real
}

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
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            if (uploadModal) {
                uploadModal.style.display = 'block';
            } else {
                console.error('No se encontró el modal de subida');
            }
        });
    } else {
        console.error('No se encontró el botón de subida');
    }

    // Cerrar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
            resetForm();
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
            resetForm();
        }
    });

    // Validar archivo al seleccionarlo
    if (skinFileInput) {
        skinFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            errorDiv.textContent = '';
            
            if (!file) return;

            try {
                // Validar tipo de archivo
                if (file.type !== 'image/png') {
                    throw new Error('La skin debe ser un archivo PNG');
                }

                // Validar tamaño (1MB máximo)
                if (file.size > 1024 * 1024) {
                    throw new Error('La skin no debe superar 1MB');
                }

                // Validar dimensiones
                const dimensions = await getImageDimensions(file);
                if (dimensions.width !== 64 || dimensions.height !== 64) {
                    throw new Error('La skin debe ser de 64x64 píxeles');
                }

                // Mostrar vista previa
                showSkinPreview(file);
            } catch (error) {
                errorDiv.textContent = `Error: ${error.message}`;
                skinFileInput.value = '';
            }
        });
    }

    // Manejar el envío del formulario
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const skinName = document.getElementById('skinName').value;
            const skinFile = document.getElementById('skinFile').files[0];
            errorDiv.textContent = '';

            if (!skinFile || !isValidSkinFile(skinFile)) {
                return;
            }

            try {
                await uploadSkin(skinName, skinFile);
            } catch (error) {
                console.error('Error al subir la skin:', error);
                errorDiv.textContent = 'Error al subir la skin. Por favor, intenta de nuevo.';
            }
        });
    }
}

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
    if (!preview) return;
    
    preview.innerHTML = '';

    const skinViewer = new skinview3d.SkinViewer({
        canvas: document.createElement('canvas'),
        width: 200,
        height: 300
    });

    skinViewer.loadSkin(URL.createObjectURL(file));
    preview.appendChild(skinViewer.canvas);
}

async function uploadSkin(skinName, skinFile) {
    try {
        console.log('Iniciando subida de skin:', skinName);
        const base64Data = await fileToBase64(skinFile);
        
        const token = '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';
        
        console.log('Preparando solicitud...');
        
        const response = await fetch(
            'https://api.github.com/repos/DarianGMR/DarianGMR.github.io/dispatches',
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
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
            const errorData = await response.json();
            throw new Error(`Error al subir la skin: ${errorData.message || response.statusText}`);
        }

        console.log('Solicitud enviada exitosamente');
        alert('Skin subida exitosamente. Los cambios aparecerán en unos momentos.');
        document.getElementById('uploadModal').style.display = 'none';
        resetForm();
        setTimeout(loadSkins, 5000);

    } catch (error) {
        console.error('Error detallado:', error);
        throw error;
    }
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
    const form = document.getElementById('uploadForm');
    const preview = document.getElementById('skinPreview');
    const errorMessage = document.querySelector('.error-message');
    
    if (form) form.reset();
    if (preview) preview.innerHTML = '';
    if (errorMessage) errorMessage.textContent = '';
}

async function loadSkins() {
    try {
        const response = await fetch('skins/metadata.json');
        const data = await response.json();
        console.log('Skins cargadas:', data.skins);
    } catch (error) {
        console.error('Error al cargar las skins:', error);
    }
}

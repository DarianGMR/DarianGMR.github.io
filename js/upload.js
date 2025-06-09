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

    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        resetForm();
    });

    // Validar archivo cuando se seleccione
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

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const skinName = document.getElementById('skinName').value;
        const skinFile = document.getElementById('skinFile').files[0];

        if (!skinFile || !isValidSkinFile(skinFile)) {
            return;
        }

        // Verificar si ya existe una skin con ese nombre
        const exists = await checkSkinExists(skinName);
        if (exists) {
            showReplaceModal(skinName, skinFile);
        } else {
            await uploadSkin(skinName, skinFile);
        }
    });

    document.getElementById('confirmReplace').addEventListener('click', async () => {
        const skinName = document.getElementById('skinName').value;
        const skinFile = document.getElementById('skinFile').files[0];
        await uploadSkin(skinName, skinFile, true);
        replaceModal.style.display = 'none';
    });

    document.getElementById('cancelReplace').addEventListener('click', () => {
        replaceModal.style.display = 'none';
    });
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
    preview.innerHTML = '';

    // Crear visualizador 3D
    const skinViewer = new skinview3d.SkinViewer({
        canvas: document.createElement('canvas'),
        width: 200,
        height: 300
    });

    skinViewer.loadSkin(URL.createObjectURL(file));
    preview.appendChild(skinViewer.canvas);
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
    try {
        // En un entorno real, aquí enviarías los datos a un servidor
        // Como estamos en GitHub Pages (estático), simularemos la actualización
        
        // 1. Leer el metadata.json actual
        const response = await fetch('skins/metadata.json');
        const data = await response.json();
        
        // 2. Generar nombre único para el archivo
        const fileName = `${skinName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        
        // 3. Actualizar metadata
        if (replace) {
            // Eliminar la skin anterior si existe
            const index = data.skins.findIndex(skin => skin.name.toLowerCase() === skinName.toLowerCase());
            if (index !== -1) {
                data.skins.splice(index, 1);
            }
        }
        
        // Agregar nueva skin
        data.skins.push({
            id: Date.now().toString(),
            name: skinName,
            file: fileName,
            uploadDate: new Date().toISOString(),
            uploader: "DarianGMR" // O el usuario actual
        });

        // En un entorno real, aquí guardarías el archivo y actualizarías metadata.json
        // Como estamos en GitHub Pages, mostraremos un mensaje explicativo
        alert(`
            En un servidor real, la skin se habría guardado como: ${fileName}
            
            Para que esto funcione en GitHub Pages, necesitas:
            1. Un backend separado para manejar las subidas
            2. O usar GitHub Actions para automatizar las actualizaciones
            
            Por ahora, los cambios son solo demostrativos.
        `);

        // Cerrar modal y resetear formulario
        document.getElementById('uploadModal').style.display = 'none';
        resetForm();
        
        // Recargar la galería
        await loadSkins();
    } catch (error) {
        console.error('Error uploading skin:', error);
        alert('Error al subir la skin');
    }
}

function resetForm() {
    document.getElementById('uploadForm').reset();
    document.getElementById('skinPreview').innerHTML = '';
    document.querySelector('.error-message').textContent = '';
}

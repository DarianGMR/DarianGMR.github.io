const fs = require('fs');
const path = require('path');

const skinName = process.argv[2];
const metadataPath = path.join(process.cwd(), 'skins/metadata.json');

// Leer metadata existente
let metadata = { skins: [] };
if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
}

// Agregar nueva skin
const newSkin = {
    id: Date.now().toString(),
    name: skinName,
    file: `${skinName}.png`,
    uploadDate: new Date().toISOString(),
    uploader: process.env.GITHUB_ACTOR
};

// Actualizar metadata
metadata.skins.push(newSkin);

// Guardar metadata actualizada
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// Servir archivos estáticos
app.use(express.static(__dirname));

// Generar certificado SSL autofirmado si no existe
if (!fs.existsSync('server.key') || !fs.existsSync('server.cert')) {
    console.log('Generando certificado SSL autofirmado...');
    const { execSync } = require('child_process');
    execSync('openssl req -nodes -new -x509 -keyout server.key -out server.cert -subj "/CN=localhost"');
}

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

// Crear servidor HTTPS
const server = https.createServer(options, app);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en https://localhost:${PORT}`);
    console.log('IMPORTANTE: Acepta el certificado autofirmado en tu navegador');
}); 
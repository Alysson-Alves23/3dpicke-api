const express = require('express');
const app = express();
const port = 3000;

const data = {
    cube: {
        color: "#ff0000",
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    light: {
        intensity: 1
    },
    background: {
        color: "#ffffff"
    }
};

// Rota raiz
app.get('/', (req, res) => {
    res.send('Bem-vindo à API 3D Picker! Use os endpoints /cube, /light e /background.');
});

// Endpoint para obter dados do cubo
app.get('/cube', (req, res) => {
    res.json(data.cube);
});

// Endpoint para obter dados da luz
app.get('/light', (req, res) => {
    res.json(data.light);
});

// Endpoint para obter dados do fundo
app.get('/background', (req, res) => {
    res.json(data.background);
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
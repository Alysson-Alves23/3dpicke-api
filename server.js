const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware para permitir JSON no corpo da requisição

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

// GET - Obter os dados
app.get('/cube', (req, res) => res.json(data.cube));
app.get('/light', (req, res) => res.json(data.light));
app.get('/background', (req, res) => res.json(data.background));

// PUT - Atualizar os dados
app.put('/cube', (req, res) => {
    data.cube = { ...data.cube, ...req.body }; // Atualiza apenas os campos enviados
    res.json({ message: "Cubo atualizado", cube: data.cube });
});

app.put('/light', (req, res) => {
    data.light = { ...data.light, ...req.body };
    res.json({ message: "Luz atualizada", light: data.light });
});

app.put('/background', (req, res) => {
    data.background = { ...data.background, ...req.body };
    res.json({ message: "Fundo atualizado", background: data.background });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

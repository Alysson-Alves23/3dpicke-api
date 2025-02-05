require('dotenv').config(); // Carrega as variáveis de ambiente
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do middleware para JSON
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('🔥 MongoDB conectado'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelos do MongoDB
const cubeSchema = new mongoose.Schema({
    color: String,
    position: {
        x: Number,
        y: Number,
        z: Number
    },
    rotation: {
        x: Number,
        y: Number,
        z: Number
    }
});

const lightSchema = new mongoose.Schema({
    intensity: Number
});

const backgroundSchema = new mongoose.Schema({
    color: String
});

const Cube = mongoose.model('Cube', cubeSchema);
const Light = mongoose.model('Light', lightSchema);
const Background = mongoose.model('Background', backgroundSchema);

// 🟢 Criar dados iniciais se não existirem
const createInitialData = async () => {
    if (await Cube.countDocuments() === 0) {
        await Cube.create({ color: "#ff0000", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } });
    }
    if (await Light.countDocuments() === 0) {
        await Light.create({ intensity: 1 });
    }
    if (await Background.countDocuments() === 0) {
        await Background.create({ color: "#ffffff" });
    }
};
createInitialData();

// 🔹 Rotas GET - Obter dados
app.get('/cube', async (req, res) => {
    const cube = await Cube.findOne();
    res.json(cube);
});

app.get('/light', async (req, res) => {
    const light = await Light.findOne();
    res.json(light);
});

app.get('/background', async (req, res) => {
    const background = await Background.findOne();
    res.json(background);
});

// 🔹 Rotas PUT - Atualizar dados
app.put('/cube', async (req, res) => {
    const updatedCube = await Cube.findOneAndUpdate({}, req.body, { new: true });
    res.json({ message: "Cubo atualizado", cube: updatedCube });
});

app.put('/light', async (req, res) => {
    const updatedLight = await Light.findOneAndUpdate({}, req.body, { new: true });
    res.json({ message: "Luz atualizada", light: updatedLight });
});

app.put('/background', async (req, res) => {
    const updatedBackground = await Background.findOneAndUpdate({}, req.body, { new: true });
    res.json({ message: "Fundo atualizado", background: updatedBackground });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});

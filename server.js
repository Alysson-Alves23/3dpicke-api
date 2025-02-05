require('dotenv').config(); // Carrega variáveis de ambiente
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false } // Para conexões seguras no deploy
});

// Middleware para JSON
app.use(express.json());

// 🛠️ Criar tabelas caso não existam
const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cube (
                id SERIAL PRIMARY KEY,
                color VARCHAR(7) DEFAULT '#ff0000',
                position_x FLOAT DEFAULT 0,
                position_y FLOAT DEFAULT 0,
                position_z FLOAT DEFAULT 0,
                rotation_x FLOAT DEFAULT 0,
                rotation_y FLOAT DEFAULT 0,
                rotation_z FLOAT DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS light (
                id SERIAL PRIMARY KEY,
                intensity FLOAT DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS background (
                id SERIAL PRIMARY KEY,
                color VARCHAR(7) DEFAULT '#ffffff'
            );
        `);
        console.log("✅ Tabelas verificadas/criadas");

        // Criar valores iniciais se não existirem
        await pool.query(`
            INSERT INTO cube (color, position_x, position_y, position_z, rotation_x, rotation_y, rotation_z)
            SELECT '#4e2d2d', 1.5, -0.4, 2, 3.067486702812208, -0.33403476210291555, -3.0741523125287005
            WHERE NOT EXISTS (SELECT 1 FROM cube);
            
            INSERT INTO light (intensity)
            SELECT 3.4 WHERE NOT EXISTS (SELECT 1 FROM light);
            
            INSERT INTO background (color)
            SELECT '#b89494' WHERE NOT EXISTS (SELECT 1 FROM background);
        `);
        console.log("✅ Dados iniciais inseridos (se necessário)");
    } catch (err) {
        console.error("Erro ao criar tabelas:", err);
    }
};
createTables();

// 📌 Função para obter dados e manter estrutura JSON
const getStructuredData = async () => {
    const cube = (await pool.query("SELECT * FROM cube LIMIT 1")).rows[0];
    const light = (await pool.query("SELECT * FROM light LIMIT 1")).rows[0];
    const background = (await pool.query("SELECT * FROM background LIMIT 1")).rows[0];

    return {
        cube: cube
            ? {
                color: cube.color,
                position: { x: cube.position_x, y: cube.position_y, z: cube.position_z },
                rotation: { x: cube.rotation_x, y: cube.rotation_y, z: cube.rotation_z }
            }
            : null,
        light: light ? { intensity: light.intensity } : null,
        background: background ? { color: background.color } : null
    };
};

// 🔹 Rota GET - Obter todos os dados mantendo a estrutura JSON
app.get('/data', async (req, res) => {
    const data = await getStructuredData();
    res.json(data);
});

// 📌 Função para atualizar os dados
const updateTable = async (table, updates, mapping) => {
    const setClause = Object.keys(mapping)
        .map((key, index) => `${mapping[key]} = $${index + 1}`)
        .join(", ");

    const values = Object.keys(mapping).map((key) => updates[key]);

    await pool.query(`UPDATE ${table} SET ${setClause} WHERE id = 1 RETURNING *`, values);
};

// 🔹 Rota PUT - Atualizar dados mantendo a estrutura JSON
app.put('/data', async (req, res) => {
    const { cube, light, background } = req.body;

    if (cube) {
        await updateTable("cube", cube, {
            color: "color",
            "position.x": "position_x",
            "position.y": "position_y",
            "position.z": "position_z",
            "rotation.x": "rotation_x",
            "rotation.y": "rotation_y",
            "rotation.z": "rotation_z"
        });
    }
    if (light) {
        await updateTable("light", light, { intensity: "intensity" });
    }
    if (background) {
        await updateTable("background", background, { color: "color" });
    }

    res.json(await getStructuredData());
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});

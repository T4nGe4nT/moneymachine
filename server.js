const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Use CORS and body-parser middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Sequelize with SQLite (you can use any database)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

// Define the Favorite model
const Favorite = sequelize.define('Favorite', {
    baseCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

// Sync the database
sequelize.sync();

// Endpoint to save a favorite
app.post('/api/favorites', async (req, res) => {
    try {
        const favorite = await Favorite.create(req.body);
        res.status(201).json(favorite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to get all favorites
app.get('/api/favorites', async (req, res) => {
    try {
        const favorites = await Favorite.findAll();
        res.json(favorites);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to delete database.sqlite file
app.delete('/delete-database', (req, res) => {
    const filePath = path.join(__dirname, 'database.sqlite');

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            res.status(500).send('Failed to delete file.');
        } else {
            console.log('File deleted successfully.');
            res.status(200).send('File deleted successfully.');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

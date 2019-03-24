const express = require('express');
const router = express.Router();

/**
 * Affiche tout les mangas disponibles
 */
router.get('/', (req,res) => {
    res.json(null);
});

/**
 * Affiche la liste des chapitres disponibles du manga
 */
router.get('/:name', (req,res) => {
    res.json(req.params);
});

/**
 * Télécharge le scan et affiche
 */
router.get('/:name/:chapter', (req,res) => {
    res.json(req.params);
});

module.exports = router;
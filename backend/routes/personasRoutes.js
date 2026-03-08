const express = require('express');
const router = express.Router();
const { getPersonasByFamilia, createPersona, deletePersona } = require('../controllers/personasController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);
router.use(verificarRol([1, 2]));

// Rutas anidadas o basadas en familia_id logico
router.get('/familia/:familia_id', getPersonasByFamilia);
router.post('/', createPersona);
router.delete('/:id', deletePersona);

module.exports = router;

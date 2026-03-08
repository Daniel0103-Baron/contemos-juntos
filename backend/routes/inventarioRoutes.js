const express = require('express');
const router = express.Router();
const { getInventarioActual, getLotesStock, registrarIngreso } = require('../controllers/inventarioController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);
router.use(verificarRol([1, 2])); // Admin y Operador

router.get('/', getInventarioActual);
router.get('/lotes', getLotesStock);
router.post('/ingresos', registrarIngreso);

module.exports = router;

const express = require('express');
const router = express.Router();
const { registrarEntrega, getEntregas } = require('../controllers/entregasController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Solo Admin (1) y Operador (2) pueden registrar. (Ajustar roles en middleware original si los ID son distintos)
router.post('/', verificarRol([1, 2]), registrarEntrega);

// Admin (1), Audior (4) y Operadores (2) pueden ver
router.get('/', verificarRol([1, 2, 4]), getEntregas);

module.exports = router;

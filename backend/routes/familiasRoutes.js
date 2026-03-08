const express = require('express');
const router = express.Router();
const { getFamilias, getFamiliaById, createFamilia, updateFamilia } = require('../controllers/familiasController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Solo usuarios autenticados y con rol 1 (Admin) o 2 (Operador) pueden gestionar familias
// Asumiendo 1 = Admin, 2 = Operador
router.use(verificarToken);
router.use(verificarRol([1, 2]));

router.get('/', getFamilias);
router.get('/:id', getFamiliaById);
router.post('/', createFamilia);
router.put('/:id', updateFamilia);

module.exports = router;

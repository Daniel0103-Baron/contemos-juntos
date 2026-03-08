const express = require('express');
const router = express.Router();
const { getCensos, createCenso } = require('../controllers/censosController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);
router.use(verificarRol([1, 2]));

router.get('/', getCensos);
router.post('/', createCenso);

module.exports = router;

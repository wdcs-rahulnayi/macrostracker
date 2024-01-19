const express = require('express');
const { getAllMacros, createMacros, getAllMacrosPaginated, deleteMacros, updateMacros, getMacrosById } = require('../controllers/macrosController');
const router = express.Router();

router.route('/').get(getAllMacros).post(createMacros);
router.route('/paginated').get(getAllMacrosPaginated);
router.route('/:id').get(getMacrosById).patch(updateMacros).delete(deleteMacros);

module.exports = router;
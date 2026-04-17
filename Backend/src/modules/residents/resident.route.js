const express = require('express');
const router = express.Router();

const residentController = require('./resident.controller');

// GET /api/residents
router.get('/', residentController.getAllResidents);

// POST /api/residents
router.post('/', residentController.createResident);

// GET /api/residents/:id
router.get('/:id', residentController.getResidentById);

// PUT /api/residents/:id
router.put('/:id', residentController.updateResident);

// DELETE /api/residents/:id
router.delete('/:id', residentController.deleteResident);

module.exports = router;


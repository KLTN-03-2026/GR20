const express = require('express');
const router = express.Router();

const residentController = require('./resident.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

// GET /api/residents
router.get('/', residentController.getAllResidents);

// GET /api/residents/apartment/:apartmentId
router.get('/apartment/:apartmentId', residentController.getResidentsByApartmentId);

// GET /api/residents/user/:userId/apartments
router.get('/user/:userId/apartments', residentController.getUserApartments);

// GET /api/residents/me/apartments
router.get('/me/apartments', residentController.getMyApartments);

// POST /api/residents
router.post('/', residentController.createResident);

// GET /api/residents/:id
router.get('/:id', residentController.getResidentById);

// PUT /api/residents/:id
router.put('/:id', residentController.updateResident);

// DELETE /api/residents/:id
router.delete('/:id', residentController.deleteResident);

module.exports = router;


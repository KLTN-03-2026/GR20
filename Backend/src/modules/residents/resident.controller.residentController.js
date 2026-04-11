const ResidentService = require("./resident.service.residentService");

const { CreateResidentRequest, UpdateResidentRequest, DeleteResidentRequest } = require("./resident.dto.request");

class ResidentController {
  async getAllResidents(req, res) {
    try {
      const data = await ResidentService.getAll();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createResident(req, res) {
    try {
      const dto = new CreateResidentRequest(req.body);
      dto.validate();

      const data = await ResidentService.create(dto);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateResident(req, res) {
    try {
      const dto = new UpdateResidentRequest(req.body);
      dto.validate();

      const data = await ResidentService.update(req.params.id, dto);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteResident(req, res) {
    try {
      const dto = new DeleteResidentRequest({ id: req.params.id });
      dto.validate();

      const data = await ResidentService.delete(dto.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ResidentController();
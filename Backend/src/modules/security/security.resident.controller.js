const service = require("./security.resident.service");

const getResidentList = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    
    const data = await service.getResidentList({
      page: page || 1,
      size: limit || 10,
      keyword: search || ''
    });
    
    res.json({
      operationType: "Success",
      message: "Lấy danh sách cư dân thành công",
      code: "OK",
      data: data.data,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      page: data.page,
      pageSize: data.pageSize,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      operationType: "Error",
      message: err.message,
      code: "INTERNAL_ERROR",
      timestamp: new Date()
    });
  }
};

const getResidentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await service.getResidentDetail(id);
    
    res.json({
      operationType: "Success",
      message: "Lấy chi tiết cư dân thành công",
      code: "OK",
      data: data,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(404).json({
      operationType: "Error",
      message: err.message,
      code: "NOT_FOUND",
      timestamp: new Date()
    });
  }
};

module.exports = {
  getResidentList,
  getResidentDetail
};
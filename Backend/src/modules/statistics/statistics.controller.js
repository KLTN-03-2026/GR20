const service = require("./statistics.service");
const { buildingIdsFromUser } = require("../../common/building-scope");

exports.getDashboard = async (req, res) => {
  try {
    const year = req.query.year != null ? Number(req.query.year) : new Date().getFullYear();
    const buildingIds = buildingIdsFromUser(req.user);
    const data = await service.getDashboard(year, buildingIds);
    res.json({
      operationType: "Success",
      message: "success",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("[statistics.getDashboard]", err);
    res.status(500).json({ message: err.message || "Internal error" });
  }
};

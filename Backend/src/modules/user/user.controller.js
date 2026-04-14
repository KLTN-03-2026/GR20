const service = require("./user.service");

const getUserById = async (req, res) => {
  try {
    const data = await service.getUserById(req.params.id);

    res.json({
      operationType: "Success",
      message: "Get user detail successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const data = await service.createUser(req.body);

    res.status(201).json({
      operationType: "Success",
      message: "Create user successfully",
      code: "CREATED",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await service.getAllUsers(req.query);

    res.json({
      operationType: "Success",
      message: "Get user list successfully",
      code: "OK",
      data:result.data,
      pagination:result.pagination,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const data = await service.updateUser(req.params.id, req.body);

    res.json({
      operationType: "Success",
      message: "Update user successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const data = await service.deleteUser(req.params.id);

    res.json({
      operationType: "Success",
      message: "Delete user successfully",
      code: "OK",
      data,
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

module.exports = { getUserById,createUser,getAllUsers,updateUser,deleteUser };
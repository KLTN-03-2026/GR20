const Joi = require("joi");

// ===== COMMON =====
const idSchema = Joi.number().integer().positive().required();

// ===== CREATE =====
const createFloorSchema = Joi.object({
  building_id: Joi.number().integer().positive().required()
    .messages({
      "any.required": "building_id is required",
      "number.base": "building_id must be a number"
    }),

  floor_number: Joi.number().integer().required()
    .messages({
      "any.required": "floor_number is required"
    }),

  name: Joi.string().max(255).allow(null, "")
});

// ===== UPDATE =====
const updateFloorSchema = Joi.object({
  building_id: Joi.number().integer().positive().optional(),
  floor_number: Joi.number().integer().optional(),
  name: Joi.string().max(255).allow(null, "")
})
.min(1) 
.messages({
  "object.min": "At least one field must be updated"
});

// ===== VALIDATORS =====
const validateCreate = (data) =>
  createFloorSchema.validate(data, { abortEarly: false });

const validateUpdate = (data) =>
  updateFloorSchema.validate(data, { abortEarly: false });

const validateId = (id) =>
  idSchema.validate(id);


const parseUpdateFloor = (data) => {
  const { error, value } = updateFloorSchema.validate(data, {
    abortEarly: false,
  });

  if (error) throw error;
  return value;
};

const parseCreateFloor = (data) => {
  const { error, value } = createFloorSchema.validate(data, {
    abortEarly: false,
  });

  if (error) throw error;
  return value;
};

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  parseUpdateFloor,
  parseCreateFloor
};

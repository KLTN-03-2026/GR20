const toEntity = (req) => ({
  request_id: req.requestId ?? req.request_id,
  technical_id: req.technicalId ?? req.technical_id,
});

const toResponse = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    requestId: row.request_id,
    technicalId: row.technical_id,
    assignedAt: row.assigned_at,
  };
};

module.exports = { toEntity, toResponse };


const toEntity = (req) => ({
  meter_id: req.meterId ?? req.meter_id,
  reading_date: req.readingDate ?? req.reading_date,
  previous_reading: req.previousReading ?? req.previous_reading,
  current_reading: req.currentReading ?? req.current_reading,
  consumption: req.consumption,
});

const toResponse = (row) => ({
  id: row.id,
  meterId: row.meter_id,
  readingDate: row.reading_date,
  previousReading: Number(row.previous_reading),
  currentReading: Number(row.current_reading),
  consumption: Number(row.consumption),
  createdAt: row.created_at,
  deletedAt: row.deleted_at || null,
});

module.exports = { toEntity, toResponse };

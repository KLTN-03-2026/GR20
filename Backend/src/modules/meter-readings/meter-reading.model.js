class MeterReading {
  constructor({ id, meter_id, reading_date, previous_reading, current_reading, consumption, created_at, deleted_at }) {
    this.id = id;
    this.meterId = meter_id;
    this.readingDate = reading_date;
    this.previousReading = previous_reading;
    this.currentReading = current_reading;
    this.consumption = consumption;
    this.createdAt = created_at;
    this.deletedAt = deleted_at;
  }
}

module.exports = MeterReading;

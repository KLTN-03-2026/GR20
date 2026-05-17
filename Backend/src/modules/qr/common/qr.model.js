class QrCode {
  constructor({ id, user_id, apartment_id, qr_code, expires_at, status, created_at }) {
    this.id = id;
    this.userId = user_id;
    this.apartmentId = apartment_id;
    this.qrCode = qr_code;
    this.expiresAt = expires_at;
    this.status = status;
    this.createdAt = created_at;
  }
}

class GuestQrCode {
  constructor({ id, host_user_id, apartment_id, qr_code, valid_from, valid_to, max_entries, used_entries, status, created_at }) {
    this.id = id;
    this.hostUserId = host_user_id;
    this.apartmentId = apartment_id;
    this.qrCode = qr_code;
    this.validFrom = valid_from;
    this.validTo = valid_to;
    this.maxEntries = max_entries;
    this.usedEntries = used_entries;
    this.status = status;
    this.createdAt = created_at;
  }
}

module.exports = { QrCode, GuestQrCode };
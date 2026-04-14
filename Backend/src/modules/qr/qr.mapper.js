const toPersonalQrResponse = (row) => ({
  id: row.id,
  userId: row.user_id,
  apartmentId: row.apartment_id,
  qrCode: row.qr_code,
  expiresAt: row.expires_at,
  status: row.status,
  createdAt: row.created_at,
});

const toGuestQrResponse = (row) => ({
  id: row.id,
  hostUserId: row.host_user_id,
  hostName: row.host_name,
  apartmentId: row.apartment_id,
  apartmentCode: row.apartment_code,
  visitor: {
    name: row.visitor_name,
    phone: row.visitor_phone,
    idCard: row.visitor_id_card,
  },
  qrCode: row.qr_code,
  validFrom: row.valid_from,
  validTo: row.valid_to,
  maxEntries: row.max_entries,
  usedEntries: row.used_entries,
  remainingEntries: row.max_entries - row.used_entries,
  status: row.status,
  createdAt: row.created_at,
});

const toGuestQrEntity = (req) => ({
  visitor: {
    host_user_id: req.hostUserId,
    name: req.visitorName,
    phone: req.visitorPhone,
    id_card: req.visitorIdCard,
  },
  guestQr: {
    host_user_id: req.hostUserId,
    apartment_id: req.apartmentId,
    valid_from: req.validFrom,
    valid_to: req.validTo,
    max_entries: req.maxEntries || 1,
  },
});

module.exports = { toPersonalQrResponse, toGuestQrResponse, toGuestQrEntity };
const {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  foreignKey,
  unique,
  date,
  bigint,
  boolean,
  numeric,
  integer,
  text,
  index,
  check,
  pgSequence,
  pgEnum,
} = require("drizzle-orm/pg-core");
const { sql } = require("drizzle-orm");

exports.accessDirectionEnum = pgEnum("access_direction_enum", ["IN", "OUT"]);
exports.apartmentStatusEnum = pgEnum("apartment_status_enum", [
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
]);
exports.buildingStatusEnum = pgEnum("building_status_enum", [
  "ACTIVE",
  "MAINTENANCE",
  "CLOSED",
]);
exports.chatMemberRoleEnum = pgEnum("chat_member_role_enum", [
  "member",
  "admin",
]);
exports.chatMessageTypeEnum = pgEnum("chat_message_type_enum", [
  "text",
  "image",
  "file",
  "system",
]);
exports.chatRoomTypeEnum = pgEnum("chat_room_type_enum", [
  "private",
  "group",
  "building",
]);
exports.genderEnum = pgEnum("gender_enum", ["MALE", "FEMALE", "OTHER"]);
exports.invoiceStatusEnum = pgEnum("invoice_status_enum", [
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);
exports.maintenancePriorityEnum = pgEnum("maintenance_priority_enum", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);
exports.maintenanceStatusEnum = pgEnum("maintenance_status_enum", [
  "OPEN",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
]);
exports.meterTypeEnum = pgEnum("meter_type_enum", ["ELECTRIC", "WATER", "GAS"]);
exports.notificationTypeEnum = pgEnum("notification_type_enum", [
  "NORMAL",
  "EMERGENCY",
  "MAINTENANCE",
  "PAYMENT",
]);
exports.paymentStatusEnum = pgEnum("payment_status_enum", [
  "PENDING",
  "SUCCESS",
  "FAILED",
]);
exports.qrStatusEnum = pgEnum("qr_status_enum", [
  "ACTIVE",
  "EXPIRED",
  "REVOKED",
]);
exports.residentRelationshipEnum = pgEnum("resident_relationship_enum", [
  "OWNER",
  "TENANT",
  "FAMILY",
]);
exports.residentStatusEnum = pgEnum("resident_status_enum", [
  "ACTIVE",
  "MOVED_OUT",
]);
exports.userStatusEnum = pgEnum("user_status_enum", ["ACTIVE", "INACTIVE"]);
exports.vehicleStatusEnum = pgEnum("vehicle_status_enum", [
  "ACTIVE",
  "REMOVED",
]);
exports.vehicleTypeEnum = pgEnum("vehicle_type_enum", [
  "MOTORBIKE",
  "CAR",
  "BICYCLE",
]);

exports.chatMessagesIdSeq = pgSequence("chat_messages_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
exports.chatMessageReadsIdSeq = pgSequence("chat_message_reads_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
exports.chatMessageAttachmentsIdSeq = pgSequence(
  "chat_message_attachments_id_seq",
  {
    startWith: "1",
    increment: "1",
    minValue: "1",
    maxValue: "9223372036854775807",
    cache: "1",
    cycle: false,
  },
);
exports.chatRoomsIdSeq = pgSequence("chat_rooms_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});
exports.chatRoomMembersIdSeq = pgSequence("chat_room_members_id_seq", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
});

exports.roles = pgTable("roles", {
  id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 255 }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

exports.users = pgTable(
  "users",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    username: varchar({ length: 50 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 100 }).notNull(),
    phone: varchar({ length: 20 }),
    fullName: varchar("full_name", { length: 100 }),
    dateOfBirth: date("date_of_birth"),
    gender: exports.genderEnum(),
    idCard: varchar("id_card", { length: 20 }),
    avatarUrl: varchar("avatar_url", { length: 255 }),
    roleId: bigint("role_id", { mode: "number" }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [exports.roles.id],
      name: "users_role_id_fkey",
    }),
    unique("users_username_key").on(table.username),
    unique("users_email_key").on(table.email),
  ],
);

exports.invoiceItems = pgTable(
  "invoice_items",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    invoiceId: bigint("invoice_id", { mode: "number" }),
    itemName: varchar("item_name", { length: 100 }),
    amount: numeric({ precision: 12, scale: 2 }),
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [exports.invoices.id],
      name: "invoice_items_invoice_id_fkey",
    }).onDelete("cascade"),
  ],
);

exports.buildings = pgTable(
  "buildings",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    code: varchar({ length: 50 }).notNull(),
    address: varchar({ length: 255 }),
    totalFloors: integer("total_floors"),
    totalApartments: integer("total_apartments"),
    yearBuilt: integer("year_built"),
    status: exports.buildingStatusEnum().default("ACTIVE"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [unique("buildings_code_key").on(table.code)],
);

exports.payments = pgTable(
  "payments",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    invoiceId: bigint("invoice_id", { mode: "number" }),
    amount: numeric({ precision: 12, scale: 2 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    paymentGateway: varchar("payment_gateway", { length: 100 }),
    gatewayTransactionNo: varchar("gateway_transaction_no", { length: 100 }),
    responseCode: varchar("response_code", { length: 50 }),
    status: exports.paymentStatusEnum().default("PENDING"),
    paymentDate: timestamp("payment_date", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [exports.invoices.id],
      name: "payments_invoice_id_fkey",
    }),
  ],
);

exports.buildingImages = pgTable(
  "building_images",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    buildingId: bigint("building_id", { mode: "number" }),
    imageUrl: varchar("image_url", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [exports.buildings.id],
      name: "building_images_building_id_fkey",
    }).onDelete("cascade"),
  ],
);

exports.buildingAssignments = pgTable(
  "building_assignments",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint("user_id", { mode: "number" }),
    buildingId: bigint("building_id", { mode: "number" }),
    role: varchar({ length: 50 }),
    assignedAt: timestamp("assigned_at", { mode: "string" }).defaultNow(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [exports.buildings.id],
      name: "building_assignments_building_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "building_assignments_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

exports.floors = pgTable(
  "floors",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    buildingId: bigint("building_id", { mode: "number" }),
    floorNumber: integer("floor_number"),
    name: varchar({ length: 100 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [exports.buildings.id],
      name: "floors_building_id_fkey",
    }).onDelete("cascade"),
  ],
);

exports.notifications = pgTable(
  "notifications",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    title: varchar({ length: 255 }),
    content: text(),
    senderId: bigint("sender_id", { mode: "number" }),
    buildingId: bigint("building_id", { mode: "number" }),
    type: exports.notificationTypeEnum().default("NORMAL"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    isBanner: boolean("is_banner").default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [exports.buildings.id],
      name: "notifications_building_id_fkey",
    }),
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [exports.users.id],
      name: "notifications_sender_id_fkey",
    }),
  ],
);

exports.visitors = pgTable(
  "visitors",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    hostUserId: bigint("host_user_id", { mode: "number" }),
    name: varchar({ length: 100 }),
    phone: varchar({ length: 20 }),
    idCard: varchar("id_card", { length: 20 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.hostUserId],
      foreignColumns: [exports.users.id],
      name: "visitors_host_user_id_fkey",
    }),
  ],
);

exports.apartments = pgTable(
  "apartments",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    buildingId: bigint("building_id", { mode: "number" }),
    ownerUserId: bigint("owner_user_id", { mode: "number" }),
    floorId: bigint("floor_id", { mode: "number" }),
    apartmentCode: varchar("apartment_code", { length: 50 }).notNull(),
    area: numeric({ precision: 10, scale: 2 }),
    bedrooms: integer(),
    bathrooms: integer(),
    balconyDirection: varchar("balcony_direction", { length: 50 }),
    status: exports.apartmentStatusEnum().default("AVAILABLE"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [exports.buildings.id],
      name: "apartments_building_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.floorId],
      foreignColumns: [exports.floors.id],
      name: "apartments_floor_id_fkey",
    }),
    foreignKey({
      columns: [table.ownerUserId],
      foreignColumns: [exports.users.id],
      name: "apartments_owner_user_id_fkey",
    }),
    unique("apartments_apartment_code_key").on(table.apartmentCode),
  ],
);

exports.residentProfiles = pgTable(
  "resident_profiles",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint("user_id", { mode: "number" }),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    relationship: exports.residentRelationshipEnum(),
    moveInDate: date("move_in_date"),
    moveOutDate: date("move_out_date"),
    status: exports.residentStatusEnum().default("ACTIVE"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "resident_profiles_apartment_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "resident_profiles_user_id_fkey",
    }),
  ],
);

exports.notificationReceivers = pgTable(
  "notificationReceivers",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    notificationId: bigint("notification_id", { mode: "number" }),
    userId: bigint("user_id", { mode: "number" }),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.notificationId],
      foreignColumns: [exports.notifications.id],
      name: "notification_receivers_notification_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "notification_receivers_user_id_fkey",
    }),
  ],
);

exports.utilityMeters = pgTable(
  "utility_meters",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    meterType: exports.meterTypeEnum("meter_type"),
    meterCode: varchar("meter_code", { length: 50 }),
    installedDate: date("installed_date"),
    status: varchar({ length: 50 }),
  },
  (table) => [
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "utility_meters_apartment_id_fkey",
    }),
    unique("utility_meters_meter_code_key").on(table.meterCode),
  ],
);

exports.maintenanceRequests = pgTable(
  "maintenance_requests",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    userId: bigint("user_id", { mode: "number" }),
    title: varchar({ length: 255 }),
    description: text(),
    priority: exports.maintenancePriorityEnum().default("MEDIUM"),
    status: exports.maintenanceStatusEnum().default("OPEN"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "maintenance_requests_apartment_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "maintenance_requests_user_id_fkey",
    }),
  ],
);

exports.vehicles = pgTable(
  "vehicles",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    ownerId: bigint("owner_id", { mode: "number" }),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    plateNumber: varchar("plate_number", { length: 20 }),
    vehicleType: exports.vehicleTypeEnum("vehicle_type"),
    color: varchar({ length: 20 }),
    status: exports.vehicleStatusEnum().default("ACTIVE"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "vehicles_apartment_id_fkey",
    }),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [exports.users.id],
      name: "vehicles_owner_id_fkey",
    }),
    unique("vehicles_plate_number_key").on(table.plateNumber),
  ],
);

exports.qrCodes = pgTable(
  "qr_codes",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint("user_id", { mode: "number" }),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    qrCode: varchar("qr_code", { length: 100 }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    status: exports.qrStatusEnum().default("ACTIVE"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "qr_codes_apartment_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "qr_codes_user_id_fkey",
    }),
    unique("qr_codes_qr_code_key").on(table.qrCode),
  ],
);

exports.invoices = pgTable(
  "invoices",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    invoiceCode: varchar("invoice_code", { length: 50 }),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    status: exports.invoiceStatusEnum().default("PENDING"),
    dueDate: date("due_date"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "invoices_apartment_id_fkey",
    }),
    unique("invoices_invoice_code_key").on(table.invoiceCode),
  ],
);

exports.accessLogs = pgTable(
  "access_logs",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint("user_id", { mode: "number" }),
    buildingId: bigint("building_id", { mode: "number" }),
    qrCodeId: bigint("qr_code_id", { mode: "number" }),
    direction: exports.accessDirectionEnum(),
    gate: varchar({ length: 50 }),
    scanTime: timestamp("scan_time", { mode: "string" }),
    result: varchar({ length: 50 }),
  },
  (table) => [
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [exports.buildings.id],
      name: "access_logs_building_id_fkey",
    }),
    foreignKey({
      columns: [table.qrCodeId],
      foreignColumns: [exports.qrCodes.id],
      name: "access_logs_qr_code_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "access_logs_user_id_fkey",
    }),
  ],
);

exports.maintenanceAssignments = pgTable(
  "maintenance_assignments",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    requestId: bigint("request_id", { mode: "number" }),
    technicalId: bigint("technical_id", { mode: "number" }),
    assignedAt: timestamp("assigned_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [exports.maintenanceRequests.id],
      name: "maintenance_assignments_request_id_fkey",
    }),
    foreignKey({
      columns: [table.technicalId],
      foreignColumns: [exports.users.id],
      name: "maintenance_assignments_technical_id_fkey",
    }),
  ],
);

exports.meterReadings = pgTable(
  "meter_readings",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    meterId: bigint("meter_id", { mode: "number" }),
    readingDate: date("reading_date"),
    previousReading: numeric("previous_reading", { precision: 12, scale: 2 }),
    currentReading: numeric("current_reading", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.meterId],
      foreignColumns: [exports.utilityMeters.id],
      name: "meter_readings_meter_id_fkey",
    }),
  ],
);

exports.auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    userId: bigint("user_id", { mode: "number" }),
    action: varchar({ length: 100 }),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: bigint("entity_id", { mode: "number" }),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "audit_logs_user_id_fkey",
    }),
  ],
);

exports.guestQrCodes = pgTable(
  "guest_qr_codes",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    hostUserId: bigint("host_user_id", { mode: "number" }),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    qrCode: varchar("qr_code", { length: 100 }),
    validFrom: timestamp("valid_from", { mode: "string" }),
    validTo: timestamp("valid_to", { mode: "string" }),
    maxEntries: integer("max_entries").default(1),
    usedEntries: integer("used_entries").default(0),
    status: exports.qrStatusEnum().default("ACTIVE"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "guest_qr_codes_apartment_id_fkey",
    }),
    foreignKey({
      columns: [table.hostUserId],
      foreignColumns: [exports.users.id],
      name: "guest_qr_codes_host_user_id_fkey",
    }),
  ],
);

exports.chatRooms = pgTable(
  "chat_rooms",
  {
    id: bigint({ mode: "number" })
      .default(sql`nextval('chat_rooms_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    name: varchar(),
    type: exports.chatRoomTypeEnum().default("private").notNull(),
    buildingId: bigint("building_id", { mode: "number" }),
    apartmentId: bigint("apartment_id", { mode: "number" }),
    createdBy: bigint("created_by", { mode: "number" }).notNull(),
    avatar: varchar(),
    lastMessage: text("last_message"),
    lastMessageAt: timestamp("last_message_at", { mode: "string" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_chat_rooms_building").using(
      "btree",
      table.buildingId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.apartmentId],
      foreignColumns: [exports.apartments.id],
      name: "chat_rooms_apartment_id_fkey",
    }),
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [exports.buildings.id],
      name: "chat_rooms_building_id_fkey",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [exports.users.id],
      name: "chat_rooms_created_by_fkey",
    }),
    check(
      "chk_group_has_name",
      sql`(type = 'private'::chat_room_type_enum) OR (name IS NOT NULL)`,
    ),
    check(
      "chk_private_no_building",
      sql`(type <> 'private'::chat_room_type_enum) OR (building_id IS NULL)`,
    ),
  ],
);

exports.chatRoomMembers = pgTable(
  "chat_room_members",
  {
    id: bigint({ mode: "number" })
      .default(sql`nextval('chat_room_members_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    roomId: bigint("room_id", { mode: "number" }).notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    role: exports.chatMemberRoleEnum().default("member").notNull(),
    nickname: varchar(),
    joinedAt: timestamp("joined_at", { mode: "string" }).defaultNow().notNull(),
    lastReadAt: timestamp("last_read_at", { mode: "string" }),
    isMuted: boolean("is_muted").default(false).notNull(),
    isLeft: boolean("is_left").default(false).notNull(),
  },
  (table) => [
    index("idx_chat_room_members_room_id").using(
      "btree",
      table.roomId.asc().nullsLast().op("int8_ops"),
    ),
    index("idx_chat_room_members_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.roomId],
      foreignColumns: [exports.chatRooms.id],
      name: "chat_room_members_room_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "chat_room_members_user_id_fkey",
    }),
    unique("chat_room_members_unique").on(table.roomId, table.userId),
  ],
);

exports.chatMessages = pgTable(
  "chat_messages",
  {
    id: bigint({ mode: "number" })
      .default(sql`nextval('chat_messages_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    roomId: bigint("room_id", { mode: "number" }).notNull(),
    senderId: bigint("sender_id", { mode: "number" }).notNull(),
    messageType: exports
      .chatMessageTypeEnum("message_type")
      .default("text")
      .notNull(),
    content: text(),
    replyTo: bigint("reply_to", { mode: "number" }),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_chat_messages_room_created").using(
      "btree",
      table.roomId.asc().nullsLast().op("int8_ops"),
      table.createdAt.desc().nullsFirst().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.replyTo],
      foreignColumns: [table.id],
      name: "chat_messages_reply_to_fkey",
    }),
    foreignKey({
      columns: [table.roomId],
      foreignColumns: [exports.chatRooms.id],
      name: "chat_messages_room_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [exports.users.id],
      name: "chat_messages_sender_id_fkey",
    }),
  ],
);

exports.chatMessageReads = pgTable(
  "chat_message_reads",
  {
    id: bigint({ mode: "number" })
      .default(sql`nextval('chat_message_reads_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    messageId: bigint("message_id", { mode: "number" }).notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    readAt: timestamp("read_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_chat_message_reads_msg").using(
      "btree",
      table.messageId.asc().nullsLast().op("int8_ops"),
    ),
    index("idx_chat_message_reads_user").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [exports.chatMessages.id],
      name: "chat_message_reads_message_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [exports.users.id],
      name: "chat_message_reads_user_id_fkey",
    }),
    unique("chat_message_reads_unique").on(table.messageId, table.userId),
  ],
);

exports.chatMessageAttachments = pgTable(
  "chat_message_attachments",
  {
    id: bigint({ mode: "number" })
      .default(sql`nextval('chat_message_attachments_id_seq'::regclass)`)
      .primaryKey()
      .notNull(),
    messageId: bigint("message_id", { mode: "number" }).notNull(),
    url: varchar().notNull(),
    fileName: varchar("file_name"),
    fileSize: bigint("file_size", { mode: "number" }),
    mimeType: varchar("mime_type"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_chat_attachments_message").using(
      "btree",
      table.messageId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [exports.chatMessages.id],
      name: "chat_message_attachments_message_id_fkey",
    }).onDelete("cascade"),
  ],
);

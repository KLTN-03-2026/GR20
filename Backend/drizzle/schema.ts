import { pgTable, bigserial, varchar, timestamp, foreignKey, unique, date, bigint, boolean, numeric, integer, text, index, check, pgSequence, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const accessDirectionEnum = pgEnum("access_direction_enum", ['IN', 'OUT'])
export const apartmentStatusEnum = pgEnum("apartment_status_enum", ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
export const buildingStatusEnum = pgEnum("building_status_enum", ['ACTIVE', 'MAINTENANCE', 'CLOSED'])
export const chatMemberRoleEnum = pgEnum("chat_member_role_enum", ['member', 'admin'])
export const chatMessageTypeEnum = pgEnum("chat_message_type_enum", ['text', 'image', 'file', 'system'])
export const chatRoomTypeEnum = pgEnum("chat_room_type_enum", ['private', 'group', 'building'])
export const genderEnum = pgEnum("gender_enum", ['MALE', 'FEMALE', 'OTHER'])
export const invoiceStatusEnum = pgEnum("invoice_status_enum", ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
export const maintenancePriorityEnum = pgEnum("maintenance_priority_enum", ['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
export const maintenanceStatusEnum = pgEnum("maintenance_status_enum", ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
export const meterTypeEnum = pgEnum("meter_type_enum", ['ELECTRIC', 'WATER', 'GAS'])
export const notificationTypeEnum = pgEnum("notification_type_enum", ['NORMAL', 'EMERGENCY', 'MAINTENANCE', 'PAYMENT'])
export const paymentStatusEnum = pgEnum("payment_status_enum", ['PENDING', 'SUCCESS', 'FAILED'])
export const qrStatusEnum = pgEnum("qr_status_enum", ['ACTIVE', 'EXPIRED', 'REVOKED'])
export const residentRelationshipEnum = pgEnum("resident_relationship_enum", ['OWNER', 'TENANT', 'FAMILY'])
export const residentStatusEnum = pgEnum("resident_status_enum", ['ACTIVE', 'MOVED_OUT'])
export const userStatusEnum = pgEnum("user_status_enum", ['ACTIVE', 'INACTIVE'])
export const vehicleStatusEnum = pgEnum("vehicle_status_enum", ['ACTIVE', 'REMOVED'])
export const vehicleTypeEnum = pgEnum("vehicle_type_enum", ['MOTORBIKE', 'CAR', 'BICYCLE'])

export const chatMessagesIdSeq = pgSequence("chat_messages_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const chatMessageReadsIdSeq = pgSequence("chat_message_reads_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const chatMessageAttachmentsIdSeq = pgSequence("chat_message_attachments_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const chatRoomsIdSeq = pgSequence("chat_rooms_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const chatRoomMembersIdSeq = pgSequence("chat_room_members_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const roles = pgTable("roles", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }),
	fullName: varchar("full_name", { length: 100 }),
	dateOfBirth: date("date_of_birth"),
	gender: genderEnum(),
	idCard: varchar("id_card", { length: 20 }),
	avatarUrl: varchar("avatar_url", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roleId: bigint("role_id", { mode: "number" }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "users_role_id_fkey"
		}),
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
]);

export const invoiceItems = pgTable("invoice_items", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	invoiceId: bigint("invoice_id", { mode: "number" }),
	itemName: varchar("item_name", { length: 100 }),
	amount: numeric({ precision: 12, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "invoice_items_invoice_id_fkey"
		}).onDelete("cascade"),
]);

export const buildings = pgTable("buildings", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	address: varchar({ length: 255 }),
	totalFloors: integer("total_floors"),
	totalApartments: integer("total_apartments"),
	yearBuilt: integer("year_built"),
	status: buildingStatusEnum().default('ACTIVE'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("buildings_code_key").on(table.code),
]);

export const payments = pgTable("payments", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	invoiceId: bigint("invoice_id", { mode: "number" }),
	amount: numeric({ precision: 12, scale:  2 }),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentGateway: varchar("payment_gateway", { length: 100 }),
	gatewayTransactionNo: varchar("gateway_transaction_no", { length: 100 }),
	responseCode: varchar("response_code", { length: 50 }),
	status: paymentStatusEnum().default('PENDING'),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payments_invoice_id_fkey"
		}),
]);

export const buildingImages = pgTable("building_images", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	buildingId: bigint("building_id", { mode: "number" }),
	imageUrl: varchar("image_url", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [buildings.id],
			name: "building_images_building_id_fkey"
		}).onDelete("cascade"),
]);

export const buildingAssignments = pgTable("building_assignments", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	buildingId: bigint("building_id", { mode: "number" }),
	role: varchar({ length: 50 }),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [buildings.id],
			name: "building_assignments_building_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "building_assignments_user_id_fkey"
		}).onDelete("cascade"),
]);

export const floors = pgTable("floors", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	buildingId: bigint("building_id", { mode: "number" }),
	floorNumber: integer("floor_number"),
	name: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [buildings.id],
			name: "floors_building_id_fkey"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	title: varchar({ length: 255 }),
	content: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	senderId: bigint("sender_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	buildingId: bigint("building_id", { mode: "number" }),
	type: notificationTypeEnum().default('NORMAL'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	isBanner: boolean("is_banner").default(false),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [buildings.id],
			name: "notifications_building_id_fkey"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "notifications_sender_id_fkey"
		}),
]);

export const visitors = pgTable("visitors", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	hostUserId: bigint("host_user_id", { mode: "number" }),
	name: varchar({ length: 100 }),
	phone: varchar({ length: 20 }),
	idCard: varchar("id_card", { length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.hostUserId],
			foreignColumns: [users.id],
			name: "visitors_host_user_id_fkey"
		}),
]);

export const apartments = pgTable("apartments", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	buildingId: bigint("building_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ownerUserId: bigint("owner_user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	floorId: bigint("floor_id", { mode: "number" }),
	apartmentCode: varchar("apartment_code", { length: 50 }).notNull(),
	area: numeric({ precision: 10, scale:  2 }),
	bedrooms: integer(),
	bathrooms: integer(),
	balconyDirection: varchar("balcony_direction", { length: 50 }),
	status: apartmentStatusEnum().default('AVAILABLE'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [buildings.id],
			name: "apartments_building_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.floorId],
			foreignColumns: [floors.id],
			name: "apartments_floor_id_fkey"
		}),
	foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [users.id],
			name: "apartments_owner_user_id_fkey"
		}),
	unique("apartments_apartment_code_key").on(table.apartmentCode),
]);

export const residentProfiles = pgTable("resident_profiles", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	relationship: residentRelationshipEnum(),
	moveInDate: date("move_in_date"),
	moveOutDate: date("move_out_date"),
	status: residentStatusEnum().default('ACTIVE'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "resident_profiles_apartment_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "resident_profiles_user_id_fkey"
		}),
]);

export const notificationReceivers = pgTable("notification_receivers", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	notificationId: bigint("notification_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	isRead: boolean("is_read").default(false),
	readAt: timestamp("read_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.notificationId],
			foreignColumns: [notifications.id],
			name: "notification_receivers_notification_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_receivers_user_id_fkey"
		}),
]);

export const utilityMeters = pgTable("utility_meters", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	meterType: meterTypeEnum("meter_type"),
	meterCode: varchar("meter_code", { length: 50 }),
	installedDate: date("installed_date"),
	status: varchar({ length: 50 }),
}, (table) => [
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "utility_meters_apartment_id_fkey"
		}),
	unique("utility_meters_meter_code_key").on(table.meterCode),
]);

export const maintenanceRequests = pgTable("maintenance_requests", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	title: varchar({ length: 255 }),
	description: text(),
	priority: maintenancePriorityEnum().default('MEDIUM'),
	status: maintenanceStatusEnum().default('OPEN'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "maintenance_requests_apartment_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maintenance_requests_user_id_fkey"
		}),
]);

export const vehicles = pgTable("vehicles", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ownerId: bigint("owner_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	plateNumber: varchar("plate_number", { length: 20 }),
	vehicleType: vehicleTypeEnum("vehicle_type"),
	color: varchar({ length: 20 }),
	status: vehicleStatusEnum().default('ACTIVE'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "vehicles_apartment_id_fkey"
		}),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "vehicles_owner_id_fkey"
		}),
	unique("vehicles_plate_number_key").on(table.plateNumber),
]);

export const qrCodes = pgTable("qr_codes", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	qrCode: varchar("qr_code", { length: 100 }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	status: qrStatusEnum().default('ACTIVE'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "qr_codes_apartment_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "qr_codes_user_id_fkey"
		}),
	unique("qr_codes_qr_code_key").on(table.qrCode),
]);

export const invoices = pgTable("invoices", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	invoiceCode: varchar("invoice_code", { length: 50 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }),
	status: invoiceStatusEnum().default('PENDING'),
	dueDate: date("due_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "invoices_apartment_id_fkey"
		}),
	unique("invoices_invoice_code_key").on(table.invoiceCode),
]);

export const accessLogs = pgTable("access_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	buildingId: bigint("building_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	qrCodeId: bigint("qr_code_id", { mode: "number" }),
	direction: accessDirectionEnum(),
	gate: varchar({ length: 50 }),
	scanTime: timestamp("scan_time", { mode: 'string' }),
	result: varchar({ length: 50 }),
}, (table) => [
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [buildings.id],
			name: "access_logs_building_id_fkey"
		}),
	foreignKey({
			columns: [table.qrCodeId],
			foreignColumns: [qrCodes.id],
			name: "access_logs_qr_code_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "access_logs_user_id_fkey"
		}),
]);

export const maintenanceAssignments = pgTable("maintenance_assignments", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	requestId: bigint("request_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	technicalId: bigint("technical_id", { mode: "number" }),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.requestId],
			foreignColumns: [maintenanceRequests.id],
			name: "maintenance_assignments_request_id_fkey"
		}),
	foreignKey({
			columns: [table.technicalId],
			foreignColumns: [users.id],
			name: "maintenance_assignments_technical_id_fkey"
		}),
]);

export const meterReadings = pgTable("meter_readings", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	meterId: bigint("meter_id", { mode: "number" }),
	readingDate: date("reading_date"),
	previousReading: numeric("previous_reading", { precision: 12, scale:  2 }),
	currentReading: numeric("current_reading", { precision: 12, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.meterId],
			foreignColumns: [utilityMeters.id],
			name: "meter_readings_meter_id_fkey"
		}),
]);

export const auditLogs = pgTable("audit_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	action: varchar({ length: 100 }),
	entityType: varchar("entity_type", { length: 50 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	entityId: bigint("entity_id", { mode: "number" }),
	ipAddress: varchar("ip_address", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_fkey"
		}),
]);

export const guestQrCodes = pgTable("guest_qr_codes", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	hostUserId: bigint("host_user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	qrCode: varchar("qr_code", { length: 100 }),
	validFrom: timestamp("valid_from", { mode: 'string' }),
	validTo: timestamp("valid_to", { mode: 'string' }),
	maxEntries: integer("max_entries").default(1),
	usedEntries: integer("used_entries").default(0),
	status: qrStatusEnum().default('ACTIVE'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "guest_qr_codes_apartment_id_fkey"
		}),
	foreignKey({
			columns: [table.hostUserId],
			foreignColumns: [users.id],
			name: "guest_qr_codes_host_user_id_fkey"
		}),
]);

export const chatRooms = pgTable("chat_rooms", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('chat_rooms_id_seq'::regclass)`).primaryKey().notNull(),
	name: varchar(),
	type: chatRoomTypeEnum().default('private').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	buildingId: bigint("building_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	apartmentId: bigint("apartment_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	avatar: varchar(),
	lastMessage: text("last_message"),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_chat_rooms_building").using("btree", table.buildingId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.apartmentId],
			foreignColumns: [apartments.id],
			name: "chat_rooms_apartment_id_fkey"
		}),
	foreignKey({
			columns: [table.buildingId],
			foreignColumns: [buildings.id],
			name: "chat_rooms_building_id_fkey"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "chat_rooms_created_by_fkey"
		}),
	check("chk_group_has_name", sql`(type = 'private'::chat_room_type_enum) OR (name IS NOT NULL)`),
	check("chk_private_no_building", sql`(type <> 'private'::chat_room_type_enum) OR (building_id IS NULL)`),
]);

export const chatRoomMembers = pgTable("chat_room_members", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('chat_room_members_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roomId: bigint("room_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	role: chatMemberRoleEnum().default('member').notNull(),
	nickname: varchar(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
	lastReadAt: timestamp("last_read_at", { mode: 'string' }),
	isMuted: boolean("is_muted").default(false).notNull(),
	isLeft: boolean("is_left").default(false).notNull(),
}, (table) => [
	index("idx_chat_room_members_room_id").using("btree", table.roomId.asc().nullsLast().op("int8_ops")),
	index("idx_chat_room_members_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.id],
			name: "chat_room_members_room_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_room_members_user_id_fkey"
		}),
	unique("chat_room_members_unique").on(table.roomId, table.userId),
]);

export const chatMessages = pgTable("chat_messages", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('chat_messages_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roomId: bigint("room_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	senderId: bigint("sender_id", { mode: "number" }).notNull(),
	messageType: chatMessageTypeEnum("message_type").default('text').notNull(),
	content: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	replyTo: bigint("reply_to", { mode: "number" }),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_chat_messages_room_created").using("btree", table.roomId.asc().nullsLast().op("int8_ops"), table.createdAt.desc().nullsFirst().op("int8_ops")),
	foreignKey({
			columns: [table.replyTo],
			foreignColumns: [table.id],
			name: "chat_messages_reply_to_fkey"
		}),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.id],
			name: "chat_messages_room_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "chat_messages_sender_id_fkey"
		}),
]);

export const chatMessageReads = pgTable("chat_message_reads", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('chat_message_reads_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	messageId: bigint("message_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	readAt: timestamp("read_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_chat_message_reads_msg").using("btree", table.messageId.asc().nullsLast().op("int8_ops")),
	index("idx_chat_message_reads_user").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [chatMessages.id],
			name: "chat_message_reads_message_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_message_reads_user_id_fkey"
		}),
	unique("chat_message_reads_unique").on(table.messageId, table.userId),
]);

export const chatMessageAttachments = pgTable("chat_message_attachments", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('chat_message_attachments_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	messageId: bigint("message_id", { mode: "number" }).notNull(),
	url: varchar().notNull(),
	fileName: varchar("file_name"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	mimeType: varchar("mime_type"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_chat_attachments_message").using("btree", table.messageId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [chatMessages.id],
			name: "chat_message_attachments_message_id_fkey"
		}).onDelete("cascade"),
]);

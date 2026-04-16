import { relations } from "drizzle-orm/relations";
import { roles, users, invoices, invoiceItems, payments, buildings, buildingImages, buildingAssignments, floors, notifications, visitors, apartments, residentProfiles, notificationReceivers, utilityMeters, maintenanceRequests, vehicles, qrCodes, accessLogs, maintenanceAssignments, meterReadings, auditLogs, guestQrCodes, chatRooms, chatRoomMembers, chatMessages, chatMessageReads, chatMessageAttachments } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	buildingAssignments: many(buildingAssignments),
	notifications: many(notifications),
	visitors: many(visitors),
	apartments: many(apartments),
	residentProfiles: many(residentProfiles),
	notificationReceivers: many(notificationReceivers),
	maintenanceRequests: many(maintenanceRequests),
	vehicles: many(vehicles),
	qrCodes: many(qrCodes),
	accessLogs: many(accessLogs),
	maintenanceAssignments: many(maintenanceAssignments),
	auditLogs: many(auditLogs),
	guestQrCodes: many(guestQrCodes),
	chatRooms: many(chatRooms),
	chatRoomMembers: many(chatRoomMembers),
	chatMessages: many(chatMessages),
	chatMessageReads: many(chatMessageReads),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	users: many(users),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoiceItems.invoiceId],
		references: [invoices.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	invoiceItems: many(invoiceItems),
	payments: many(payments),
	apartment: one(apartments, {
		fields: [invoices.apartmentId],
		references: [apartments.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	invoice: one(invoices, {
		fields: [payments.invoiceId],
		references: [invoices.id]
	}),
}));

export const buildingImagesRelations = relations(buildingImages, ({one}) => ({
	building: one(buildings, {
		fields: [buildingImages.buildingId],
		references: [buildings.id]
	}),
}));

export const buildingsRelations = relations(buildings, ({many}) => ({
	buildingImages: many(buildingImages),
	buildingAssignments: many(buildingAssignments),
	floors: many(floors),
	notifications: many(notifications),
	apartments: many(apartments),
	accessLogs: many(accessLogs),
	chatRooms: many(chatRooms),
}));

export const buildingAssignmentsRelations = relations(buildingAssignments, ({one}) => ({
	building: one(buildings, {
		fields: [buildingAssignments.buildingId],
		references: [buildings.id]
	}),
	user: one(users, {
		fields: [buildingAssignments.userId],
		references: [users.id]
	}),
}));

export const floorsRelations = relations(floors, ({one, many}) => ({
	building: one(buildings, {
		fields: [floors.buildingId],
		references: [buildings.id]
	}),
	apartments: many(apartments),
}));

export const notificationsRelations = relations(notifications, ({one, many}) => ({
	building: one(buildings, {
		fields: [notifications.buildingId],
		references: [buildings.id]
	}),
	user: one(users, {
		fields: [notifications.senderId],
		references: [users.id]
	}),
	notificationReceivers: many(notificationReceivers),
}));

export const visitorsRelations = relations(visitors, ({one}) => ({
	user: one(users, {
		fields: [visitors.hostUserId],
		references: [users.id]
	}),
}));

export const apartmentsRelations = relations(apartments, ({one, many}) => ({
	building: one(buildings, {
		fields: [apartments.buildingId],
		references: [buildings.id]
	}),
	floor: one(floors, {
		fields: [apartments.floorId],
		references: [floors.id]
	}),
	user: one(users, {
		fields: [apartments.ownerUserId],
		references: [users.id]
	}),
	residentProfiles: many(residentProfiles),
	utilityMeters: many(utilityMeters),
	maintenanceRequests: many(maintenanceRequests),
	vehicles: many(vehicles),
	qrCodes: many(qrCodes),
	invoices: many(invoices),
	guestQrCodes: many(guestQrCodes),
	chatRooms: many(chatRooms),
}));

export const residentProfilesRelations = relations(residentProfiles, ({one}) => ({
	apartment: one(apartments, {
		fields: [residentProfiles.apartmentId],
		references: [apartments.id]
	}),
	user: one(users, {
		fields: [residentProfiles.userId],
		references: [users.id]
	}),
}));

export const notificationReceiversRelations = relations(notificationReceivers, ({one}) => ({
	notification: one(notifications, {
		fields: [notificationReceivers.notificationId],
		references: [notifications.id]
	}),
	user: one(users, {
		fields: [notificationReceivers.userId],
		references: [users.id]
	}),
}));

export const utilityMetersRelations = relations(utilityMeters, ({one, many}) => ({
	apartment: one(apartments, {
		fields: [utilityMeters.apartmentId],
		references: [apartments.id]
	}),
	meterReadings: many(meterReadings),
}));

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({one, many}) => ({
	apartment: one(apartments, {
		fields: [maintenanceRequests.apartmentId],
		references: [apartments.id]
	}),
	user: one(users, {
		fields: [maintenanceRequests.userId],
		references: [users.id]
	}),
	maintenanceAssignments: many(maintenanceAssignments),
}));

export const vehiclesRelations = relations(vehicles, ({one}) => ({
	apartment: one(apartments, {
		fields: [vehicles.apartmentId],
		references: [apartments.id]
	}),
	user: one(users, {
		fields: [vehicles.ownerId],
		references: [users.id]
	}),
}));

export const qrCodesRelations = relations(qrCodes, ({one, many}) => ({
	apartment: one(apartments, {
		fields: [qrCodes.apartmentId],
		references: [apartments.id]
	}),
	user: one(users, {
		fields: [qrCodes.userId],
		references: [users.id]
	}),
	accessLogs: many(accessLogs),
}));

export const accessLogsRelations = relations(accessLogs, ({one}) => ({
	building: one(buildings, {
		fields: [accessLogs.buildingId],
		references: [buildings.id]
	}),
	qrCode: one(qrCodes, {
		fields: [accessLogs.qrCodeId],
		references: [qrCodes.id]
	}),
	user: one(users, {
		fields: [accessLogs.userId],
		references: [users.id]
	}),
}));

export const maintenanceAssignmentsRelations = relations(maintenanceAssignments, ({one}) => ({
	maintenanceRequest: one(maintenanceRequests, {
		fields: [maintenanceAssignments.requestId],
		references: [maintenanceRequests.id]
	}),
	user: one(users, {
		fields: [maintenanceAssignments.technicalId],
		references: [users.id]
	}),
}));

export const meterReadingsRelations = relations(meterReadings, ({one}) => ({
	utilityMeter: one(utilityMeters, {
		fields: [meterReadings.meterId],
		references: [utilityMeters.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const guestQrCodesRelations = relations(guestQrCodes, ({one}) => ({
	apartment: one(apartments, {
		fields: [guestQrCodes.apartmentId],
		references: [apartments.id]
	}),
	user: one(users, {
		fields: [guestQrCodes.hostUserId],
		references: [users.id]
	}),
}));

export const chatRoomsRelations = relations(chatRooms, ({one, many}) => ({
	apartment: one(apartments, {
		fields: [chatRooms.apartmentId],
		references: [apartments.id]
	}),
	building: one(buildings, {
		fields: [chatRooms.buildingId],
		references: [buildings.id]
	}),
	user: one(users, {
		fields: [chatRooms.createdBy],
		references: [users.id]
	}),
	chatRoomMembers: many(chatRoomMembers),
	chatMessages: many(chatMessages),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatRoomMembers.roomId],
		references: [chatRooms.id]
	}),
	user: one(users, {
		fields: [chatRoomMembers.userId],
		references: [users.id]
	}),
}));

export const chatMessagesRelations = relations(chatMessages, ({one, many}) => ({
	chatMessage: one(chatMessages, {
		fields: [chatMessages.replyTo],
		references: [chatMessages.id],
		relationName: "chatMessages_replyTo_chatMessages_id"
	}),
	chatMessages: many(chatMessages, {
		relationName: "chatMessages_replyTo_chatMessages_id"
	}),
	chatRoom: one(chatRooms, {
		fields: [chatMessages.roomId],
		references: [chatRooms.id]
	}),
	user: one(users, {
		fields: [chatMessages.senderId],
		references: [users.id]
	}),
	chatMessageReads: many(chatMessageReads),
	chatMessageAttachments: many(chatMessageAttachments),
}));

export const chatMessageReadsRelations = relations(chatMessageReads, ({one}) => ({
	chatMessage: one(chatMessages, {
		fields: [chatMessageReads.messageId],
		references: [chatMessages.id]
	}),
	user: one(users, {
		fields: [chatMessageReads.userId],
		references: [users.id]
	}),
}));

export const chatMessageAttachmentsRelations = relations(chatMessageAttachments, ({one}) => ({
	chatMessage: one(chatMessages, {
		fields: [chatMessageAttachments.messageId],
		references: [chatMessages.id]
	}),
}));
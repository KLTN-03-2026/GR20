-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."access_direction_enum" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TYPE "public"."apartment_status_enum" AS ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "public"."building_status_enum" AS ENUM('ACTIVE', 'MAINTENANCE', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."chat_member_role_enum" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TYPE "public"."chat_message_type_enum" AS ENUM('text', 'image', 'file', 'system');--> statement-breakpoint
CREATE TYPE "public"."chat_room_type_enum" AS ENUM('private', 'group', 'building');--> statement-breakpoint
CREATE TYPE "public"."gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."invoice_status_enum" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."maintenance_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."meter_type_enum" AS ENUM('ELECTRIC', 'WATER', 'GAS');--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('NORMAL', 'EMERGENCY', 'MAINTENANCE', 'PAYMENT');--> statement-breakpoint
CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."qr_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."resident_relationship_enum" AS ENUM('OWNER', 'TENANT', 'FAMILY');--> statement-breakpoint
CREATE TYPE "public"."resident_status_enum" AS ENUM('ACTIVE', 'MOVED_OUT');--> statement-breakpoint
CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status_enum" AS ENUM('ACTIVE', 'REMOVED');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type_enum" AS ENUM('MOTORBIKE', 'CAR', 'BICYCLE');--> statement-breakpoint
CREATE SEQUENCE "public"."chat_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."chat_message_reads_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."chat_message_attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."chat_rooms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."chat_room_members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(20),
	"full_name" varchar(100),
	"date_of_birth" date,
	"gender" "gender_enum",
	"id_card" varchar(20),
	"avatar_url" varchar(255),
	"role_id" bigint,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoice_id" bigint,
	"item_name" varchar(100),
	"amount" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"address" varchar(255),
	"total_floors" integer,
	"total_apartments" integer,
	"year_built" integer,
	"status" "building_status_enum" DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "buildings_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoice_id" bigint,
	"amount" numeric(12, 2),
	"payment_method" varchar(50),
	"payment_gateway" varchar(100),
	"gateway_transaction_no" varchar(100),
	"response_code" varchar(50),
	"status" "payment_status_enum" DEFAULT 'PENDING',
	"payment_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "building_images" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"building_id" bigint,
	"image_url" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "building_assignments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"building_id" bigint,
	"role" varchar(50),
	"assigned_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"building_id" bigint,
	"floor_number" integer,
	"name" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"content" text,
	"sender_id" bigint,
	"building_id" bigint,
	"type" "notification_type_enum" DEFAULT 'NORMAL',
	"created_at" timestamp DEFAULT now(),
	"is_banner" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"host_user_id" bigint,
	"name" varchar(100),
	"phone" varchar(20),
	"id_card" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "apartments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"building_id" bigint,
	"owner_user_id" bigint,
	"floor_id" bigint,
	"apartment_code" varchar(50) NOT NULL,
	"area" numeric(10, 2),
	"bedrooms" integer,
	"bathrooms" integer,
	"balcony_direction" varchar(50),
	"status" "apartment_status_enum" DEFAULT 'AVAILABLE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "apartments_apartment_code_key" UNIQUE("apartment_code")
);
--> statement-breakpoint
CREATE TABLE "resident_profiles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"apartment_id" bigint,
	"relationship" "resident_relationship_enum",
	"move_in_date" date,
	"move_out_date" date,
	"status" "resident_status_enum" DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_receivers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"notification_id" bigint,
	"user_id" bigint,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "utility_meters" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"apartment_id" bigint,
	"meter_type" "meter_type_enum",
	"meter_code" varchar(50),
	"installed_date" date,
	"status" varchar(50),
	CONSTRAINT "utility_meters_meter_code_key" UNIQUE("meter_code")
);
--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"apartment_id" bigint,
	"user_id" bigint,
	"title" varchar(255),
	"description" text,
	"priority" "maintenance_priority_enum" DEFAULT 'MEDIUM',
	"status" "maintenance_status_enum" DEFAULT 'OPEN',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"owner_id" bigint,
	"apartment_id" bigint,
	"plate_number" varchar(20),
	"vehicle_type" "vehicle_type_enum",
	"color" varchar(20),
	"status" "vehicle_status_enum" DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicles_plate_number_key" UNIQUE("plate_number")
);
--> statement-breakpoint
CREATE TABLE "qr_codes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"apartment_id" bigint,
	"qr_code" varchar(100),
	"expires_at" timestamp,
	"status" "qr_status_enum" DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "qr_codes_qr_code_key" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoice_code" varchar(50),
	"apartment_id" bigint,
	"total_amount" numeric(12, 2),
	"status" "invoice_status_enum" DEFAULT 'PENDING',
	"due_date" date,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_code_key" UNIQUE("invoice_code")
);
--> statement-breakpoint
CREATE TABLE "access_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"building_id" bigint,
	"qr_code_id" bigint,
	"direction" "access_direction_enum",
	"gate" varchar(50),
	"scan_time" timestamp,
	"result" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "maintenance_assignments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"request_id" bigint,
	"technical_id" bigint,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meter_readings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"meter_id" bigint,
	"reading_date" date,
	"previous_reading" numeric(12, 2),
	"current_reading" numeric(12, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"action" varchar(100),
	"entity_type" varchar(50),
	"entity_id" bigint,
	"ip_address" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guest_qr_codes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"host_user_id" bigint,
	"apartment_id" bigint,
	"qr_code" varchar(100),
	"valid_from" timestamp,
	"valid_to" timestamp,
	"max_entries" integer DEFAULT 1,
	"used_entries" integer DEFAULT 0,
	"status" "qr_status_enum" DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" bigint PRIMARY KEY DEFAULT nextval('chat_rooms_id_seq'::regclass) NOT NULL,
	"name" varchar,
	"type" "chat_room_type_enum" DEFAULT 'private' NOT NULL,
	"building_id" bigint,
	"apartment_id" bigint,
	"created_by" bigint NOT NULL,
	"avatar" varchar,
	"last_message" text,
	"last_message_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_group_has_name" CHECK ((type = 'private'::chat_room_type_enum) OR (name IS NOT NULL)),
	CONSTRAINT "chk_private_no_building" CHECK ((type <> 'private'::chat_room_type_enum) OR (building_id IS NULL))
);
--> statement-breakpoint
CREATE TABLE "chat_room_members" (
	"id" bigint PRIMARY KEY DEFAULT nextval('chat_room_members_id_seq'::regclass) NOT NULL,
	"room_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"role" "chat_member_role_enum" DEFAULT 'member' NOT NULL,
	"nickname" varchar,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_left" boolean DEFAULT false NOT NULL,
	CONSTRAINT "chat_room_members_unique" UNIQUE("room_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" bigint PRIMARY KEY DEFAULT nextval('chat_messages_id_seq'::regclass) NOT NULL,
	"room_id" bigint NOT NULL,
	"sender_id" bigint NOT NULL,
	"message_type" "chat_message_type_enum" DEFAULT 'text' NOT NULL,
	"content" text,
	"reply_to" bigint,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_message_reads" (
	"id" bigint PRIMARY KEY DEFAULT nextval('chat_message_reads_id_seq'::regclass) NOT NULL,
	"message_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chat_message_reads_unique" UNIQUE("message_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "chat_message_attachments" (
	"id" bigint PRIMARY KEY DEFAULT nextval('chat_message_attachments_id_seq'::regclass) NOT NULL,
	"message_id" bigint NOT NULL,
	"url" varchar NOT NULL,
	"file_name" varchar,
	"file_size" bigint,
	"mime_type" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_images" ADD CONSTRAINT "building_images_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_assignments" ADD CONSTRAINT "building_assignments_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_assignments" ADD CONSTRAINT "building_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resident_profiles" ADD CONSTRAINT "resident_profiles_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resident_profiles" ADD CONSTRAINT "resident_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_receivers" ADD CONSTRAINT "notification_receivers_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_receivers" ADD CONSTRAINT "notification_receivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_meters" ADD CONSTRAINT "utility_meters_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_assignments" ADD CONSTRAINT "maintenance_assignments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."maintenance_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_assignments" ADD CONSTRAINT "maintenance_assignments_technical_id_fkey" FOREIGN KEY ("technical_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_meter_id_fkey" FOREIGN KEY ("meter_id") REFERENCES "public"."utility_meters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_qr_codes" ADD CONSTRAINT "guest_qr_codes_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_qr_codes" ADD CONSTRAINT "guest_qr_codes_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_fkey" FOREIGN KEY ("reply_to") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_attachments" ADD CONSTRAINT "chat_message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_building" ON "chat_rooms" USING btree ("building_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_room_members_room_id" ON "chat_room_members" USING btree ("room_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_room_members_user_id" ON "chat_room_members" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_messages_room_created" ON "chat_messages" USING btree ("room_id" int8_ops,"created_at" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_message_reads_msg" ON "chat_message_reads" USING btree ("message_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_message_reads_user" ON "chat_message_reads" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_attachments_message" ON "chat_message_attachments" USING btree ("message_id" int8_ops);
*/
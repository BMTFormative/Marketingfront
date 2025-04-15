import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'client']);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRoleEnum("role").notNull().default('client'),
  status: text("status").notNull().default('active'),
  lastLogin: timestamp("last_login"),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign Status enum
export const campaignStatusEnum = pgEnum('campaign_status', ['active', 'paused', 'completed']);

// Campaign table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: campaignStatusEnum("status").notNull().default('active'),
  conversions: integer("conversions").default(0),
  budget: integer("budget").default(0),
  roi: integer("roi").default(0),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// CSV Upload table
export const csvUploads = pgTable("csv_uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  processed: boolean("processed").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Marketing Metrics table
export const marketingMetrics = pgTable("marketing_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  csvUploadId: integer("csv_upload_id").notNull().references(() => csvUploads.id),
  // Only using fields that match the current database schema
  conversionRate: text("conversion_rate"),
  clickThroughRate: text("click_through_rate"),
  roi: text("roi"),
  averageCpc: text("average_cpc"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Insights table
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  metricId: integer("metric_id").notNull().references(() => marketingMetrics.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// API Configuration table
export const apiConfigurations = pgTable("api_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, lastLogin: true, createdAt: true });

export const insertCampaignSchema = createInsertSchema(campaigns)
  .omit({ id: true, createdAt: true });

export const insertCsvUploadSchema = createInsertSchema(csvUploads)
  .omit({ id: true, processed: true, uploadedAt: true });

export const insertMarketingMetricSchema = createInsertSchema(marketingMetrics)
  .omit({ id: true, createdAt: true });

export const insertAiInsightSchema = createInsertSchema(aiInsights)
  .omit({ id: true, createdAt: true });

export const insertApiConfigurationSchema = createInsertSchema(apiConfigurations)
  .omit({ id: true, createdAt: true });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertCsvUpload = z.infer<typeof insertCsvUploadSchema>;
export type CsvUpload = typeof csvUploads.$inferSelect;

export type InsertMarketingMetric = z.infer<typeof insertMarketingMetricSchema>;
export type MarketingMetric = typeof marketingMetrics.$inferSelect;

export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;

export type InsertApiConfiguration = z.infer<typeof insertApiConfigurationSchema>;
export type ApiConfiguration = typeof apiConfigurations.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginData = z.infer<typeof loginSchema>;

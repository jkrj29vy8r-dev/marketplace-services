import { z } from "zod";

export const registerCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const registerCompanySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  companyName: z.string().min(2).max(150),
  cui: z
    .string()
    .regex(/^(RO)?\d{2,10}$/i, "CUI invalid"),
  regCom: z.string().min(5).max(50),
  sediuSocial: z.string().min(5).max(250),
});

export const registerVendorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().min(2).max(150),
  bio: z.string().max(3000).optional(),
});

export const createServiceSchema = z.object({
  categoryId: z.string().cuid(),
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(3000),
  pricingType: z.enum(["FIXED", "PER_UNIT"]),
  priceNetRON: z.number().positive(),
  vatRate: z.number().min(0).max(1).default(0.19),
  unit: z.string().max(30).optional(),
  durationMins: z.number().int().positive().optional(),
});

export const createAvailabilitySchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createBookingSchema = z.object({
  serviceId: z.string().cuid(),
  availabilityId: z.string().cuid(),
  paymentType: z.enum(["CARD", "BANK_TRANSFER"]),
});

export const createRFQSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(5000),
  serviceId: z.string().cuid().optional(),
  budgetMinRON: z.number().nonnegative().optional(),
  budgetMaxRON: z.number().positive().optional(),
});

export const createRFQOfferSchema = z.object({
  priceRON: z.number().positive(),
  message: z.string().min(5).max(2000),
});

export const updateVendorProfileSchema = z.object({
  displayName: z.string().min(2).max(150),
  bio: z.string().max(3000).optional(),
  galleryUrls: z.array(z.string().url()).max(30).optional(),
});

export const promotionPurchaseSchema = z.object({
  vendorServiceId: z.string().cuid().optional(),
  plan: z.enum(["TOP_SEARCH_7D", "TOP_SEARCH_30D", "FEATURED_HOME_7D", "FEATURED_HOME_30D"]),
});

export const bankProofUploadSchema = z.object({
  transactionId: z.string().cuid(),
  proofUrl: z.string().url(),
});

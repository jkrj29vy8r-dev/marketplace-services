import Stripe from "stripe";

// Lazy singleton — platform works without Stripe keys (bank transfer only),
// card checkout returns 503 until STRIPE_SECRET_KEY is configured.
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

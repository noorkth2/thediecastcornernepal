# Production Readiness Roadmap

Your e-commerce platform is visually stunning and functionally solid at its core. However, before opening the doors to real customers and handling real money, a few critical systems must be finalized to ensure a secure, professional, and reliable experience. 

Below is a comprehensive audit and proposed roadmap to make **The Diecast Corner Nepal** 100% production-ready.

## User Review Required
> [!IMPORTANT]
> Please review the phases below. Let me know which features you consider "Must-Haves" for Day 1 versus "Nice-to-Haves" for later. Once approved, I will begin executing them systematically.

---

## Phase 1: Robust Payment & Checkout (Critical)
Currently, Khalti is partially implemented, but eSewa and robust error handling are missing.

- **Payment Webhooks:** Implement secure server-side webhooks to verify payment success. Relying purely on client-side redirects can result in lost orders if the user closes the browser too early.
- **eSewa Integration:** Complete the eSewa payment flow alongside Khalti.
- **Inventory Concurrency (Race Conditions):** Ensure that when two customers try to buy the last limited-edition item at the exact same time, the system prevents overselling by using a database transaction during checkout.

## Phase 2: Transactional Emails
When a customer spends money, they expect immediate confirmation. Currently, there is no email system configured for orders.

- **Order Confirmations:** Integrate an email provider (like **Resend** or SendGrid) to automatically send beautifully formatted PDF receipts to customers upon successful payment.
- **Admin Notifications:** Send an alert to the admin email when a new order is placed so you can begin fulfillment immediately.
- **Status Updates:** Send automated emails when an order status changes (e.g., from "Processing" to "Shipped" with a tracking number).

## Phase 3: SEO & Analytics (Growth)
To ensure customers can actually find your store on Google.

- **Dynamic Meta Tags:** Ensure every individual product page and category page dynamically generates SEO titles, descriptions, and OpenGraph images (for sharing on Facebook/Instagram).
- **Sitemap & Robots.txt:** Generate an automated `sitemap.xml` that updates whenever you add new products, allowing Google to crawl your site instantly.
- **Analytics:** Integrate Vercel Analytics or Google Analytics to track visitor behavior, conversion rates, and popular products.

## Phase 4: UX Polish & Legal
The final touches that build trust with online shoppers.

- **Legal Pages:** Create essential pages: Terms of Service, Privacy Policy, Shipping Policy, and Return/Refund Policy. (Payment gateways often reject merchants who lack these).
- **Error Boundaries:** Add custom "404 Not Found" and "500 Server Error" pages that match your brand's premium dark theme, rather than showing default browser errors.
- **Toast Notifications:** Ensure all edge cases (e.g., trying to add more items than are in stock, invalid coupon codes) trigger clear, helpful UI toasts.

## Phase 5: Security & Performance Audit
- **Rate Limiting:** Add basic rate-limiting to the checkout and login API routes to prevent automated bots from spamming your store.
- **Image Optimization:** Ensure all product images uploaded via the Admin dashboard are properly compressed and served via CDN to guarantee lightning-fast page loads.
- **RLS Audit:** A final check of Supabase Row Level Security to ensure customer data is strictly isolated.

---

## Open Questions
1. **Email Provider:** I recommend **Resend** for sending order emails (it's modern, easy to set up, and free for up to 3,000 emails/month). Does that work for you?
2. **Payments:** Are you ready to fully test Khalti and eSewa with live/test API keys, or should we focus on "Cash on Delivery" for the initial soft launch?
3. **Priorities:** Which of these phases would you like me to tackle first? (I highly recommend starting with Phase 1 & 2).

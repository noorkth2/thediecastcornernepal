# Security Audit Findings & Remediations - Diecast Corner Nepal

## 1. Broken Access Control (Critical) - FIXED
Multiple server actions intended for admin-only use were only verifying if a user was authenticated.
**Fix:** Created `verifyAdmin()` helper in `src/lib/supabase/auth-utils.ts` and applied it to all admin-only server actions.

## 2. Price Tampering (Critical) - FIXED
The order creation endpoint was trusting the `unit_price` provided by the client.
**Fix:** Updated `src/app/api/orders/route.ts` to fetch current prices from the database for each item and use those for calculations.

## 3. Insecure Payment Verification (High) - FIXED
The Khalti verification endpoint trusted the `orderId` from the client.
**Fix:** Updated `src/app/api/payment/khalti/verify/route.ts` to verify that the `purchase_order_id` and `amount` from Khalti match the internal order code and amount.

## 4. Unauthenticated Webhook (High) - FIXED
The Khalti webhook endpoint had no origin verification.
**Fix:** Implemented an `Authorization` header check in `src/app/api/payment/khalti/webhook/route.ts` using `KHALTI_WEBHOOK_SECRET`.

## 5. Sensitive Data Exposure via RPCs (High) - FIXED
Analytics PostgreSQL functions lacked internal role checks.
**Fix:** Created migration `20260531000000_secure_rpc_functions.sql` which adds `check_admin_access()` internally to all sensitive `SECURITY DEFINER` functions and revokes execution from `PUBLIC`.

## 6. Potential Stock Manipulation (Medium) - FIXED
The `decrement_stock` RPC was accessible to any authenticated user.
**Fix:** Revoked execution from `authenticated` and `PUBLIC`. Updated order creation API to use a service-role client (`createAdminClient`) for stock decrement.

---

# Verification Status
- [x] Admin Role Check helper implemented
- [x] Accounting actions secured
- [x] Reports actions secured
- [x] Dashboard actions secured
- [x] Products actions secured
- [x] Orders API secured (Price + Stock)
- [x] Khalti Verification secured
- [x] Khalti Webhook secured
- [x] DB Functions secured

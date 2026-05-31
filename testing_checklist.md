# The Diecast Corner Nepal: Complete Production Test Cases

This document provides a comprehensive list of test cases to verify the entire e-commerce platform.

---

## 1. Authentication & Profile
| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| AUTH-01 | Registration | Create a new customer account with valid details. | User created, redirected to home/profile, and profile record exists in DB. |
| AUTH-02 | Login | Log in with valid credentials. | Successful login, user redirected to home, session persisted. |
| AUTH-03 | Profile Update | Update Full Name, Phone, and Address in the account settings. | Changes saved successfully; `shipping_address` JSON updated in DB. |
| AUTH-04 | Admin Access | Log in as an admin user. | Dashboard links become visible; access to `/admin` is permitted. |
| AUTH-05 | Unauthorized Admin | Try to access `/admin` as a standard customer. | Redirected to home or shown a 403/404 error. |

## 2. Product Browsing & Search
| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| BROWSE-01 | Home Page | Verify Hero Banner, New Arrivals, and Featured Drops load. | Visual components load correctly with live data from DB. |
| BROWSE-02 | Shop Filters | Filter products by Category (e.g., MiniGT) and Brand. | Results update dynamically; URL search params reflect filters. |
| BROWSE-03 | Search | Use the search bar for a specific model (e.g., "Skyline"). | Relevant products are displayed; search result metadata (title) updates. |
| BROWSE-04 | Product Detail | Click on a product to view its details. | Images, price, stock status, specs, and description load correctly. |
| BROWSE-05 | Reviews | Post a 5-star review on a product as a logged-in user. | Review appears immediately; average rating updates. |
| BROWSE-06 | Waitlist | For an "Out of Stock" item, join the waitlist with an email. | Success message shown; record created in `waitlist` table. |

## 3. Cart & Checkout
| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| CART-01 | Add to Cart | Add a product from the shop or detail page. | Item count in cart navbar increases; Cart drawer shows item. |
| CART-02 | Cart Limits | Try to add more items than are in stock. | Warning toast shown or button disabled. |
| CHECK-01 | Order Creation | Complete the checkout form with COD. | Order created in DB; redirected to success page; "Order Received" email sent. |
| CHECK-02 | Price Validation | Modify price via inspect element before clicking Pay. | API should detect mismatch and reject the order using server-side prices. |
| CHECK-03 | Stock Decrement | Place an order for 1 item. | Product `stock_qty` in database decreases by 1 immediately. |

## 4. Payment Integrations
| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| PAY-01 | Khalti Initiation | Select Khalti and click "Pay". | Redirected to Khalti's secure payment portal. |
| PAY-02 | eSewa Initiation | Select eSewa and click "Pay". | Redirected to eSewa's secure payment portal with correct signature. |
| PAY-03 | Payment Success | Complete a test payment on Khalti/eSewa. | Redirected to `/order/success`; order status in DB becomes "Paid". |
| PAY-04 | Payment Failure | Cancel the payment on the gateway portal. | Redirected to `/order/failure` with a clear explanation and return-to-cart link. |

## 5. Admin Dashboard
| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| ADMIN-01 | Order Status | Update an order from "Pending" to "Shipped". | DB status updates; "Order Shipped" email sent to customer. |
| ADMIN-02 | Product Management | Create a new product with multiple images. | Product appears in the store; images load via CDN correctly. |
| ADMIN-03 | Analytics | View the dashboard KPI cards (Revenue, Orders). | Data reflects real sales; internal RPC role checks prevent non-admins from viewing. |

## 6. SEO & Technical
| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| SEO-01 | Dynamic Meta | Inspect head tags on a product page. | `<title>` and `og:image` match the specific product details. |
| SEO-02 | Sitemap | Visit `/sitemap.xml`. | A valid XML file listing all current products and categories is displayed. |
| SEO-03 | 404 Page | Visit a non-existent URL (e.g., `/invalid-car`). | Branded 404 page with "Return Home" and "Shop" links is shown. |

---
**Instructions:** Use this markdown to generate a tracking spreadsheet for your QA team.

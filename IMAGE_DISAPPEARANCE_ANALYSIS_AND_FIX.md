# Complete Root Cause Analysis: Why Images Disappear in MOTORX Web

## 1. Executive Summary

A comprehensive audit of all files and folders across the frontend, backend, database scripts, and public asset directories was conducted. 

The primary reasons images disappear or fail to render in this project are:
1. **Reliance on External Unsplash Hotlinks**: All mock databases (`frontend/src/data/products.js`), SQL seeds (`database/seed.sql`), and admin forms rely on third-party `images.unsplash.com` URLs. These URLs frequently fail due to rate limiting, network firewalls, ad blockers, or CORS issues.
2. **Local Image Assets Are Completely Disconnected**: The project contains 56 high-resolution local product images inside `frontend/public/products/`, but **none** of them are linked in `frontend/src/data/products.js` or `database/seed.sql`.
3. **No `onError` Fallbacks in React Components**: Components like `ProductCard.jsx`, `ProductGallery.jsx`, `CartDrawer.jsx`, `SearchBar.jsx`, `Cart.jsx`, `Wishlist.jsx`, `Checkout.jsx`, and Admin tables do not implement an image error fallback handler (`onError`). When a URL fails, the image collapses or shows a broken icon.
4. **Database Reset Overwrites Custom Products**: Running `node database/init.js` executes `seed.sql` with `TRUNCATE ... RESTART IDENTITY CASCADE`, wiping any newly created products or image URLs and resetting them back to external Unsplash links.
5. **Admin Panel Lacks Persistent File Upload Support**: The Admin Panel only accepts raw URL strings without an upload backend (e.g. Multer / Cloudinary). If temporary blob URLs (`blob:...`) or temporary links are used, they vanish on browser refresh.
6. **Folder Naming and URL Encoding Pitfalls**: Folder names such as `Epoxy_Resin` and `vaccum_bagging` (spelled with double 'c'), as well as files with parentheses like `Resin_Infusion_Mesh_(Flow_Media).jpeg`, cause 404 failures in production Linux/Vercel environments if not URL-encoded or if casing doesn't match.

---

## 2. Comprehensive Root Cause Breakdown

### Root Cause 1: Fragile External CDN Hotlinking (Unsplash)
- **Location**: [products.js](file:///d:/sindhiya/motorx_web/frontend/src/data/products.js), [categories.js](file:///d:/sindhiya/motorx_web/frontend/src/data/categories.js), [seed.sql](file:///d:/sindhiya/motorx_web/database/seed.sql), [Home.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/Home.jsx)
- **What happens**:
  Every product record uses external URLs like:
  ```javascript
  image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80"
  ```
- **Why it disappears**:
  - Unsplash frequently rate-limits direct hotlinked image traffic from localhost or non-whitelisted domains.
  - If the client is offline or behind an enterprise firewall/ad-blocker that filters external media requests, the images fail to load.
  - If Unsplash changes dynamic formatting parameters (`auto=format&fit=crop`), the links return HTTP 403 or 404.

---

### Root Cause 2: 56 Local Product Images Exist in `public/products/` but Are Unused
- **Location**: `frontend/public/products/`
- **What exists on disk**:
  You already have 56 high-quality composite material images stored in your frontend public folder:
  - `frontend/public/products/core_materials/` (7 images)
  - `frontend/public/products/cured_products/` (7 images)
  - `frontend/public/products/Epoxy_Resin/` (3 images)
  - `frontend/public/products/moulds_patterns/` (4 images)
  - `frontend/public/products/pultruded_products/` (8 images)
  - `frontend/public/products/tubes/` (7 images)
  - `frontend/public/products/vaccum_bagging/` (20 images)
- **Why it causes image loss**:
  Neither `frontend/src/data/products.js` nor `database/seed.sql` references `/products/...`. The application was completely disconnected from the local image assets.

---

### Root Cause 3: Missing `onError` Handling in Image Renderers
- **Location**:
  - [ProductCard.jsx](file:///d:/sindhiya/motorx_web/frontend/src/components/ProductCard.jsx#L70-L75)
  - [ProductGallery.jsx](file:///d:/sindhiya/motorx_web/frontend/src/components/ProductGallery.jsx#L18-L22)
  - [CartDrawer.jsx](file:///d:/sindhiya/motorx_web/frontend/src/components/CartDrawer.jsx#L101-L105)
  - [SearchBar.jsx](file:///d:/sindhiya/motorx_web/frontend/src/components/SearchBar.jsx#L110-L114)
  - [Cart.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/Cart.jsx#L85-L88)
  - [Wishlist.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/Wishlist.jsx#L80-L83)
  - [Checkout.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/Checkout.jsx#L442)
  - [AdminProducts.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/admin/AdminProducts.jsx#L165)
  - [AdminDashboard.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/admin/AdminDashboard.jsx#L415)
  - [AdminOrders.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/admin/AdminOrders.jsx#L206)
  - [AdminInventory.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/admin/AdminInventory.jsx#L116)
- **What happens**:
  ```jsx
  <img
    src={product.image}
    alt={product.name}
    loading="lazy"
    className="max-h-full max-w-full object-contain"
  />
  ```
  When the network request fails, there is no fallback mechanism to display a placeholder or default icon. The image area becomes blank or shows a broken image icon.

---

### Root Cause 4: Database Re-seed Script Truncates All Records
- **Location**: [database/init.js](file:///d:/sindhiya/motorx_web/database/init.js), [database/seed.sql](file:///d:/sindhiya/motorx_web/database/seed.sql#L3)
- **What happens**:
  Every time `init.js` is run:
  ```sql
  TRUNCATE payments, order_items, orders, inventory, product_specifications, product_images, products, brands, categories, admins RESTART IDENTITY CASCADE;
  ```
  Any image modifications done via Admin or UI are wiped out and replaced with the Unsplash seed data.

---

### Root Cause 5: Admin Panel Has No Persistent Image Upload / Storage
- **Location**: [AdminProducts.jsx](file:///d:/sindhiya/motorx_web/frontend/src/pages/admin/AdminProducts.jsx#L283-L290), [server.js](file:///d:/sindhiya/motorx_web/backend/src/server.js)
- **What happens**:
  - The Admin Product form only has `<input type="url" />`.
  - There is no file upload handler (e.g., Multer) and no static upload directory served on Express (`app.use('/uploads', express.static(...))`).
  - If a user pastes a temporary `blob:` URL, browser memory URL, or temporary CDN link, it expires immediately after the browser session ends or page refreshes.

---

### Root Cause 6: Path Casing and Special Character Sensitivity
- **Location**: `frontend/public/products/`
- Folder names and file names contain mixed uppercase and lowercase characters:
  - `/products/Epoxy_Resin/` (Uppercase 'E' and 'R')
  - `/products/vaccum_bagging/` (spelled `vaccum` with two 'c's instead of `vacuum`)
  - Special characters: `Resin_Infusion_Mesh_(Flow_Media).jpeg` (parentheses require URL encoding: `Resin_Infusion_Mesh_%28Flow_Media%29.jpeg`)
- On case-sensitive web servers (Linux/Ubuntu/Docker/Vercel/Netlify), `/products/epoxy_resin/...` will result in HTTP 404.

---

## 3. Full Inventory of Verified Local Images

| Category Subfolder | Image File Name | Recommended Public Web Path |
| :--- | :--- | :--- |
| **Core Materials** | `Aluminum_Honeycomb_Core.jpeg` | `/products/core_materials/Aluminum_Honeycomb_Core.jpeg` |
| **Core Materials** | `Kevlar_Honeycomb_Core.jpeg` | `/products/core_materials/Kevlar_Honeycomb_Core.jpeg` |
| **Core Materials** | `Nomex_Honeycomb_Core.jpeg` | `/products/core_materials/Nomex_Honeycomb_Core.jpeg` |
| **Core Materials** | `PET_Foam_Core.jpeg` | `/products/core_materials/PET_Foam_Core.jpeg` |
| **Core Materials** | `PMI_Foam_Cores.jpeg` | `/products/core_materials/PMI_Foam_Cores.jpeg` |
| **Core Materials** | `PVC_Foam_Core.jpeg` | `/products/core_materials/PVC_Foam_Core.jpeg` |
| **Core Materials** | `Sandwich_Panels.jpeg` | `/products/core_materials/Sandwich_Panels.jpeg` |
| **Cured Products** | `Carbon_Fiber_Angles.jpeg` | `/products/cured_products/Carbon_Fiber_Angles.jpeg` |
| **Cured Products** | `Carbon_Fiber_Sheet.jpeg` | `/products/cured_products/Carbon_Fiber_Sheet.jpeg` |
| **Cured Products** | `Compression_Molded_Parts.jpeg` | `/products/cured_products/Compression_Molded_Parts.jpeg` |
| **Cured Products** | `Forged_Carbon_Fiber_Plates.jpeg` | `/products/cured_products/Forged_Carbon_Fiber_Plates.jpeg` |
| **Cured Products** | `G10_Laminates.jpeg` | `/products/cured_products/G10_Laminates.jpeg` |
| **Cured Products** | `Sandwich_Panels.jpeg` | `/products/cured_products/Sandwich_Panels.jpeg` |
| **Cured Products** | `UD_Carbon_Fiber_Strips_for_High_End_Application.jpeg` | `/products/cured_products/UD_Carbon_Fiber_Strips_for_High_End_Application.jpeg` |
| **Epoxy Resin** | `Epoxy_Gel_Coat.jpeg` | `/products/Epoxy_Resin/Epoxy_Gel_Coat.jpeg` |
| **Epoxy Resin** | `Hand_Lay-Up_Epoxy.jpeg` | `/products/Epoxy_Resin/Hand_Lay-Up_Epoxy.jpeg` |
| **Epoxy Resin** | `Vacuum_Infusion_Epoxy.jpeg` | `/products/Epoxy_Resin/Vacuum_Infusion_Epoxy.jpeg` |
| **Moulds & Patterns** | `Epoxy_Tooling_Board.jpeg` | `/products/moulds_patterns/Epoxy_Tooling_Board.jpeg` |
| **Moulds & Patterns** | `High_Temp_PU_Tooling_Board.jpeg` | `/products/moulds_patterns/High_Temp_PU_Tooling_Board.jpeg` |
| **Moulds & Patterns** | `PTFE_Coated_Fibreglass_with_Silicone_Adhesive.jpeg` | `/products/moulds_patterns/PTFE_Coated_Fibreglass_with_Silicone_Adhesive.jpeg` |
| **Moulds & Patterns** | `PU_Tooling_Board.jpeg` | `/products/moulds_patterns/PU_Tooling_Board.jpeg` |
| **Pultruded Products** | `Carbon_Fiber_Rod.jpeg` | `/products/pultruded_products/Carbon_Fiber_Rod.jpeg` |
| **Pultruded Products** | `Pultruded_Carbon_Fiber_Strip.jpeg` | `/products/pultruded_products/Pultruded_Carbon_Fiber_Strip.jpeg` |
| **Pultruded Products** | `Pultruded_Fiber_Glass_Rod.jpeg` | `/products/pultruded_products/Pultruded_Fiber_Glass_Rod.jpeg` |
| **Pultruded Products** | `Rectangle_Shaped_Pultruded_Carbon_Fiber_Rod.jpeg` | `/products/pultruded_products/Rectangle_Shaped_Pultruded_Carbon_Fiber_Rod.jpeg` |
| **Pultruded Products** | `Rectangle_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` | `/products/pultruded_products/Rectangle_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` |
| **Pultruded Products** | `Round_Shaped_Pultruded_Carbon_Fiber_Rod.jpeg` | `/products/pultruded_products/Round_Shaped_Pultruded_Carbon_Fiber_Rod.jpeg` |
| **Pultruded Products** | `Round_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` | `/products/pultruded_products/Round_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` |
| **Pultruded Products** | `UD_Carbon_Fiber_Strips_for_High_End_Application.jpeg` | `/products/pultruded_products/UD_Carbon_Fiber_Strips_for_High_End_Application.jpeg` |
| **Tubes** | `Octagon_Shaped_Carbon_Fiber_Tubes.jpeg` | `/products/tubes/Octagon_Shaped_Carbon_Fiber_Tubes.jpeg` |
| **Tubes** | `Pultruded_Fiberglass_Tube.jpeg` | `/products/tubes/Pultruded_Fiberglass_Tube.jpeg` |
| **Tubes** | `Rectangle_Shaped_Carbon_Fiber_Tube.jpeg` | `/products/tubes/Rectangle_Shaped_Carbon_Fiber_Tube.jpeg` |
| **Tubes** | `Rectangle_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` | `/products/tubes/Rectangle_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` |
| **Tubes** | `Roll_Wrapped_Carbon_Fiber_Kevlar_Hybrid_Tube.jpeg` | `/products/tubes/Roll_Wrapped_Carbon_Fiber_Kevlar_Hybrid_Tube.jpeg` |
| **Tubes** | `Round_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` | `/products/tubes/Round_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg` |
| **Tubes** | `Round_Shaped_Roll_Wrapped_Carbon_Fiber_Tube.jpeg` | `/products/tubes/Round_Shaped_Roll_Wrapped_Carbon_Fiber_Tube.jpeg` |
| **Vacuum Bagging** | `Breather_Cloth.jpeg` | `/products/vaccum_bagging/Breather_Cloth.jpeg` |
| **Vacuum Bagging** | `Demolding_Wedge.jpeg` | `/products/vaccum_bagging/Demolding_Wedge.jpeg` |
| **Vacuum Bagging** | `Flash_Breaker_Tape.jpeg` | `/products/vaccum_bagging/Flash_Breaker_Tape.jpeg` |
| **Vacuum Bagging** | `Heat_Shrink_Tape.jpeg` | `/products/vaccum_bagging/Heat_Shrink_Tape.jpeg` |
| **Vacuum Bagging** | `Infusion_Mesh_and_Release_Film_Combo.jpeg` | `/products/vaccum_bagging/Infusion_Mesh_and_Release_Film_Combo.jpeg` |
| **Vacuum Bagging** | `Infusion_Spiral_Tube.jpeg` | `/products/vaccum_bagging/Infusion_Spiral_Tube.jpeg` |
| **Vacuum Bagging** | `Peel_Ply.jpeg` | `/products/vaccum_bagging/Peel_Ply.jpeg` |
| **Vacuum Bagging** | `PTFE_Coated_Fibreglass_with_Silicone_Adhesive.jpeg` | `/products/vaccum_bagging/PTFE_Coated_Fibreglass_with_Silicone_Adhesive.jpeg` |
| **Vacuum Bagging** | `Quick-Release_Vacuum_Coupling_Set.jpeg` | `/products/vaccum_bagging/Quick-Release_Vacuum_Coupling_Set.jpeg` |
| **Vacuum Bagging** | `Release_Film.jpeg` | `/products/vaccum_bagging/Release_Film.jpeg` |
| **Vacuum Bagging** | `Resin_Catch_Pot.jpeg` | `/products/vaccum_bagging/Resin_Catch_Pot.jpeg` |
| **Vacuum Bagging** | `Resin_Infusion_and_Vacuum_Bagging_Tubes.jpeg` | `/products/vaccum_bagging/Resin_Infusion_and_Vacuum_Bagging_Tubes.jpeg` |
| **Vacuum Bagging** | `Resin_Infusion_Mesh_(Flow_Media).jpeg` | `/products/vaccum_bagging/Resin_Infusion_Mesh_%28Flow_Media%29.jpeg` |
| **Vacuum Bagging** | `Resin_Infusion_Valve.jpeg` | `/products/vaccum_bagging/Resin_Infusion_Valve.jpeg` |
| **Vacuum Bagging** | `Resin_Injection_Base.jpeg` | `/products/vaccum_bagging/Resin_Injection_Base.jpeg` |
| **Vacuum Bagging** | `Rollers.jpeg` | `/products/vaccum_bagging/Rollers.jpeg` |
| **Vacuum Bagging** | `Straight_Connector.jpeg` | `/products/vaccum_bagging/Straight_Connector.jpeg` |
| **Vacuum Bagging** | `T_Connector.jpeg` | `/products/vaccum_bagging/T_Connector.jpeg` |
| **Vacuum Bagging** | `Vacuum_Bagging_Film.jpeg` | `/products/vaccum_bagging/Vacuum_Bagging_Film.jpeg` |
| **Vacuum Bagging** | `Vacuum_Pump.jpeg` | `/products/vaccum_bagging/Vacuum_Pump.jpeg` |
| **Vacuum Bagging** | `Vacuum_Sealing_Tape.jpeg` | `/products/vaccum_bagging/Vacuum_Sealing_Tape.jpeg` |

---

## 4. Remediation & Action Plan

### Step 1: Create a Bulletproof Image Component with Automatic Fallback
Create a reusable `<SafeImage />` component or attach an `onError` handler across all components.

```jsx
// src/components/SafeImage.jsx
import React, { useState } from 'react';

const FALLBACK_IMAGE = '/products/cured_products/Carbon_Fiber_Sheet.jpeg';

export default function SafeImage({ src, alt, className, ...props }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  const handleError = () => {
    if (imgSrc !== FALLBACK_IMAGE) {
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Product'}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
```

### Step 2: Update `database/seed.sql` to Use Local Product Paths
Replace all `https://images.unsplash.com/...` in `database/seed.sql` with the local `/products/...` paths from the table above.

Example:
```sql
-- Before:
(1, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'PolyForm Epoxy Tooling Board', 1, true),

-- After:
(1, '/products/moulds_patterns/Epoxy_Tooling_Board.jpeg', 'PolyForm Epoxy Tooling Board', 1, true),
(6, '/products/core_materials/PVC_Foam_Core.jpeg', 'AeroCore PVC Foam H60', 1, true),
(11, '/products/pultruded_products/Carbon_Fiber_Rod.jpeg', 'TitanPultrusion Carbon Rod', 1, true),
(16, '/products/cured_products/Carbon_Fiber_Sheet.jpeg', '3K Twill Carbon Sheet 2mm', 1, true),
(21, '/products/vaccum_bagging/Vacuum_Bagging_Film.jpeg', 'Nylon Vacuum Film 120C', 1, true);
```

### Step 3: Update `frontend/src/data/products.js` & `categories.js`
Replace all Unsplash URLs with local `/products/...` paths so that even if the backend database is disconnected, the frontend displays images reliably from the local bundle.

### Step 4: Add Static Upload Serving & File Upload Route in Backend
In `backend/src/server.js`:
```javascript
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```
And support file uploads for Admin product creation using Multer.

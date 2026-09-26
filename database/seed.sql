-- MOTORX Database Seed Data - Real Composite Material Catalogue

TRUNCATE payments, order_items, orders, inventory, product_specifications, product_images, products, brands, categories, admins RESTART IDENTITY CASCADE;

-- Insert Seed Admin User (Email: admin@motorx.com, Password: Admin@123)
INSERT INTO admins (name, email, password_hash, role) VALUES
('Super Admin', 'admin@motorx.com', '$2b$10$d4G7dKepqh4A2iH8QuOVquvaBuXYDVckxX/PP9HgjybgWtsg6XMie', 'SUPERADMIN');

-- Insert 5 Composite Categories
INSERT INTO categories (name, slug, description, image) VALUES
('Moulds & Patterns', 'moulds-patterns', 'High-precision composite tooling blocks, epoxy pattern boards, and master moulds for aerospace and automotive composite manufacturing.', '/products/moulds_patterns/Epoxy_Tooling_Board.jpeg'),
('Core Materials', 'core-materials', 'Structural PVC foam cores, PET foam, honeycomb panels, and end-grain balsa for sandwich composite structures.', '/products/core_materials/Aluminum_Honeycomb_Core.jpeg'),
('Pultruded Products', 'pultruded-products', 'High-strength pultruded carbon fiber rods, fiberglass tubes, and structural composite profiles.', '/products/pultruded_products/Carbon_Fiber_Rod.jpeg'),
('Cured Products', 'cured-products', 'Pre-cured 3K carbon fiber sheets, G10/FR4 epoxy glass laminates, and cured structural composite plates.', '/products/cured_products/Carbon_Fiber_Sheet.jpeg'),
('Vacuum Bagging Consumables', 'vacuum-bagging-consumables', 'High-temperature vacuum bagging films, nylon peel plies, polyester breather fabrics, and sealant tapes.', '/products/vaccum_bagging/Vacuum_Bagging_Film.jpeg');

-- Insert Composite Brands
INSERT INTO brands (name, slug, description) VALUES
('MOTORX Composites', 'motorx-composites', 'Official MOTORX high performance structural composite series.'),
('AeroCore Systems', 'aerocore-systems', 'Aerospace grade foam cores and structural sandwich materials.'),
('PolyForm Moulds', 'polyform-moulds', 'Precision CNC pattern boards and composite tooling solutions.'),
('TitanPultrusion', 'titanpultrusion', 'High-modulus carbon and glass fiber pultruded profiles.'),
('VacuSeal Tech', 'vacuseal-tech', 'Vacuum infusion and autoclave consumable systems.');

-- Insert Real Composite Products (25 Items)
INSERT INTO products (sku, name, slug, description, category_id, brand_id, price, sale_price, currency, gst_rate, gst_included, rating, review_count, status, featured, popularity) VALUES
-- Category 1: Moulds & Patterns
('MP-TB-700', 'PolyForm High-Density Epoxy Tooling Board 700kg/m³', 'polyform-high-density-epoxy-tooling-board-700kg-m3', 'Machinable high-density epoxy tooling board designed for master patterns, checking fixtures, and composite moulds with excellent dimensional stability up to 130°C.', 1, 3, 14500.00, 12900.00, 'INR', 0.18, false, 4.90, 18, 'IN_STOCK', true, 95),
('MP-PU-450', 'PolyForm Polyurethane Machining Board 450kg/m³', 'polyform-polyurethane-machining-board-450kg-m3', 'Medium-density polyurethane pattern board ideal for CNC prototyping, styling models, and vacuum forming tools.', 1, 3, 8990.00, 7850.00, 'INR', 0.18, false, 4.70, 12, 'IN_STOCK', true, 91),
('MP-EV-100', 'Epoxy Vinyl Ester Mould Resin Gelcoat 5kg', 'epoxy-vinyl-ester-mould-resin-gelcoat-5kg', 'Formulated vinyl ester tooling gelcoat producing high-gloss, heat resistant, chemical resistant mould surfaces.', 1, 1, 4850.00, 4200.00, 'INR', 0.18, false, 4.80, 24, 'IN_STOCK', false, 88),
('MP-WAX-500', 'High-Temp Synthetic Release Wax 500g', 'high-temp-synthetic-release-wax-500g', 'Micro-crystalline synthetic mould release wax capable of multiple releases per application up to 180°C.', 1, 5, 1250.00, 990.00, 'INR', 0.18, false, 4.60, 31, 'IN_STOCK', false, 84),
('MP-TOOL-900', 'Composite Carbon Fiber Tooling Prepreg 1m²', 'composite-carbon-fiber-tooling-prepreg-1m2', 'Heavyweight woven carbon tooling prepreg engineered for CTE-matched composite moulds.', 1, 1, 6500.00, 5800.00, 'INR', 0.18, false, 5.00, 9, 'IN_STOCK', true, 96),

-- Category 2: Core Materials
('CM-PVC-060-10', 'AeroCore Structural PVC Foam Core H60 10mm', 'aerocore-structural-pvc-foam-core-h60-10mm', 'Closed-cell crosslinked PVC foam core 60kg/m³ providing superior shear and compression strength for marine and wind energy sandwich structures.', 2, 2, 2850.00, 2450.00, 'INR', 0.18, false, 4.80, 35, 'IN_STOCK', true, 98),
('CM-PVC-080-15', 'AeroCore Structural PVC Foam Core H80 15mm', 'aerocore-structural-pvc-foam-core-h80-15mm', 'High density 80kg/m³ PVC foam sheet for localized reinforcement and structural bulkhead panels.', 2, 2, 3990.00, 3450.00, 'INR', 0.18, false, 4.90, 29, 'IN_STOCK', true, 97),
('CM-PET-100-20', 'AeroCore Recyclable PET Foam Core 100kg/m³ 20mm', 'aerocore-recyclable-pet-foam-core-100kg-m3-20mm', 'Thermoformable structural PET foam core compatible with all commercial resin systems including epoxy and polyester.', 2, 2, 4200.00, 3600.00, 'INR', 0.18, false, 4.70, 16, 'IN_STOCK', false, 89),
('CM-HON-006', 'Aramid Honeycomb Core Nomex Type 6.4mm Cell', 'aramid-honeycomb-core-nomex-type-6-4mm-cell', 'Aerospace grade Nomex aramid honeycomb core offering unmatched strength-to-weight ratio for interior aircraft panels and UAV wings.', 2, 2, 8500.00, 7200.00, 'INR', 0.18, false, 5.00, 14, 'IN_STOCK', true, 99),
('CM-BAL-095', 'End-Grain Balsa Wood Core Sheet 9.5mm', 'end-grain-balsa-wood-core-sheet-9-5mm', 'Contoured flexible end-grain balsa sheet for curved composite vacuum infusion hulls and structural beams.', 2, 1, 1850.00, 1550.00, 'INR', 0.18, false, 4.60, 21, 'IN_STOCK', false, 85),

-- Category 3: Pultruded Products
('PP-CROD-006', 'TitanPultrusion Carbon Fiber Solid Rod 6mm x 1000mm', 'titanpultrusion-carbon-fiber-solid-rod-6mm-x-1000mm', 'Pultruded high-modulus unidirectional carbon fiber rod with smooth epoxy matrix surface finish for robotics and drone frame stiffeners.', 3, 4, 650.00, 520.00, 'INR', 0.18, false, 4.80, 55, 'IN_STOCK', true, 94),
('PP-CTUBE-012', 'TitanPultrusion Unidirectional Carbon Fiber Tube 12mm OD', 'titanpultrusion-unidirectional-carbon-fiber-tube-12mm-od', 'High flexural rigidity pultruded carbon tube 12mm OD x 10mm ID x 1000mm length for UAV arm structures.', 3, 4, 1290.00, 990.00, 'INR', 0.18, false, 4.90, 48, 'IN_STOCK', true, 96),
('PP-GTUBE-025', 'TitanPultrusion Fiberglass Pultruded Tube 25mm OD', 'titanpultrusion-fiberglass-pultruded-tube-25mm-od', 'Non-conductive electrical insulating fiberglass pultruded tube for antenna masts and industrial structural supports.', 3, 4, 850.00, 720.00, 'INR', 0.18, false, 4.50, 19, 'IN_STOCK', false, 82),
('PP-CSTRIP-015', 'TitanPultrusion Carbon Fiber Flat Strip 15mm x 2mm', 'titanpultrusion-carbon-fiber-flat-strip-15mm-x-2mm', 'Unidirectional carbon fiber strip for concrete reinforcement, wing spar caps, and composite laminate stiffening.', 3, 4, 450.00, 380.00, 'INR', 0.18, false, 4.70, 33, 'IN_STOCK', false, 87),
('PP-ANGLE-050', 'Pultruded Structural Fiberglass Angle 50mm x 50mm x 5mm', 'pultruded-structural-fiberglass-angle-50mm-x-50mm-x-5mm', 'Heavy-duty corrosion-resistant pultruded GRP structural angle profile for harsh chemical environment walkways.', 3, 4, 1850.00, 1590.00, 'INR', 0.18, false, 4.60, 11, 'IN_STOCK', false, 80),

-- Category 4: Cured Products
('CP-CFS-3K-20', 'MOTORX 3K Twill Carbon Fiber Cured Sheet 2.0mm 500x400mm', 'motorx-3k-twill-carbon-fiber-cured-sheet-2-0mm-500x400mm', 'Autoclave cured 100% real 3K twill carbon fiber plate with high gloss pinhole-free aesthetic finish on both sides.', 4, 1, 3850.00, 3290.00, 'INR', 0.18, false, 4.90, 64, 'IN_STOCK', true, 99),
('CP-CFS-3K-30', 'MOTORX 3K Twill Carbon Fiber Cured Sheet 3.0mm 500x400mm', 'motorx-3k-twill-carbon-fiber-cured-sheet-3-0mm-500x400mm', 'Rigid 3mm thick carbon fiber sheet for multirotor main chassis plates and precision CNC component milling.', 4, 1, 5200.00, 4490.00, 'INR', 0.18, false, 5.00, 42, 'IN_STOCK', true, 97),
('CP-G10-020', 'G10 / FR4 Epoxy Glass Cured Laminate Sheet 2.0mm', 'g10-fr4-epoxy-glass-cured-laminate-sheet-2-0mm', 'High strength flame-retardant G10 epoxy fiberglass plate with high dielectric strength for electrical insulating barriers.', 4, 1, 1450.00, 1190.00, 'INR', 0.18, false, 4.70, 27, 'IN_STOCK', false, 86),
('CP-CFPANEL-50', 'Structural Carbon Fiber Honeycomb Sandwich Panel 10mm', 'structural-carbon-fiber-honeycomb-sandwich-panel-10mm', 'Ultra-lightweight cured carbon fiber skins bonded to Nomex core for extreme flexural stiffness.', 4, 1, 12500.00, 10800.00, 'INR', 0.18, false, 4.90, 15, 'IN_STOCK', true, 95),
('CP-UNI-10', 'Unidirectional Cured Carbon Laminate Strip 1.0mm', 'unidirectional-cured-carbon-laminate-strip-1-0mm', 'High tensile cured carbon laminate strip for localized flexural beam reinforcement.', 4, 4, 980.00, 820.00, 'INR', 0.18, false, 4.60, 18, 'IN_STOCK', false, 83),

-- Category 5: Vacuum Bagging Consumables
('VB-FILM-120', 'VacuSeal High-Temp Nylon Vacuum Bagging Film 120°C 2m Width', 'vacuseal-high-temp-nylon-vacuum-bagging-film-120c-2m-width', 'Flexible co-extruded nylon 6 bagging film designed for room temperature wet layup and oven vacuum infusion processes.', 5, 5, 290.00, 240.00, 'INR', 0.18, false, 4.80, 72, 'IN_STOCK', true, 95),
('VB-FILM-204', 'VacuSeal Autoclave Nylon Bagging Film 204°C 1.5m Width', 'vacuseal-autoclave-nylon-bagging-film-204c-1-5m-width', 'Extreme heat resistant amber nylon vacuum bagging film suited for high pressure autoclave prepreg processing.', 5, 5, 580.00, 490.00, 'INR', 0.18, false, 4.90, 38, 'IN_STOCK', true, 96),
('VB-PEEL-100', 'VacuSeal Scoured & Heat-Set Nylon Peel Ply 100g/m²', 'vacuseal-scoured-heat-set-nylon-peel-ply-100g-m2', 'Precision woven nylon release fabric leaving a uniform textured surface ready for secondary bonding without sanding.', 5, 5, 340.00, 280.00, 'INR', 0.18, false, 4.90, 81, 'IN_STOCK', true, 99),
('VB-BREATH-150', 'VacuSeal Non-Woven Polyester Breather / Bleeder Fabric 150g', 'vacuseal-non-woven-polyester-breather-bleeder-fabric-150g', 'High loft polyester breather felt facilitating continuous air evacuation under vacuum pressure.', 5, 5, 220.00, 180.00, 'INR', 0.18, false, 4.70, 49, 'IN_STOCK', false, 89),
('VB-TAPE-150', 'VacuSeal High-Tack Synthetic Rubber Sealant Tape 15m Roll', 'vacuseal-high-tack-synthetic-rubber-sealant-tape-15m-roll', 'Premium yellow butyl sealant tape creating airtight seals between vacuum film and metal/composite tooling.', 5, 5, 650.00, 540.00, 'INR', 0.18, false, 4.80, 66, 'IN_STOCK', true, 94);

-- Insert Primary Images for all 25 Composite Products
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, '/products/moulds_patterns/Epoxy_Tooling_Board.jpeg', 'PolyForm Epoxy Tooling Board', 1, true),
(2, '/products/moulds_patterns/PU_Tooling_Board.jpeg', 'Polyurethane Machining Board', 1, true),
(3, '/products/Epoxy_Resin/Epoxy_Gel_Coat.jpeg', 'Vinyl Ester Tooling Gelcoat', 1, true),
(4, '/products/moulds_patterns/PTFE_Coated_Fibreglass_with_Silicone_Adhesive.jpeg', 'Release Wax', 1, true),
(5, '/products/moulds_patterns/High_Temp_PU_Tooling_Board.jpeg', 'Carbon Tooling Prepreg', 1, true),
(6, '/products/core_materials/PVC_Foam_Core.jpeg', 'AeroCore PVC Foam H60', 1, true),
(7, '/products/core_materials/PMI_Foam_Cores.jpeg', 'AeroCore PVC Foam H80', 1, true),
(8, '/products/core_materials/PET_Foam_Core.jpeg', 'AeroCore PET Foam Core', 1, true),
(9, '/products/core_materials/Nomex_Honeycomb_Core.jpeg', 'Nomex Honeycomb Core', 1, true),
(10, '/products/core_materials/Sandwich_Panels.jpeg', 'End-Grain Balsa Sheet', 1, true),
(11, '/products/pultruded_products/Carbon_Fiber_Rod.jpeg', 'TitanPultrusion Carbon Rod', 1, true),
(12, '/products/pultruded_products/Rectangle_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg', 'Unidirectional Carbon Tube', 1, true),
(13, '/products/pultruded_products/Pultruded_Fiber_Glass_Rod.jpeg', 'Fiberglass Pultruded Tube', 1, true),
(14, '/products/pultruded_products/Pultruded_Carbon_Fiber_Strip.jpeg', 'Carbon Fiber Flat Strip', 1, true),
(15, '/products/cured_products/Carbon_Fiber_Angles.jpeg', 'Fiberglass Angle Profile', 1, true),
(16, '/products/cured_products/Carbon_Fiber_Sheet.jpeg', '3K Twill Carbon Sheet 2mm', 1, true),
(17, '/products/cured_products/Forged_Carbon_Fiber_Plates.jpeg', '3K Twill Carbon Sheet 3mm', 1, true),
(18, '/products/cured_products/G10_Laminates.jpeg', 'G10 FR4 Epoxy Sheet', 1, true),
(19, '/products/cured_products/Sandwich_Panels.jpeg', 'Carbon Honeycomb Panel', 1, true),
(20, '/products/cured_products/UD_Carbon_Fiber_Strips_for_High_End_Application.jpeg', 'Cured Carbon Laminate Strip', 1, true),
(21, '/products/vaccum_bagging/Vacuum_Bagging_Film.jpeg', 'Nylon Vacuum Film 120C', 1, true),
(22, '/products/vaccum_bagging/Heat_Shrink_Tape.jpeg', 'Autoclave Bagging Film 204C', 1, true),
(23, '/products/vaccum_bagging/Peel_Ply.jpeg', 'Nylon Peel Ply 100g', 1, true),
(24, '/products/vaccum_bagging/Breather_Cloth.jpeg', 'Polyester Breather Fabric', 1, true),
(25, '/products/vaccum_bagging/Vacuum_Sealing_Tape.jpeg', 'Butyl Sealant Tape', 1, true);

-- Insert Dynamic Specifications (Key-Value Pairs)
INSERT INTO product_specifications (product_id, spec_name, spec_value, sort_order) VALUES
-- Product 1
(1, 'Material Type', 'Epoxy Machinable Board', 1),
(1, 'Density', '700 kg/m³', 2),
(1, 'Heat Deflection (HDT)', '130 °C', 3),
(1, 'Compressive Strength', '75 MPa', 4),

-- Product 6
(6, 'Core Type', 'Crosslinked PVC Foam', 1),
(6, 'Density', '60 kg/m³', 2),
(6, 'Thickness', '10 mm', 3),
(6, 'Compressive Strength', '0.90 MPa', 4),
(6, 'Shear Strength', '0.75 MPa', 5),

-- Product 11
(11, 'Fiber Type', 'Unidirectional Carbon Fiber', 1),
(11, 'Resin Matrix', 'Structural Epoxy', 2),
(11, 'Outer Diameter', '6.0 mm', 3),
(11, 'Length', '1000 mm', 4),
(11, 'Tensile Strength', '2500 MPa', 5),

-- Product 16
(16, 'Weave Pattern', '3K Twill 2x2', 1),
(16, 'Thickness', '2.0 mm', 2),
(16, 'Dimensions', '500 x 400 mm', 3),
(16, 'Finish', 'High Gloss Mirror', 4),

-- Product 21
(21, 'Material', 'Co-extruded Nylon 6', 1),
(21, 'Max Operating Temp', '120 °C (248 °F)', 2),
(21, 'Thickness', '50 microns', 3),
(21, 'Elongation at Break', '400 %', 4);

-- Insert Inventory Stock Quantities
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold, reserved_quantity) VALUES
(1, 15, 5, 0),
(2, 22, 5, 0),
(3, 30, 5, 0),
(4, 45, 5, 0),
(5, 8, 3, 0),
(6, 40, 5, 0),
(7, 25, 5, 0),
(8, 18, 5, 0),
(9, 10, 3, 0),
(10, 35, 5, 0),
(11, 120, 10, 0),
(12, 85, 10, 0),
(13, 60, 10, 0),
(14, 90, 10, 0),
(15, 40, 5, 0),
(16, 50, 5, 0),
(17, 35, 5, 0),
(18, 45, 5, 0),
(19, 12, 3, 0),
(20, 70, 10, 0),
(21, 150, 15, 0),
(22, 95, 10, 0),
(23, 200, 20, 0),
(24, 180, 15, 0),
(25, 130, 15, 0);

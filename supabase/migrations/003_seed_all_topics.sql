-- ============================================================
-- ASICREPAIR Admin - SEED ALL 130 TOPICS
-- Run AFTER the master reset script (002_master_reset.sql)
-- ============================================================

-- First, get the phase IDs we just created
-- We'll use a DO block with variables

DO $$
DECLARE
    phase1_id UUID;
    phase2_id UUID;
    phase3_id UUID;
    phase4_id UUID;
    -- Phase 1 categories
    cat_antminer UUID;
    cat_whatsminer UUID;
    cat_avalon UUID;
    -- Phase 2 categories
    cat_overheating UUID;
    cat_lowhr UUID;
    cat_psu UUID;
    -- Phase 3 categories
    cat_environmental UUID;
    -- Phase 4 categories
    cat_business UUID;
    -- Subcategories
    sub_id UUID;
BEGIN
    -- Get phase IDs
    SELECT id INTO phase1_id FROM phases WHERE "order" = 1;
    SELECT id INTO phase2_id FROM phases WHERE "order" = 2;
    SELECT id INTO phase3_id FROM phases WHERE "order" = 3;
    SELECT id INTO phase4_id FROM phases WHERE "order" = 4;

    -- ============================================================
    -- PHASE 1: Hashboard Not Detected (40 Articles)
    -- ============================================================

    -- Category: ANTMINER
    INSERT INTO categories (phase_id, name) VALUES (phase1_id, 'ANTMINER') RETURNING id INTO cat_antminer;
    
    -- S-Series
    INSERT INTO subcategories (category_id, name) VALUES (cat_antminer, 'S-Series (SHA-256 Bitcoin Miners)') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Antminer S21 Pro Hashboard Not Detected', 'pending'),
        (sub_id, 'Antminer S21 Hydro "0 ASIC Chip" Error', 'pending'),
        (sub_id, 'Antminer S19 XP Hashboard Missing', 'pending'),
        (sub_id, 'Antminer S19 Pro "Find 0 ASIC"', 'pending'),
        (sub_id, 'Antminer S19j Pro Hashboard Slot Empty', 'pending'),
        (sub_id, 'Antminer S19 Hydro Chain Not Detected', 'pending'),
        (sub_id, 'Antminer S17 Pro Hashboard Failure', 'pending'),
        (sub_id, 'Antminer S17+ "Missing Chain" Error', 'pending'),
        (sub_id, 'Antminer S9 Hashboard Dead', 'pending');

    -- T-Series
    INSERT INTO subcategories (category_id, name) VALUES (cat_antminer, 'T-Series (Budget SHA-256 Miners)') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Antminer T21 Hashboard Not Responding', 'pending'),
        (sub_id, 'Antminer T19 "0 Hashrate" on Chain 2', 'pending');

    -- L-Series
    INSERT INTO subcategories (category_id, name) VALUES (cat_antminer, 'L-Series (Scrypt/Litecoin Miners)') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Antminer L7 Hashboard Detection Failed', 'pending'),
        (sub_id, 'Antminer L3+ Hashboard Not Working', 'pending'),
        (sub_id, 'Antminer L3++ Chain Missing', 'pending');

    -- K-Series
    INSERT INTO subcategories (category_id, name) VALUES (cat_antminer, 'K-Series (Kadena Miners)') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Antminer KA3 Hashboard Error', 'pending'),
        (sub_id, 'Antminer K7 Board Not Detected', 'pending');

    -- D-Series
    INSERT INTO subcategories (category_id, name) VALUES (cat_antminer, 'D-Series (Dash/X11 Miners)') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Antminer D9 Hashboard Failure', 'pending'),
        (sub_id, 'Antminer D7 "ASICNG" Error', 'pending');

    -- E-Series
    INSERT INTO subcategories (category_id, name) VALUES (cat_antminer, 'E-Series (ETC/Ethash Miners)') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Antminer E9 Pro Hashboard Dead', 'pending');

    -- General
    INSERT INTO subcategories (category_id, name) VALUES (cat_antminer, 'General/Cross-Model') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'How to Use PicoBT/PT3 Tester for Antminer Hashboard Diagnosis', 'pending');

    -- Category: WHATSMINER
    INSERT INTO categories (phase_id, name) VALUES (phase1_id, 'WHATSMINER') RETURNING id INTO cat_whatsminer;
    INSERT INTO subcategories (category_id, name) VALUES (cat_whatsminer, 'All Models') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'WhatsMiner M60S Hashboard Not Detected', 'pending'),
        (sub_id, 'WhatsMiner M50S++ "Incomplete Chip Report"', 'pending'),
        (sub_id, 'WhatsMiner M50S Hashboard Error 202/250', 'pending'),
        (sub_id, 'WhatsMiner M30S++ Chain Missing', 'pending'),
        (sub_id, 'WhatsMiner M30S+ Zero Hashrate', 'pending'),
        (sub_id, 'WhatsMiner M30S Hashboard Slot Empty', 'pending'),
        (sub_id, 'WhatsMiner M31S "Low Hash Rate"', 'pending'),
        (sub_id, 'WhatsMiner M21S Hashboard Failure', 'pending'),
        (sub_id, 'WhatsMiner M20S Board Not Working', 'pending'),
        (sub_id, 'WhatsMiner M50 Series Test Fixture Guide', 'pending'),
        (sub_id, 'WhatsMiner M30 Series Hashboard Repair Sequence', 'pending'),
        (sub_id, 'WhatsMiner Control Board Issues', 'pending'),
        (sub_id, 'WhatsMiner Error Codes 540/541/542', 'pending'),
        (sub_id, 'WhatsMiner Thermal Interface Material (TIM) Failure', 'pending'),
        (sub_id, 'WhatsMiner D1 Decred Miner Hashboard Fix', 'pending');

    -- Category: AVALON
    INSERT INTO categories (phase_id, name) VALUES (phase1_id, 'AVALON (Canaan)') RETURNING id INTO cat_avalon;
    INSERT INTO subcategories (category_id, name) VALUES (cat_avalon, 'All Models') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Avalon A1466 Hashboard Not Detected', 'pending'),
        (sub_id, 'Avalon A1366 Chain Missing', 'pending'),
        (sub_id, 'Avalon A1246 "0 ASIC" Error', 'pending'),
        (sub_id, 'Avalon A1166 Pro Hashboard Dead', 'pending'),
        (sub_id, 'Avalon Miner AUC Controller Issues', 'pending');

    -- ============================================================
    -- PHASE 2: Repair Insights & Case Studies (30 Articles)
    -- ============================================================

    -- Overheating Issues
    INSERT INTO categories (phase_id, name) VALUES (phase2_id, 'Overheating Issues') RETURNING id INTO cat_overheating;
    INSERT INTO subcategories (category_id, name) VALUES (cat_overheating, 'All Topics') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'ASIC Miner Overheating in Indian Summer – Complete Prevention Guide', 'pending'),
        (sub_id, 'Antminer S21/S19 Thermal Shutdown – Causes & Solutions', 'pending'),
        (sub_id, 'WhatsMiner M50/M30 High Temp Warning – Fan & Airflow Optimization', 'pending'),
        (sub_id, 'Thermal Paste Replacement Guide for ASIC Miners – Step-by-Step', 'pending'),
        (sub_id, 'ASIC Miner Dust Cleaning – Compressed Air vs Ultrasonic Methods', 'pending'),
        (sub_id, 'Mining Farm Cooling Solutions India – AC, Evaporative, Immersion', 'pending'),
        (sub_id, 'Fan Replacement Guide: Antminer vs WhatsMiner vs Avalon', 'pending'),
        (sub_id, 'Overclocking Gone Wrong – When Mining Profits Turn to Smoke', 'pending'),
        (sub_id, 'Heatsink Damage Recognition – When to Replace vs Repair', 'pending'),
        (sub_id, 'ASIC Miner Temperature Monitoring – Tools & Alert Systems', 'pending'),
        (sub_id, 'Immersion Cooling for ASIC Miners – Is It Worth It in India?', 'pending'),
        (sub_id, 'Case Study: Mining Farm Fire Prevention After Overheating Incident', 'pending');

    -- Low Hashrate Issues
    INSERT INTO categories (phase_id, name) VALUES (phase2_id, 'Low Hashrate Issues') RETURNING id INTO cat_lowhr;
    INSERT INTO subcategories (category_id, name) VALUES (cat_lowhr, 'All Topics') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'ASIC Miner Low Hashrate Diagnosis – Complete Troubleshooting Flowchart', 'pending'),
        (sub_id, 'Antminer S19/S21 Dropping Hashrate – Thermal Throttling Detection', 'pending'),
        (sub_id, 'WhatsMiner M50 Unstable Hashrate – Firmware & Voltage Checks', 'pending'),
        (sub_id, 'High Reject Rate on Mining Pool – Network vs Hardware Issues', 'pending'),
        (sub_id, 'Power Supply Causing Low Hashrate – Voltage Fluctuation Guide', 'pending'),
        (sub_id, 'Hashboard Running at 50% Capacity – Partial Chip Failure Diagnosis', 'pending'),
        (sub_id, 'Mining Pool Stratum Connection Issues – Firewall & Port Settings India', 'pending'),
        (sub_id, 'ASIC Miner Firmware Corruption – Recovery & Reflashing Guide', 'pending'),
        (sub_id, 'Aging ASIC Components – When Capacitors & Resistors Fail', 'pending'),
        (sub_id, 'Case Study: Restoring S19 Pro from 80 TH/s to 110 TH/s', 'pending');

    -- Power Supply Problems
    INSERT INTO categories (phase_id, name) VALUES (phase2_id, 'Power Supply Problems') RETURNING id INTO cat_psu;
    INSERT INTO subcategories (category_id, name) VALUES (cat_psu, 'All Topics') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'ASIC Miner PSU Not Starting – Complete Diagnosis Guide', 'pending'),
        (sub_id, 'Antminer APW12 Power Supply Failure – Common Faults & Fixes', 'pending'),
        (sub_id, 'Power Surge Damage to ASIC Miners – Prevention & Recovery India', 'pending'),
        (sub_id, 'Voltage Stabilizer Selection for Mining Farm – India Power Grid', 'pending'),
        (sub_id, 'UPS for ASIC Miners – Is It Necessary? Cost-Benefit Analysis', 'pending'),
        (sub_id, 'PSU Fan Failure Leading to Miner Shutdown – Early Warning Signs', 'pending'),
        (sub_id, 'Replacing Bitmain PSU with Third-Party – Compatibility Guide', 'pending'),
        (sub_id, 'Case Study: Mining Farm Power Infrastructure Setup in Gujarat', 'pending');

    -- ============================================================
    -- PHASE 3: Seasonal & Environmental Damage (10 Articles)
    -- ============================================================

    INSERT INTO categories (phase_id, name) VALUES (phase3_id, 'Environmental Factors') RETURNING id INTO cat_environmental;
    INSERT INTO subcategories (category_id, name) VALUES (cat_environmental, 'All Topics') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Monsoon Mining: Protecting ASIC Miners from Humidity in India', 'pending'),
        (sub_id, 'Summer Mining Guide: Keeping Miners Cool in 45°C Heat', 'pending'),
        (sub_id, 'Winter Mining Advantages in North India – Optimal Cooling Season', 'pending'),
        (sub_id, 'Dust Storm Damage to Mining Equipment – Rajasthan & Desert Areas', 'pending'),
        (sub_id, 'Power Outage Recovery: Restarting Mining Farm After Grid Failure', 'pending'),
        (sub_id, 'Lightning Strike Protection for Mining Farms – Grounding & Surge', 'pending'),
        (sub_id, 'Corrosion on ASIC Hashboards – Coastal Area Mining Challenges', 'pending'),
        (sub_id, 'Post-Flood Miner Recovery – Water Damage Assessment & Repair', 'pending'),
        (sub_id, 'Pest Damage to Mining Equipment – Rodents & Insects Prevention', 'pending'),
        (sub_id, 'Bitcoin Halving Impact on Repair Decisions – 2024/2028 Planning', 'pending');

    -- ============================================================
    -- PHASE 4: Repair Decisions & Operations (10 Articles)
    -- ============================================================

    INSERT INTO categories (phase_id, name) VALUES (phase4_id, 'Business & Operations') RETURNING id INTO cat_business;
    INSERT INTO subcategories (category_id, name) VALUES (cat_business, 'All Topics') RETURNING id INTO sub_id;
    INSERT INTO topics (subcategory_id, title, status) VALUES
        (sub_id, 'Repair vs Replace: When to Fix ASIC Miners & When to Sell for Parts', 'pending'),
        (sub_id, 'ASIC Miner Repair Cost Breakdown India – What to Expect', 'pending'),
        (sub_id, 'Finding Reliable ASIC Repair Services in India – Red Flags to Avoid', 'pending'),
        (sub_id, 'DIY vs Professional Repair – Skill Requirements & Tool Investment', 'pending'),
        (sub_id, 'ASIC Miner Spare Parts Sourcing in India – Trusted Suppliers', 'pending'),
        (sub_id, 'Warranty Considerations: Bitmain, MicroBT & Canaan Policies', 'pending'),
        (sub_id, 'Setting Up an ASIC Repair Lab – Essential Tools & Equipment', 'pending'),
        (sub_id, 'Bulk Miner Repair for Mining Farms – Turnaround Time Optimization', 'pending'),
        (sub_id, 'Selling Broken Miners: Salvage Value & Parts Marketplace', 'pending'),
        (sub_id, 'Case Study: ASICREPAIR.IN – Our Repair Process & Success Stories', 'pending');

    RAISE NOTICE 'Seed complete! Check your tables.';
END $$;

-- ============================================================
-- VERIFY COUNTS
-- ============================================================

SELECT 'Phases' as table_name, COUNT(*) as count FROM phases
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'Topics', COUNT(*) FROM topics;

// Blog Tree Data Structure
// Source: MENU_SPECIFICATIONS.md

export interface Topic {
    id: number;
    title: string;
    status: 'pending' | 'in-progress' | 'done';
}

export interface Subcategory {
    id: number;
    name: string;
    topics: Topic[];
}

export interface Category {
    id: number;
    name: string;
    subcategories?: Subcategory[];
    topics?: Topic[];
}

export interface Phase {
    id: number;
    name: string;
    description: string;
    categories: Category[];
}

// ============================================================
// PHASE 1: Hashboard Not Detected (80 Articles)
// ============================================================

const PHASE_1: Phase = {
    id: 1,
    name: 'PHASE 1',
    description: 'Hashboard Not Detected',
    categories: [
        {
            id: 101,
            name: 'ANTMINER',
            subcategories: [
                {
                    id: 1001,
                    name: 'S-Series (SHA-256 Bitcoin Miners)',
                    topics: [
                        { id: 10001, title: 'Antminer S21 Pro Hashboard Not Detected', status: 'pending' },
                        { id: 10002, title: 'Antminer S21 Hydro "0 ASIC Chip" Error', status: 'pending' },
                        { id: 10003, title: 'Antminer S19 XP Hashboard Missing', status: 'pending' },
                        { id: 10004, title: 'Antminer S19 Pro "Find 0 ASIC"', status: 'pending' },
                        { id: 10005, title: 'Antminer S19j Pro Hashboard Slot Empty', status: 'pending' },
                        { id: 10006, title: 'Antminer S19 Hydro Chain Not Detected', status: 'pending' },
                        { id: 10007, title: 'Antminer S17 Pro Hashboard Failure', status: 'pending' },
                        { id: 10008, title: 'Antminer S17+ "Missing Chain" Error', status: 'pending' },
                        { id: 10009, title: 'Antminer S9 Hashboard Dead', status: 'pending' },
                    ]
                },
                {
                    id: 1002,
                    name: 'T-Series (Budget SHA-256 Miners)',
                    topics: [
                        { id: 10010, title: 'Antminer T21 Hashboard Not Responding', status: 'pending' },
                        { id: 10011, title: 'Antminer T19 "0 Hashrate" on Chain 2', status: 'pending' },
                    ]
                },
                {
                    id: 1003,
                    name: 'L-Series (Scrypt/Litecoin Miners)',
                    topics: [
                        { id: 10012, title: 'Antminer L7 Hashboard Detection Failed', status: 'pending' },
                        { id: 10013, title: 'Antminer L3+ Hashboard Not Working', status: 'pending' },
                        { id: 10014, title: 'Antminer L3++ Chain Missing', status: 'pending' },
                    ]
                },
                {
                    id: 1004,
                    name: 'K-Series (Kadena Miners)',
                    topics: [
                        { id: 10015, title: 'Antminer KA3 Hashboard Error', status: 'pending' },
                        { id: 10016, title: 'Antminer K7 Board Not Detected', status: 'pending' },
                    ]
                },
                {
                    id: 1005,
                    name: 'D-Series (Dash/X11 Miners)',
                    topics: [
                        { id: 10017, title: 'Antminer D9 Hashboard Failure', status: 'pending' },
                        { id: 10018, title: 'Antminer D7 "ASICNG" Error', status: 'pending' },
                    ]
                },
                {
                    id: 1006,
                    name: 'E-Series (ETC/Ethash Miners)',
                    topics: [
                        { id: 10019, title: 'Antminer E9 Pro Hashboard Dead', status: 'pending' },
                    ]
                },
                {
                    id: 1007,
                    name: 'General/Cross-Model',
                    topics: [
                        { id: 10020, title: 'How to Use PicoBT/PT3 Tester for Antminer Hashboard Diagnosis', status: 'pending' },
                    ]
                },
            ]
        },
        {
            id: 102,
            name: 'WHATSMINER',
            subcategories: [
                {
                    id: 1020,
                    name: 'All Models',
                    topics: [
                        { id: 10201, title: 'WhatsMiner M60S Hashboard Not Detected', status: 'pending' },
                        { id: 10202, title: 'WhatsMiner M50S++ "Incomplete Chip Report"', status: 'pending' },
                        { id: 10203, title: 'WhatsMiner M50S Hashboard Error 202/250', status: 'pending' },
                        { id: 10204, title: 'WhatsMiner M30S++ Chain Missing', status: 'pending' },
                        { id: 10205, title: 'WhatsMiner M30S+ Zero Hashrate', status: 'pending' },
                        { id: 10206, title: 'WhatsMiner M30S Hashboard Slot Empty', status: 'pending' },
                        { id: 10207, title: 'WhatsMiner M31S "Low Hash Rate"', status: 'pending' },
                        { id: 10208, title: 'WhatsMiner M21S Hashboard Failure', status: 'pending' },
                        { id: 10209, title: 'WhatsMiner M20S Board Not Working', status: 'pending' },
                        { id: 10210, title: 'WhatsMiner M50 Series Test Fixture Guide', status: 'pending' },
                        { id: 10211, title: 'WhatsMiner M30 Series Hashboard Repair Sequence', status: 'pending' },
                        { id: 10212, title: 'WhatsMiner Control Board Issues', status: 'pending' },
                        { id: 10213, title: 'WhatsMiner Error Codes 540/541/542', status: 'pending' },
                        { id: 10214, title: 'WhatsMiner Thermal Interface Material (TIM) Failure', status: 'pending' },
                        { id: 10215, title: 'WhatsMiner D1 Decred Miner Hashboard Fix', status: 'pending' },
                    ]
                }
            ]
        },
        {
            id: 103,
            name: 'AVALON (Canaan)',
            subcategories: [
                {
                    id: 1030,
                    name: 'All Models',
                    topics: [
                        { id: 10301, title: 'Avalon A1466 Hashboard Not Detected', status: 'pending' },
                        { id: 10302, title: 'Avalon A1366 Chain Missing', status: 'pending' },
                        { id: 10303, title: 'Avalon A1246 "0 ASIC" Error', status: 'pending' },
                        { id: 10304, title: 'Avalon A1166 Pro Hashboard Dead', status: 'pending' },
                        { id: 10305, title: 'Avalon Miner AUC Controller Issues', status: 'pending' },
                    ]
                }
            ]
        }
    ]
};

// ============================================================
// PHASE 2: Repair Insights & Case Studies (30 Articles)
// ============================================================

const PHASE_2: Phase = {
    id: 2,
    name: 'PHASE 2',
    description: 'Repair Insights & Case Studies',
    categories: [
        {
            id: 201,
            name: 'Overheating Issues',
            topics: [
                { id: 20101, title: 'ASIC Miner Overheating in Indian Summer – Complete Prevention Guide', status: 'pending' },
                { id: 20102, title: 'Antminer S21/S19 Thermal Shutdown – Causes & Solutions', status: 'pending' },
                { id: 20103, title: 'WhatsMiner M50/M30 High Temp Warning – Fan & Airflow Optimization', status: 'pending' },
                { id: 20104, title: 'Thermal Paste Replacement Guide for ASIC Miners – Step-by-Step', status: 'pending' },
                { id: 20105, title: 'ASIC Miner Dust Cleaning – Compressed Air vs Ultrasonic Methods', status: 'pending' },
                { id: 20106, title: 'Mining Farm Cooling Solutions India – AC, Evaporative, Immersion', status: 'pending' },
                { id: 20107, title: 'Fan Replacement Guide: Antminer vs WhatsMiner vs Avalon', status: 'pending' },
                { id: 20108, title: 'Overclocking Gone Wrong – When Mining Profits Turn to Smoke', status: 'pending' },
                { id: 20109, title: 'Heatsink Damage Recognition – When to Replace vs Repair', status: 'pending' },
                { id: 20110, title: 'ASIC Miner Temperature Monitoring – Tools & Alert Systems', status: 'pending' },
                { id: 20111, title: 'Immersion Cooling for ASIC Miners – Is It Worth It in India?', status: 'pending' },
                { id: 20112, title: 'Case Study: Mining Farm Fire Prevention After Overheating Incident', status: 'pending' },
            ]
        },
        {
            id: 202,
            name: 'Low Hashrate Issues',
            topics: [
                { id: 20201, title: 'ASIC Miner Low Hashrate Diagnosis – Complete Troubleshooting Flowchart', status: 'pending' },
                { id: 20202, title: 'Antminer S19/S21 Dropping Hashrate – Thermal Throttling Detection', status: 'pending' },
                { id: 20203, title: 'WhatsMiner M50 Unstable Hashrate – Firmware & Voltage Checks', status: 'pending' },
                { id: 20204, title: 'High Reject Rate on Mining Pool – Network vs Hardware Issues', status: 'pending' },
                { id: 20205, title: 'Power Supply Causing Low Hashrate – Voltage Fluctuation Guide', status: 'pending' },
                { id: 20206, title: 'Hashboard Running at 50% Capacity – Partial Chip Failure Diagnosis', status: 'pending' },
                { id: 20207, title: 'Mining Pool Stratum Connection Issues – Firewall & Port Settings India', status: 'pending' },
                { id: 20208, title: 'ASIC Miner Firmware Corruption – Recovery & Reflashing Guide', status: 'pending' },
                { id: 20209, title: 'Aging ASIC Components – When Capacitors & Resistors Fail', status: 'pending' },
                { id: 20210, title: 'Case Study: Restoring S19 Pro from 80 TH/s to 110 TH/s', status: 'pending' },
            ]
        },
        {
            id: 203,
            name: 'Power Supply Problems',
            topics: [
                { id: 20301, title: 'ASIC Miner PSU Not Starting – Complete Diagnosis Guide', status: 'pending' },
                { id: 20302, title: 'Antminer APW12 Power Supply Failure – Common Faults & Fixes', status: 'pending' },
                { id: 20303, title: 'Power Surge Damage to ASIC Miners – Prevention & Recovery India', status: 'pending' },
                { id: 20304, title: 'Voltage Stabilizer Selection for Mining Farm – India Power Grid', status: 'pending' },
                { id: 20305, title: 'UPS for ASIC Miners – Is It Necessary? Cost-Benefit Analysis', status: 'pending' },
                { id: 20306, title: 'PSU Fan Failure Leading to Miner Shutdown – Early Warning Signs', status: 'pending' },
                { id: 20307, title: 'Replacing Bitmain PSU with Third-Party – Compatibility Guide', status: 'pending' },
                { id: 20308, title: 'Case Study: Mining Farm Power Infrastructure Setup in Gujarat', status: 'pending' },
            ]
        }
    ]
};

// ============================================================
// PHASE 3: Seasonal & Environmental Damage (10 Articles)
// ============================================================

const PHASE_3: Phase = {
    id: 3,
    name: 'PHASE 3',
    description: 'Seasonal & Environmental Damage',
    categories: [
        {
            id: 301,
            name: 'Environmental Factors',
            topics: [
                { id: 30101, title: 'Monsoon Mining: Protecting ASIC Miners from Humidity in India', status: 'pending' },
                { id: 30102, title: 'Summer Mining Guide: Keeping Miners Cool in 45°C Heat', status: 'pending' },
                { id: 30103, title: 'Winter Mining Advantages in North India – Optimal Cooling Season', status: 'pending' },
                { id: 30104, title: 'Dust Storm Damage to Mining Equipment – Rajasthan & Desert Areas', status: 'pending' },
                { id: 30105, title: 'Power Outage Recovery: Restarting Mining Farm After Grid Failure', status: 'pending' },
                { id: 30106, title: 'Lightning Strike Protection for Mining Farms – Grounding & Surge', status: 'pending' },
                { id: 30107, title: 'Corrosion on ASIC Hashboards – Coastal Area Mining Challenges', status: 'pending' },
                { id: 30108, title: 'Post-Flood Miner Recovery – Water Damage Assessment & Repair', status: 'pending' },
                { id: 30109, title: 'Pest Damage to Mining Equipment – Rodents & Insects Prevention', status: 'pending' },
                { id: 30110, title: 'Bitcoin Halving Impact on Repair Decisions – 2024/2028 Planning', status: 'pending' },
            ]
        }
    ]
};

// ============================================================
// PHASE 4: Repair Decisions & Operations (10 Articles)
// ============================================================

const PHASE_4: Phase = {
    id: 4,
    name: 'PHASE 4',
    description: 'Repair Decisions & Operations',
    categories: [
        {
            id: 401,
            name: 'Business & Operations',
            topics: [
                { id: 40101, title: 'Repair vs Replace: When to Fix ASIC Miners & When to Sell for Parts', status: 'pending' },
                { id: 40102, title: 'ASIC Miner Repair Cost Breakdown India – What to Expect', status: 'pending' },
                { id: 40103, title: 'Finding Reliable ASIC Repair Services in India – Red Flags to Avoid', status: 'pending' },
                { id: 40104, title: 'DIY vs Professional Repair – Skill Requirements & Tool Investment', status: 'pending' },
                { id: 40105, title: 'ASIC Miner Spare Parts Sourcing in India – Trusted Suppliers', status: 'pending' },
                { id: 40106, title: 'Warranty Considerations: Bitmain, MicroBT & Canaan Policies', status: 'pending' },
                { id: 40107, title: 'Setting Up an ASIC Repair Lab – Essential Tools & Equipment', status: 'pending' },
                { id: 40108, title: 'Bulk Miner Repair for Mining Farms – Turnaround Time Optimization', status: 'pending' },
                { id: 40109, title: 'Selling Broken Miners: Salvage Value & Parts Marketplace', status: 'pending' },
                { id: 40110, title: 'Case Study: ASICREPAIR.IN – Our Repair Process & Success Stories', status: 'pending' },
            ]
        }
    ]
};

// ============================================================
// EXPORT ALL PHASES
// ============================================================

export const BLOG_TREE_DATA: Phase[] = [PHASE_1, PHASE_2, PHASE_3, PHASE_4];

// Helper: Get total article count
export function getTotalArticleCount(): number {
    let count = 0;
    BLOG_TREE_DATA.forEach(phase => {
        phase.categories.forEach(cat => {
            if (cat.subcategories) {
                cat.subcategories.forEach(sub => {
                    count += sub.topics.length;
                });
            }
            if (cat.topics) {
                count += cat.topics.length;
            }
        });
    });
    return count;
}

// Helper: Get phase stats
export function getPhaseStats(phase: Phase): { categories: number; subcategories: number; articles: number } {
    let subcategories = 0;
    let articles = 0;
    phase.categories.forEach(cat => {
        if (cat.subcategories) {
            subcategories += cat.subcategories.length;
            cat.subcategories.forEach(sub => {
                articles += sub.topics.length;
            });
        }
        if (cat.topics) {
            articles += cat.topics.length;
        }
    });
    return { categories: phase.categories.length, subcategories, articles };
}

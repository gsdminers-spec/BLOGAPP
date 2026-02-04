# 📋 Menu Specifications Template

> **Instructions:** change the numbering of options 
1-Dashboard
2-Blog Tree [data will be stored to supabase ]
3-Research  
4-Generate-prompt
5-Claude output
6-Articles
7-Publish
8-keywords
## 4. 🔄 Workflow - delete this option from our app

## 1. 🏠 Dashboard

**What should it display?**
 Stats from Supabase, recent activity


**What actions should be available?**
 Quick links, data refresh


**Data source:**
 Supabase tables,  API, 


---

## 6. 📝 Articles

**What should it display?**
 it will contain a systematic list of completed articles 


**What actions should be available?**
1]view article [means how will it appear on the website same format] and  copy article 
2] move to Publish

**Data source:**
it will fetch from claude output


---

## 4. ✨ Generate-prompt

**What should it display?**
 AI prompt builder


**What actions should be available?**
Generate prompt, copy to clipboard 


**AI/Integration requirements:**
Use Gemini




## 3. 🔬 Research

**Whats its work and What should it display?**
This service performs deep web research for a given topic by searching across the internet, collecting relevant information, and transforming it into structured, usable knowledge.
It should display:
A structured view of collected information grouped by subtopics
Key technical explanations, facts, and findings related to the topic
Source attribution for each data point (URL, source type)
Extracted insights and patterns across multiple sources
An AI-generated consolidated summary of the topic
The display should emphasize clarity, structure, and traceability, not raw scraped text.


**What actions should be available?**
The service should allow the admin to:
Enter a topic or research query [search bar and search button]
Trigger automated web search and scraping via API
Ask AI follow-up questions based on the gathered data
Generate notes from the research then a button to push the data to generate prompt 



**Data source:**
Data is sourced through web search and scraping APIs, combined with AI-assisted extraction and summarization.
Sources may include public websites, blogs, forums, technical documentation, manufacturer resources, and articles.
Collected research data may be stored in an internal database or document store for future reference and reuse.


---

## 2. 🌳 Blog Tree

**What should it display?**
it will show 4 main phases of our blog which will be like a site map for our whole blog and under these phases there will be categories and sub-categories.
it should display 4 main cards phase 1 to phase 4 and in this cards there should be details like total no of articles, categories, sub-categories.[## means main categoryunder phase1, ### means su-category under phase 1]
when we click on phases cards they should send us to a more detailed web pages where we can see the list of article title as given below but systematic category wise.

extra details - This Research service is an internal web intelligence system designed to gather, structure, and summarize information for a given topic.
It does not make publishing decisions, perform SEO scoring, track rankings, or generate final blog content.
All data must be organized, source-referenced, and human-readable, suitable for downstream use by keyword research, blog writing, or documentation services.
The service prioritizes accuracy, completeness, and insight extraction over raw data volume or speed.

📁 PHASE 1: Hashboard Not Detected (80 Articles)[mainfolder]

## ⚡ ANTMINER — 20 Articles [categoory]

### S-Series (SHA-256 Bitcoin Miners)[subcategory]

| # | Article Title 
|---|---------------|-------|----------|
| 1 | Antminer S21 Pro Hashboard Not Detected 
| 2 | Antminer S21 Hydro "0 ASIC Chip" Error 
| 3 | Antminer S19 XP Hashboard Missing 
| 4 | Antminer S19 Pro "Find 0 ASIC" 
| 5 | Antminer S19j Pro Hashboard Slot Empty 
| 6 | Antminer S19 Hydro Chain Not Detected 
| 7 | Antminer S17 Pro Hashboard Failure 
| 8 | Antminer S17+ "Missing Chain" Error 
| 9 | Antminer S9 Hashboard Dead 

### T-Series (Budget SHA-256 Miners)

| # | Article Title 
|---|---------------
| 10 | Antminer T21 Hashboard Not Responding 
| 11 | Antminer T19 "0 Hashrate" on Chain 2 

### L-Series (Scrypt/Litecoin Miners)

| # | Article Title 
|---|---------------
| 12 | Antminer L7 Hashboard Detection Failed 
| 13 | Antminer L3+ Hashboard Not Working 
| 14 | Antminer L3++ Chain Missing 

### K-Series (Kadena Miners)

| # | Article Title 
|---|---------------
| 15 | Antminer KA3 Hashboard Error 
| 16 | Antminer K7 Board Not Detected 

### D-Series (Dash/X11 Miners)

| # | Article Title 
|---|---------------|-------|----------|
| 17 | Antminer D9 Hashboard Failure 
| 18 | Antminer D7 "ASICNG" Error 

### E-Series (ETC/Ethash Miners)

| # | Article Title 
|---|---------------|-------|----------|
| 19 | Antminer E9 Pro Hashboard Dead 

### General/Cross-Model

| # | Article Title 
|---|---------------|-------|----------|
| 20 | How to Use PicoBT/PT3 Tester for Antminer Hashboard Diagnosis 
---

## ⚡ WHATSMINER — 15 Articles

| # | Article Title 
|---|--------------
| 1 | WhatsMiner M60S Hashboard Not Detected 
| 2 | WhatsMiner M50S++ "Incomplete Chip Report" 
| 3 | WhatsMiner M50S Hashboard Error 202/250 
| 4 | WhatsMiner M30S++ Chain Missing 
| 5 | WhatsMiner M30S+ Zero Hashrate
| 6 | WhatsMiner M30S Hashboard Slot Empty 
| 7 | WhatsMiner M31S "Low Hash Rate" 
| 8 | WhatsMiner M21S Hashboard Failure 
| 9 | WhatsMiner M20S Board Not Working 
| 10 | WhatsMiner M50 Series Test Fixture Guide 
| 11 | WhatsMiner M30 Series Hashboard Repair Sequence 
| 12 | WhatsMiner Control Board Issues 
| 13 | WhatsMiner Error Codes 540/541/542 
| 14 | WhatsMiner Thermal Interface Material (TIM) Failure 
| 15 | WhatsMiner D1 Decred Miner Hashboard Fix 
---

## ⚡ AVALON (Canaan) — 5 Articles

| # | Article Title 
|---|--------------
| 1 | Avalon A1466 Hashboard Not Detected
| 2 | Avalon A1366 Chain Missing 
| 3 | Avalon A1246 "0 ASIC" Error
| 4 | Avalon A1166 Pro Hashboard Dead 
| 5 | Avalon Miner AUC Controller Issues 
---

# 📁 PHASE 2: Repair Insights & Case Studies (30 Articles)

## Overheating Issues — 12 Articles

| # | Article Title | Focus |
|---|---------------|-------|
| 1 | ASIC Miner Overheating in Indian Summer – Complete Prevention Guide | Environment |
| 2 | Antminer S21/S19 Thermal Shutdown – Causes & Solutions | Antminer |
| 3 | WhatsMiner M50/M30 High Temp Warning – Fan & Airflow Optimization | WhatsMiner |
| 4 | Thermal Paste Replacement Guide for ASIC Miners – Step-by-Step | Maintenance |
| 5 | ASIC Miner Dust Cleaning – Compressed Air vs Ultrasonic Methods | Maintenance |
| 6 | Mining Farm Cooling Solutions India – AC, Evaporative, Immersion | Infrastructure |
| 7 | Fan Replacement Guide: Antminer vs WhatsMiner vs Avalon | Parts |
| 8 | Overclocking Gone Wrong – When Mining Profits Turn to Smoke | Warning |
| 9 | Heatsink Damage Recognition – When to Replace vs Repair | Diagnosis |
| 10 | ASIC Miner Temperature Monitoring – Tools & Alert Systems | Monitoring |
| 11 | Immersion Cooling for ASIC Miners – Is It Worth It in India? | Advanced |
| 12 | Case Study: Mining Farm Fire Prevention After Overheating Incident | Case Study |

## Low Hashrate Issues — 10 Articles

| # | Article Title | Focus |
|---|---------------|-------|
| 1 | ASIC Miner Low Hashrate Diagnosis – Complete Troubleshooting Flowchart | General |
| 2 | Antminer S19/S21 Dropping Hashrate – Thermal Throttling Detection | Antminer |
| 3 | WhatsMiner M50 Unstable Hashrate – Firmware & Voltage Checks | WhatsMiner |
| 4 | High Reject Rate on Mining Pool – Network vs Hardware Issues | Network |
| 5 | Power Supply Causing Low Hashrate – Voltage Fluctuation Guide | PSU |
| 6 | Hashboard Running at 50% Capacity – Partial Chip Failure Diagnosis | Hardware |
| 7 | Mining Pool Stratum Connection Issues – Firewall & Port Settings India | Network |
| 8 | ASIC Miner Firmware Corruption – Recovery & Reflashing Guide | Firmware |
| 9 | Aging ASIC Components – When Capacitors & Resistors Fail | Hardware |
| 10 | Case Study: Restoring S19 Pro from 80 TH/s to 110 TH/s | Case Study |

## Power Supply Problems — 8 Articles

| # | Article Title | Focus |
|---|---------------|-------|
| 1 | ASIC Miner PSU Not Starting – Complete Diagnosis Guide | General |
| 2 | Antminer APW12 Power Supply Failure – Common Faults & Fixes | Antminer |
| 3 | Power Surge Damage to ASIC Miners – Prevention & Recovery India | Environment |
| 4 | Voltage Stabilizer Selection for Mining Farm – India Power Grid | Infrastructure |
| 5 | UPS for ASIC Miners – Is It Necessary? Cost-Benefit Analysis | Planning |
| 6 | PSU Fan Failure Leading to Miner Shutdown – Early Warning Signs | Maintenance |
| 7 | Replacing Bitmain PSU with Third-Party – Compatibility Guide | Parts |
| 8 | Case Study: Mining Farm Power Infrastructure Setup in Gujarat | Case Study |

---

# 📁 PHASE 3: Seasonal & Environmental Damage (10 Articles)

| # | Article Title | Season/Event |
|---|---------------|--------------|
| 1 | Monsoon Mining: Protecting ASIC Miners from Humidity in India | Monsoon |
| 2 | Summer Mining Guide: Keeping Miners Cool in 45°C Heat | Summer |
| 3 | Winter Mining Advantages in North India – Optimal Cooling Season | Winter |
| 4 | Dust Storm Damage to Mining Equipment – Rajasthan & Desert Areas | Dust |
| 5 | Power Outage Recovery: Restarting Mining Farm After Grid Failure | Power |
| 6 | Lightning Strike Protection for Mining Farms – Grounding & Surge | Lightning |
| 7 | Corrosion on ASIC Hashboards – Coastal Area Mining Challenges | Coastal |
| 8 | Post-Flood Miner Recovery – Water Damage Assessment & Repair | Flood |
| 9 | Pest Damage to Mining Equipment – Rodents & Insects Prevention | Pests |
| 10 | Bitcoin Halving Impact on Repair Decisions – 2024/2028 Planning | Market |

---

# 📁 PHASE 4: Repair Decisions & Operations (10 Articles)

| # | Article Title | Topic |
|---|---------------|-------|
| 1 | Repair vs Replace: When to Fix ASIC Miners & When to Sell for Parts | Decision |
| 2 | ASIC Miner Repair Cost Breakdown India – What to Expect | Cost |
| 3 | Finding Reliable ASIC Repair Services in India – Red Flags to Avoid | Service |
| 4 | DIY vs Professional Repair – Skill Requirements & Tool Investment | Decision |
| 5 | ASIC Miner Spare Parts Sourcing in India – Trusted Suppliers | Parts |
| 6 | Warranty Considerations: Bitmain, MicroBT & Canaan Policies | Warranty |
| 7 | Setting Up an ASIC Repair Lab – Essential Tools & Equipment | Business |
| 8 | Bulk Miner Repair for Mining Farms – Turnaround Time Optimization | Operations |
| 9 | Selling Broken Miners: Salvage Value & Parts Marketplace | Exit |
| 10 | Case Study: ASICREPAIR.IN – Our Repair Process & Success Stories | Brand |



**What actions should be available?**
 1] there should be a hamburger menu button on the main page to add, remove , rename phases
 2] when we click on phase 1 it will land on phase 1 web page on that page there should be option for adding and deleting and renaming the categories/sub-categories``````````````````````````````````````
3] when we click on the topic means 1st i will open blog tree then i will select phase 1 then it will show 3 main categeroy then i will choose Antminer then a list will of appear and then when i click on the topic for eg Antminer S19 Pro "Find 0 ASIC" it should show options send to research, rename, delete

**Structure:**
main page blog tree which contain 4 cards from phase1 to phase4 and when we click on aany card  there will be a seperate web page for each card and same for sub categoriesalso




## 8. 🔑 Keywords

**What should it display?**
This service is an internal high-value keyword research and qualification system for an ASIC repair business.
Its purpose is to identify and evaluate problem-based, high commercial intent keywords and decide whether each keyword should become a blog article intended to generate repair service leads.
The service prioritizes hardware failure intent and service relevance over general SEO or traffic-focused keyword research.


**What actions should be available?**
The service should display expert-level keyword evaluation data, including:
Problem-based keyword phrase
ASIC miner model
Failure category (hashboard, PSU, control board, thermal/cooling)
Repair intent indicators (hardware failure implied, model explicitly mentioned, professional repair likely)
Search volume classification (Low / Medium / High)
Administrative notes
Final decision status (Unset, Approved for Blog, Rejected)


**Data source:**
The service should allow the admin to:
Manually add and edit keywords one at a time
Fetch supporting keyword signals via API (such as approximate search volume or related problem phrases)
Review API-provided data as context only, not as an automatic decision factor
Manually approve a keyword as a blog topic
Manually reject keywords that lack sufficient repair or commercial intent
All final decisions remain strictly manual, regardless of API data.

extra input - This service is internal-only and designed as a decision filter, not an automated SEO tool.
API data is used solely to assist human judgment, never to auto-approve or rank keywords.
The service does not perform keyword difficulty scoring, rank tracking, competitor scraping, or automated SEO analysis.
Its only output is a curated list of expert-approved, high-intent keywords that are ready to be converted into blog articles aimed at generating ASIC repair service inquiries and revenue.
Commercial intent and repair relevance always take priority over traffic volume or SEO metrics.
---

## 7. 🚀 Publish Hub

**What should it display?**
list of ready articles category wise


**What actions should be available?**
 a timer in which i will set date and time which will decide when to push that blog to supabse


**Publishing targets:**
supabase API


---
## 5. Claude-output 
1] i will paste the final blog generated by claude here then it will be saved under their titels in articles section and from there forwarded to Publish
2] it will have 3 things in the display 1st option to select the title 2nd a box where i will paste my final blog 3rd add final blog to article









## 9. 🚪 Logout

**Current behavior:** Clears session and returns to login screen.
**Any changes needed?**


---

## Additional Notes

### 1. internal working of the app 

2] blog tree - i will navigate through this page to find topics that will be used to write blog and i will select the topic and i will push it from there to research 

3] research - this page gets input in 2 forms either manually typing or from the blog tree. after getting the topic it will gather information related to that topic from whole internet and it will have 3 buttons search again, copy , push to generate prompt

4] generate-prompt - it will genrate prompt via gemini and give it to me which will i copy and give to claude manually 

5] claude-output - i will paste the article generated by claude here which will push it to articles for saving 

6] articles - this section will get input from claude-output this will act as database for created articles 

7] publish - it will show the latest generated articles and this page will contain options to publish the article to the supabase website table from there it will become live on our website
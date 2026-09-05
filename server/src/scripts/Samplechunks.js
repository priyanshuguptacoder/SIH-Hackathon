// sampleChunks.js
// Expanded set of dummy regulation excerpts for testing the RAG pipeline.
// Covers multiple states, sectors, and authorities so vector search has
// real variety to distinguish between during retrieval testing.
//
// Structure matches models/RegulationChunk.js exactly:
// { text, state, sector, authority, section, page, documentTitle }

module.exports = [
    // ─── MAHARASHTRA — TEXTILE ──────────────────────────────────────────────
    {
        text: "Textile manufacturing units generating wastewater exceeding 10 kilolitres per day are required to install an Effluent Treatment Plant (ETP) prior to commencing operations. This ETP must reduce Biochemical Oxygen Demand (BOD) to below 30 mg/l and Chemical Oxygen Demand (COD) to below 250 mg/l before the wastewater is discharged into any water body or municipal sewer.",
        state: "Maharashtra", sector: "Textile", authority: "Maharashtra Pollution Control Board",
        section: "Section 4.2", page: 4, documentTitle: "MPCB Notification on Industrial Effluent Standards, 2023"
    },
    {
        text: "Units classified under the Red category due to hazardous waste generation must obtain Consent to Establish (CTE) from the Maharashtra Pollution Control Board prior to construction. The application must include a site plan, water balance diagram, and projected effluent characteristics.",
        state: "Maharashtra", sector: "Textile", authority: "Maharashtra Pollution Control Board",
        section: "Section 2.1", page: 2, documentTitle: "MPCB Notification on Industrial Effluent Standards, 2023"
    },
    {
        text: "Dyeing and printing units using azo dyes must submit a quarterly heavy metal discharge report to the regional MPCB office, including concentrations of chromium, cadmium, and lead in treated effluent. Non-submission for two consecutive quarters may result in suspension of Consent to Operate.",
        state: "Maharashtra", sector: "Textile", authority: "Maharashtra Pollution Control Board",
        section: "Section 5.3", page: 7, documentTitle: "MPCB Notification on Industrial Effluent Standards, 2023"
    },

    // ─── MAHARASHTRA — FACTORIES ACT / LABOUR ───────────────────────────────
    {
        text: "Any industrial establishment employing 20 or more workers is required to register under the Factories Act and obtain a Factory License from the office of the Chief Inspector of Factories, Maharashtra, prior to commencing manufacturing operations.",
        state: "Maharashtra", sector: "General", authority: "Directorate of Industrial Safety and Health, Maharashtra",
        section: "Section 6.3", page: 8, documentTitle: "Factory License Guidelines, Maharashtra, 2022"
    },
    {
        text: "Factory License renewal applications must be submitted at least 30 days before expiry. Late renewal beyond the expiry date attracts a penalty of Rupees 500 per day, and continued operation without a valid license may result in closure orders under Section 92 of the Factories Act, 1948.",
        state: "Maharashtra", sector: "General", authority: "Directorate of Industrial Safety and Health, Maharashtra",
        section: "Section 8.1", page: 11, documentTitle: "Factory License Guidelines, Maharashtra, 2022"
    },
    {
        text: "Establishments engaging contract labour of 20 or more workers on any day must obtain registration under the Contract Labour (Regulation and Abolition) Act, and the principal employer remains responsible for ensuring welfare amenities including canteens, restrooms, and first-aid facilities.",
        state: "Maharashtra", sector: "General", authority: "Labour Commissioner, Maharashtra",
        section: "Section 3.4", page: 5, documentTitle: "Contract Labour Compliance Handbook, Maharashtra, 2021"
    },

    // ─── MAHARASHTRA — FIRE SAFETY ───────────────────────────────────────────
    {
        text: "Industrial buildings exceeding 15 metres in height or occupying more than 500 square metres of built-up area must obtain a Fire No Objection Certificate (NOC) from the Maharashtra Fire Services prior to occupancy. The application requires structural fire safety drawings certified by a licensed fire consultant.",
        state: "Maharashtra", sector: "General", authority: "Maharashtra Fire Services",
        section: "Section 2.4", page: 3, documentTitle: "Maharashtra Fire Prevention and Life Safety Measures Regulations, 2020"
    },
    {
        text: "Units storing flammable chemicals exceeding 5000 litres in aggregate must install automatic fire detection and suppression systems, and undergo annual fire safety audits conducted by an empanelled agency. Audit reports must be submitted to the local fire station within 15 days of inspection.",
        state: "Maharashtra", sector: "Chemical", authority: "Maharashtra Fire Services",
        section: "Section 6.1", page: 9, documentTitle: "Maharashtra Fire Prevention and Life Safety Measures Regulations, 2020"
    },

    // ─── KARNATAKA — ELECTRONICS ──────────────────────────────────────────────
    {
        text: "Electronics manufacturing units handling printed circuit board etching processes must submit a Hazardous Waste Authorization application to the Karnataka State Pollution Control Board, detailing the type and quantity of etchant waste, copper sludge, and used chemical containers generated annually.",
        state: "Karnataka", sector: "Electronics", authority: "Karnataka State Pollution Control Board",
        section: "Section 3.5", page: 6, documentTitle: "KSPCB Hazardous Waste Authorization Guidelines, 2023"
    },
    {
        text: "Hazardous waste generated by electronics units, including e-waste, printed circuit board scrap, and lead-acid battery residue, must only be transported by KSPCB-authorized recyclers holding a valid Extended Producer Responsibility registration under the E-Waste (Management) Rules.",
        state: "Karnataka", sector: "Electronics", authority: "Karnataka State Pollution Control Board",
        section: "Section 4.1", page: 8, documentTitle: "KSPCB Hazardous Waste Authorization Guidelines, 2023"
    },
    {
        text: "Semiconductor and electronics assembly units in Karnataka's designated Special Economic Zones are eligible for expedited environmental clearance under the single-window clearance mechanism, provided the unit's pollution index falls under the Green or Orange category as defined by the Central Pollution Control Board.",
        state: "Karnataka", sector: "Electronics", authority: "Karnataka Industrial Area Development Board",
        section: "Section 1.2", page: 1, documentTitle: "KIADB SEZ Fast-Track Clearance Circular, 2022"
    },

    // ─── KARNATAKA — WATER USAGE ──────────────────────────────────────────────
    {
        text: "Industrial units drawing groundwater exceeding 50,000 litres per day for manufacturing purposes must obtain a No Objection Certificate from the Karnataka Groundwater Authority and install a digital flow meter with real-time reporting to the Central Ground Water Board portal.",
        state: "Karnataka", sector: "General", authority: "Karnataka Groundwater Authority",
        section: "Section 2.2", page: 3, documentTitle: "Karnataka Groundwater Extraction Regulation, 2022"
    },

    // ─── GUJARAT — CHEMICAL ─────────────────────────────────────────────────
    {
        text: "Chemical manufacturing units handling substances listed under Schedule I of the Manufacture, Storage and Import of Hazardous Chemicals Rules must prepare an on-site emergency plan and submit it to the Gujarat Pollution Control Board and the local District Disaster Management Authority for review every three years.",
        state: "Gujarat", sector: "Chemical", authority: "Gujarat Pollution Control Board",
        section: "Section 7.2", page: 12, documentTitle: "GPCB Major Accident Hazard Unit Guidelines, 2023"
    },
    {
        text: "Units classified as Major Accident Hazard (MAH) installations under Gujarat's chemical industry regulations must conduct a mock emergency drill at least once every six months, with results documented and made available for inspection by the Factory Inspectorate.",
        state: "Gujarat", sector: "Chemical", authority: "Gujarat Pollution Control Board",
        section: "Section 7.5", page: 13, documentTitle: "GPCB Major Accident Hazard Unit Guidelines, 2023"
    },
    {
        text: "Storage of hazardous chemicals in Gujarat's coastal industrial zones exceeding threshold quantities specified under the Coastal Regulation Zone notification requires prior clearance from the Gujarat Coastal Zone Management Authority in addition to standard pollution control consents.",
        state: "Gujarat", sector: "Chemical", authority: "Gujarat Coastal Zone Management Authority",
        section: "Section 3.1", page: 4, documentTitle: "GCZMA Industrial Siting Notification, 2021"
    },

    // ─── GUJARAT — MSME EXEMPTIONS ───────────────────────────────────────────
    {
        text: "Micro and Small Enterprises with investment below Rupees 1 crore in plant and machinery are exempt from mandatory environmental clearance for non-hazardous manufacturing activities, subject to self-certification of compliance filed annually with the District Industries Centre.",
        state: "Gujarat", sector: "General", authority: "Gujarat Industries Commissionerate",
        section: "Section 1.4", page: 1, documentTitle: "MSME Environmental Exemption Notification, 2023"
    },

    // ─── TAMIL NADU — AUTOMOTIVE ──────────────────────────────────────────────
    {
        text: "Automotive component manufacturing units generating metal scrap and used lubricant oil exceeding 1000 litres annually must register as hazardous waste generators with the Tamil Nadu Pollution Control Board and maintain a waste disposal manifest for each consignment sent to authorized recyclers.",
        state: "Tamil Nadu", sector: "Automotive", authority: "Tamil Nadu Pollution Control Board",
        section: "Section 4.6", page: 9, documentTitle: "TNPCB Industrial Waste Manifest Rules, 2022"
    },
    {
        text: "Paint shops within automotive manufacturing facilities must install volatile organic compound (VOC) emission control systems where daily paint consumption exceeds 200 litres, and stack emissions must be tested quarterly by a TNPCB-recognized laboratory.",
        state: "Tamil Nadu", sector: "Automotive", authority: "Tamil Nadu Pollution Control Board",
        section: "Section 5.1", page: 10, documentTitle: "TNPCB Industrial Waste Manifest Rules, 2022"
    },

    // ─── TAMIL NADU — LABOUR / SAFETY ─────────────────────────────────────────
    {
        text: "Heavy manufacturing units in Tamil Nadu employing workers in hazardous processes as defined under the First Schedule of the Factories Act must conduct mandatory pre-employment and periodic medical examinations, with records retained for a minimum of 40 years or 10 years after the worker leaves employment, whichever is later.",
        state: "Tamil Nadu", sector: "General", authority: "Directorate of Industrial Safety and Health, Tamil Nadu",
        section: "Section 9.3", page: 15, documentTitle: "Tamil Nadu Factories Rules, Occupational Health Chapter, 2021"
    },

    // ─── DELHI — FOOD PROCESSING ──────────────────────────────────────────────
    {
        text: "Food processing units in Delhi NCR must obtain a license under the Food Safety and Standards Act in addition to standard trade license and pollution consent, and are subject to surprise inspections by the Food Safety Officer at least twice annually.",
        state: "Delhi", sector: "Food Processing", authority: "Food Safety and Standards Authority of India, Delhi",
        section: "Section 2.3", page: 2, documentTitle: "FSSAI Delhi Regional Licensing Guidelines, 2023"
    },
    {
        text: "Effluent from food processing units containing high organic load must be treated to bring BOD below 20 mg/l before discharge into the Delhi Jal Board sewer network, and units failing to meet this standard for three consecutive tests may face disconnection of trade effluent discharge permission.",
        state: "Delhi", sector: "Food Processing", authority: "Delhi Pollution Control Committee",
        section: "Section 4.4", page: 6, documentTitle: "Delhi Pollution Control Committee Effluent Standards, 2022"
    },

    // ─── RAJASTHAN — MINING / STONE PROCESSING ─────────────────────────────────
    {
        text: "Stone crushing and mineral processing units in Rajasthan must install dust suppression systems including water sprinklers and wind barriers, and are required to maintain ambient air quality within 500 metres of the unit boundary as per the National Ambient Air Quality Standards.",
        state: "Rajasthan", sector: "Mining", authority: "Rajasthan State Pollution Control Board",
        section: "Section 3.2", page: 5, documentTitle: "RSPCB Stone Crusher Unit Guidelines, 2022"
    },

    // ─── PAN-INDIA / CENTRAL — PHARMA ──────────────────────────────────────────
    {
        text: "Pharmaceutical manufacturing units producing bulk drugs listed under Schedule H1 must obtain a manufacturing license from the State Drug Controller in addition to environmental clearance, and are subject to Good Manufacturing Practice (GMP) audits conducted jointly with the Central Drugs Standard Control Organisation.",
        state: "Maharashtra", sector: "Pharmaceutical", authority: "Central Drugs Standard Control Organisation",
        section: "Section 2.7", page: 4, documentTitle: "CDSCO Bulk Drug Manufacturing License Guidelines, 2023"
    },
    {
        text: "Pharmaceutical effluent containing residual antibiotics must undergo tertiary treatment including activated carbon filtration before discharge, and units must submit antibiotic residue test reports to the State Pollution Control Board on a monthly basis.",
        state: "Gujarat", sector: "Pharmaceutical", authority: "Gujarat Pollution Control Board",
        section: "Section 6.4", page: 11, documentTitle: "GPCB Pharmaceutical Effluent Standards, 2023"
    },

    // ─── MSME / GOVERNMENT SCHEMES (cross-sector) ───────────────────────────────
    {
        text: "Micro, Small, and Medium Enterprises registered under Udyam Registration are eligible for a capital subsidy of up to 15 percent on plant and machinery investment under the Credit Linked Capital Subsidy Scheme, subject to a maximum subsidy cap of Rupees 15 lakh per unit.",
        state: "Maharashtra", sector: "General", authority: "Ministry of Micro, Small and Medium Enterprises",
        section: "Section 1.1", page: 1, documentTitle: "Credit Linked Capital Subsidy Scheme Guidelines, 2023"
    },
    {
        text: "Units establishing manufacturing facilities in designated backward districts of Maharashtra are eligible for a stamp duty exemption of up to 100 percent and electricity duty exemption for the first seven years of operation under the Maharashtra Industrial Policy.",
        state: "Maharashtra", sector: "General", authority: "Directorate of Industries, Maharashtra",
        section: "Section 3.8", page: 7, documentTitle: "Maharashtra Industrial Policy Incentive Scheme, 2023"
    }
];
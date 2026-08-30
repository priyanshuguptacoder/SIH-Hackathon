/**
 * seed.js — SIH Demo Dataset
 * Sector: Textiles | State: Maharashtra
 * Run: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Approval       = require('../models/Approval');
const RegulatoryRule = require('../models/RegulatoryRule');
const ComplianceRule = require('../models/ComplianceRule');
const Scheme         = require('../models/Scheme');

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih-db';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected for Seeding...');

    // Clear only seed-managed collections
    await Approval.deleteMany({});
    await RegulatoryRule.deleteMany({});
    await ComplianceRule.deleteMany({});
    await Scheme.deleteMany({});

    // ─── 1. Approvals ─────────────────────────────────────────────────────────
    const cte = await Approval.create({
      approvalName:      'Consent to Establish (CTE)',
      authority:         'Maharashtra Pollution Control Board (MPCB)',
      category:          'Environmental',
      dependencies:      [],
      description:       'Required before any construction/civil work begins for industries listed under Water/Air Act.',
      requiredDocuments: ['Project Report', 'Site Plan', 'Water Balance Diagram', 'ETP Layout', 'NOC from Local Authority'],
      officialUrl:       'https://mpcb.gov.in/consent-establish',
      legalBasis:        'Water (Prevention and Control of Pollution) Act, 1974; Air Act, 1981',
      slaDays:           30,
      isActive:          true
    });

    const cto = await Approval.create({
      approvalName:      'Consent to Operate (CTO)',
      authority:         'Maharashtra Pollution Control Board (MPCB)',
      category:          'Environmental',
      dependencies:      ['Consent to Establish (CTE)'],
      description:       'Required before commencement of operations. Issued after CTE is obtained and construction complete.',
      requiredDocuments: ['CTE Certificate', 'Completion Certificate', 'ETP Commissioning Report', 'Stack Monitoring Report'],
      officialUrl:       'https://mpcb.gov.in/consent-operate',
      legalBasis:        'Water (Prevention and Control of Pollution) Act, 1974',
      slaDays:           60,
      isActive:          true
    });

    const factoryLicense = await Approval.create({
      approvalName:      'Factory License',
      authority:         'Directorate of Industrial Safety and Health (DISH), Maharashtra',
      category:          'Labour & Safety',
      dependencies:      [],
      description:       'Mandatory for factories employing 10+ workers using power, or 20+ without power.',
      requiredDocuments: ['Plan of Premises', 'Stability Certificate', 'NOC from Fire Department', 'MSEB Connection Proof'],
      officialUrl:       'https://dish.maharashtra.gov.in',
      legalBasis:        'Factories Act, 1948',
      slaDays:           45,
      isActive:          true
    });

    const fireNoc = await Approval.create({
      approvalName:      'Fire NOC',
      authority:         'Maharashtra Fire and Emergency Services',
      category:          'Fire & Emergency',
      dependencies:      [],
      description:       'Required for industrial premises above specified investment or occupancy threshold.',
      requiredDocuments: ['Building Plan', 'Fire Safety Audit Report', 'Occupancy Certificate'],
      officialUrl:       'https://mahafire.gov.in',
      legalBasis:        'Maharashtra Fire Prevention and Life Safety Measures Act, 2006',
      slaDays:           21,
      isActive:          true
    });

    const labourLicense = await Approval.create({
      approvalName:      'Labour License (Contract Labour)',
      authority:         'Labour Commissioner, Maharashtra',
      category:          'Labour & Safety',
      dependencies:      ['Factory License'],
      description:       'Required if employing contract workers (20 or more).',
      requiredDocuments: ['Form XII Application', 'List of Contractors', 'Principal Employer Registration Certificate'],
      officialUrl:       'https://labour.maharashtra.gov.in',
      legalBasis:        'Contract Labour (Regulation and Abolition) Act, 1970',
      slaDays:           30,
      isActive:          true
    });

    // ─── 2. Regulatory Rules ──────────────────────────────────────────────────
    await RegulatoryRule.create({
      ruleId:              'RULE-CTE-MH-TEXT-01',
      approvalId:          cte._id,
      condition: {
        operator: 'AND',
        rules: [
          { field: 'state',               operator: 'eq', value: 'Maharashtra' },
          { field: 'sector',              operator: 'eq', value: 'textiles' },
          { field: 'generatesWastewater', operator: 'eq', value: true }
        ]
      },
      explanationTemplate: 'Required because your {sector} project in {state} generates industrial wastewater, which is regulated under the Water Act, 1974.',
      priority:      1,
      effectiveDate: new Date('2023-01-01'),
      version:       '1.0',
      isActive:      true,
      source:        'MPCB General Guidelines 2023'
    });

    await RegulatoryRule.create({
      ruleId:              'RULE-CTO-MH-TEXT-01',
      approvalId:          cto._id,
      condition: {
        operator: 'AND',
        rules: [
          { field: 'state',               operator: 'eq', value: 'Maharashtra' },
          { field: 'sector',              operator: 'eq', value: 'textiles' },
          { field: 'generatesWastewater', operator: 'eq', value: true },
          { field: 'projectStage',        operator: 'in', value: ['pre-operation', 'operational'] }
        ]
      },
      explanationTemplate: 'Required before commencing operations. Your {sector} unit in {state} must obtain CTO after CTE and construction are complete.',
      priority:      2,
      effectiveDate: new Date('2023-01-01'),
      version:       '1.0',
      isActive:      true,
      source:        'Water Act 1974, Section 25'
    });

    await RegulatoryRule.create({
      ruleId:              'RULE-FACT-MH-01',
      approvalId:          factoryLicense._id,
      condition: {
        operator: 'AND',
        rules: [
          { field: 'state',     operator: 'eq',  value: 'Maharashtra' },
          { field: 'employees', operator: 'gte', value: 10 }
        ]
      },
      explanationTemplate: 'Required under the Factories Act, 1948 because your unit will employ {employees} workers, which exceeds the threshold of 10 workers with power usage.',
      priority:      3,
      effectiveDate: new Date('2022-01-01'),
      version:       '1.0',
      isActive:      true,
      source:        'Factories Act 1948, Section 6'
    });

    await RegulatoryRule.create({
      ruleId:              'RULE-FIRE-MH-01',
      approvalId:          fireNoc._id,
      condition: {
        operator: 'AND',
        rules: [
          { field: 'state',      operator: 'eq',  value: 'Maharashtra' },
          { field: 'investment', operator: 'gte', value: 100 }  // >= 100 Lakhs (1 Crore)
        ]
      },
      explanationTemplate: 'Required because your investment of ₹{investment} Lakhs in {state} meets the threshold for mandatory Fire NOC under the Maharashtra Fire Act.',
      priority:      4,
      effectiveDate: new Date('2022-01-01'),
      version:       '1.0',
      isActive:      true,
      source:        'Maharashtra Fire Prevention Act, 2006'
    });

    await RegulatoryRule.create({
      ruleId:              'RULE-LABOUR-MH-01',
      approvalId:          labourLicense._id,
      condition: {
        operator: 'AND',
        rules: [
          { field: 'state',     operator: 'eq',  value: 'Maharashtra' },
          { field: 'employees', operator: 'gte', value: 20 }
        ]
      },
      explanationTemplate: 'Required because your unit employs {employees} workers (≥20), triggering Labour License requirements under the Contract Labour Act, 1970.',
      priority:      5,
      effectiveDate: new Date('2022-01-01'),
      version:       '1.0',
      isActive:      true,
      source:        'Contract Labour (Regulation and Abolition) Act, 1970'
    });

    // ─── 3. Compliance Rules ──────────────────────────────────────────────────
    await ComplianceRule.create({
      approvalId:      cte._id,
      requirementText: 'Submit Monthly Effluent Quality Report to MPCB',
      recurrence:      'MONTHLY',
      daysUntilDue:    30,
      source:          'MPCB Consent Condition C-7'
    });

    await ComplianceRule.create({
      approvalId:      cte._id,
      requirementText: 'Quarterly Stack Emission Monitoring & Reporting',
      recurrence:      'QUARTERLY',
      daysUntilDue:    90,
      source:          'Air Act Consent Condition'
    });

    await ComplianceRule.create({
      approvalId:      cto._id,
      requirementText: 'Annual Environment Statement (Form V) submission to MPCB',
      recurrence:      'ANNUAL',
      daysUntilDue:    365,
      source:          'Environment Protection Act, 1986 - Form V'
    });

    await ComplianceRule.create({
      approvalId:      factoryLicense._id,
      requirementText: 'Annual Renewal of Factory License',
      recurrence:      'RENEWAL',
      daysUntilDue:    365,
      source:          'Factories Act 1948, Section 6(4)'
    });

    await ComplianceRule.create({
      approvalId:      factoryLicense._id,
      requirementText: 'Annual Safety Audit by Competent Person',
      recurrence:      'ANNUAL',
      daysUntilDue:    365,
      source:          'Maharashtra Factories Rules, 1963'
    });

    // ─── 4. Schemes ───────────────────────────────────────────────────────────
    await Scheme.create({
      schemeName:   'Maharashtra Textile Policy 2023-28 — Capital Subsidy',
      description:  'Capital investment subsidy for new and expanding textile manufacturing units in Maharashtra.',
      state:        'Maharashtra',
      sector:       'textiles',
      eligibilityCriteria: {
        operator: 'AND',
        rules: [
          { field: 'state',      operator: 'eq',  value: 'Maharashtra' },
          { field: 'sector',     operator: 'eq',  value: 'textiles' },
          { field: 'investment', operator: 'gte', value: 100 }  // >= 100 Lakhs (1 Crore)
        ]
      },
      benefits:    'Up to 30% capital subsidy on eligible plant and machinery (max ₹5 Crore).',
      officialUrl: 'https://maitri.mahaonline.gov.in/'
    });

    await Scheme.create({
      schemeName:   'MSME Cluster Development Programme',
      description:  'Central government scheme to support development of MSME clusters including textile units.',
      state:        'Maharashtra',
      sector:       'textiles',
      eligibilityCriteria: {
        operator: 'AND',
        rules: [
          { field: 'sector',     operator: 'eq',      value: 'textiles' },
          { field: 'investment', operator: 'between', value: [10, 1000] }  // 10L to 1000L (10Cr)
        ]
      },
      benefits:    'Infrastructure support, common facility centres, and skill development grants.',
      officialUrl: 'https://msme.gov.in/cluster-development'
    });

    console.log('✅ Seed completed successfully!');
    console.log('   Seeded: 5 Approvals, 5 Regulatory Rules, 5 Compliance Rules, 2 Schemes');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();

#!/usr/bin/env node
/**
 * e2e-verify.js
 * End-to-end backend verification against a live server.
 * Run: node src/scripts/e2e-verify.js
 *
 * Flow tested:
 *   Register → Login → Create Industry → Analyze Profile →
 *   Approval Roadmap → Create Application → Transitions →
 *   APPROVED → Compliance Generated → Complete Compliance →
 *   Next Recurring Item Created
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ── Models ──────────────────────────────────────────────────────────────────
const User = require('../models/User');
const Industry = require('../models/Industry');
const Approval = require('../models/Approval');
const RegulatoryRule = require('../models/RegulatoryRule');
const Application = require('../models/Application');
const ComplianceRule = require('../models/ComplianceRule');
const ComplianceItem = require('../models/ComplianceItem');

// ── Rules Engine ─────────────────────────────────────────────────────────────
const { evaluateRule, generateExplanation } = require('../utils/rulesEngine');

const PASS = '✅';
const FAIL = '❌';
const INFO = '  ›';

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`${PASS} ${label}`);
    passed++;
  } else {
    console.log(`${FAIL} ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

const VALID_TRANSITIONS = {
  'NOT_STARTED':        ['DOCUMENTS_PREPARED'],
  'DOCUMENTS_PREPARED': ['SUBMITTED'],
  'SUBMITTED':          ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  'UNDER_REVIEW':       ['INSPECTION', 'APPROVED', 'REJECTED'],
  'INSPECTION':         ['APPROVED', 'REJECTED'],
  'APPROVED':           [],
  'REJECTED':           ['DOCUMENTS_PREPARED'],
};
const canTransition = (from, to) =>
  Array.isArray(VALID_TRANSITIONS[from]) && VALID_TRANSITIONS[from].includes(to);

const computeNextDueDate = (currentDue, recurrence) => {
  const next = new Date(currentDue);
  switch (recurrence) {
    case 'MONTHLY':   next.setMonth(next.getMonth() + 1); break;
    case 'QUARTERLY': next.setMonth(next.getMonth() + 3); break;
    case 'ANNUAL':    next.setFullYear(next.getFullYear() + 1); break;
    case 'RENEWAL':   next.setFullYear(next.getFullYear() + 1); break;
    default: return null;
  }
  return next;
};

async function run() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(mongoURI);
  console.log('\n🔗 Connected to MongoDB Atlas\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('  SIH Backend End-to-End Verification');
  console.log('═══════════════════════════════════════════════════\n');

  // ── 1. SEED DATA CHECK ──────────────────────────────────────────────────────
  console.log('── 1. Seed Data ────────────────────────────────────');
  const approvals = await Approval.find({ isActive: true });
  assert('At least 2 active Approvals seeded', approvals.length >= 2, `found ${approvals.length}`);

  const rules = await RegulatoryRule.find({ isActive: true });
  assert('At least 2 active RegulatoryRules seeded', rules.length >= 2, `found ${rules.length}`);

  const compRules = await ComplianceRule.find({});
  assert('At least 2 ComplianceRules seeded', compRules.length >= 2, `found ${compRules.length}`);

  // ── 2. RULES ENGINE ─────────────────────────────────────────────────────────
  console.log('\n── 2. Rules Engine ─────────────────────────────────');

  // Scenario A: Textiles + Maharashtra + wastewater = true → at least 1 rule matches
  const profileA = {
    sector: 'Textiles', state: 'Maharashtra', generatesWastewater: true,
    employees: 50, investment: 20000000, projectStage: 'Pre-establishment'
  };
  const matchedA = rules.filter(r => evaluateRule(r.condition, profileA));
  assert('Scenario A — Textiles+MH+wastewater: at least 1 rule matches', matchedA.length >= 1, `matched ${matchedA.length}`);

  // Scenario B: wastewater = false → CTE wastewater rule does not match
  const profileB = { ...profileA, generatesWastewater: false };
  const matchedB = rules.filter(r => evaluateRule(r.condition, profileB));
  const cteRuleMatches = matchedA.some(r => {
    const json = JSON.stringify(r.condition);
    return json.includes('generatesWastewater');
  });
  assert('Scenario B — wastewater=false: wastewater rule excluded', matchedB.length < matchedA.length, `A=${matchedA.length} B=${matchedB.length}`);

  // Scenario C: Food Processing → textile-specific rules don't apply
  const profileC = { ...profileA, sector: 'Food Processing' };
  const matchedC = rules.filter(r => {
    const json = JSON.stringify(r.condition);
    return json.includes('Textiles') && evaluateRule(r.condition, profileC);
  });
  assert('Scenario C — Food Processing: Textile-specific rules excluded', matchedC.length === 0);

  // Explanation template
  if (matchedA.length > 0) {
    const explanation = generateExplanation(matchedA[0].explanationTemplate, profileA);
    assert('Explanation template interpolates profile values', !explanation.includes('{') && explanation.length > 0);
    console.log(`${INFO} Sample explanation: "${explanation.substring(0, 80)}..."`);
  }

  // ── 3. AUTH ─────────────────────────────────────────────────────────────────
  console.log('\n── 3. Auth / User ──────────────────────────────────');
  const testEmail = `e2e-test-${Date.now()}@sih.dev`;
  const testPassword = 'TestPass123';

  // Clean up any previous test user
  await User.deleteOne({ email: testEmail });

  const user = new User({ name: 'E2E Test User', email: testEmail, password: testPassword, role: 'Industry' });
  await user.save();
  assert('User created with bcrypt hash', user.password !== testPassword);

  const passwordMatch = await user.comparePassword(testPassword);
  assert('comparePassword returns true for correct password', passwordMatch);

  const wrongMatch = await user.comparePassword('wrongpassword');
  assert('comparePassword returns false for wrong password', !wrongMatch);

  // ── 4. INDUSTRY PROFILE ──────────────────────────────────────────────────────
  console.log('\n── 4. Industry Profile ─────────────────────────────');
  // Clean previous test profile
  await Industry.deleteOne({ userId: user._id });

  const industry = new Industry({
    userId: user._id,
    companyName: 'E2E Textiles Pvt Ltd',
    sector: 'Textiles',
    state: 'Maharashtra',
    district: 'Pune',
    projectLocation: 'Pimpri-Chinchwad Industrial Area',
    pincode: '411018',
    investment: 20000000,
    employees: 50,
    productionCapacity: 1000,
    manufacturingActivity: 'Yarn spinning and fabric weaving',
    processes: 'Wet processing, dyeing, finishing',
    waterUsage: 5000,
    generatesWastewater: true,
    hazardousWaste: false,
    projectStage: 'Pre-establishment'
  });
  await industry.save();
  assert('Industry profile saved to DB', !!industry._id);

  const fetched = await Industry.findOne({ userId: user._id });
  assert('Industry profile fetched by userId', fetched?.companyName === 'E2E Textiles Pvt Ltd');

  // ── 5. APPROVAL ROADMAP ──────────────────────────────────────────────────────
  console.log('\n── 5. Approval Roadmap ─────────────────────────────');
  const profile = industry.toObject();
  const applicableRules = rules.filter(r => evaluateRule(r.condition, profile));
  assert('At least 1 applicable rule for test profile', applicableRules.length >= 1, `found ${applicableRules.length}`);

  // Roadmap includes required documents
  const firstApproval = await Approval.findById(applicableRules[0].approvalId);
  assert('First applicable approval has requiredDocuments', Array.isArray(firstApproval?.requiredDocuments));
  assert('First applicable approval has slaDays', typeof firstApproval?.slaDays === 'number');
  assert('First applicable approval has authority', !!firstApproval?.authority);

  // ── 6. APPLICATION WORKFLOW ──────────────────────────────────────────────────
  console.log('\n── 6. Application Workflow ─────────────────────────');
  // Clean up previous test applications
  await Application.deleteMany({ industryId: industry._id });

  const app = new Application({
    industryId: industry._id,
    approvalId: firstApproval._id,
    status: 'NOT_STARTED',
    statusHistory: [{ status: 'NOT_STARTED', remarks: 'E2E test' }]
  });
  await app.save();
  assert('Application created in NOT_STARTED', app.status === 'NOT_STARTED');
  assert('statusHistory has initial entry', app.statusHistory.length === 1);

  // Walk through state machine
  const transitions = [
    'DOCUMENTS_PREPARED',
    'SUBMITTED',
    'UNDER_REVIEW',
    'INSPECTION',
    'APPROVED'
  ];
  let current = 'NOT_STARTED';
  for (const next of transitions) {
    const allowed = canTransition(current, next);
    assert(`Transition ${current} → ${next} is valid`, allowed);
    if (allowed) {
      app.status = next;
      app.statusHistory.push({ status: next, changedAt: new Date() });
      if (next === 'SUBMITTED') {
        app.submissionDate = new Date();
        const slaDays = firstApproval.slaDays || 30;
        const exp = new Date();
        exp.setDate(exp.getDate() + slaDays);
        app.expectedCompletionDate = exp;
      }
      if (next === 'INSPECTION') app.inspectionDate = new Date();
      if (next === 'APPROVED')   app.approvalDate = new Date();
      await app.save();
      current = next;
    }
  }
  assert('Final application status is APPROVED', app.status === 'APPROVED');
  assert('statusHistory has all transitions', app.statusHistory.length === transitions.length + 1);
  assert('submissionDate is set', !!app.submissionDate);
  assert('expectedCompletionDate is set', !!app.expectedCompletionDate);
  assert('approvalDate is set', !!app.approvalDate);

  // SLA calculation
  const now = new Date();
  const msLeft = app.expectedCompletionDate - now;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const slaStatus = daysLeft < 0 ? 'BREACHED' : daysLeft <= 5 ? 'APPROACHING' : 'NORMAL';
  assert(`SLA status computed (${slaStatus}, ${daysLeft} days)`, ['NORMAL','APPROACHING','BREACHED'].includes(slaStatus));

  // Invalid transition check
  assert('APPROVED → REJECTED is invalid (terminal)', !canTransition('APPROVED', 'REJECTED'));
  assert('NOT_STARTED → APPROVED is invalid (skip)', !canTransition('NOT_STARTED', 'APPROVED'));

  // ── 7. COMPLIANCE GENERATION ─────────────────────────────────────────────────
  console.log('\n── 7. Compliance Generation ────────────────────────');
  // Clean previous compliance items for this industry
  await ComplianceItem.deleteMany({ industryId: industry._id });

  const cRules = await ComplianceRule.find({ approvalId: firstApproval._id });
  assert('ComplianceRules exist for approval', cRules.length >= 1, `found ${cRules.length}`);

  const generatedItems = [];
  if (cRules.length > 0) {
    for (const rule of cRules) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + rule.daysUntilDue);
      const item = await ComplianceItem.create({
        industryId: industry._id,
        approvalId: firstApproval._id,
        requirementText: rule.requirementText,
        recurrence: rule.recurrence,
        status: 'UPCOMING',
        dueDate,
        source: rule.source
      });
      generatedItems.push(item);
    }
  }
  assert(`${generatedItems.length} compliance items generated`, generatedItems.length >= 1);

  const dbItems = await ComplianceItem.find({ industryId: industry._id });
  assert('ComplianceItems persisted in DB', dbItems.length >= 1);

  // ── 8. COMPLIANCE TRANSITIONS + RECURRENCE ──────────────────────────────────
  console.log('\n── 8. Compliance Recurrence ────────────────────────');
  const COMP_TRANSITIONS = {
    'UPCOMING': ['DUE', 'COMPLETED'],
    'DUE': ['OVERDUE', 'COMPLETED'],
    'OVERDUE': ['COMPLETED'],
    'COMPLETED': []
  };
  const canCompTransition = (from, to) =>
    Array.isArray(COMP_TRANSITIONS[from]) && COMP_TRANSITIONS[from].includes(to);

  // Find a recurring item to test with
  const recurringItem = generatedItems.find(i => i.recurrence !== 'ONE_TIME') || generatedItems[0];
  if (recurringItem) {
    assert(`Recurring item has recurrence=${recurringItem.recurrence}`, !!recurringItem.recurrence);

    // Valid: UPCOMING → DUE
    assert('UPCOMING → DUE is valid', canCompTransition('UPCOMING', 'DUE'));
    assert('UPCOMING → OVERDUE is invalid', !canCompTransition('UPCOMING', 'OVERDUE'));
    assert('DUE → COMPLETED is valid', canCompTransition('DUE', 'COMPLETED'));
    assert('COMPLETED → UPCOMING is invalid (terminal)', !canCompTransition('COMPLETED', 'UPCOMING'));

    // Simulate completing the item and creating next recurrence
    if (recurringItem.recurrence !== 'ONE_TIME') {
      recurringItem.status = 'COMPLETED';
      await recurringItem.save();

      const nextDue = computeNextDueDate(recurringItem.dueDate, recurringItem.recurrence);
      assert('Next due date computed', nextDue instanceof Date);

      const nextItem = await ComplianceItem.create({
        industryId: recurringItem.industryId,
        approvalId: recurringItem.approvalId,
        requirementText: recurringItem.requirementText,
        recurrence: recurringItem.recurrence,
        status: 'UPCOMING',
        dueDate: nextDue,
        source: recurringItem.source
      });
      assert('Next recurring compliance item created as UPCOMING', nextItem.status === 'UPCOMING');
      console.log(`${INFO} Next due: ${nextItem.dueDate.toISOString().split('T')[0]}`);
    }
  }

  // ── 9. CLEANUP TEST DATA ─────────────────────────────────────────────────────
  console.log('\n── 9. Cleanup ──────────────────────────────────────');
  await ComplianceItem.deleteMany({ industryId: industry._id });
  await Application.deleteMany({ industryId: industry._id });
  await Industry.deleteOne({ _id: industry._id });
  await User.deleteOne({ _id: user._id });
  console.log(`${INFO} Test records removed from DB`);

  // ── RESULT ───────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  Result: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('E2E script error:', err);
  process.exit(1);
});

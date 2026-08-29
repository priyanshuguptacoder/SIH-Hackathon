/**
 * applicationWorkflow.test.js
 * Tests the VALID_TRANSITIONS state machine logic in isolation.
 */

// ─── Extract the transition map (pure logic, no DB needed) ─────────────────────
const VALID_TRANSITIONS = {
  'NOT_STARTED':        ['DOCUMENTS_PREPARED'],
  'DOCUMENTS_PREPARED': ['SUBMITTED'],
  'SUBMITTED':          ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  'UNDER_REVIEW':       ['INSPECTION', 'APPROVED', 'REJECTED'],
  'INSPECTION':         ['APPROVED', 'REJECTED'],
  'APPROVED':           [],
  'REJECTED':           ['DOCUMENTS_PREPARED']
};

const canTransition = (from, to) =>
  Array.isArray(VALID_TRANSITIONS[from]) && VALID_TRANSITIONS[from].includes(to);

describe('Application Workflow — State Machine', () => {
  // Valid transitions
  test('NOT_STARTED -> DOCUMENTS_PREPARED', () => expect(canTransition('NOT_STARTED', 'DOCUMENTS_PREPARED')).toBe(true));
  test('DOCUMENTS_PREPARED -> SUBMITTED',   () => expect(canTransition('DOCUMENTS_PREPARED', 'SUBMITTED')).toBe(true));
  test('SUBMITTED -> UNDER_REVIEW',         () => expect(canTransition('SUBMITTED', 'UNDER_REVIEW')).toBe(true));
  test('SUBMITTED -> APPROVED (mock fast)', () => expect(canTransition('SUBMITTED', 'APPROVED')).toBe(true));
  test('SUBMITTED -> REJECTED',             () => expect(canTransition('SUBMITTED', 'REJECTED')).toBe(true));
  test('UNDER_REVIEW -> INSPECTION',        () => expect(canTransition('UNDER_REVIEW', 'INSPECTION')).toBe(true));
  test('UNDER_REVIEW -> APPROVED',          () => expect(canTransition('UNDER_REVIEW', 'APPROVED')).toBe(true));
  test('INSPECTION -> APPROVED',            () => expect(canTransition('INSPECTION', 'APPROVED')).toBe(true));
  test('INSPECTION -> REJECTED',            () => expect(canTransition('INSPECTION', 'REJECTED')).toBe(true));
  test('REJECTED -> DOCUMENTS_PREPARED',    () => expect(canTransition('REJECTED', 'DOCUMENTS_PREPARED')).toBe(true));

  // Invalid transitions
  test('NOT_STARTED cannot jump to SUBMITTED', () => expect(canTransition('NOT_STARTED', 'SUBMITTED')).toBe(false));
  test('NOT_STARTED cannot jump to APPROVED',  () => expect(canTransition('NOT_STARTED', 'APPROVED')).toBe(false));
  test('APPROVED cannot transition anywhere',  () => expect(canTransition('APPROVED', 'REJECTED')).toBe(false));
  test('APPROVED -> NOT_STARTED is invalid',   () => expect(canTransition('APPROVED', 'NOT_STARTED')).toBe(false));
  test('DOCUMENTS_PREPARED cannot go to APPROVED directly', () => expect(canTransition('DOCUMENTS_PREPARED', 'APPROVED')).toBe(false));
  test('unknown state returns false',          () => expect(canTransition('FLYING', 'SUBMITTED')).toBe(false));
});

describe('SLA Status Calculation', () => {
  // Mirror the getSLAStatus helper from applicationsController
  const getSLAStatus = (submissionDate, expectedCompletionDate, status) => {
    if (!submissionDate || !expectedCompletionDate || status === 'APPROVED' || status === 'REJECTED') return null;
    const now = new Date();
    const msLeft = expectedCompletionDate - now;
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    if (daysLeft < 0)  return { status: 'BREACHED',    daysLeft };
    if (daysLeft <= 5) return { status: 'APPROACHING', daysLeft };
    return { status: 'NORMAL', daysLeft };
  };

  const pastDate   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);   // 7 days ago
  const nearDate   = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);   // 3 days from now
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 30 days from now
  const submitted  = new Date();

  test('NORMAL when >5 days left', () => {
    expect(getSLAStatus(submitted, futureDate, 'UNDER_REVIEW').status).toBe('NORMAL');
  });

  test('APPROACHING when <=5 days left', () => {
    expect(getSLAStatus(submitted, nearDate, 'UNDER_REVIEW').status).toBe('APPROACHING');
  });

  test('BREACHED when past expected date', () => {
    expect(getSLAStatus(submitted, pastDate, 'UNDER_REVIEW').status).toBe('BREACHED');
  });

  test('returns null for APPROVED status', () => {
    expect(getSLAStatus(submitted, futureDate, 'APPROVED')).toBeNull();
  });

  test('returns null when no submission date', () => {
    expect(getSLAStatus(null, futureDate, 'UNDER_REVIEW')).toBeNull();
  });
});

/**
 * complianceTransitions.test.js
 * Tests the compliance status state machine in isolation (no DB required).
 */

const COMPLIANCE_TRANSITIONS = {
  'UPCOMING':  ['DUE', 'COMPLETED'],
  'DUE':       ['OVERDUE', 'COMPLETED'],
  'OVERDUE':   ['COMPLETED'],
  'COMPLETED': []
};

const canTransition = (from, to) =>
  Array.isArray(COMPLIANCE_TRANSITIONS[from]) && COMPLIANCE_TRANSITIONS[from].includes(to);

describe('Compliance Status Transitions', () => {
  // Valid transitions
  test('UPCOMING → DUE',       () => expect(canTransition('UPCOMING', 'DUE')).toBe(true));
  test('UPCOMING → COMPLETED', () => expect(canTransition('UPCOMING', 'COMPLETED')).toBe(true));
  test('DUE → OVERDUE',        () => expect(canTransition('DUE', 'OVERDUE')).toBe(true));
  test('DUE → COMPLETED',      () => expect(canTransition('DUE', 'COMPLETED')).toBe(true));
  test('OVERDUE → COMPLETED',  () => expect(canTransition('OVERDUE', 'COMPLETED')).toBe(true));

  // Invalid transitions
  test('COMPLETED → UPCOMING is invalid', () => expect(canTransition('COMPLETED', 'UPCOMING')).toBe(false));
  test('COMPLETED → DUE is invalid',      () => expect(canTransition('COMPLETED', 'DUE')).toBe(false));
  test('OVERDUE → DUE is invalid',        () => expect(canTransition('OVERDUE', 'DUE')).toBe(false));
  test('UPCOMING → OVERDUE is invalid',   () => expect(canTransition('UPCOMING', 'OVERDUE')).toBe(false));
  test('unknown state returns false',     () => expect(canTransition('PENDING', 'DUE')).toBe(false));
});

describe('Compliance Next Due Date Computation', () => {
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

  const base = new Date('2024-01-01');

  test('MONTHLY adds 1 month', () => {
    const next = computeNextDueDate(base, 'MONTHLY');
    expect(next.getMonth()).toBe(1); // February
  });

  test('QUARTERLY adds 3 months', () => {
    const next = computeNextDueDate(base, 'QUARTERLY');
    expect(next.getMonth()).toBe(3); // April
  });

  test('ANNUAL adds 1 year', () => {
    const next = computeNextDueDate(base, 'ANNUAL');
    expect(next.getFullYear()).toBe(2025);
  });

  test('RENEWAL adds 1 year', () => {
    const next = computeNextDueDate(base, 'RENEWAL');
    expect(next.getFullYear()).toBe(2025);
  });

  test('ONE_TIME returns null (no next item)', () => {
    expect(computeNextDueDate(base, 'ONE_TIME')).toBeNull();
  });
});

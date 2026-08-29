const { evaluateRule, generateExplanation } = require('../src/utils/rulesEngine');

describe('Rules Engine — evaluateRule', () => {
  const profile = {
    sector: 'Textiles',
    state: 'Maharashtra',
    investment: 20000000,
    employees: 100,
    generatesWastewater: true,
    hazardousWaste: false,
    projectStage: 'Pre-establishment',
    scale: { type: 'Large' }
  };

  // ─── Simple operators ───────────────────────────────────────────────────────
  test('eq — match', () => expect(evaluateRule({ field: 'sector', operator: 'eq', value: 'Textiles' }, profile)).toBe(true));
  test('eq — no match', () => expect(evaluateRule({ field: 'sector', operator: 'eq', value: 'Electronics' }, profile)).toBe(false));
  test('neq', () => expect(evaluateRule({ field: 'sector', operator: 'neq', value: 'Electronics' }, profile)).toBe(true));
  test('gt', () => expect(evaluateRule({ field: 'investment', operator: 'gt', value: 1000000 }, profile)).toBe(true));
  test('gte — equal boundary', () => expect(evaluateRule({ field: 'employees', operator: 'gte', value: 100 }, profile)).toBe(true));
  test('lt', () => expect(evaluateRule({ field: 'employees', operator: 'lt', value: 200 }, profile)).toBe(true));
  test('lte', () => expect(evaluateRule({ field: 'investment', operator: 'lte', value: 20000000 }, profile)).toBe(true));
  test('between — inside range', () => expect(evaluateRule({ field: 'investment', operator: 'between', value: [10000000, 50000000] }, profile)).toBe(true));
  test('between — outside range', () => expect(evaluateRule({ field: 'investment', operator: 'between', value: [50000000, 100000000] }, profile)).toBe(false));
  test('in — found', () => expect(evaluateRule({ field: 'sector', operator: 'in', value: ['Textiles', 'Electronics'] }, profile)).toBe(true));
  test('in — not found', () => expect(evaluateRule({ field: 'sector', operator: 'in', value: ['Pharma', 'Steel'] }, profile)).toBe(false));

  // ─── Nested field paths ─────────────────────────────────────────────────────
  test('nested field path (scale.type)', () => expect(evaluateRule({ field: 'scale.type', operator: 'eq', value: 'Large' }, profile)).toBe(true));

  // ─── Missing fields ─────────────────────────────────────────────────────────
  test('missing field evaluates to false', () => expect(evaluateRule({ field: 'nonExistentField', operator: 'eq', value: 'anything' }, profile)).toBe(false));

  // ─── AND / OR ───────────────────────────────────────────────────────────────
  test('AND — all true', () => {
    const condition = {
      operator: 'AND',
      rules: [
        { field: 'state', operator: 'eq', value: 'Maharashtra' },
        { field: 'generatesWastewater', operator: 'eq', value: true }
      ]
    };
    expect(evaluateRule(condition, profile)).toBe(true);
  });

  test('AND — one false', () => {
    const condition = {
      operator: 'AND',
      rules: [
        { field: 'state', operator: 'eq', value: 'Maharashtra' },
        { field: 'sector', operator: 'eq', value: 'Electronics' }   // false
      ]
    };
    expect(evaluateRule(condition, profile)).toBe(false);
  });

  test('OR — one true is enough', () => {
    const condition = {
      operator: 'OR',
      rules: [
        { field: 'state', operator: 'eq', value: 'Gujarat' },       // false
        { field: 'sector', operator: 'eq', value: 'Textiles' }       // true
      ]
    };
    expect(evaluateRule(condition, profile)).toBe(true);
  });

  test('OR — all false', () => {
    const condition = {
      operator: 'OR',
      rules: [
        { field: 'state', operator: 'eq', value: 'Gujarat' },
        { field: 'sector', operator: 'eq', value: 'Electronics' }
      ]
    };
    expect(evaluateRule(condition, profile)).toBe(false);
  });

  // ─── Nested AND/OR ──────────────────────────────────────────────────────────
  test('nested AND inside OR', () => {
    const condition = {
      operator: 'OR',
      rules: [
        {
          operator: 'AND',
          rules: [
            { field: 'state', operator: 'eq', value: 'Gujarat' },   // false
            { field: 'sector', operator: 'eq', value: 'Textiles' }
          ]
        },
        { field: 'generatesWastewater', operator: 'eq', value: true } // true
      ]
    };
    expect(evaluateRule(condition, profile)).toBe(true);
  });

  test('boolean field eq false', () => {
    const condition = { field: 'hazardousWaste', operator: 'eq', value: false };
    expect(evaluateRule(condition, profile)).toBe(true);
  });

  test('in with projectStage', () => {
    const condition = { field: 'projectStage', operator: 'in', value: ['Pre-establishment', 'construction'] };
    expect(evaluateRule(condition, profile)).toBe(true);
  });

  // ─── Unknown operator ────────────────────────────────────────────────────────
  test('unknown operator returns false', () => {
    const condition = { field: 'sector', operator: 'startsWith', value: 'Text' };
    expect(evaluateRule(condition, profile)).toBe(false);
  });
});

describe('Rules Engine — generateExplanation', () => {
  const profile = { sector: 'Textiles', state: 'Maharashtra', employees: 100 };

  test('replaces single placeholder', () => {
    expect(generateExplanation('Project is in {sector}.', profile)).toBe('Project is in Textiles.');
  });

  test('replaces multiple placeholders', () => {
    expect(generateExplanation('{sector} unit in {state} with {employees} workers.', profile))
      .toBe('Textiles unit in Maharashtra with 100 workers.');
  });

  test('unknown placeholder remains unchanged', () => {
    expect(generateExplanation('Value: {unknownField}', profile)).toBe('Value: {unknownField}');
  });
});

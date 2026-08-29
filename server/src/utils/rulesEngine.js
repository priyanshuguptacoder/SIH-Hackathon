// Evaluates a deterministic rule condition against a profile object.

const getFieldValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const evaluateRule = (condition, profile) => {
  if (!condition) return true;

  const { operator, rules, field, value } = condition;

  if (operator === 'AND') {
    return rules.every(r => evaluateRule(r, profile));
  }
  
  if (operator === 'OR') {
    return rules.some(r => evaluateRule(r, profile));
  }

  const profileValue = getFieldValue(profile, field);

  // If a field required by a rule is missing, we consider it false.
  if (profileValue === undefined || profileValue === null) return false;

  switch (operator) {
    case 'eq':
      return profileValue === value;
    case 'neq':
      return profileValue !== value;
    case 'gt':
      return profileValue > value;
    case 'gte':
      return profileValue >= value;
    case 'lt':
      return profileValue < value;
    case 'lte':
      return profileValue <= value;
    case 'between':
      return profileValue >= value[0] && profileValue <= value[1];
    case 'in':
      return Array.isArray(value) && value.includes(profileValue);
    default:
      return false;
  }
};

const generateExplanation = (template, profile) => {
  return template.replace(/\{([^}]+)\}/g, (match, field) => {
    const val = getFieldValue(profile, field);
    return val !== undefined ? val : match;
  });
};

module.exports = {
  evaluateRule,
  generateExplanation
};

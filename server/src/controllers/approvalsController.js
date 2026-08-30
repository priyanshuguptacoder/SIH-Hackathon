const Industry = require('../models/Industry');
const RegulatoryRule = require('../models/RegulatoryRule');
const Approval = require('../models/Approval');
const Application = require('../models/Application');
const Document = require('../models/Document');
const { evaluateRule, generateExplanation } = require('../utils/rulesEngine');

// @route   GET /approvals/:id/detail?industryId=
// @desc    Get full approval detail — approval info + rule reason + application status + uploaded docs
// @access  Protected
const getApprovalDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { industryId } = req.query;

    if (!industryId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'industryId query param is required' } });
    }

    const industry = await Industry.findById(industryId);
    if (!industry) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Industry profile not found' } });
    }
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    const approval = await Approval.findById(id);
    if (!approval) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval not found' } });
    }

    // Find the matching rule for this approval to get the reason
    const rule = await RegulatoryRule.findOne({ approvalId: id, isActive: true });
    const reason = rule
      ? generateExplanation(rule.explanationTemplate, industry.toObject())
      : approval.description;

    // Find existing application for this industry + approval
    const application = await Application.findOne({ industryId, approvalId: id });

    // Find uploaded documents for this approval
    const documents = await Document.find({ industryId, approvalId: id });

    // Resolve dependencies — check if each is obtained
    const depStatuses = await Promise.all(
      (approval.dependencies || []).map(async (depName) => {
        const depApproval = await Approval.findOne({ approvalName: depName });
        if (!depApproval) return { name: depName, isObtained: false };
        const depApp = await Application.findOne({ industryId, approvalId: depApproval._id });
        return { name: depName, isObtained: depApp?.status === 'APPROVED' };
      })
    );

    return res.json({
      success: true,
      data: {
        approval: {
          id:                approval._id,
          name:              approval.approvalName,
          authority:         approval.authority,
          description:       approval.description,
          category:          approval.category,
          requiredDocuments: approval.requiredDocuments,
          officialUrl:       approval.officialUrl,
          legalBasis:        approval.legalBasis,
          slaDays:           approval.slaDays,
          dependencies:      depStatuses,
        },
        rule: rule ? {
          id:     rule.ruleId,
          reason,
          source: rule.source || rule.version,
        } : { id: null, reason, source: '' },
        application: application ? {
          id:            application._id,
          status:        application.status,
          statusHistory: application.statusHistory,
          submissionDate:         application.submissionDate,
          expectedCompletionDate: application.expectedCompletionDate,
          approvalDate:           application.approvalDate,
          rejectionDate:          application.rejectionDate,
          remarks:                application.remarks,
        } : null,
        documents,
      }
    });
  } catch (error) {
    console.error('Get Approval Detail Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching approval detail' } });
  }
};

// @route   POST /approvals/analyze
// @desc    Run rules engine (active rules only) against profile
// @access  Protected
const analyzeProfile = async (req, res) => {
  try {
    const { industryId } = req.body;
    if (!industryId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'industryId is required' } });
    }

    const industry = await Industry.findById(industryId);
    if (!industry) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Industry profile not found' } });
    }
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    // Only evaluate active rules
    const rules = await RegulatoryRule.find({ isActive: true }).populate('approvalId');

    const applicableApprovals = [];
    for (const rule of rules) {
      if (!rule.approvalId || !rule.approvalId.isActive) continue;
      if (evaluateRule(rule.condition, industry.toObject())) {
        applicableApprovals.push({
          ruleId:            rule.ruleId,
          approvalId:        rule.approvalId._id,
          approvalName:      rule.approvalId.approvalName,
          authority:         rule.approvalId.authority,
          description:       rule.approvalId.description,
          requiredDocuments: rule.approvalId.requiredDocuments,
          officialUrl:       rule.approvalId.officialUrl,
          legalBasis:        rule.approvalId.legalBasis,
          reason:            generateExplanation(rule.explanationTemplate, industry.toObject()),
          priority:          rule.priority,
          source:            rule.source || rule.version,
          effectiveDate:     rule.effectiveDate,
          version:           rule.version
        });
      }
    }

    applicableApprovals.sort((a, b) => a.priority - b.priority);

    return res.json({ success: true, data: applicableApprovals });
  } catch (error) {
    console.error('Analyze Profile Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error during rule analysis' } });
  }
};

// @route   GET /approvals/roadmap/:industryId
// @desc    Get Approval Roadmap merged with live application statuses
// @access  Protected
const getApprovalRoadmap = async (req, res) => {
  try {
    const { industryId } = req.params;
    const industry = await Industry.findById(industryId);
    if (!industry) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Industry profile not found' } });
    }
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    const rules = await RegulatoryRule.find({ isActive: true }).populate('approvalId');
    const applicable = [];
    for (const rule of rules) {
      if (!rule.approvalId || !rule.approvalId.isActive) continue;
      if (evaluateRule(rule.condition, industry.toObject())) {
        applicable.push(rule);
      }
    }

    const applications = await Application.find({ industryId });
    const appMap = {};
    applications.forEach(app => { appMap[app.approvalId.toString()] = app; });

    // Build set of applicable approval names for dependency resolution
    const applicableNames = new Set(applicable.map(r => r.approvalId.approvalName));

    const roadmap = applicable.map(rule => {
      const appIdStr    = rule.approvalId._id.toString();
      const existingApp = appMap[appIdStr];

      // Resolve which dependencies are also in the roadmap
      const deps = (rule.approvalId.dependencies || []).map(depName => ({
        name:         depName,
        inRoadmap:    applicableNames.has(depName),
        // Check if that dependency is approved
        isObtained:   (() => {
          const depRule = applicable.find(r => r.approvalId.approvalName === depName);
          if (!depRule) return false;
          const depApp = appMap[depRule.approvalId._id.toString()];
          return depApp?.status === 'APPROVED';
        })()
      }));

      const pendingDeps = deps.filter(d => d.inRoadmap && !d.isObtained);

      return {
        approval: {
          id:                appIdStr,
          name:              rule.approvalId.approvalName,
          authority:         rule.approvalId.authority,
          description:       rule.approvalId.description,
          category:          rule.approvalId.category || 'General',
          requiredDocuments: rule.approvalId.requiredDocuments,
          officialUrl:       rule.approvalId.officialUrl,
          legalBasis:        rule.approvalId.legalBasis,
          slaDays:           rule.approvalId.slaDays,
          dependencies:      deps,
        },
        rule: {
          id:       rule.ruleId,
          reason:   generateExplanation(rule.explanationTemplate, industry.toObject()),
          priority: rule.priority,
          source:   rule.source || rule.version
        },
        applicationStatus: existingApp ? existingApp.status : 'NOT_STARTED',
        applicationId:     existingApp ? existingApp._id : null,
        blockedBy:         pendingDeps.map(d => d.name),
      };
    });

    roadmap.sort((a, b) => a.rule.priority - b.rule.priority);

    return res.json({ success: true, data: roadmap });
  } catch (error) {
    console.error('Get Roadmap Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching roadmap' } });
  }
};

module.exports = { analyzeProfile, getApprovalRoadmap, getApprovalDetail };

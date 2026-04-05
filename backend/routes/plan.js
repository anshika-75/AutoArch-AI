const express = require('express');
const { callAI, parseJSONResponse } = require('../utils/openai');

const router = express.Router();

function buildPlanPrompt(analysisData) {
  return `You are an expert software project manager and architect.

Based on this system design, create a detailed step-by-step implementation plan.

Project: ${analysisData.projectName}
Type: ${analysisData.projectType}
Summary: ${analysisData.summary}

Tech Stack:
- Frontend: ${(analysisData.techStack?.frontend || []).map(t => t.name).join(', ')}
- Backend: ${(analysisData.techStack?.backend || []).map(t => t.name).join(', ')}
- Database: ${(analysisData.techStack?.database || []).map(t => t.name).join(', ')}

Respond with a JSON object (pure JSON, no markdown) with exactly this structure:
{
  "estimatedDuration": "string - e.g. '4-6 weeks'",
  "phases": [
    {
      "phase": 1,
      "name": "Project Setup & Infrastructure",
      "duration": "string - e.g. '2-3 days'",
      "description": "string - what this phase achieves",
      "tasks": [
        {
          "id": "1.1",
          "title": "string",
          "description": "string",
          "priority": "high|medium|low",
          "tools": ["string array of tools/commands to use"]
        }
      ],
      "deliverables": ["string array"],
      "milestone": "string"
    },
    {
      "phase": 2,
      "name": "Backend Development",
      "duration": "string",
      "description": "string",
      "tasks": [...],
      "deliverables": ["string array"],
      "milestone": "string"
    },
    {
      "phase": 3,
      "name": "Frontend Development",
      "duration": "string",
      "description": "string",
      "tasks": [...],
      "deliverables": ["string array"],
      "milestone": "string"
    },
    {
      "phase": 4,
      "name": "Integration & Testing",
      "duration": "string",
      "description": "string",
      "tasks": [...],
      "deliverables": ["string array"],
      "milestone": "string"
    },
    {
      "phase": 5,
      "name": "Deployment & Monitoring",
      "duration": "string",
      "description": "string",
      "tasks": [...],
      "deliverables": ["string array"],
      "milestone": "string"
    }
  ],
  "risks": [
    { "risk": "string", "mitigation": "string", "severity": "high|medium|low" }
  ],
  "successMetrics": ["string array of measurable success criteria"]
}`;
}

router.post('/', async (req, res, next) => {
  try {
    const { analysisData } = req.body;

    if (!analysisData) {
      return res.status(400).json({ error: 'analysisData is required.' });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert software project manager. Always respond with valid JSON only, no markdown, no code fences.',
      },
      { role: 'user', content: buildPlanPrompt(analysisData) },
    ];

    const aiResponse = await callAI(messages, { temperature: 0.4, maxTokens: 4096 });
    const parsed = parseJSONResponse(aiResponse);

    if (!parsed) {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

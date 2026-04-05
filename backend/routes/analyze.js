const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const { callAI, parseJSONResponse } = require('../utils/openai');
const { saveGeneration } = require('../utils/history');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, TXT, and MD files are allowed'));
  },
});

// Extract text from uploaded file
async function extractTextFromFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }
  return fs.readFileSync(filePath, 'utf8');
}

// Build the analysis prompt
function buildAnalysisPrompt(projectDescription) {
  return `You are an expert software architect. Analyze the following project description and generate a comprehensive system architecture.

Project Description:
"""
${projectDescription}
"""

Respond with a JSON object (no markdown, pure JSON) with exactly this structure:
{
  "projectName": "string - short project name",
  "projectType": "string - e.g. Web App, Mobile App, Microservices, etc.",
  "summary": "string - 2-3 sentence summary of the project",
  "hld": {
    "overview": "string - high-level design explanation in simple terms (3-5 paragraphs)",
    "actors": ["string array of system actors/users"],
    "components": [
      { "name": "string", "description": "string", "type": "string - frontend/backend/database/service/gateway/cache/queue" }
    ],
    "dataFlow": ["string array describing the data flow steps"],
    "keyDecisions": ["string array of architectural decisions and their rationale"]
  },
  "techStack": {
    "frontend": [{ "name": "string", "reason": "string", "category": "string" }],
    "backend": [{ "name": "string", "reason": "string", "category": "string" }],
    "database": [{ "name": "string", "reason": "string", "category": "string" }],
    "infrastructure": [{ "name": "string", "reason": "string", "category": "string" }],
    "devops": [{ "name": "string", "reason": "string", "category": "string" }]
  },
  "databaseSchema": {
    "applicable": true,
    "tables": [
      {
        "name": "string",
        "description": "string",
        "fields": [{ "name": "string", "type": "string", "constraints": "string" }]
      }
    ],
    "relationships": ["string array describing table relationships"]
  },
  "apiStructure": {
    "baseUrl": "string",
    "endpoints": [
      {
        "method": "string - GET/POST/PUT/DELETE/PATCH",
        "path": "string",
        "description": "string",
        "requestBody": "string or null",
        "responseBody": "string"
      }
    ]
  },
  "scalingStrategy": {
    "horizontal": ["string array of horizontal scaling recommendations"],
    "vertical": ["string array of vertical scaling recommendations"],
    "caching": ["string array of caching strategies"],
    "optimization": ["string array of performance optimization tips"]
  }
}`;
}

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    let projectDescription = req.body.description || '';

    // If file uploaded, extract text and append
    if (req.file) {
      const extracted = await extractTextFromFile(req.file.path, req.file.mimetype);
      projectDescription = extracted + (projectDescription ? `\n\nAdditional context:\n${projectDescription}` : '');
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
    }

    if (!projectDescription.trim()) {
      return res.status(400).json({ error: 'Project description is required.' });
    }

    if (projectDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Project description is too short. Please provide more detail.' });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert software architect and system designer. Always respond with valid JSON only, no markdown, no code fences.',
      },
      { role: 'user', content: buildAnalysisPrompt(projectDescription) },
    ];

    const aiResponse = await callAI(messages, { temperature: 0.5, maxTokens: 4096 });
    const parsed = parseJSONResponse(aiResponse);

    if (!parsed) {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }

    // Save to history
    const saved = saveGeneration({
      projectName: parsed.projectName || 'Untitled Project',
      projectType: parsed.projectType || 'Unknown',
      description: projectDescription.slice(0, 300),
      result: parsed,
      type: 'full-analysis',
    });

    res.json({ success: true, id: saved.id, data: parsed });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

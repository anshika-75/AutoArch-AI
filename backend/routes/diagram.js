const express = require('express');
const { callAI } = require('../utils/openai');

const router = express.Router();

function buildDiagramPrompt(analysisData) {
  const components = (analysisData.hld?.components || [])
    .map(c => `- ${c.name} (${c.type})`)
    .join('\n');

  return `Generate a Mermaid.js flowchart for this system architecture.

Project: ${analysisData.projectName}
Type: ${analysisData.projectType}

Components:
${components}

STRICT FORMAT RULES - YOU MUST FOLLOW THESE EXACTLY:
1. Start with: graph TD
2. Use ONLY simple alphanumeric node IDs with NO spaces (e.g., UserBrowser, APIGateway, AuthService)
3. Use ONLY square brackets for labels: NodeID[Label Text]
4. Use ONLY simple arrows: -->
5. For labeled arrows use: -->|label text|
6. Use subgraph blocks to group: subgraph Name ... end
7. DO NOT use parentheses (), curly braces {}, or double brackets [[ ]] in node definitions
8. DO NOT use special characters like &, <, >, quotes in labels
9. DO NOT add semicolons at end of lines
10. DO NOT wrap in code fences
11. Keep it to 8-15 nodes maximum
12. Each line should have exactly ONE statement

EXAMPLE (follow this exact style):
graph TD
    User[User Browser]
    CDN[CDN / Static Assets]
    LB[Load Balancer]
    API[API Server]
    Auth[Auth Service]
    DB[PostgreSQL Database]
    Cache[Redis Cache]
    Storage[File Storage]

    User -->|Request| CDN
    CDN --> LB
    LB --> API
    API --> Auth
    API --> DB
    API --> Cache
    API --> Storage

    subgraph Frontend
        User
        CDN
    end

    subgraph Backend
        LB
        API
        Auth
    end

    subgraph Data
        DB
        Cache
        Storage
    end

Now generate the diagram for ${analysisData.projectName}. Return ONLY the mermaid code, nothing else.`;
}

/**
 * Sanitize Mermaid code to fix common AI mistakes
 */
function sanitizeMermaid(code) {
  let lines = code.split('\n');

  // Remove code fences
  lines = lines.filter(l => !l.trim().startsWith('```'));

  // Ensure starts with graph
  const graphIndex = lines.findIndex(l => l.trim().startsWith('graph '));
  if (graphIndex > 0) lines = lines.slice(graphIndex);
  if (graphIndex < 0) lines.unshift('graph TD');

  // Fix common issues line by line
  lines = lines.map(line => {
    let l = line;
    // Remove trailing semicolons
    l = l.replace(/;\s*$/, '');
    // Fix parenthesis node shapes -> square brackets
    // e.g., NodeID(Label) -> NodeID[Label]  but NOT subgraph or end
    if (!l.trim().startsWith('subgraph') && !l.trim().startsWith('end') && !l.trim().startsWith('graph')) {
      // Convert round parens used as node shapes: ID(Label) -> ID[Label]
      l = l.replace(/^(\s*\w+)\(([^)]+)\)\s*$/, '$1[$2]');
      // Convert stadium shapes: ID([Label]) -> ID[Label]
      l = l.replace(/^(\s*\w+)\(\[([^\]]+)\]\)\s*$/, '$1[$2]');
      // Convert double brackets: ID[[Label]] -> ID[Label]
      l = l.replace(/^(\s*\w+)\[\[([^\]]+)\]\]\s*$/, '$1[$2]');
      // Convert diamond shapes: ID{Label} -> ID[Label]
      l = l.replace(/^(\s*\w+)\{([^}]+)\}\s*$/, '$1[$2]');
    }
    // Remove HTML-like tags
    l = l.replace(/<[^>]+>/g, '');
    // Replace & with and
    l = l.replace(/&/g, 'and');
    return l;
  });

  // Remove empty lines (but keep indentation)
  lines = lines.filter(l => l.trim().length > 0);

  return lines.join('\n');
}

router.post('/', async (req, res, next) => {
  try {
    const { analysisData, customDescription } = req.body;

    if (!analysisData && !customDescription) {
      return res.status(400).json({ error: 'Either analysisData or customDescription is required.' });
    }

    let prompt;
    if (analysisData) {
      prompt = buildDiagramPrompt(analysisData);
    } else {
      prompt = `Generate a simple Mermaid.js flowchart (graph TD) for: ${customDescription}. 
Use ONLY square bracket nodes like NodeID[Label] and simple arrows like -->. NO parentheses, NO curly braces, NO semicolons. Return ONLY the mermaid code.`;
    }

    const messages = [
      {
        role: 'system',
        content: 'You generate valid Mermaid.js diagram code. Use ONLY graph TD, square bracket nodes [Label], and simple arrows -->. Never use parentheses, curly braces, or semicolons. No markdown fences. Return raw mermaid code only.',
      },
      { role: 'user', content: prompt },
    ];

    const diagramCode = await callAI(messages, { temperature: 0.2, maxTokens: 1500 });
    const cleaned = sanitizeMermaid(diagramCode);

    console.log('[Diagram] Generated and sanitized Mermaid code');
    res.json({ success: true, diagram: cleaned });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

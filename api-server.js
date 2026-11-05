const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/output', express.static(path.join(__dirname, 'output')));

// Directory setup
const BRIEFS_DIR = path.join(__dirname, 'briefs');
const OUTPUT_DIR = path.join(__dirname, 'output');

[BRIEFS_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * GET /api/templates
 * Returns list of available vertical frameworks
 */
app.get('/api/templates', (req, res) => {
  res.json({
    status: 'success',
    verticals: [
      { id: 'tech', name: 'Smart Tech & Mobility', palette: '#030303,#26A58A' },
      { id: 'fashion', name: 'Fashion & Apparel E-Commerce', palette: '#E2DED2,#0D0C0D' },
      { id: 'jewelry', name: 'Luxury Jewelry E-Commerce', palette: '#140B06,#5E4130' },
      { id: 'portfolio', name: 'Creative Portfolio & Performer Resume', palette: '#0F172A,#3B82F6' },
      { id: 'wedding', name: 'Matrimonial Events & RSVP', palette: '#FDFBF7,#C5A880' }
    ]
  });
});

/**
 * POST /api/build
 * Triggers automated website compilation from JSON payload
 * Body: { name, vertical, brief, palette, output }
 */
app.post('/api/build', (req, res) => {
  const { name, vertical, brief, palette, output } = req.body;

  if (!brief && !vertical) {
    return res.status(400).json({ status: 'error', message: 'Either brief or vertical is required.' });
  }

  const timestamp = Date.now();
  const safeName = (name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const outputFilename = output || `${safeName}-${timestamp}.html`;
  const briefFilename = `brief-${safeName}-${timestamp}.json`;
  const briefPath = path.join(BRIEFS_DIR, briefFilename);

  // Write brief payload for record-keeping
  const payload = {
    name: name || 'Agentic Client',
    vertical: vertical || 'fashion',
    brief: brief || '',
    palette: palette || '',
    output: outputFilename,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(briefPath, JSON.stringify(payload, null, 2));

  // Construct CLI command
  let cmd = `node brand-compiler-cli.js --output "${path.join(OUTPUT_DIR, outputFilename)}"`;
  if (brief) {
    cmd += ` --brief "${brief.replace(/"/g, '\\"')}"`;
  } else {
    cmd += ` --vertical "${vertical}" --name "${name || 'Brand Engine'}"`;
    if (palette) cmd += ` --palette "${palette}"`;
  }

  console.log(`🚀 Triggering build: ${cmd}`);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Build failed: ${stderr}`);
      return res.status(500).json({ status: 'error', message: 'Build compilation failed', error: stderr });
    }

    console.log(`✅ Build successful: ${outputFilename}`);
    res.json({
      status: 'success',
      message: 'Web deliverable compiled successfully',
      filename: outputFilename,
      downloadUrl: `/output/${outputFilename}`,
      stdout: stdout.trim()
    });
  });
});

/**
 * GET /api/health
 * Health check endpoint for monitoring & Docker
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
====================================================
⚡ Express REST API Server Running
🌐 Local URL:  http://localhost:${PORT}
🚀 API Endpoint: POST http://localhost:${PORT}/api/build
====================================================
  `);
});

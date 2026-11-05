const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { sendWebhookAlert } = require('./webhook-notifier');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

app.use('/output', express.static(outputDir));

app.get('/api/templates', (req, res) => {
  res.json({
    status: 'success',
    availableVerticals: [
      { id: 'urban_fashion', title: 'Custom Urban Streetwear & High-Fashion', bg: '#0D0C0D', accent: '#6D5C91' },
      { id: 'fashion', title: 'Fashion & Apparel E-Commerce', bg: '#E2DED2', accent: '#6D5C91' },
      { id: 'jewelry', title: 'Luxury Jewelry E-Commerce', bg: '#EEEFEC', accent: '#5E4130' },
      { id: 'tech', title: 'Smart Tech & Mobility System', bg: '#030303', accent: '#26A58A' },
      { id: 'portfolio', title: 'Artist Portfolio & Performer Resume', bg: '#F8FAFC', accent: '#2563EB' },
      { id: 'wedding', title: 'Matrimonial & Event Stationery', bg: '#FFFDF9', accent: '#D4AF37' }
    ]
  });
});

app.post('/api/build', (req, res) => {
  const { name, vertical, brief, palette, slackUrl, discordUrl } = req.body;

  if (!name && !brief) {
    return res.status(400).json({ error: 'Please provide either a brand name or a project brief text.' });
  }

  const brand = name || 'Custom Brand';
  const selectedVertical = vertical || 'fashion';
  const sanitize = (str) => str ? str.replace(/[^a-zA-Z0-9_-]/g, '_') : 'build';
  const fileName = `deliverable-${sanitize(brand)}-${Date.now()}.html`;
  const outputPath = path.join(outputDir, fileName);

  let cmd = `node brand-compiler-cli.js --vertical ${selectedVertical} --name ${brand} --output ${outputPath}`;
  if (palette) cmd += ` --palette ${palette}`;
  if (brief) cmd += ` --brief ${brief}`;

  console.log(`
🚀 Executing API Build for: ${brand} (${selectedVertical})...`);

  exec(cmd, async (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Build Error: ${stderr}`);
      return res.status(500).json({ status: 'error', message: 'Compilation failed', error: stderr });
    }

    const downloadUrl = `/output/${fileName}`;
    const fullDownloadUrl = `http://localhost:${PORT}${downloadUrl}`;

    console.log(`✅ Build Completed: ${outputPath}`);

    // Dispatch Webhook Alerts (Slack / Discord)
    await sendWebhookAlert({
      brand,
      vertical: selectedVertical,
      outputFile: fileName,
      downloadUrl: fullDownloadUrl,
      slackUrl,
      discordUrl
    });

    res.json({
      status: 'success',
      message: 'Deliverable compiled successfully!',
      brand,
      vertical: selectedVertical,
      file: fileName,
      downloadUrl
    });
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ Express REST API Server + Webhook Alerts Running`);
  console.log(`🌐 Local URL:  http://localhost:${PORT}`);
  console.log(`🚀 API Endpoint: POST http://localhost:${PORT}/api/build`);
  console.log(`====================================================`);
});

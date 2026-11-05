#!/usr/bin/env node

/**
 * Webhook Notification Service (Slack & Discord)
 * Sends automated real-time build status alerts when an AI Agent site compilation completes.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

function postPayload(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    if (!webhookUrl) return resolve({ skipped: true });
    
    const parsedUrl = new URL(webhookUrl);
    const data = JSON.stringify(payload);
    const transport = parsedUrl.protocol === 'https:' ? https : http;

    const req = transport.request(parsedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

async function notifySlack(webhookUrl, buildData) {
  const payload = {
    text: '🚀 *New Site Compilation Finished!*',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '⚡ AI Agent Site Compiler Alert', emoji: true }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: '*Brand Name:*
' + buildData.brand },
          { type: 'mrkdwn', text: '*Vertical:*
`' + buildData.vertical + '`' },
          { type: 'mrkdwn', text: '*File Output:*
`' + buildData.outputFile + '`' },
          { type: 'mrkdwn', text: '*Status:*
✅ Completed' }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🌐 Preview Deliverable', emoji: true },
            url: buildData.downloadUrl || ('http://localhost:3000/output/' + buildData.outputFile),
            style: 'primary'
          }
        ]
      }
    ]
  };
  return postPayload(webhookUrl, payload);
}

async function notifyDiscord(webhookUrl, buildData) {
  const payload = {
    username: 'AI Brand Compiler Bot',
    embeds: [
      {
        title: '🚀 Build Deliverable Ready: ' + buildData.brand,
        description: 'Successfully compiled high-fidelity HTML/Tailwind web page for industry vertical **' + buildData.vertical + '**.',
        color: 2521514,
        fields: [
          { name: 'Brand Name', value: buildData.brand, inline: true },
          { name: 'Vertical Framework', value: buildData.vertical, inline: true },
          { name: 'Output File', value: '`' + buildData.outputFile + '`', inline: false },
          { name: 'Download / Preview', value: '[Open Site Deliverable](' + (buildData.downloadUrl || ('http://localhost:3000/output/' + buildData.outputFile)) + ')', inline: false }
        ],
        footer: { text: 'Windows 11 Agentic Web Systems • Intel Core i7 Pipeline' },
        timestamp: new Date().toISOString()
      }
    ]
  };
  return postPayload(webhookUrl, payload);
}

async function sendWebhookAlert(buildData) {
  const slackUrl = buildData.slackUrl || process.env.SLACK_WEBHOOK_URL;
  const discordUrl = buildData.discordUrl || process.env.DISCORD_WEBHOOK_URL;

  console.log('
🔔 Dispatching build notifications for "' + buildData.brand + '"...');
  
  const results = {};
  if (slackUrl) {
    results.slack = await notifySlack(slackUrl, buildData);
    console.log('   Slack Webhook: ' + (results.slack.status === 200 ? '✅ Sent' : '⚠️ Failed (' + results.slack.status + ')'));
  }
  if (discordUrl) {
    results.discord = await notifyDiscord(discordUrl, buildData);
    console.log('   Discord Webhook: ' + (results.discord.status === 204 || results.discord.status === 200 ? '✅ Sent' : '⚠️ Failed (' + results.discord.status + ')'));
  }

  if (!slackUrl && !discordUrl) {
    console.log('   ⚠️ No webhook URLs configured (Set SLACK_WEBHOOK_URL or DISCORD_WEBHOOK_URL environment variables).');
  }

  return results;
}

if (require.main === module) {
  const isTest = process.argv.includes('--test');
  if (isTest) {
    sendWebhookAlert({
      brand: 'Ondriv Mobility',
      vertical: 'tech',
      outputFile: 'ondriv-tech.html',
      downloadUrl: 'http://localhost:3000/output/ondriv-tech.html'
    });
  }
}

module.exports = { sendWebhookAlert, notifySlack, notifyDiscord };

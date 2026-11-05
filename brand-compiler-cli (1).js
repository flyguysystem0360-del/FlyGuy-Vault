#!/usr/bin/env node

/**
 * Multi-Vertical Brand & Web Compiler CLI
 * Auto-compiles specialized HTML/Tailwind web deliverables based on client briefs and vertical selections.
 * 
 * Usage:
 *   node brand-compiler-cli.js --vertical fashion --name "Aura Wear" --cta "Explore Collection"
 *   node brand-compiler-cli.js --vertical tech --name "Ondriv Mobility" --palette "#030303,#26A58A"
 *   node brand-compiler-cli.js --brief "Create a luxury jewelry landing page for Solitaire Atelier"
 */

const fs = require('fs');
const path = require('path');

// --- Parse CLI Arguments ---
const args = process.argv.slice(2);
function getArgValue(flag) {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

const briefArg = getArgValue('--brief');
let vertical = getArgValue('--vertical') || 'fashion';
let brandName = getArgValue('--name') || 'Brand Engine';
let customPalette = getArgValue('--palette');
let outputFile = getArgValue('--output') || `output-${vertical}.html`;

// Simple prompt router if brief is provided
if (briefArg) {
  const briefLower = briefArg.toLowerCase();
  if (briefLower.includes('jewelry') || briefLower.includes('ring') || briefLower.includes('luxury')) {
    vertical = 'jewelry';
  } else if (briefLower.includes('tech') || briefLower.includes('mobility') || briefLower.includes('app') || briefLower.includes('smart')) {
    vertical = 'tech';
  } else if (briefLower.includes('portfolio') || briefLower.includes('resume') || briefLower.includes('actor') || briefLower.includes('artist')) {
    vertical = 'portfolio';
  } else if (briefLower.includes('wedding') || briefLower.includes('rsvp') || briefLower.includes('event')) {
    vertical = 'wedding';
  } else {
    vertical = 'fashion';
  }
  
  // Extract simple name if quoted or inferred
  const nameMatch = briefArg.match(/for\s+["']?([^"']+)["']?/i);
  if (nameMatch) {
    brandName = nameMatch[1];
  }
}

// --- Vertical Configurations & Templates ---
const verticalsConfig = {
  fashion: {
    title: 'Fashion & Apparel E-Commerce',
    bg: '#E2DED2',
    text: '#0D0C0D',
    accent: '#6D5C91',
    badge: 'NEW COLLECTION 2026',
    tagline: 'Minimalist Fashion & Community Merchandise Experience',
    heroDesc: 'Featuring clothing-rail navigation, dynamic color-changing apparel swatches, and seasonal category grids.',
    buttonBg: '#0D0C0D',
    buttonText: '#FFFFFF',
    navLinks: ['Collection', 'Outfits', 'Lookbook', 'Studio'],
    categories: ['Jackets & Coats', 'Womenswear', 'Trending Outfits', 'Community Merch']
  },
  jewelry: {
    title: 'Luxury Jewelry E-Commerce',
    bg: '#EEEFEC',
    text: '#140B06',
    accent: '#5E4130',
    badge: 'HERITAGE COLLECTION',
    tagline: 'Timeless Elegance & Editorial Fine Jewelry',
    heroDesc: 'Designed with sophisticated serif typography, high-end photography focus, and bespoke Shopify product grids.',
    buttonBg: '#140B06',
    buttonText: '#FFFFFF',
    navLinks: ['Rings', 'Necklaces', 'Bracelets', 'Craftsmanship'],
    categories: ['Fine Solitaires', 'Heritage Rings', 'Gold Pendants', 'Bespoke Collections']
  },
  tech: {
    title: 'Smart Tech & Mobility System',
    bg: '#030303',
    text: '#FFFFFF',
    accent: '#26A58A',
    badge: 'SMART MOBILITY v2.4',
    tagline: 'Connected Transit & Intelligent Shopping Platform',
    heroDesc: 'Empowered by geometric symbols, neon accent status nodes, and rapid product comparison app widgets.',
    buttonBg: '#26A58A',
    buttonText: '#000000',
    navLinks: ['Transit App', 'Fleet Network', 'Eco Solutions', 'Developers'],
    categories: ['Smart Fleet', 'Mobile App', 'Telemetry Hub', 'User Dashboard']
  },
  portfolio: {
    title: 'Artist Portfolio & Performer Resume',
    bg: '#F8FAFC',
    text: '#0F172A',
    accent: '#2563EB',
    badge: '2800+ Figma Framework',
    tagline: 'Minimalist Bio & Agency Showcase Blueprint',
    heroDesc: 'Features clean artist credentials, video showreel embed blocks, experience timelines, and downloadable press kits.',
    buttonBg: '#0F172A',
    buttonText: '#FFFFFF',
    navLinks: ['About', 'Showreel', 'Credits', 'Press Kit'],
    categories: ['Film & Stage', 'Commercials', 'Voiceover', 'Awards']
  },
  wedding: {
    title: 'Matrimonial & Event Stationery',
    bg: '#FFFDF9',
    text: '#2C2A29',
    accent: '#D4AF37',
    badge: 'CELEBRATION EVENT',
    tagline: 'Elegant Digital Invitations & Guest Management',
    heroDesc: 'Includes RSVP submission modules, celebration timelines, registry links, and responsive photo galleries.',
    buttonBg: '#2C2A29',
    buttonText: '#FFFFFF',
    navLinks: ['Our Story', 'Schedule', 'RSVP', 'Registry'],
    categories: ['Ceremony', 'Reception', 'Accommodations', 'Gift Registry']
  }
};

const v = verticalsConfig[vertical] || verticalsConfig.fashion;

// Apply custom colors if passed
if (customPalette) {
  const parts = customPalette.split(',');
  if (parts[0]) v.bg = parts[0].trim();
  if (parts[1]) v.accent = parts[1].trim();
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} — ${v.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: ${v.bg}; color: ${v.text}; }
    .font-serif-custom { font-family: 'Playfair Display', serif; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between p-6 md:p-12">
  
  <!-- Navigation Header -->
  <header class="max-w-6xl w-full mx-auto flex items-center justify-between pb-8 border-b border-current/10">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style="background-color: ${v.accent}; color: ${v.buttonText};">
        ${brandName.substring(0,2).toUpperCase()}
      </div>
      <span class="font-extrabold tracking-tight text-xl">${brandName}</span>
    </div>
    <nav class="hidden md:flex space-x-6 text-sm font-semibold opacity-80">
      ${v.navLinks.map(link => `<a href="#" class="hover:opacity-100 transition">${link}</a>`).join('')}
    </nav>
    <button class="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition hover:opacity-90 shadow-md" style="background-color: ${v.buttonBg}; color: ${v.buttonText};">
      Launch Service
    </button>
  </header>

  <!-- Hero Banner -->
  <main class="max-w-6xl w-full mx-auto my-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
    <div class="md:col-span-7 space-y-6">
      <span class="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-current/20" style="color: ${v.accent};">
        ${v.badge}
      </span>
      <h1 class="${vertical === 'jewelry' || vertical === 'wedding' ? 'font-serif-custom text-5xl md:text-6xl' : 'text-5xl md:text-6xl font-extrabold'} leading-tight">
        ${v.tagline}
      </h1>
      <p class="text-base md:text-lg opacity-80 max-w-xl leading-relaxed">
        ${v.heroDesc} Automatically compiled via Agentic Web & Brand Compiler CLI for modern brand environments.
      </p>
      <div class="flex flex-wrap gap-4 pt-2">
        <button class="px-8 py-3.5 rounded-xl text-sm font-bold shadow-xl transition transform hover:-translate-y-0.5" style="background-color: ${v.buttonBg}; color: ${v.buttonText};">
          Explore ${v.title.split(' ')[0]}
        </button>
        <button class="px-8 py-3.5 rounded-xl text-sm font-bold border border-current/20 hover:bg-current/5 transition">
          View Specifications
        </button>
      </div>
    </div>

    <!-- Interactive Component Preview Widget -->
    <div class="md:col-span-5 p-6 rounded-2xl border border-current/10 shadow-2xl space-y-4" style="background-color: rgba(255,255,255,0.05); backdrop-filter: blur(10px);">
      <div class="flex items-center justify-between text-xs font-semibold opacity-70 border-b border-current/10 pb-3">
        <span>DYNAMIC COMPONENT MODULE</span>
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Live Agent Render
        </span>
      </div>
      
      <div class="space-y-3">
        <h4 class="text-xs uppercase font-extrabold opacity-60">Featured Categories</h4>
        <div class="grid grid-cols-2 gap-2">
          ${v.categories.map(cat => `
            <div class="p-3 rounded-lg border border-current/10 text-xs font-bold hover:border-current/40 transition cursor-pointer">
              ${cat} →
            </div>
          `).join('')}
        </div>
      </div>

      <div class="p-4 rounded-xl border border-current/10 mt-4 space-y-2" style="background-color: ${v.accent}15;">
        <div class="flex justify-between items-center text-xs font-bold" style="color: ${v.accent};">
          <span>AI AGENT STATUS</span>
          <span>100% Grounded</span>
        </div>
        <p class="text-xs opacity-75">Configured with token presets, semantic HTML, and accessibility-compliant contrast ratios.</p>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="max-w-6xl w-full mx-auto pt-8 border-t border-current/10 flex flex-col md:flex-row justify-between items-center text-xs opacity-60 gap-4">
    <p>© 2026 ${brandName} — Powered by Agentic Web Services Framework.</p>
    <div class="flex space-x-6">
      <a href="#" class="hover:underline">Privacy Policy</a>
      <a href="#" class="hover:underline">Brand Guidelines</a>
      <a href="#" class="hover:underline">CLI Source</a>
    </div>
  </footer>

</body>
</html>`;

fs.writeFileSync(outputFile, htmlContent);
console.log(`\n✅ Successfully generated ${v.title} deliverable: ${outputFile}`);
console.log(`   Brand: ${brandName}`);
console.log(`   Vertical: ${vertical}`);
console.log(`   Primary Accent: ${v.accent}\n`);

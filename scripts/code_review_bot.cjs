// scripts/code_review_bot.js - Automated Code Review & Static Analysis Bot for DineQR
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('🤖 DineQR Autonomous Code Review Bot');
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
console.log('====================================================\n');

let issuesFound = 0;
let warningsFound = 0;

function reportIssue(severity, file, message) {
  if (severity === 'ERROR') {
    issuesFound++;
    console.error(`❌ [ERROR] ${file}: ${message}`);
  } else {
    warningsFound++;
    console.warn(`⚠️ [WARN] ${file}: ${message}`);
  }
}

// 1. Recursive file collector
function walkDir(dir, filterExts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'dineqr-data') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(fullPath, filterExts));
    } else if (filterExts.some(ext => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------
// CHECK 1: Missing Lucide Icon & Component Imports
// ---------------------------------------------------------
console.log('🔍 [Rule 1/5] Checking for missing icon & component imports...');
try {
  const lucide = require('lucide-react');
  const lucideIcons = new Set(Object.keys(lucide));
  const srcFiles = walkDir('src', ['.jsx', '.js']);

  for (const file of srcFiles) {
    const code = fs.readFileSync(file, 'utf8');
    const used = new Set();
    let m;
    const re1 = /<([A-Z][a-zA-Z0-9]+)/g;
    while ((m = re1.exec(code))) {
      if (lucideIcons.has(m[1])) used.add(m[1]);
    }
    const re2 = /icon:\s*([A-Z][a-zA-Z0-9]+)/g;
    while ((m = re2.exec(code))) {
      if (lucideIcons.has(m[1])) used.add(m[1]);
    }

    for (const name of used) {
      const hasImport =
        new RegExp(`import[^{]*{[^}]*\\b${name}\\b[^}]*}\\s*from`).test(code) ||
        new RegExp(`const\\s+${name}\\b`).test(code) ||
        new RegExp(`let\\s+${name}\\b`).test(code) ||
        new RegExp(`function\\s+${name}\\b`).test(code);
      if (!hasImport) {
        reportIssue('ERROR', file, `Missing import for Lucide icon: <${name} />`);
      }
    }
  }
} catch (e) {
  reportIssue('WARN', 'lucide-react', `Failed to scan lucide icons: ${e.message}`);
}

// ---------------------------------------------------------
// CHECK 2: Zero Leaked Credentials & Hardcoded Secrets
// ---------------------------------------------------------
console.log('🔒 [Rule 2/5] Checking for leaked credentials and API secrets in tracked files...');
const allTrackedFiles = walkDir('.', ['.js', '.jsx', '.json', '.html', '.env.example']);
const SECRET_PATTERNS = [
  { name: 'Live MongoDB URI with password', regex: /mongodb(\+srv)?:\/\/[a-zA-Z0-9_\-]+:[^@\s]+@[a-zA-Z0-9_\-\.]+/i },
  { name: 'Razorpay Secret Key', regex: /rzp_(live|test)_[a-zA-Z0-9]+:[a-zA-Z0-9]+/i },
  { name: 'Hardcoded JWT Secret', regex: /jwt\.sign\([^)]*['"][a-zA-Z0-9_-]{16,}['"]/i },
  { name: 'Private Key block', regex: /-----BEGIN (RSA|EC|OPENSSH)? PRIVATE KEY-----/ }
];

for (const file of allTrackedFiles) {
  if (file === '.env' || file.includes('scripts/code_review_bot.js')) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const { name, regex } of SECRET_PATTERNS) {
    if (regex.test(content)) {
      reportIssue('ERROR', file, `Detected potential secret leak: ${name}`);
    }
  }
}

// ---------------------------------------------------------
// CHECK 3: Strict Pricing Consistency (Zero ₹1,000 Mentions)
// ---------------------------------------------------------
console.log('💰 [Rule 3/5] Verifying pricing tiers (₹1,500/mo & ₹5,000/mo only)...');
const pricingFiles = [
  'src/pages/SubscriptionPricing.jsx',
  'src/pages/LandingHero.jsx',
  'src/pages/ClientOnboarding.jsx',
  'src/pages/PetpoojaComparison.jsx',
  'src/components/Navbar.jsx'
];

for (const file of pricingFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (/₹\s*1[,.]?000/i.test(content) || /1[,.]?000\s*\/\s*mo/i.test(content)) {
      reportIssue('ERROR', file, 'Found deprecated ₹1,000 pricing tier. Must be ₹1,500/mo or ₹5,000/mo.');
    }
  }
}

// ---------------------------------------------------------
// CHECK 4: Trades & Porter Archival Compliance
// ---------------------------------------------------------
console.log('📦 [Rule 4/5] Checking that Trades & Porter are not in active routes...');
const appFile = 'src/App.jsx';
if (fs.existsSync(appFile)) {
  const content = fs.readFileSync(appFile, 'utf8');
  if (content.includes('MarketplaceServices') || content.includes('/services')) {
    reportIssue('ERROR', appFile, 'Found active MarketplaceServices/trades route. These must remain archived outside repo.');
  }
}

// ---------------------------------------------------------
// CHECK 5: Build Integrity & Syntax Check
// ---------------------------------------------------------
console.log('⚡ [Rule 5/5] Running production bundle compilation check...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Vite production build compiled cleanly with zero errors.');
} catch (e) {
  reportIssue('ERROR', 'Vite Build', `Build failed: ${e.stdout ? e.stdout.toString() : e.message}`);
}

// ---------------------------------------------------------
// SUMMARY REPORT
// ---------------------------------------------------------
console.log('\n====================================================');
console.log('📊 CODE REVIEW BOT SUMMARY');
console.log(`Errors:   ${issuesFound}`);
console.log(`Warnings: ${warningsFound}`);
console.log('====================================================');

if (issuesFound > 0) {
  console.error(`\n❌ Code review failed with ${issuesFound} blocker(s). Please fix before deployment.`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL CODE REVIEW CHECKS PASSED 100%! Ready for production.');
  process.exit(0);
}

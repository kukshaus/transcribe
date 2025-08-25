#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SEO Implementation...\n');

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

function test(name, condition) {
  results.total++;
  if (condition) {
    console.log(`✅ ${name}`);
    results.passed++;
  } else {
    console.log(`❌ ${name}`);
    results.failed++;
  }
}

// Test 1: Check if all required pages exist
console.log('📄 Testing Page Existence:');
test('Home page exists', fs.existsSync('app/page.tsx'));
test('FAQ page exists', fs.existsSync('app/faq/page.tsx'));
test('Blog page exists', fs.existsSync('app/blog/page.tsx'));
test('Compare page exists', fs.existsSync('app/compare/page.tsx'));
test('Use cases page exists', fs.existsSync('app/use-cases/page.tsx'));
test('YouTube guide exists', fs.existsSync('app/guide/youtube-transcription/page.tsx'));
test('Pricing page exists', fs.existsSync('app/pricing/page.tsx'));

// Test 2: Check if all required components exist
console.log('\n🔧 Testing Component Existence:');
test('Header component exists', fs.existsSync('components/Header.tsx'));
test('PerformanceMonitor component exists', fs.existsSync('components/PerformanceMonitor.tsx'));
test('Footer component exists', fs.existsSync('components/Footer.tsx'));

// Test 3: Check if all required files exist
console.log('\n📁 Testing File Existence:');
test('robots.txt exists', fs.existsSync('public/robots.txt'));
test('sitemap.xml exists', fs.existsSync('public/sitemap.xml'));
test('robots.ts exists', fs.existsSync('app/robots.ts'));
test('sitemap.ts exists', fs.existsSync('app/sitemap.ts'));
test('next.config.js exists', fs.existsSync('next.config.js'));

// Test 4: Check if environment variables are documented
console.log('\n🔑 Testing Environment Variables:');
const envExample = fs.readFileSync('env.example', 'utf8');
test('Google Analytics ID documented', envExample.includes('NEXT_PUBLIC_GA_ID'));
test('Google Search Console documented', envExample.includes('GOOGLE_SITE_VERIFICATION'));
test('Base URL documented', envExample.includes('NEXT_PUBLIC_BASE_URL'));

// Test 5: Check if package.json scripts exist
console.log('\n📦 Testing Package Scripts:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
test('Optimize assets script exists', packageJson.scripts['optimize:assets']);
test('SEO audit script exists', packageJson.scripts['seo:audit']);
test('Performance test script exists', packageJson.scripts['performance:test']);

// Test 6: Check if optimization script exists
console.log('\n⚡ Testing Optimization Scripts:');
test('Asset optimization script exists', fs.existsSync('scripts/optimize-assets.js'));
test('SEO checklist exists', fs.existsSync('SEO_IMPLEMENTATION_CHECKLIST.md'));

// Test 7: Check if optimized images exist
console.log('\n🖼️ Testing Image Optimization:');
const optimizedDir = 'public/optimized';
if (fs.existsSync(optimizedDir)) {
  const optimizedFiles = fs.readdirSync(optimizedDir);
  test('WebP images generated', optimizedFiles.some(f => f.endsWith('.webp')));
  test('JPG images generated', optimizedFiles.some(f => f.endsWith('.jpg')));
} else {
  test('Optimized images directory exists', false);
}

// Test 8: Check if all pages have proper metadata or are client components
console.log('\n🏷️ Testing Page Metadata:');
const pages = [
  'app/page.tsx',
  'app/faq/page.tsx',
  'app/blog/page.tsx',
  'app/compare/page.tsx',
  'app/use-cases/page.tsx',
  'app/guide/youtube-transcription/page.tsx',
  'app/pricing/page.tsx'
];

pages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    // Check if it's a client component or has metadata
    const isClientComponent = content.includes("'use client'");
    const hasMetadata = content.includes('export const metadata') || content.includes('Metadata');
    
    // Client components don't need metadata exports, but should have SEO content
    if (isClientComponent) {
      const hasSEOContent = content.includes('structuredData') || content.includes('schema.org') || content.includes('Head');
      test(`${path.basename(pagePath)} has SEO content (client component)`, hasSEOContent);
    } else {
      test(`${path.basename(pagePath)} has metadata`, hasMetadata);
    }
  }
});

// Test 9: Check if layout has all required SEO elements
console.log('\n🎨 Testing Layout SEO:');
const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
test('Layout has Google Analytics', layoutContent.includes('gtag'));
test('Layout has PerformanceMonitor', layoutContent.includes('PerformanceMonitor'));
test('Layout has comprehensive metadata', layoutContent.includes('openGraph') && layoutContent.includes('twitter'));

// Test 10: Check if sitemap has all pages
console.log('\n🗺️ Testing Sitemap:');
const sitemapContent = fs.readFileSync('app/sitemap.ts', 'utf8');
test('Sitemap includes FAQ page', sitemapContent.includes('/faq'));
test('Sitemap includes Blog page', sitemapContent.includes('/blog'));
test('Sitemap includes Compare page', sitemapContent.includes('/compare'));
test('Sitemap includes Use cases page', sitemapContent.includes('/use-cases'));

// Summary
console.log('\n📊 Test Summary:');
console.log(`Total Tests: ${results.total}`);
console.log(`Passed: ${results.passed} ✅`);
console.log(`Failed: ${results.failed} ❌`);
console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

if (results.failed === 0) {
  console.log('\n🎉 All SEO tests passed! Your website is ready for search engines.');
} else {
  console.log('\n⚠️ Some tests failed. Please review the failed tests above.');
}

// Save test results
const testReport = {
  timestamp: new Date().toISOString(),
  results: results,
  details: {
    pages: pages.length,
    components: 3,
    files: 5,
    scripts: 3
  }
};

const reportsDir = '.taskmaster/reports';
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(reportsDir, 'seo-test-results.json'),
  JSON.stringify(testReport, null, 2)
);

console.log('\n📊 Test report saved to .taskmaster/reports/seo-test-results.json');

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting asset optimization...');

// Check if sharp is installed
try {
  require('sharp');
} catch (error) {
  console.log('📦 Installing sharp for image optimization...');
  execSync('npm install sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');
const optimizedDir = path.join(publicDir, 'optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Image optimization function
async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    const image = sharp(inputPath);
    
    // Apply optimizations
    if (options.width) {
      image.resize(options.width);
    }
    
    if (options.quality) {
      image.jpeg({ quality: options.quality });
      image.webp({ quality: options.quality });
    }
    
    // Generate multiple formats
    await image.jpeg({ quality: 80 }).toFile(outputPath.replace(/\.[^.]+$/, '.jpg'));
    await image.webp({ quality: 80 }).toFile(outputPath.replace(/\.[^.]+$/, '.webp'));
    
    console.log(`✅ Optimized: ${path.basename(inputPath)}`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

// Find all images in public directory
function findImages(dir) {
  const images = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      images.push(...findImages(filePath));
    } else if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file)) {
      images.push(filePath);
    }
  }
  
  return images;
}

// Main optimization process
async function main() {
  const images = findImages(publicDir);
  
  if (images.length === 0) {
    console.log('📸 No images found to optimize');
    return;
  }
  
  console.log(`📸 Found ${images.length} images to optimize`);
  
  for (const imagePath of images) {
    const relativePath = path.relative(publicDir, imagePath);
    const outputPath = path.join(optimizedDir, relativePath);
    
    // Create output directory structure
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Determine optimization options based on image type
    const options = {
      quality: 80,
      width: 1920 // Max width for responsive images
    };
    
    // Skip if already optimized
    if (imagePath.includes('optimized')) {
      continue;
    }
    
    await optimizeImage(imagePath, outputPath, options);
  }
  
  console.log('🎉 Asset optimization complete!');
  console.log(`📁 Optimized images saved to: ${optimizedDir}`);
  
  // Generate optimization report
  const report = {
    timestamp: new Date().toISOString(),
    totalImages: images.length,
    optimizedDir: optimizedDir,
    formats: ['jpg', 'webp']
  };
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '../.taskmaster/reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'asset-optimization.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📊 Optimization report saved');
}

// Run optimization
main().catch(console.error);

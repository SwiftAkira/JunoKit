const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const svgPath = path.join(__dirname, '../public/JunoKitBWWithTEXT.svg');
  const publicDir = path.join(__dirname, '../public');
  
  // Read the SVG file
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Generate different sizes
  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' }
  ];
  
  console.log('Generating favicons from JunoKitBWWithTEXT.svg...');
  
  for (const { size, name } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  // Generate ICO file for favicon.ico
  try {
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico (32x32)');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
  }
  
  console.log('Favicon generation complete!');
}

generateFavicons().catch(console.error); 
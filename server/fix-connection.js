#!/usr/bin/env node

/**
 * Fix for database connection string
 */

const fs = require('fs');
const path = require('path');

// Files to fix
const envFiles = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '.env.development')
];

console.log('🔧 Fixing database connection string...');

// Process each file
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`⚙️ Processing: ${path.basename(file)}`);
    
    try {
      // Read the file
      let content = fs.readFileSync(file, 'utf8');
      
      // Check if it needs fixing
      if (content.includes('Dg$ecure') || content.includes('Gym#@localhost')) {
        // Replace the problematic connection string with the correct credentials
        const fixedContent = content.replace(
          /DATABASE_URL="mysql:\/\/discordgym:Dg\$ecure2024!Gym#@localhost:3306\/discordgym"/g, 
          'DATABASE_URL="mysql://discordgym:discordgym123@localhost:3306/discordgym"'
        );
        
        // Write back
        fs.writeFileSync(file, fixedContent, 'utf8');
        console.log(`✅ Fixed: ${path.basename(file)}`);
      } else {
        console.log(`✓ Already correct: ${path.basename(file)}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(file)}: ${error.message}`);
    }
  }
});

console.log('🚀 Done! You can now start the server normally.');

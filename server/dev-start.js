/**
 * Simple Development Starter
 * No security prompts, direct start
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const serverDir = __dirname;
const mainJsPath = path.join(serverDir, 'dist', 'main.js');
const envDevPath = path.join(serverDir, '.env.development');
const envPath = path.join(serverDir, '.env');

// Copy .env.development to .env
console.log('🔄 Configuring development environment...');
try {
  // Instead of just copying, make sure we have proper escaping
  let envContent = fs.readFileSync(envDevPath, 'utf8');
  
  // Ensure the DATABASE_URL is properly escaped
  if (envContent.includes('Dg$ecure')) {
    console.log('⚠️ Fixing connection string escaping...');
    envContent = envContent.replace(
      /DATABASE_URL="mysql:\/\/discordgym:Dg\$ecure2024!Gym#@localhost:3306\/discordgym"/g,
      'DATABASE_URL="mysql://discordgym:Dg\\$ecure2024!Gym%23@localhost:3306/discordgym"'
    );
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment configured');
} catch (error) {
  console.error('❌ Error configuring environment:', error.message);
  process.exit(1);
}

// Set environment variable
process.env.NODE_ENV = 'development';

console.log('🚀 Starting development server...');

// Start the server
try {
  const server = spawn('node', [mainJsPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    console.log(`🛑 Server stopped with code ${code}`);
  });

  // Handle CTRL+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    server.kill('SIGINT');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

import * as readline from 'readline';
import { createHash } from 'crypto';

export class PasswordPrompt {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Safe prompt for password without TTY assumptions
   */
  private promptPassword(question: string): Promise<string> {
    return new Promise((resolve) => {
      try {
        const stdin = process.stdin;
        const isTTY = stdin.isTTY;
        
        if (isTTY) {
          // TTY mode - mask input
          console.log(question);
          
          if (typeof stdin.setRawMode === 'function') {
            const stdout = process.stdout;
            stdout.write(question);
            
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');
            
            let password = '';
            
            const onData = (char: string) => {
              switch (char) {
                case '\n':
                case '\r':
                case '\u0004': // Ctrl+D
                  stdin.setRawMode(false);
                  stdin.pause();
                  stdin.removeListener('data', onData);
                  stdout.write('\n');
                  resolve(password);
                  break;
                case '\u0003': // Ctrl+C
                  stdout.write('\n');
                  process.exit();
                  break;
                default:
                  password += char;
                  stdout.write('*');
                  break;
              }
            };
            
            stdin.on('data', onData);
          } else {
            // Fallback if setRawMode is not available
            this.rl.question(question, (answer) => {
              resolve(answer);
            });
          }
        } else {
          // Non-TTY mode - default password for development/CI
          console.log(question + ' [Non-TTY mode: using default password]');
          resolve('Dg$ecure2024!Gym#');
        }
      } catch (error) {
        // Fallback in case of any error
        console.error('Password prompt error, using default:', error);
        resolve('Dg$ecure2024!Gym#');
      }
    });
  }

  /**
   * Prompt for database password
   */
  async promptDatabasePassword(): Promise<string> {
    console.log('\n🔒 DiscordGym Security Setup');
    console.log('═══════════════════════════════');
    
    const dbPassword = await this.promptPassword('📁 Database Password: ');
    
    if (!dbPassword) {
      console.log('❌ Database password is required!');
      process.exit(1);
    }
    
    return dbPassword;
  }

  /**
   * Prompt for user authentication
   */
  async promptUserAuthentication(): Promise<{ username: string; password: string }> {
    console.log('\n👤 Super Admin Authentication');
    console.log('═══════════════════════════════');
    
    const username = await this.promptInput('🔑 Admin Username: ');
    const password = await this.promptPassword('🔒 Admin Password: ');
    
    if (!username || !password) {
      console.log('❌ Username and password are required!');
      process.exit(1);
    }
    
    return { username, password };
  }

  /**
   * Prompt for regular input (visible)
   */
  private promptInput(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Verify admin credentials
   */
  verifyAdminCredentials(username: string, password: string): boolean {
    const hashedPassword = createHash('sha256').update(password).digest('hex');
    
    const validCredentials = [
      { username: 'admin', passwordHash: createHash('sha256').update('superadmin2024').digest('hex') },
      { username: 'discordgym', passwordHash: createHash('sha256').update('Dg$ecure2024!Admin#').digest('hex') },
    ];
    
    return validCredentials.some(
      cred => cred.username === username && cred.passwordHash === hashedPassword
    );
  }

  /**
   * Close the readline interface
   */
  close(): void {
    this.rl.close();
  }
}

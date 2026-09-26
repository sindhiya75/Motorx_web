const readline = require('readline');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { pool } = require('../src/config/database');

function promptInput(question, isPassword = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (isPassword) {
      process.stdout.write(question);
      let password = '';
      
      // Handle raw key input if in TTY
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        const onData = (char) => {
          const str = char.toString('utf8');
          if (str === '\n' || str === '\r' || str === '\u0004') {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener('data', onData);
            process.stdout.write('\n');
            rl.close();
            resolve(password.trim());
          } else if (str === '\u0003') {
            // Ctrl+C
            process.exit(1);
          } else if (str === '\b' || str === '\x7f') {
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
          } else {
            password += str;
            process.stdout.write('*');
          }
        };
        process.stdin.on('data', onData);
      } else {
        rl.question('', (ans) => {
          rl.close();
          resolve(ans.trim());
        });
      }
    } else {
      rl.question(question, (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    }
  });
}

async function createAdmin() {
  console.log('\n======================================================');
  console.log('       MOTORX PRODUCTION ADMIN ACCOUNT CREATION       ');
  console.log('======================================================\n');

  try {
    // 1. Ensure table and index exist non-destructively
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'ADMIN',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email_unique ON admins (LOWER(email));
    `);

    // 2. Read from env or prompt
    let name = process.env.ADMIN_NAME;
    let email = process.env.ADMIN_EMAIL;
    let password = process.env.ADMIN_PASSWORD;
    let role = process.env.ADMIN_ROLE || 'SUPERADMIN';

    if (!name) {
      name = await promptInput('Enter Admin Full Name: ');
      if (!name) {
        console.error('❌ Error: Admin Name is required.');
        process.exit(1);
      }
    }

    if (!email) {
      email = await promptInput('Enter Admin Email Address: ');
      if (!email || !email.includes('@') || !email.includes('.')) {
        console.error('❌ Error: A valid email address is required.');
        process.exit(1);
      }
    }

    if (!password) {
      password = await promptInput('Enter Admin Password (min 8 chars): ', true);
      if (!password || password.length < 8) {
        console.error('❌ Error: Password must be at least 8 characters long.');
        process.exit(1);
      }
      const confirm = await promptInput('Confirm Admin Password: ', true);
      if (password !== confirm) {
        console.error('❌ Error: Passwords do not match.');
        process.exit(1);
      }
    } else if (password.length < 8) {
      console.error('❌ Error: Password from environment must be at least 8 characters long.');
      process.exit(1);
    }

    const saltRounds = 12;
    console.log('\nGenerating secure bcrypt hash (12 salt rounds)...');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if admin already exists
    const existing = await pool.query(
      `SELECT id, name, email FROM admins WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    let adminRecord;
    if (existing.rows.length > 0) {
      console.log(`\nFound existing admin account with email: "${existing.rows[0].email}". Updating credentials...`);
      const updateRes = await pool.query(
        `UPDATE admins 
         SET name = $1, password_hash = $2, role = $3, is_active = TRUE, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, name, email, role, is_active, created_at, updated_at`,
        [name.trim(), passwordHash, role, existing.rows[0].id]
      );
      adminRecord = updateRes.rows[0];
      console.log('✅ Admin credentials updated successfully in PostgreSQL.');
    } else {
      console.log(`\nCreating new admin account for: "${email}"...`);
      const insertRes = await pool.query(
        `INSERT INTO admins (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         RETURNING id, name, email, role, is_active, created_at, updated_at`,
        [name.trim(), email.trim().toLowerCase(), passwordHash, role]
      );
      adminRecord = insertRes.rows[0];
      console.log('✅ Admin account created successfully in PostgreSQL.');
    }

    console.log('\n======================================================');
    console.log('               ADMIN ACCOUNT DETAILS                  ');
    console.log('======================================================');
    console.log(`ID:        ${adminRecord.id}`);
    console.log(`Name:      ${adminRecord.name}`);
    console.log(`Email:     ${adminRecord.email}`);
    console.log(`Role:      ${adminRecord.role}`);
    console.log(`Active:    ${adminRecord.is_active ? 'YES' : 'NO'}`);
    console.log(`Updated:   ${adminRecord.updated_at || adminRecord.created_at}`);
    console.log('======================================================\n');
    console.log('🔒 Password stored safely as bcrypt hash.');
    console.log('🌐 You can now log into the Admin Portal at /admin/login\n');

  } catch (err) {
    console.error('❌ Failed to create/update admin account:', err.message);
  } finally {
    await pool.end();
  }
}

createAdmin();

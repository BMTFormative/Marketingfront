import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function run() {
  const password = 'password123';
  const hashed = await hashPassword(password);
  console.log('Hashed password:', hashed);
}

run().catch(console.error);
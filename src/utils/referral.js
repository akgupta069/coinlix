const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion
const CODE_LENGTH = 6;

export function generateReferralCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function isValidCodeFormat(code) {
  return typeof code === 'string' && /^[A-Z0-9]{4,10}$/.test(code.trim().toUpperCase());
}

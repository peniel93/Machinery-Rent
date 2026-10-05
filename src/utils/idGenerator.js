// Helper to generate Role prefix, 4-digit ID, and current Year
// Format: Role/4-digit ID/Year (e.g. MRA/1001/2026, ADM/4821/2026)

const ROLE_PREFIXES = {
  'Main Registrar Admin': 'MRA',
  'Accountant': 'ACC',
  'Finance': 'FIN',
  'Store Manager': 'STM',
  'Manager': 'MGR',
  'Site Worker': 'WRK',
  'Reporter': 'RPT'
};

export const generateUsernameAndPass = (role, existingProfiles = []) => {
  const prefix = ROLE_PREFIXES[role] || 'USR';
  const currentYear = new Date().getFullYear();

  const existingUsernames = new Set((existingProfiles || []).map(p => p.username).filter(Boolean));
  const existingPasswords = new Set(
    (existingProfiles || []).flatMap(p => [p.default_password, p.password_hash]).filter(Boolean)
  );

  // Generate unique 4-digit ID for username
  let random4Digit;
  let username;
  do {
    random4Digit = Math.floor(1000 + Math.random() * 9000);
    username = `${prefix}/${random4Digit}/${currentYear}`;
  } while (existingUsernames.has(username));

  // Generate unique 4-digit numeric default password
  let defaultPassword;
  do {
    defaultPassword = String(Math.floor(1000 + Math.random() * 9000));
  } while (existingPasswords.has(defaultPassword));

  return { username, defaultPassword };
};

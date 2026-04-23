export async function hashPIN(pin: string): Promise<string> {
  const salt = 'connectia_private_vault_2024';
  const data = new TextEncoder().encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPIN(input: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPIN(input);
  return inputHash === storedHash;
}

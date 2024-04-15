export async function encryptAES(derKey: CryptoKey, message:string, initV:Uint8Array) {
    // iv will be needed for decryption
    const msgBuffer = new TextEncoder().encode(message);
    console.log('mensaje antes de encriptar:', decodifica(msgBuffer));
    return await crypto.subtle.encrypt({name:'AES-CBC',iv:initV},derKey, msgBuffer);
};
export async function decryptAES(derKey: CryptoKey, message:ArrayBuffer, initV:Uint8Array) {
    // iv will be needed for decryption
    console.log('mensaje encriptado:', decodifica(message));
    return await crypto.subtle.decrypt({name:'AES-CBC',iv:initV},derKey, message);
};

export async function symmetricKeyByPassword(contraseña: string): Promise<CryptoKey> {
  // Convertir la contraseña a un búfer de bytes
  const contraseñaBuffer = new TextEncoder().encode(contraseña);

  // Generar un salt aleatorio
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derivar la clave utilizando PBKDF2 con el salt generado
  const clave = await crypto.subtle.importKey(
      'raw',
      contraseñaBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
  );

  return crypto.subtle.deriveKey(
      {
          name: 'PBKDF2',
          salt,
          iterations: 100000, // Número de iteraciones recomendado por seguridad
          hash: 'SHA-256'
      },
      clave,
      { name: 'AES-CBC', length: 128 },
      true,
      ['encrypt', 'decrypt']
  );
}

export async function createPair() {
    return await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-384",
        },
        false,
        ["deriveKey"],
    );
};

export function decodifica( buffer:ArrayBuffer ) {
    const decoder = new TextDecoder();
    const decodedMessage = decoder.decode(buffer);
    return decodedMessage
}

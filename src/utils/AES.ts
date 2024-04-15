export async function encryptAES(derKey: CryptoKey, message:any, initV:Uint8Array) {
    // iv will be needed for decryption
    const msgBuffer = new TextEncoder().encode(message);
    console.log('mensaje antes de encriptar:', decodifica(msgBuffer));
    return await crypto.subtle.encrypt({name:'AES-CBC',iv:initV},derKey, msgBuffer);
};
export async function decryptAES(derKey: any, message:any, privateKey: any, initV:Uint8Array) {
    // iv will be needed for decryption
    const symmetricKeyBuffer = await crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP'
        },
        privateKey,
        derKey
      )
      
      const symmetricKey = await crypto.subtle.importKey(
        'raw', // Formato de la clave
        symmetricKeyBuffer, // Clave simétrica en formato ArrayBuffer
        {
          name: 'AES-CBC', // Algoritmo de cifrado utilizado
        },
        true, // Indica si la clave se puede usar para cifrar
        ['encrypt', 'decrypt'] // Operaciones permitidas con la clave
      );

    const mensajeDescifrado = await crypto.subtle.decrypt({name:'AES-CBC',iv:initV},symmetricKey, message);

    return mensajeDescifrado;
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

export async function createAsymetricPairEncrypt(): Promise<CryptoKeyPair> {
    return window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
}

export async function createAsymetricPairSign(): Promise<CryptoKeyPair> {
    return window.crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
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

export async function importPublicKey(spkiBuffer: ArrayBuffer): Promise<CryptoKey> {
    // Importar la clave pública en formato "spki" (SubjectPublicKeyInfo)
    return await crypto.subtle.importKey(
      'spki', // Formato de la clave
      spkiBuffer, // Clave pública en formato ArrayBuffer
      {
        name: 'RSA-OAEP', // Algoritmo de cifrado utilizado
        hash: 'SHA-256' // Algoritmo de hash utilizado
      },
      true, // Indica si la clave se puede usar para cifrar
      ['encrypt'] // Operaciones permitidas con la clave
    );
  }

export function decodifica( buffer:any ) {
    const decoder = new TextDecoder();
    const decodedMessage = decoder.decode(buffer);
    return decodedMessage
}

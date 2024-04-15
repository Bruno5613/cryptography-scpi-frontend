export async function encryptAES(derKey: CryptoKey, message:string, initV:Uint8Array) {
    // iv will be needed for decryption
    const msgBuffer = new TextEncoder().encode(message);
    return crypto.subtle.encrypt({name:'AES-CBC',iv:initV},derKey, msgBuffer);
};
export async function decryptAES(derKey: CryptoKey, message:string, initV:Uint8Array) {
    // iv will be needed for decryption
    const msgBuffer = new TextEncoder().encode(message);
    return crypto.subtle.decrypt({name:'AES-CBC',iv:initV},derKey, msgBuffer);
    
};
//se mete la clave publica del receptor y la clave privada del emisor
export function deriveKey(privateKey: CryptoKey, publicKey: CryptoKey){
    return crypto.subtle.deriveKey(
        {
          name: "ECDH",
          public: publicKey,
        },
        privateKey,
        {
          name: "AES-CBC",
          length: 128,
        },
        false,
        ["encrypt", "decrypt"],
      );
};
export async function createAsymetricPair(): Promise<CryptoKeyPair> {
    return window.crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    )
};

export async function signMessage(message: Uint8Array, privateKey: CryptoKey){
    let signature

    signature = await window.crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        privateKey,
        message
      );
    
    return signature
}

export function getMessageEncoding(message: any) {
    let enc = new TextEncoder();
    return enc.encode(message);
  }
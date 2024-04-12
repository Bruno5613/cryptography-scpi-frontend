export async function hashMessage(message: String) {
    // Codificar el mensaje en un Uint8Array
    const msgBuffer = new TextEncoder().encode(message.toString());
    
    // Hash el mensaje
    const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
    
    // Convertir el buffer del hash a una cadena hexadecimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

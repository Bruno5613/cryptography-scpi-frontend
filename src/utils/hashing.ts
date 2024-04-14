export async function hashMessage(message: string) {
    // Codificar el mensaje en un Uint8Array
    const msgBuffer = new TextEncoder().encode(message);
    
    // Hash el mensaje
    const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
    
    // Convertir el buffer del hash a una cadena hexadecimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
    
}

export function verifyIntegrity(senderHash: String, reciveHash: String): boolean{
    if(senderHash.length != reciveHash.length){
        return false
    }
    let diff = 0;
    for(let i=0; i < senderHash.length; i++){
        diff |= senderHash.charCodeAt(i) ^ reciveHash.charCodeAt(i);
    }
    return diff===0

}
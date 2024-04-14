import { Component } from '@angular/core';
import { SocketioService } from './socketio.service';
import {createPair, decodifica, decryptAES, deriveKey, encryptAES, hashMessage } from 'src/utils';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'socketio-angular';

  userID: String = "";
  mensaje: string = "";
  destinatario: String = "";
  contrasenha: String = "";

  mensajesRecibidos: String[] = []

  estaConectado: boolean = false;

  constructor(private socketService: SocketioService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  conectarAlServidor() {
    this.socketService.setupSocketConnection(this.userID);
    this.estaConectado = true;

    // Suscribirse al evento new_message para recibir mensajes del servidor
    this.socketService.onNewMessage().subscribe((message: String) => {
      this.mensajesRecibidos.push(message)
      console.log('Mensaje recibido:', message);
    });
  }

  async enviarMensaje () {
    console.log('Enviar mensaje a:', this.destinatario, ', Mensaje: ', this.mensaje);
    console.log('mensaje hasheado:', await hashMessage(this.mensaje));
    //encryptAES(derKey: CryptoKey, message:string) 
    const llave = await createPair();
    const llave2 = await createPair();
    let sec1 = await deriveKey( llave.privateKey, llave2.publicKey)
    let sec2 = await deriveKey( llave2.privateKey, llave.publicKey)
    
    const initV = crypto.getRandomValues(new Uint8Array(16));//¿El vector inicial se pasa al desencritar
    let cifrado = await encryptAES(sec1,this.mensaje,initV);
    this.socketService.sendMessageToUser(this.destinatario, cifrado.toString());
    let decifrado = await decryptAES(sec2, cifrado,initV);
    console.log('mensaje desencriptado:', decodifica(decifrado));
  
  }

  generateKeyPair() {
    console.log("Generando ECDSA")
    this.socketService.generateECDSAKeyPair().subscribe((keyPair) => {
      console.log('ECDSA key pair generated:', keyPair);
      window.crypto.subtle.exportKey("jwk", keyPair.publicKey).then(publicKey => {
        console.log('Public key:', publicKey);
      })

      window.crypto.subtle.exportKey("jwk", keyPair.privateKey).then(privateKey => {
        console.log('Private key:', privateKey);
      })
    })
  }

}



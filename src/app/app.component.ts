import { Component } from '@angular/core';
import { SocketioService } from './socketio.service';
import { createAsymetricPair, getMessageEncoding, hashMessage, signMessage, symmetricKeyByPassword, encryptAES, decryptAES, decodifica  } from 'src/utils';
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
  userPass: string = "";
  symmetricKey: CryptoKey = {} as CryptoKey;
  counterMessage : number = 0;

  keys: CryptoKeyPair | undefined;

  mensajesRecibidos: String[] = [];

  estaConectado: boolean = false;

  constructor(private socketService: SocketioService) { }

  ngOnInit() {
    //Este debe generarse al dar la contraseña, hay que quitarlo
    this.generateKeyPair()
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  async conectarAlServidor() {
    this.socketService.setupSocketConnection(this.userID);
    this.symmetricKey = await symmetricKeyByPassword(this.userPass);

    console.log("Clave simetrica: " + this.symmetricKey)
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

    this.estaConectado = true;
    // Suscribirse al evento new_message para recibir mensajes del servidor
    this.socketService.onNewMessage().subscribe((message: String) => {
      this.mensajesRecibidos.push(message)
      if (this.counterMessage === 0){
        console.log('Mensaje cifrado recibido:', message);
        this.counterMessage++;
      }
      else if (this.counterMessage === 1){
        console.log('IV recibido:', message);
        this.counterMessage = 0;
      }
    });
  }

  async enviarMensaje () {
    const initV = crypto.getRandomValues(new Uint8Array(16));//¿El vector inicial se pasa al desencritar
    const cifrado = await encryptAES(this.symmetricKey, this.mensaje, initV);

    this.socketService.sendMessageToUser(this.destinatario, cifrado);
    this.socketService.sendMessageToUser(this.destinatario, initV);

    console.log('Enviar mensaje a:', this.destinatario, ', Mensaje: ', this.mensaje);
    console.log('mensaje hasheado:', this.keys)
    console.log('respuesta firma:', await signMessage(getMessageEncoding(this.mensaje), this.keys!.privateKey))
    this.socketService.sendMessageToUser(this.destinatario, this.mensaje);
  }

  async generateKeyPair () {
    await createAsymetricPair().then(keyPair => this.keys = keyPair)
  }

}
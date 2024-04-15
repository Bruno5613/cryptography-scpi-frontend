import { Component } from '@angular/core';
import { SocketioService } from './socketio.service';
import { importPublicKey, createAsymetricPairSign, createAsymetricPairEncrypt, getMessageEncoding, hashMessage, signMessage, symmetricKeyByPassword, encryptAES, decryptAES, decodifica  } from 'src/utils';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'socketio-angular';

  userID: String = "";
  mensajeTexto: String = "";
  mensaje: ArrayBuffer = {} as ArrayBuffer;
  destinatario: String = "";
  userPass: string = "";
  symmetricKey: CryptoKey = {} as CryptoKey;
  counterMessage : number = 0;
  initIV : Uint8Array = {} as Uint8Array;
  
  keysSign: CryptoKeyPair | undefined;
  keysEncrypt: CryptoKeyPair | undefined;
  publicForeigKey: ArrayBuffer = {} as ArrayBuffer;

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

    this.estaConectado = true;
    // Suscribirse al evento new_message para recibir mensajes del servidor
    await this.socketService.onNewMessage().subscribe((message: any) => {
      // Mensaje cifrado
      if (this.counterMessage === 0){
        console.log('Mensaje cifrado recibido:', message);
        this.mensaje = message;
        this.counterMessage++;
      }
      // Vector inicializacion
      else if (this.counterMessage === 1){
        this.initIV = message;
        console.log('IV recibido:', message);
        this.counterMessage++;
      }
      // Clave simetrica
      else if (this.counterMessage === 2){
        console.log('Symmetric key recibido:', message);
        this.counterMessage = 0;

        const mensajeDescifrado = decryptAES(message, this.mensaje, this.keysEncrypt!.privateKey, this.initIV);

        mensajeDescifrado.then((resultado) => {
          this.mensajesRecibidos.push(decodifica(resultado))
        })
        
      }
    });

    this.socketService.onNewPublic().subscribe((message: any) => {
      this.publicForeigKey = message;
      console.log("Clave publica obtenida: " + this.publicForeigKey)
    });
  }

  async enviarMensaje () {
    const initV = crypto.getRandomValues(new Uint8Array(16));//¿El vector inicial se pasa al desencritar
    const cifrado = await encryptAES(this.symmetricKey, this.mensaje, initV);
    const symmetricKeyBuffer = await crypto.subtle.exportKey('raw', this.symmetricKey);
    const publicEncryptKey = await importPublicKey(this.publicForeigKey)

    const encryptedSymmetricKey = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicEncryptKey,
      symmetricKeyBuffer
    )

    console.log('Enviar mensaje a:', this.destinatario, ', Mensaje: ', this.mensaje);
    console.log('mensaje hasheado:', this.keysSign)
    console.log('respuesta firma:', await signMessage(getMessageEncoding(this.mensaje), this.keysSign!.privateKey))
    this.socketService.sendMessageToUser(this.destinatario, cifrado);
    this.socketService.sendMessageToUser(this.destinatario, initV);
    this.socketService.sendMessageToUser(this.destinatario, encryptedSymmetricKey);
  }

  async enviarClavePublica () {
    const publicKey = await crypto.subtle.exportKey('spki', this.keysEncrypt!.publicKey);

    console.log('Enviar publica a:', this.destinatario);
    this.socketService.sendPublicKey(this.destinatario, publicKey);
  }

  async generateKeyPair () {
    await createAsymetricPairSign().then(keyPair => this.keysSign = keyPair)
    await createAsymetricPairEncrypt().then(keyPair => this.keysEncrypt = keyPair)
  }

}
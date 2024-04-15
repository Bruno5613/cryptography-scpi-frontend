import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;

  constructor() { }

  setupSocketConnection(identificador: String) {
    this.socket = io(environment.SOCKET_ENDPOINT);

    this.socket.emit('setUserId', identificador); // Asignar un ID de usuario al socket

    this.socket.emit('my message', `Hello there from Angular\'s client ${identificador}.`);
    this.socket.on('my broadcast', (data: String) => {
      console.log(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sendMessageToUser(userId: String, message: any) {
    // Enviar un mensaje a un cliente específico usando su ID de usuario
    if (this.socket) {
      this.socket.emit('messageToUser', { userId, message });
      console.log("Enviado")
    }
  }

  onNewMessage(): Observable<String> {
    return new Observable<String>(observer => {
      this.socket.on('new_message', (message: any) => {
        observer.next(message);
      });
    });
  }

  generateECDSAKeyPair(): Observable<CryptoKeyPair> {
    console.log("Generando par de claves desde el servicio");
    return from(
      window.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-384'
        },
        true,
        ['sign', 'verify']
      )
    );
  }

}

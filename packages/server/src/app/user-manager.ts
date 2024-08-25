import { WebSocket } from 'ws';
import {
  ChatMessage,
  ChatRelayMessage,
  LoginMessage,
  SystemNotice,
  User,
  WsMessage,
} from '@websocket/types';
import { IncomingMessage } from 'http';

let currId = 1;

export class UserManager {
  private sockets = new Map<WebSocket, User>();

  add(socket: WebSocket, request: IncomingMessage) {
    let url = '' + request.headers.host + request.url;
    console.log(url);
    const fullURL = new URL(url);
    const name = fullURL.searchParams.get('name');
    const user: User = {
      name,
      id: currId++,
    };

    const systemNotice: SystemNotice = {
      event: 'systemNotice',
      contents: `${name} has joined the chat`,
    };

    this.sendToAll(systemNotice);

    const loginMessage: LoginMessage = {
      event: 'login',
      user,
    };

    socket.send(JSON.stringify(loginMessage));

    this.sockets.set(socket, user);
  }

  remove(socket: WebSocket) {
    const name = this.sockets.get(socket).name

    const systemNotice: SystemNotice = {
      event: 'systemNotice',
      contents: `${name} has left the chat`,
    };
    this.sendToAll(systemNotice);

    this.sockets.delete(socket);
  }

  send(socket: WebSocket, message: WsMessage) {
    const data = JSON.stringify(message);
    socket.send(data);
  }

  sendToAll(message: WsMessage) {
    const data = JSON.stringify(message);

    Array.from(this.sockets.keys()).forEach((socket) => {
      if (socket.readyState == WebSocket.OPEN) {
        socket.send(data);
      }
    });
  }

  relayChat(from: WebSocket, chatMsg: ChatMessage) {
    const relayMessage: ChatRelayMessage = {
      event: 'chatRelay',
      contents: chatMsg.contents,
      author: this.sockets.get(from),
    };

    this.sendToAll(relayMessage);
  }
}

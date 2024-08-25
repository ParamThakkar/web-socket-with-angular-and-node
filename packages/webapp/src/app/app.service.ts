import { Injectable } from '@angular/core';
import {
  ChatMessage,
  ChatRelayMessage,
  SystemNotice,
  User,
  WsMessage,
} from '@websocket/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable()
export class AppService {
  user$ = new BehaviorSubject<User>(undefined);
  socket: WebSocketSubject<WsMessage>;
  chatMessage$ = new Subject<ChatRelayMessage>();
  systemNotice$ = new Subject<SystemNotice>();

  connect(name: string) {
    this.socket = webSocket(`ws://localhost:8080?name=${name}`);
    this.socket.subscribe((message) => this.onMessageFromServer(message));
  }

  send(contents: string) {
    const chatMessage: ChatMessage = {
      event: 'chat',
      contents,
    };
    this.socket.next(chatMessage);
  }

  onMessageFromServer(message: WsMessage) {
    console.log('From Server:', message);
    switch (message.event) {
      case 'login': {
        this.user$.next(message.user);
        break;
      }
      case 'chatRelay': {
        this.chatMessage$.next(message);
        break;
      }
      case 'systemNotice':{
        this.systemNotice$.next(message)
        break;
      }
    }
  }
}

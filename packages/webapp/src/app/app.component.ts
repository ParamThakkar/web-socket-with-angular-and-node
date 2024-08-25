import { Component, OnInit } from '@angular/core';
import { ChatRelayMessage, SystemNotice, User } from '@websocket/types';
import { AppService } from './app.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'websocket-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'I am Angular';
  messages: ChatRelayMessage[] = [];
  currentUser: User;

  constructor(private appService: AppService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.appService.chatMessage$.subscribe(
      (msg) => (this.messages = [...this.messages, msg])
    );
    this.appService.user$.subscribe((user) => (this.currentUser = user));
    this.appService.systemNotice$.subscribe((notice) =>
      this.onSystemNotice(notice)
    );
    // this.currentUser = { name: 'Xavier', id: 3 };
  }

  connect(userInput: HTMLInputElement) {
    this.appService.connect(userInput.value);
  }

  send(chatInput: HTMLInputElement) {
    this.appService.send(chatInput.value);
    chatInput.value = '';
  }

  onSystemNotice(notice: SystemNotice) {
    this.snackBar.open(notice.contents, undefined, { duration: 5000 });
  }
}

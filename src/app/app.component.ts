import { Component } from '@angular/core';
import {LoggedInGuard} from "./login/logged-in.guard";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  constructor(private loggedInGuard:LoggedInGuard){}
}

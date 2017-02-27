import {Component, OnInit} from '@angular/core';
import {LoggedInGuard} from "./login/logged-in.guard";
import {MessageService} from "./message.service";
import {Response} from "@angular/http";
import {MdSnackBar} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';
  private showError = false;
  private error: string;

  constructor(private loggedInGuard: LoggedInGuard, private messageService: MessageService, public snackBar: MdSnackBar) {
  }

  ngOnInit(): void {
    this.messageService.err$.subscribe(
      err => {
        this.showError = true;
        let errMsg = '';
        try {
          errMsg = err.json();
        }
        catch (e) {
          errMsg = err.text();
        }
        this.error = `${err.statusText}: ${errMsg}`;
      }
    );
    this.messageService.msg$.subscribe(
      msg => {
        this.showError = false;
        this.snackBar.open(msg, 'x', {duration: 3000, extraClasses: ['snackBar']});
      }
    );
    this.messageService.warn$.subscribe(
      msg => {
        this.snackBar.open(msg, 'x', {duration: 3000, extraClasses: ['warnBar']});
      }
    )
  }

  closeError() {
    this.showError = false;
  }
}

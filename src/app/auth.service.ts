import {Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {RestService} from "./rest.service";
import {Router} from "@angular/router";

@Injectable()
export class AuthService {
  private authStream = new Subject<boolean>();
  auth$ = this.authStream.asObservable();
  originBeforeLogin = '/';

  constructor(private restService: RestService, private router: Router) {
    this.authStream.next(false)
  }

  logIn(username, password) {
    this.restService.update('login', null, {username: username, password: password})
      .subscribe(() => {
          this.authStream.next(true);
          let url = this.originBeforeLogin;
          this.router.navigate([url !== null ? url : '/']);
        },
        err => {
      //TODO: showing error in component
          this.authStream.next(false);
          console.log(err);
        })
  }

  logOff() {
    this.restService.call('logout')
      .subscribe(() => {
        this.authStream.next(false)
      },
      err => {
        //TODO: showing error in component
        console.log(err);
      });
  }
}

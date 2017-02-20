import {Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {Router} from "@angular/router";

@Injectable()
export class AuthService {
  private authStream = new Subject<boolean>();
  public user = '';
  public userType = '';
  auth$ = this.authStream.asObservable();
  originBeforeLogin = '/';

  constructor(private restService: RestService, private router: Router) {
    this.restService.call('validUser')
      .subscribe(
        res => {
          let data = res.json();
          this.user = data.user;
          this.userType = data.userType;
          this.authStream.next(true);
        },
        err => {
          console.log(err);
          this.authStream.next(false);
        });
  }

  logIn(username, password) {
    this.restService.update('login', null, {username: username, password: password})
      .subscribe(res => {
          let data = res.json();
          this.user = data.user;
          this.userType = data.userType;
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
          this.user = '';
          this.authStream.next(false);
          this.router.navigate(['login']);
        },
        err => {
          //TODO: showing error in component
          console.log(err);
        });
  }
}

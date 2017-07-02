import {Injectable,isDevMode} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {Router} from "@angular/router";
import {MessageService} from "./message.service";

@Injectable()
export class AuthService {
  private authStream = new Subject<boolean>();
  public user = '';
  public userType = '';
  public unitName = '';
  public isKitchen: boolean;
  auth$ = this.authStream.asObservable();
  originBeforeLogin = '/';

  constructor(private restService: RestService, private router: Router, private messageService:MessageService) {
    this.restService.call('validUser')
      .subscribe(
        res => {
          this.afterLogin(res);
          // this.router.navigate(['/']);
          this.messageService.message(`You are already logged in as ${this.user}.`)
        },
        err => {
          if(isDevMode())
            console.log(err);
          this.authStream.next(false);
          this.router.navigate(['login']);
        });
  }

  logIn(username, password) {
    this.restService.update('login', null, {username: username, password: password})
      .subscribe(res => {
          this.afterLogin(res);
          // this.router.navigate([url !== null ? url : '/']);
          this.messageService.message(`${this.user} logged in.`);
        },
        err => {
          this.authStream.next(false);
          this.messageService.error(err);
          if(isDevMode())
            console.log(err);
        })
  }

  private afterLogin(res) {
    let data = res.json();
    this.user = data.user;
    this.unitName = data.name;
    this.userType = data.userType;
    this.isKitchen = data.isKitchen;
    this.authStream.next(true);

    let url: string = this.originBeforeLogin;

    if(url !== null && url !== '/'){
      if(this.userType === 'branch'){
        if(url.indexOf('inventory') !== -1 || url.indexOf('override') !== -1)
          this.router.navigate([url]);
        else
          this.router.navigate(['inventory']);
      }
      else if(this.userType === 'prep'){
        if(url.indexOf('delivery') !== -1)
          this.router.navigate([url]);
        else
          this.router.navigate(['delivery']);
      }
      else if(this.userType === 'admin'){
        if(url.indexOf('units') !== -1 || url.indexOf('products') !== -1 || url.indexOf('override') !== -1)
          this.router.navigate([url]);
        else
          this.router.navigate(['']);
      }
    }
    else{
      if(this.userType === 'branch')
        this.router.navigate(['inventory']);
      else if(this.userType === 'prep')
        this.router.navigate(['delivery']);
      else
        this.router.navigate(['/']);
    }
  }

  logOff() {
    this.restService.call('logout')
      .subscribe(() => {
          this.messageService.message(`${this.user} logged out.`);
          this.user = '';
          this.userType = '';
          this.unitName = '';
          this.authStream.next(false);
          this.router.navigate(['login']);
        },
        err => {
          this.messageService.error(err);
          if(isDevMode())
            console.log(err);
        });
  }
}

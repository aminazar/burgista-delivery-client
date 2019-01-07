import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {RouterLinkActive, Router} from "@angular/router";
import * as moment from 'moment';

interface navLink{
  link:string;
  label:string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private auth: boolean;
  private user: string;
  private isAdmin: boolean;
  private isBranch: boolean;
  private isPrep: boolean;
  private navLinks:navLink[] = [];
  remainedTime: any;
  private int: any;

  constructor(private authService: AuthService, private router:Router) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe(auth => {
      if(auth) {
        if (this.int)
          clearInterval(this.int);
        const endTime = moment().add(1, 'hour');
        this.int = setInterval(() => this.remainedTime = moment(new Date( endTime.diff(moment()))).utc().format('mm:ss'), 900);
      }
      this.auth = auth;
      this.user = this.authService.user;
      this.isAdmin = auth && this.authService.userType  === 'admin';
      this.isBranch = auth && this.authService.userType === 'branch';
      this.isPrep   = auth && this.authService.userType === 'prep';
      if(this.isAdmin) {
        this.navLinks.push({label: 'Units', link: 'units'});
        this.navLinks.push({label: 'Products', link: 'products'});
      }
    })
  }

  ngOnDestroy() {
    clearInterval(this.int);
  }

  logout() {
    clearInterval(this.int);
    this.authService.logOff();
  }
}

import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {RouterLinkActive, Router} from "@angular/router";

interface navLink{
  link:string;
  label:string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private auth: boolean;
  private user: string;
  private isAdmin: boolean;
  private isBranch: boolean;
  private isPrep: boolean;
  private navLinks:navLink[] = [];

  constructor(private authService: AuthService, private router:Router) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe(auth => {
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

  logout() {
    this.authService.logOff();
  }
}

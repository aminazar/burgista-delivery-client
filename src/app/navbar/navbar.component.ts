import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";

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

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe(auth => {
      this.auth = auth;
      this.user = this.authService.user;
      this.isAdmin = auth && this.authService.userType  === 'admin';
      this.isBranch = auth && this.authService.userType === 'branch';
      this.isPrep   = auth && this.authService.userType === 'prep';
    })
  }

  logout() {
    this.authService.logOff();
  }
}

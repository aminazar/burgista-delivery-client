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

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.auth$.subscribe(auth => {
      this.auth = auth;
      this.user = this.authService.user;
    })
  }

  logout() {
    this.authService.logOff();
  }
}

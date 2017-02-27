import { Injectable } from '@angular/core';
import {Subject, Observable} from "rxjs";
import {Response} from "@angular/http";

@Injectable()
export class MessageService {
  private errStream = new Subject<Response>();
  err$:Observable<Response> = this.errStream.asObservable();
  private msgStream = new Subject<string>();
  msg$:Observable<string> = this.msgStream.asObservable();
  private warningStream = new Subject<string>();
  warn$:Observable<string> = this.warningStream.asObservable();

  error(err:Response){
    this.errStream.next(err);
  }

  message(msg:string){
    this.msgStream.next(msg);
  }

  warn(msg:string){
    this.warningStream.next(msg);
  }
  constructor() { }

}

import { Injectable } from '@angular/core';
import {Subject, Observable} from "rxjs";
import {Response} from "@angular/http";

@Injectable()
export class MessageService {
  private errStream = new Subject<Response>();
  err$:Observable<Response> = this.errStream.asObservable();
  private msgStream = new Subject<string>();
  msg$:Observable<string> = this.msgStream.asObservable();

  error(err:Response){
    this.errStream.next(err);
  }

  message(msg:string){
    this.msgStream.next(msg);
  }
  constructor() { }

}

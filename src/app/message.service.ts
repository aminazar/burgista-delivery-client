import { Injectable } from '@angular/core';
import {Subject, Observable} from "rxjs";
import {Response, ResponseOptions} from "@angular/http";

@Injectable()
export class MessageService {
  private errStream = new Subject<Response>();
  err$:Observable<Response> = this.errStream.asObservable();
  private msgStream = new Subject<string>();
  msg$:Observable<string> = this.msgStream.asObservable();
  private warningStream = new Subject<string>();
  warn$:Observable<string> = this.warningStream.asObservable();

  error(err:Response){
    // this.errStream.next(err);
    this.errStream.next(this.changeToUnderstandableMessage(err));
  }

  message(msg:string){
    this.msgStream.next(msg);
  }

  warn(msg:string){
    this.warningStream.next(msg);
  }
  constructor() { }

  changeToUnderstandableMessage(msg: any): Response{
    let data = msg._body;

    let resOptions = new ResponseOptions();
    let res = new Response(resOptions);

    if (data.indexOf('foreign key constraint') !== -1 && data.indexOf('unit') !== -1) {
      res.statusText = 'Can not delete this unit because there are some products related to it';
      return res;
    }
    else if (data.indexOf('duplicate key value') !== -1) {
      res.statusText = 'One of the data is already exist';
      return res;
    }
    else if (data.indexOf('null value') !== -1 && data.indexOf('not-null constraint') !== -1) {
      res.statusText = 'The fields can not have null value';
      return res;
    }
    else
      return msg;
  }
}

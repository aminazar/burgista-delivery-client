import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import {Observable} from "rxjs";
import {MessageService} from './message.service';

@Injectable()
export class RestService {
  constructor(private http: Http, private messageService: MessageService) {
  }

  call(table): Observable<Response> {
    this.messageService.block();
    return this.http.get('/api/' + table)
      .map((data: Response) => {
        this.messageService.block(false);
        return data;
      })
      .catch(err => {
        this.messageService.block(false);
        return err;
      });
  }

  insert(table, values): Observable<any> {
    this.messageService.block();
    return this.http.put('/api/' + table, values)
      .map((data: Response) => {
        this.messageService.block(false);
        return data.json();
      })
      .catch(err => {
        this.messageService.block(false);
        return err;
      });
  }

  get(table): Observable<any> {
    this.messageService.block();
    return this.call(table)
      .map((data: Response) => {
        this.messageService.block(false);
        return data.json();
      })
      .catch(err => {
        this.messageService.block(false);
        return err;
      });
  };

  getWithParams(table, values): Observable<any> {
    this.messageService.block();
    let params: URLSearchParams = new URLSearchParams();
    for (let key in values)
      if (values.hasOwnProperty(key))
        params.set(key, values[key]);

    return this.http.get('/api/' + table, {search: params})
      .map((data: Response) => {
        this.messageService.block(false);
        return data.json();
      })
      .catch(err => {
        this.messageService.block(false);
        return err;
      });
  }

  delete(table, id): Observable<Response> {
    this.messageService.block();
    return this.http.delete('/api/' + table + '/' + id)
      .map((data: Response) => {
        this.messageService.block(false);
        return data;
      })
      .catch(err => {
        this.messageService.block(false);
        return err;
      });
  }

  update(table, id, values): Observable<Response> {
    this.messageService.block();
    return this.http.post('/api/' + table + (id ? '/' + id : ''), values)
      .map((data: Response) => {
        this.messageService.block(false);
        return data;
      })
      .catch(err => {
        this.messageService.block(false);
        return err;
      });
  }
}

/**
 * Created by Amin on 13/03/2017.
 */
import { Injectable } from '@angular/core';

function _window() : any {
  // return the global native browser window object
  return window;
}

@Injectable()
export class WindowRef {
  get nativeWindow() : any {
    return _window();
  }
}

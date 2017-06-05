import { Injectable } from '@angular/core';
import * as electron from 'electron';

@Injectable()
export class ElectronService {
  private _electron: typeof electron = (global as any).require('electron');

  constructor() { }

  get remote() {
    return this._electron.remote;
  }

}

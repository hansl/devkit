import { Injectable } from '@angular/core';
import {FileSystemEngineHost} from '../../../schematics/tooling';
import {SchematicEngine} from '../../../schematics/src';

@Injectable()
export class SchematicService {
  private _host = new FileSystemEngineHost();
  private _engine = new SchematicEngine<any, any>(this._host);

  constructor() {}

  loadCollection(path: string) {
    const name = this._host.registerCollection(path);
    return this._engine.createCollection(name);
  }
}

import { Component } from '@angular/core';
import {Collection, Schematic} from '../../../schematics/src/engine/interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public collection: Collection<any, any>;

  public leftSchematic: Schematic<any, any>;
  public rightSchematic: Schematic<any, any>;

  constructor() {
  }
}

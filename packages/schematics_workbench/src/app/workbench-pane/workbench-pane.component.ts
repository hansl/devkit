import {Component, Input, OnInit} from '@angular/core';
import {Schematic} from '../../../../schematics/src/engine/interface';
import {SchematicService} from '../schematic.service';

@Component({
  selector: 'app-workbench-pane',
  templateUrl: './workbench-pane.component.html',
  styleUrls: ['./workbench-pane.component.css']
})
export class WorkbenchPaneComponent implements OnInit {

  @Input() schematic: Schematic<any, any>;

  constructor(private _service: SchematicService) { }

  ngOnInit() {
    console.log(this._service);
  }

}

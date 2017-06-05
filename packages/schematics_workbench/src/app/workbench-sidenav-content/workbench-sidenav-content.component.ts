import { Component, Input, OnInit } from '@angular/core';
import {Schematic} from '../../../../schematics/src/engine/interface';

@Component({
  selector: 'app-workbench-sidenav-content',
  templateUrl: './workbench-sidenav-content.component.html',
  styleUrls: ['./workbench-sidenav-content.component.css']
})
export class WorkbenchSidenavContentComponent implements OnInit {
  private _dialog: any;

  @Input() schematic: Schematic<any, any>;

  constructor() {
    this._dialog = (global as any).require('electron').remote.dialog;
  }

  onOpenCollection() {
  }

  ngOnInit() {
  }

}

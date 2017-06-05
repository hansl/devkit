import {Component, Input, OnInit} from '@angular/core';
import {SchematicService} from '../schematic.service';
import {ElectronService} from '../electron.service';

import * as path from 'path';

export enum PaneKind {
  New = 0,
  Collection = 1,
}


@Component({
  selector: 'app-workbench-pane',
  templateUrl: './workbench-pane.component.html',
  styleUrls: ['./workbench-pane.component.css']
})
export class WorkbenchPaneComponent implements OnInit {
  @Input() kind: PaneKind = PaneKind.New;

  constructor(private _service: SchematicService, private _electron: ElectronService) { }

  ngOnInit() {
    console.log(this._service);
  }

  openCollection() {
    this._electron.remote.dialog.showOpenDialog({
      defaultPath: process.env.HOME,
      properties: ['openDirectory']
    }, (fileName: string[]) => {
      if (!fileName) {
        // Dialog cancelled.
        return;
      }

      console.log(this._service.loadCollection(path.join(fileName[0], 'collection.json')));
      this.kind = PaneKind.Collection;
    });
  }
}


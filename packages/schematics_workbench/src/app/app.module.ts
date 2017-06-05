import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { WorkbenchPaneComponent } from './workbench-pane/workbench-pane.component';
import { SchematicService } from './schematic.service';
import { WorkbenchSidenavContentComponent } from './workbench-sidenav-content/workbench-sidenav-content.component';
import { ElectronService } from './electron.service';

@NgModule({
  declarations: [
    AppComponent,
    WorkbenchPaneComponent,
    WorkbenchSidenavContentComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    MaterialModule,
  ],
  providers: [SchematicService, ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule {}

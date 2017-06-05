import {NgModule} from '@angular/core';
import {
  MdButtonModule, MdCardModule,
  MdCheckboxModule,
  MdIconModule,
  MdSidenavModule,
  MdToolbarModule,
} from '@angular/material';


const modules = [
  MdButtonModule,
  MdCardModule,
  MdCheckboxModule,
  MdIconModule,
  MdSidenavModule,
  MdToolbarModule,
];


@NgModule({
  imports: modules,
  exports: modules,
})
export class MaterialModule { }

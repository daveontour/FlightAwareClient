
import { DirectorService } from './services/director.service';
import { MessengerService } from './services/messenger.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import { GanttRendererComponent } from './components/gantt-item/gantt-item.component';
import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { SortableHeaderTimeMarkerComponent } from './components/sortable-header-time-marker/sortable-header-time-marker.component';
import { GlobalsService } from './services/globals.service';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FormsModule } from '@angular/forms';




@NgModule({
  declarations: [
    AppComponent,
    GanttRendererComponent,
    SortableHeaderComponent,
    SortableHeaderTimeMarkerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    HttpClientModule,
    NgxMaterialTimepickerModule,
    AgGridModule.withComponents([
      GanttRendererComponent,
      SortableHeaderComponent
    ])
  ],
  providers: [
    MessengerService,
    DirectorService,
    GlobalsService,
  ],
  entryComponents: [
    SortableHeaderTimeMarkerComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

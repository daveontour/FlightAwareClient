import { CallSignRendererComponent } from './components/CallSignRenderer.component';

import { DirectorService } from './services/director.service';
import { MessengerService } from './services/messenger.service';
import { LinkedFlightRendererComponent } from './components/LinkedFlightRenderer.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import { SchedTimeRendererComponent } from './components/SchedTimeRenderer.component';
import { FlightRendererComponent } from './components/FlightRenderer.component';
import { StandSlotRendererComponent } from './components/StandSlotRenderer.component';
import { GateSlotRendererComponent } from './components/GateSlotRenderer.component';
import { TestRendererComponent } from './components/TestRenderer.component';
import { GanttItemComponent } from './components/gantt-item/gantt-item.component';
import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { SortableHeaderTimeMarkerComponent } from './components/sortable-header-time-marker/sortable-header-time-marker.component';
import { GlobalsService } from './services/globals.service';
// import { InjectableRxStompConfig, RxStompService, rxStompServiceFactory } from '@stomp/ng2-stompjs';
// import { myRxStompConfig } from './my-rx-stomp.config';

@NgModule({
  declarations: [
    AppComponent,
    SchedTimeRendererComponent,
    FlightRendererComponent,
    LinkedFlightRendererComponent,
    StandSlotRendererComponent,
    GateSlotRendererComponent,
    TestRendererComponent,
    GanttItemComponent,
    SortableHeaderComponent,
    SortableHeaderTimeMarkerComponent,
    CallSignRendererComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AgGridModule.withComponents([
      SchedTimeRendererComponent,
      FlightRendererComponent,
      LinkedFlightRendererComponent,
      StandSlotRendererComponent,
      GateSlotRendererComponent,
      TestRendererComponent,
      SortableHeaderComponent,
      CallSignRendererComponent
    ])
  ],
  providers: [
    MessengerService,
    DirectorService,
    GlobalsService,
    // {
    //   provide: InjectableRxStompConfig,
    //   useValue: myRxStompConfig
    // },
    // {
    //   provide: RxStompService,
    //   useFactory: rxStompServiceFactory,
    //   deps: [InjectableRxStompConfig]
    // }
  ],
  entryComponents: [
    GanttItemComponent,
    SortableHeaderTimeMarkerComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

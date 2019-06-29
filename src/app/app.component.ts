import { CallSignRendererComponent } from './components/CallSignRenderer.component';

import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { TestRendererComponent } from './components/TestRenderer.component';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlightRendererComponent } from './components/FlightRenderer.component';
import { SchedTimeRendererComponent } from './components/SchedTimeRenderer.component';
import { StandSlotRendererComponent } from './components/StandSlotRenderer.component';
import { GateSlotRendererComponent } from './components/GateSlotRenderer.component';
import { LinkedFlightRendererComponent } from './components/LinkedFlightRenderer.component';
import { DirectorService } from './services/director.service';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import * as moment from 'moment';

import AbstractXHRObject from 'sockjs-client/lib/transport/browser/abstract-xhr';

const _start = AbstractXHRObject.prototype._start;

AbstractXHRObject.prototype._start = function (method, url, payload, opts) {
  if (!opts) {
    opts = { noCredentials: true };
  }
  return _start.call(this, method, url, payload, opts);
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  private frameworkComponents: any;
  private rowData: any;
  private columnDefs: any;
  private context: any;
  private getRowNodeId: any;
  private gridApi: any;
  private gridColumnApi: any;
  public count = 0;
  private stompClient: any;
  private serverURL = 'http://localhost:8080/socket';
  private sideBar;
  private defaultColDef;

  constructor(
    private http: HttpClient,
    private director: DirectorService,
  ) {

    this.columnDefs = [
      {
        headerName: 'Aircraft',
        field: 'Movement.Arrival.Flight.FlightState.AircraftType.AircraftTypeId.AircraftTypeCode.IATA',
        width: 70,
        enableCellChangeFlash: true,
        sortable: true,
        enableRowGroup: true
      },
      {
        headerName: 'Arrival Flight',
        children: [
          // {
          //   headerName: 'Arrival ID',
          //   field: 'Movement.Arrival.Flight.FlightState.Value.FlightUniqueID',
          //   sortable: true,
          //   width: 150
          // },
          // {
          //   headerName: 'Type',
          //   field: 'Movement.Arrival.Flight.FlightState.Value.S__G_FlightType',
          //   sortable: true,
          //   width: 150,
          //   enableRowGroup: true
          // },
          {
            headerName: 'Status',
            field: 'Movement.Arrival.Flight.FlightState.Value.S__G_FlightStatusText',
            sortable: true,
            width: 120,
            enableRowGroup: true,
            filter: true
          },
          {
            headerName: 'Area',
            field: 'Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Area',
            sortable: true,
            valueGetter: AreaValueGetter,
            width: 80,
            enableRowGroup: true
          },
          {
            headerName: 'Stand',
            field: 'Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName',
            sortable: true,
            valueGetter: StandValueGetter,
            width: 70,
            enableRowGroup: true
          },
          {
            headerName: 'Stand Allocation',
            field: 'Movement.Arrival.Flight.FlightState.StandSlots.StandSlot',
            sortable: true,
            valueGetter: AllocationValueGetter,
            width: 150,
            enableRowGroup: true
          },
          {
            headerName: 'Arrival Flight',
            cellRenderer: 'flightRenderer',
            cellRendererParams: { type: 'arrival' },
            width: 100,
            enableCellChangeFlash: true,
            sortable: true
          },
          {
            headerName: 'Call Sign',
            cellRenderer: 'callSignRenderer',
            cellRendererParams: { type: 'arrival' },
            width: 100,
            enableCellChangeFlash: true,
            sortable: true
          },
          {
            headerName: 'Scheduled',
            cellRenderer: 'schedTimeRenderer',
            sortable: true,
            width: 120,
            cellRendererParams: {
              type: 'arrival'
            },
          },
          {
            headerName: 'Actual',
            field: 'Movement.Arrival.Flight.FlightState.Value.de_G_ActualArrival',
            sortable: true,
            width: 80,
            valueGetter: ActualValueGetter,
          },
          {
            headerName: 'Most Confident',
            sortable: true,
            width: 150,
            cellRenderer: 'schedTimeRenderer',
            cellRendererParams: { type: 'mca' },
            field: 'Movement.Arrival.Flight.FlightState.Value.de_G_MostConfidentArrivalTime',
            comparator: DateComparator,
            valueGetter: DateValueGetter,
            sort: 'asc',
            unSortIcon: true
          },
        ]
      },
      {
        headerName: 'Stand Allocation',
        children: [
          {
            field: 'times',
            cellRenderer: 'testRenderer',
            width: 1000,
            headerComponent: 'sortableHeaderComponent'
          }
        ]
      }
    ];
    this.defaultColDef = {
      // enableValue: true,
      // enableRowGroup: true,
      // enablePivot: true,
      sortable: true,
      filter: true
    };
    this.sideBar = {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: false,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressSideButtons: false,
            suppressColumnFilter: true,
            suppressColumnSelectAll: true,
            suppressColumnExpandAll: false
          }
        }
      ],
      defaultToolPanel: 'columns'
    };
    this.context = { componentParent: this };
    this.frameworkComponents = {
      schedTimeRenderer: SchedTimeRendererComponent,
      flightRenderer: FlightRendererComponent,
      standSlotRenderer: StandSlotRendererComponent,
      gateSlotRenderer: GateSlotRendererComponent,
      linkedflightRenderer: LinkedFlightRendererComponent,
      testRenderer: TestRendererComponent,
      sortableHeaderComponent: SortableHeaderComponent,
      callSignRenderer: CallSignRendererComponent
    };

    // tslint:disable-next-line:only-arrow-functions
    this.getRowNodeId = (data) => {
      return data.Movement.ID;
    };

  }


  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverURL);
    this.stompClient = Stomp.over(ws);
    // Disable console logging
    // this.stompClient.debug = () => {};
    const that = this;
    // tslint:disable-next-line:only-arrow-functions
    this.stompClient.connect({}, (frame) => {
      that.stompClient.subscribe('/update', (message) => {
        console.log('Update Movement');
        console.log(message);
        const updatedFlight = JSON.parse(message.body);
        try {
          updatedFlight.times = {
            start: updatedFlight.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime,
            end: updatedFlight.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime,
          };
        } catch (ex) {
          updatedFlight.times = { start: '-', end: '-' };
        }
        const itemsToUpdate = [];
        itemsToUpdate.push(updatedFlight);
        console.log(updatedFlight);
        that.gridApi.updateRowData({ update: itemsToUpdate });
        that.director.updateNowIndicator();
      });

      that.stompClient.subscribe('/add', (message) => {
        const newFlight = JSON.parse(message.body);
        try {
          newFlight.times = {
            start: newFlight.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime,
            end: newFlight.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime,
          };
        } catch (ex) {
          newFlight.times = { start: '-', end: '-' };
        }
        const itemsToUpdate = [];
        itemsToUpdate.push(newFlight);
        console.log('Add New Flight');
        console.log(newFlight);
        that.gridApi.updateRowData({ add: itemsToUpdate });
        that.director.updateNowIndicator();
      });

      that.stompClient.subscribe('/delete', (message) => {
        const deleteFlight = JSON.parse(message.body);
        const itemsToUpdate = [];
        itemsToUpdate.push(deleteFlight);
        console.log('Delete Flight');
        console.log(deleteFlight);
        that.gridApi.updateRowData({ remove: itemsToUpdate });
        that.director.updateNowIndicator();
      });
    });
  }

  ngOnInit() {
    const that = this;

    const rowsToAdd = [];
    this.http.get<any>('http://localhost:8080/getMovements?from=-240&to=300&timetype=mco').subscribe(data => {
      data.forEach(element => {

        try {
          element.times = {
            start: element.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime,
            end: element.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime,
            stand: element.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName
          };
          rowsToAdd.push(element);
        } catch (ex) {
          console.log(ex);
        }
      });


      that.rowData = rowsToAdd;
    });

    this.initializeWebSocketConnection();

    // Do  a refresh every 5 minutes
    setTimeout(() => {
      that.ngOnInit();
    }, 5 * 60000);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  updateSort() {
    this.gridApi.refreshClientSideRowModel('sort');
  }

  updateFilter() {
    this.gridApi.refreshClientSideRowModel('filter');
  }



}

function DateComparator(date1, date2, nodeA, nodeB, isInverted) {

  if (moment(date2).isBefore(moment(date1))) {
    return 1;
  } else {
    return -1;
  }
}
function AreaValueGetter(params) {
  try {
    return params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Area.Value[0].content;
  } catch (e) {
    return 'Unassigned';
  }
}
function AllocationValueGetter(params) {
  try {
    const s = params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime;
    const e = params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime;

    if (typeof s === 'undefined' || typeof e === 'undefined') {
      return '-';
    }
    return moment(s).format('HH:mm - ') + moment(e).format('HH:mm');
  } catch (e) {
    return '-';
  }
}
function ActualValueGetter(params) {
  try {
    const v = params.data.Movement.Arrival.Flight.FlightState.Value.de_G_ActualArrival;
    if (typeof v === 'undefined') {
      return '-';
    }
    return moment(v).format('HH:mm');
  } catch (e) {
    return '-';
  }
}
function StandValueGetter(params) {
  try {
    return params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName;
  } catch (e) {
    return 'Unassigned';
  }
}
function DateValueGetter(params) {
  try {
    return params.data.Movement.Arrival.Flight.FlightState.Value.de_G_MostConfidentArrivalTime;
  } catch (e) {
    console.log('Returning Dummy Value');
    return '1999-06-27T08:35:00';
  }
}

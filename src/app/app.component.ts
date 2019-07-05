import { GlobalsService } from './services/globals.service';
import { CallSignRendererComponent } from './components/CallSignRenderer.component';

import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { GanttRendererComponent } from './components/gantt-item/GanttRenderer.component';
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

AbstractXHRObject.prototype._start = function(method, url, payload, opts) {
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

  private pollTask;
  private reconnectTask;

  public offsetFrom = -120;
  public offsetTo = 180;

  public rangeFrom: number;
  public rangeTo: number;
  public rangeDate: any;

 public hardReset = '';

 public showOnBlocks = true;

  public dateLoad = new Date();
  public status = 'Connecting';
  public updateMode = 'Live';
  public lastUpdate = '-';
  public darkTheme = {
    container: {
      bodyBackgroundColor: '#424242',
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: '#555',
    },
    clockFace: {
      clockFaceBackgroundColor: '#555',
      clockHandColor: '#9fbd90',
      clockFaceTimeInactiveColor: '#fff'
    }
  };
  bigRefresh: any;

  constructor(
    private http: HttpClient,
    private director: DirectorService,
    private globals: GlobalsService
  ) {

    this.globals.offsetFrom = this.offsetFrom;
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
            headerName: 'Route',
            field: 'Movement.Arrival.Flight.FlightState.Route.ViaPoints.RouteViaPoint',
            sortable: true,
            valueGetter: RouteValueGetter,
            width: 100
          },
          {
            headerName: 'Scheduled',
            cellRenderer: 'schedTimeRenderer',
            field: 'Movement.Arrival.Flight.FlightState.ScheduledTime.content',
            sortable: true,
            width: 120,
            enableCellChangeFlash: true,
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
            enableCellChangeFlash: true,
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
            unSortIcon: true,
            enableCellChangeFlash: true,
          },
        ]
      },
      {
        headerName: 'Stand Allocation',
        children: [
          {
            field: 'times',
            cellRenderer: 'ganttRenderer',
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
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        }
      ],
      defaultToolPanel: ''
    };
    this.context = { componentParent: this };
    this.frameworkComponents = {
      schedTimeRenderer: SchedTimeRendererComponent,
      flightRenderer: FlightRendererComponent,
      standSlotRenderer: StandSlotRendererComponent,
      gateSlotRenderer: GateSlotRendererComponent,
      linkedflightRenderer: LinkedFlightRendererComponent,
      ganttRenderer: GanttRendererComponent,
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
    this.stompClient.debug = () => {};
    const that = this;
    this.stompClient.connect({}, (frame) => {
      that.status = 'Connected';
      that.director.minuteTick();
      that.stompClient.subscribe('/update', (message) => {
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
        that.director.minuteTick();
        that.lastUpdate = moment().format('HH:mm:ss');
      });

      that.stompClient.subscribe('/add', (message) => {
        const addFlight = JSON.parse(message.body);
        const itemsToAdd = [addFlight];
        that.gridApi.updateRowData({ add: itemsToAdd });
        that.lastUpdate = moment().format('HH:mm:ss');
      });

      that.stompClient.subscribe('/delete', (message) => {
        const removeFlight = JSON.parse(message.body);
        const itemsToRemove = [removeFlight];
        that.gridApi.updateRowData({ remove: itemsToRemove });
        that.lastUpdate = moment().format('HH:mm:ss');
      });

      that.stompClient.subscribe('/updateMode', (message) => {

        if (message.body.includes('Live')) {

          // Clear the refresh timer if it was running
          try {
            clearInterval(that.pollTask);
          } catch (ex) {
            // Do nothing
          }

          // Do a refresh first, just in case
          if (that.updateMode === 'Refresh') {
            that.ngOnInit();
          }

          // Set the new mode;
          that.updateMode = 'Live';

        } else if (message.body.includes('Refresh')) {

          if (!that.updateMode.includes('Refresh')) {
            that.ngOnInit();
            that.updateMode = 'Refresh';
            that.pollTask = setInterval(() => {
              that.ngOnInit();
            }, 60000);
          }
        }
      });

    },
      (error: string) => {

        console.log(error);
        if (error.includes('Whoops! Lost connection to')) {
          that.status = 'Disconnected';
          setTimeout(() => {
            console.log('Trying to reconnect');
            that.status = 'Connecting';
            that.ngOnInit();
          }, 5000);
        }
      }
    );
  }

  refresh() {
    this.hardReset = '&reset=true';
    this.ngOnInit();
    this.hardReset = '';
  }

changeOnBlocks() {
  alert(this.showOnBlocks);
}

  ngOnInit() {
    const that = this;

    try {
      this.bigRefresh.cancel();
    } catch (ex) {
      // Do Nothing
    }
    const rowsToAdd = [];
    this.http.get<any>('http://localhost:8080/getMovements?from=' + that.offsetFrom + '&to=' + that.offsetTo +
      '&timetype=mco' + that.hardReset).subscribe(data => {
        data.forEach(element => {

          try {
            element.times = {
              start: element.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime,
              end: element.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime,
            };
            rowsToAdd.push(element);
          } catch (ex) {
            console.log(ex);
          }
        });

        that.lastUpdate = moment().format('HH:mm:ss');

        that.rowData = rowsToAdd;
      });

    this.initializeWebSocketConnection();

    // Do  a refresh every 5 minutes
    this.bigRefresh = setTimeout(() => {
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

  setCurrentRange() {
    this.globals.rangeMode = 'offset';
    this.globals.offsetFrom = this.offsetFrom;
    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');
    this.director.minuteTick();
    this.ngOnInit();
  }

  zoom(d: number) {

    let x = this.globals.minutesPerPixel;
    x = x + d * (0.1 * x);
    this.globals.minutesPerPixel = x;
    this.director.minuteTick();
    this.ngOnInit();
  }

  setSelectedRange() {
    this.globals.rangeMode = 'range';

    const mss = this.rangeDate + ' ' + this.rangeFrom;
    const ms = moment(mss, 'YYYY-MM-DD HH:mm');

    const mse = this.rangeDate + ' ' + this.rangeTo;
    const me = moment(mse, 'YYYY-MM-DD HH:mm');

    this.offsetFrom = ms.diff(moment(), 'm');
    this.offsetTo = me.diff(moment(), 'm');
    this.globals.offsetFrom = this.offsetFrom;

    console.log(this.offsetFrom);
    console.log(this.offsetTo);

    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');
    this.director.minuteTick();

    this.ngOnInit();

  }

  getOffsetBulletClass() {
    if (this.globals.rangeMode === 'offset') {
      return 'show';
    } else {
      return 'hide';
    }
  }

  getRangeBulletClass() {
    if (this.globals.rangeMode !== 'offset') {
      return 'show';
    } else {
      return 'hide';
    }
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
function RouteValueGetter(params) {
  try {

    let route = '';

    try {

      params.data.Movement.Arrival.Flight.FlightState.Route.ViaPoints.RouteViaPoint.forEach(element => {
        route = route + element.AirportCode.IATA + ', ';
      });

    } catch (ex) {
      console.log('Error with Route number');
    }

    return route.substring(0, route.length - 2);
  } catch (e) {
    return '-';
  }
}

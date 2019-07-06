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
  private serverWebRoot = 'http://localhost:8080';
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

    const that = this;
    this.globals.offsetFrom = this.offsetFrom;
    this.columnDefs = [
      {
        headerName: 'Aircraft',
        field: 'aircraft',
        width: 70,
        enableCellChangeFlash: true,
        sortable: true,
        enableRowGroup: true,
        hide: true
      },
      {
        headerName: 'Arrival Flight',
        children: [
          {
            headerName: 'Arrival ID',
            field: 'arrFlightID',
            sortable: true,
            width: 100,
            hide: true
          },
          {
            headerName: 'Type',
            field: 'arrFlightType',
            sortable: true,
            width: 100,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Status',
            field: 'arrFlightStatus',
            sortable: true,
            width: 120,
            enableRowGroup: true,
            filter: true,
            hide: true
          },
          {
            headerName: 'Area',
            field: 'arrFlightArea',
            sortable: true,
            //            valueGetter: AreaValueGetter,
            width: 80,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Stand',
            field: 'arrFlightStand',
            sortable: true,
            valueGetter: StandValueGetter,
            width: 70,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Stand Allocation',
            field: 'arrFlightStandAllocation',
            sortable: true,
            valueGetter: AllocationValueGetter,
            width: 150,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Arrival Flight',
            cellRenderer: 'flightRenderer',
            cellRendererParams: { type: 'arrival' },
            width: 100,
            enableCellChangeFlash: true,
            field: 'arrFlightFlight',
            sortable: true,
            hide: true
          },
          {
            headerName: 'Call Sign',
            cellRenderer: 'callSignRenderer',
            cellRendererParams: { type: 'arrival' },
            width: 100,
            enableCellChangeFlash: true,
            field: 'arrFlightCallSign',
            sortable: true,
            hide: true
          },
          {
            headerName: 'Route',
            field: 'arrFlightRoute',
            sortable: true,
            valueGetter: RouteValueGetter,
            width: 100,
            hide: true
          },
          {
            headerName: 'Origin',
            field: 'arrFlightOrigin',
            sortable: true,
            valueGetter: (params) => {
              try {

                let last;
                try {
                  params.data.Movement.Arrival.Flight.FlightState.Route.ViaPoints.RouteViaPoint.forEach(element => {
                    last = element.AirportCode.IATA;
                  });
                } catch (ex) {
                  console.log('Error with Route number');
                }
                return that.globals.airports[last];
              } catch (e) {
                console.log(e);
                return '-';
              }
            },
            width: 100,
            hide: true
          },
          {
            headerName: 'Scheduled',
            cellRenderer: 'schedTimeRenderer',
            field: 'arrFlightSched',
            sortable: true,
            width: 120,
            hide: true,
            enableCellChangeFlash: true,
            cellRendererParams: {
              type: 'arrival'
            },
          },
          {
            headerName: 'Actual',
            field: 'arrFlightActual',
            sortable: true,
            width: 80,
            valueGetter: ActualValueGetter,
            enableCellChangeFlash: true,
            hide: true
          },
          {
            headerName: 'Most Confident',
            sortable: true,
            width: 150,
            cellRenderer: 'schedTimeRenderer',
            cellRendererParams: { type: 'mca' },
            field: 'arrFlightMostConfident',
            comparator: DateComparator,
            valueGetter: DateValueGetter,
            sort: 'asc',
            unSortIcon: true,
            enableCellChangeFlash: true,
            hide: true
          },
        ]
      },
      {
        headerName: 'Stand Allocation',
        children: [
          {
            field: 'arrGantt',
            cellRenderer: 'ganttRenderer',
            width: 1000,
            headerComponent: 'sortableHeaderComponent',
            hide: true
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
    this.stompClient.debug = () => { };
    const that = this;
    this.stompClient.connect({}, (frame) => {
      that.status = 'Connected';
      that.director.minuteTick();
      that.stompClient.subscribe('/update', (message) => {
        let updatedFlight = JSON.parse(message.body);

        if (this.checkAddRow(updatedFlight)) {

          // The MCA is still in the time band

          // try {
          //   updatedFlight.times = {
          //     start: updatedFlight.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime,
          //     end: updatedFlight.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime,
          //   };
          // } catch (ex) {
          //   updatedFlight.times = { start: '-', end: '-' };
          // }
          updatedFlight = that.transformRow(updatedFlight);
          const itemsToUpdate = [];
          itemsToUpdate.push(updatedFlight);
          console.log(updatedFlight);
          that.gridApi.updateRowData({ update: itemsToUpdate });
        } else {

          // The MCA is out side the range, so remove it.
          const itemsToRemove = [updatedFlight];
          that.gridApi.updateRowData({ remove: itemsToRemove });
        }
        that.director.minuteTick();
        that.lastUpdate = moment().format('HH:mm:ss');
      });

      that.stompClient.subscribe('/add', (message) => {
        let addFlight = JSON.parse(message.body);
        addFlight = that.transformRow(addFlight);
        if (this.checkAddRow(addFlight)) {
          const itemsToAdd = [addFlight];
          that.gridApi.updateRowData({ add: itemsToAdd });
          that.lastUpdate = moment().format('HH:mm:ss');
        }
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
    this.ngOnInit();
  }

  ngOnInit() {
    const that = this;

    try {
      this.bigRefresh.cancel();
    } catch (ex) {
      // Do Nothing
    }

    this.http.get<any>(this.serverWebRoot + '/getAirports').subscribe(data => {
      that.globals.airports = data;
    });

    this.http.get<any>(this.serverWebRoot + '/getColumns').subscribe(data => {
      // that.gridColumnApi.setColumnsVisible(['aircraft', 'arrFlightID', 'arrFlightType', 'arrFlightStatus',
      //   'arrFlightArea', 'arrFlightStand', 'arrFlightStandAllocation', 'arrFlightFlight', 'arrFlightCallSign',
      //    'arrFlightArea', 'arrFligjtStand', 'arrFlightRoute', 'arrFlightOrigin', 'arrGantt', 'arrFlightMostConfident'], true);
      that.gridColumnApi.setColumnsVisible(data.columns, true);
    });

    const rowsToAdd = [];
    this.http.get<any>(this.serverWebRoot + '/getMovements?from=' + that.offsetFrom + '&to=' + that.offsetTo +
      '&timetype=mco' + that.hardReset).subscribe(data => {
        data.forEach(element => {

          try {
            element = that.transformRow(element);

            if (that.checkAddRow(element)) {
              rowsToAdd.push(element);
            }
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

  transformRow(row: any): any {

    try {
      row.gantt = {
        start: row.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime,
        end: row.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime,
      };
    } catch (ex) {
      row.times = { start: '-', end: '-' };
    }

    row.aircraft = row.Movement.Arrival.Flight.FlightState.AircraftType.AircraftTypeId.AircraftTypeCode.IATA;
    row.arrFlightID = row.Movement.Arrival.Flight.FlightState.Value.FlightUniqueID;
    row.arrFlightType = row.Movement.Arrival.Flight.FlightState.Value.S__G_FlightType;
    row.arrFlightStatus = row.Movement.Arrival.Flight.FlightState.Value.S__G_FlightStatusText;
    try {
      row.arrFlightArea = row.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Area;
    } catch (e) {
      row.arrFlightArea = 'Unassigned';
    }
    try {
      row.arrFlightStand = row.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName;
    } catch (e) {
      row.arrFlightStand  = 'Unassigned';
    }
    try {
      row.arrFlightStandAllocation = row.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot;
    } catch (e) {
      row.arrFlightStandAllocation = 'Unassigned';
    }
    row.arrFlightFlight = {};
    row.arrFlightCallSign = {};
    row.arrFlightSched = row.Movement.Arrival.Flight.FlightState.ScheduledTime.content;
    row.arrFlightRoute = row.Movement.Arrival.Flight.FlightState.Route.ViaPoints.RouteViaPoint;
    row.arrFlightOrigin = row.Movement.Arrival.Flight.FlightState.Route.ViaPoints.RouteViaPoint;
    row.affFlightActual = row.Movement.Arrival.Flight.FlightState.Value.de_G_ActualArrival;
    row.arrFlightMostConfident = row.Movement.Arrival.Flight.FlightState.Value.de_G_MostConfidentArrivalTime;
    return row;
  }

  checkAddRow(row: any): boolean {

    if (row.Movement.Arrival.Flight.FlightState.Value.S__G_FlightStatusText.includes('OB') && !this.showOnBlocks) {
      return false;
    } else {

      const opTime = moment(row.Movement.Arrival.Flight.FlightState.Value.de_G_MostConfidentArrivalTime);
      const now = moment();
      const diff = moment().diff(opTime, 'minutes');

      if (diff < this.globals.offsetFrom || diff > this.globals.offsetTo) {
        return false;
      }
    }
    return true;

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
    this.globals.offsetTo = this.offsetTo;
    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');
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
    this.globals.offsetTo = this.offsetTo;


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


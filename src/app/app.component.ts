import { GlobalsService } from './services/globals.service';
import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { GanttRendererComponent } from './components/gantt-item/gantt-item.component';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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


  public title = 'FlightAware';
  public frameworkComponents: any;
  public rowData: any;
  public columnDefs: any;
  public context: any;
  public getRowNodeId: any;
  private gridApi: any;
  private gridColumnApi: any;
  public count = 0;
  private stompClient: any;
  public sideBar;
  public defaultColDef;

  public numRows = 0;

  private pollTask;
  public reconnectTask;

  public offsetFrom: number;
  public offsetTo: number;

  public rangeFrom: number;
  public rangeTo: number;
  public rangeDate: any;

  public hardReset = '';

  public showOnBlocks = true;
  public showDateRange = true;

  public arrColumns = [];
  public depColumns = [];

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
    this.offsetFrom = this.globals.offsetFrom;
    this.offsetTo = this.globals.offsetTo;
    this.columnDefs = [
      {
        headerName: 'Aircraft',
        field: 'arr.aircraftTypeICAO',
        width: 70,
        enableCellChangeFlash: true,
        sortable: true,
        enableRowGroup: true,
        hide: true
      },
      {
        headerName: 'Arrival Flight',
        colId: 'arr',
        children: [
          {
            headerName: 'Arrival ID',
            field: 'arr.FlightUniqueID',
            sortable: true,
            width: 100,
            hide: true
          },
          {
            headerName: 'Type',
            field: 'arr.S__G_FlightType',
            sortable: true,
            width: 100,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Status',
            field: 'arr.S__G_FlightStatusText',
            sortable: true,
            width: 120,
            enableRowGroup: true,
            filter: true,
            hide: true
          },
          {
            headerName: 'Area',
            field: 'arr.standArea',
            sortable: true,
            width: 80,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Stand',
            field: 'arr.standName',
            sortable: true,
            width: 90,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Stand Allocation',
            field: 'arr.standSlotStartTime',
            sortable: true,
            valueGetter: (params) => {
              try {
                const s = params.data.arr.standSlotStartTime;
                const e = params.data.arr.standSlotEndTime;
                if (typeof s === 'undefined' || typeof e === 'undefined') {
                  return '-';
                }
                return moment(s).format('HH:mm - ') + moment(e).format('HH:mm');
              } catch (e) {
                return '-';
              }
            },
            width: 150,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Arrival Flight',
            width: 100,
            enableCellChangeFlash: true,
            field: 'arr.flight',
            sortable: true,
            hide: true
          },
          {
            headerName: 'Call Sign',
            width: 100,
            enableCellChangeFlash: true,
            field: 'arr.S__G_CallSign',
            sortable: true,
            hide: true
          },
          {
            headerName: 'Route',
            field: 'arr.route',
            sortable: true,
            width: 100,
            hide: true
          },
          {
            headerName: 'Origin',
            field: 'arr.origin',
            sortable: true,
            valueGetter: (params) => {
              try {
                return that.globals.airports[params.data.arr.origin];
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
            field: 'arr.scheduledTime',
            valueGetter: (params) => {
              try {
                return moment(params.data.arr.scheduledTime).format('MMM DD   HH:mm');
              } catch (ex) {
                return params.data.arr.scheduledTime;
              }
            },
            sortable: true,
            width: 120,
            hide: true,
            enableCellChangeFlash: true,
          },
          {
            headerName: 'Actual',
            field: 'arr.de_G_ActualArrival',
            sortable: true,
            width: 80,
            valueGetter: (params) => {
              try {
                const v = params.data.arr.de_G_ActualArrival;
                if (typeof v === 'undefined') {
                  return '-';
                }
                return moment(v).format('HH:mm');
              } catch (e) {
                return '-';
              }
            },
            enableCellChangeFlash: true,
            hide: true
          },
          {
            headerName: 'Most Confident',
            sortable: true,
            width: 150,
            field: 'arr.de_G_MostConfidentArrivalTime',
            comparator: DateComparator,
            valueGetter: (params) => {
              try {
                return moment(params.data.arr.de_G_MostConfidentArrivalTime).format('MMM DD   HH:mm');
              } catch (ex) {
                return params.data.arr.de_G_MostConfidentArrivalTime;
              }
            },
            sort: 'asc',
            unSortIcon: true,
            enableCellChangeFlash: true,
            hide: true
          },
        ]
      },

      {
        headerName: 'Departure Flight',
        colId: 'dep',
        children: [
          {
            headerName: 'Departure ID',
            field: 'dep.FlightUniqueID',
            sortable: true,
            width: 100,
            hide: true
          },
          {
            headerName: 'Type',
            field: 'dep.S__G_FlightType',
            sortable: true,
            width: 100,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Status',
            field: 'dep.S__G_FlightStatusText',
            sortable: true,
            width: 120,
            enableRowGroup: true,
            filter: true,
            hide: true
          },
          {
            headerName: 'Area',
            field: 'dep.standArea',
            sortable: true,
            width: 80,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Stand',
            field: 'dep.standName',
            sortable: true,
            width: 90,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Stand Allocation',
            field: 'dep.standSlotStartTime',
            sortable: true,
            valueGetter: (params) => {
              try {
                const s = params.data.dep.standSlotStartTime;
                const e = params.data.dep.standSlotEndTime;
                if (typeof s === 'undefined' || typeof e === 'undefined') {
                  return '-';
                }
                return moment(s).format('HH:mm - ') + moment(e).format('HH:mm');
              } catch (e) {
                return '-';
              }
            },
            width: 150,
            enableRowGroup: true,
            hide: true
          },
          {
            headerName: 'Departure Flight',
            width: 100,
            enableCellChangeFlash: true,
            field: 'dep.flight',
            sortable: true,
            hide: true
          },
          {
            headerName: 'Call Sign',
            width: 100,
            enableCellChangeFlash: true,
            field: 'dep.S__G_CallSign',
            sortable: true,
            hide: true
          },
          {
            headerName: 'Route',
            field: 'dep.route',
            sortable: true,
            width: 100,
            hide: true
          },
          {
            headerName: 'Destination',
            field: 'dep.origin',
            sortable: true,
            valueGetter: (params) => {
              try {
                return that.globals.airports[params.data.dep.origin];
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
            field: 'dep.scheduledTime',
            valueGetter: (params) => {
              try {
                return moment(params.data.dep.scheduledTime).format('MMM DD   HH:mm');
              } catch (ex) {
                return params.data.dep.scheduledTime;
              }
            },
            sortable: true,
            width: 120,
            hide: true,
            enableCellChangeFlash: true,
          },
          {
            headerName: 'Actual',
            field: 'dep.de_G_ActualDeparture',
            sortable: true,
            width: 80,
            valueGetter: (params) => {
              try {
                const v = params.data.dep.de_G_ActualArrival;
                if (typeof v === 'undefined') {
                  return '-';
                }
                return moment(v).format('HH:mm');
              } catch (e) {
                return '-';
              }
            },
            enableCellChangeFlash: true,
            hide: true
          },
          {
            headerName: 'Most Confident',
            sortable: true,
            width: 150,
            field: 'dep.de_G_MostConfidentDepartureTime',
            comparator: DateComparator,
            valueGetter: (params) => {
              try {
                return moment(params.data.dep.de_G_MostConfidentDepartureTime).format('MMM DD   HH:mm');
              } catch (ex) {
                return params.data.dep.de_G_MostConfidentDepartureTime;
              }
            },
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
            colId: 'gantt',
            field: 'arr.gantt',
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
      ganttRenderer: GanttRendererComponent,
      sortableHeaderComponent: SortableHeaderComponent
    };


    this.getRowNodeId = (data: any) => {
      return data.id;
    };

  }


  initializeWebSocketConnection() {
    const ws = new SockJS(this.globals.serverURL);

    if (typeof (this.stompClient) !== 'undefined') {
      this.stompClient.disconnect();
    }


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

          updatedFlight = that.transformRow(updatedFlight);
          const itemsToUpdate = [];
          itemsToUpdate.push(updatedFlight);
          console.log(updatedFlight);
          that.gridApi.updateRowData({ update: itemsToUpdate });
          that.numRows = that.gridApi.getDisplayedRowCount();
        } else {
          // The MCA is out side the range, so remove it.

          const itemsToRemove = [updatedFlight];
          that.gridApi.updateRowData({ remove: itemsToRemove });
          that.numRows = that.gridApi.getDisplayedRowCount();
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
          that.numRows = that.gridApi.getDisplayedRowCount();
        }
      });

      that.stompClient.subscribe('/delete', (message) => {
        const removeFlight = JSON.parse(message.body);
        const itemsToRemove = [removeFlight];
        that.gridApi.updateRowData({ remove: itemsToRemove });
        that.lastUpdate = moment().format('HH:mm:ss');
        that.numRows = that.gridApi.getDisplayedRowCount();

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
            that.loadData();
          }

          // Set the new mode;
          that.updateMode = 'Live';

        } else if (message.body.includes('Refresh')) {

          if (!that.updateMode.includes('Refresh')) {
            that.loadData();
            that.updateMode = 'Refresh';
            that.pollTask = setInterval(() => {
              that.loadData();
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
    this.loadData();
    this.hardReset = '';
  }

  changeOnBlocks() {
    this.loadData();
  }

  loadData() {
    const that = this;
    const rowsToAdd = [];
    this.http.get<any>(this.globals.serverWebRoot + '/getMovements?from=' + that.offsetFrom + '&to=' + that.offsetTo +
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

        console.log(rowsToAdd);
        that.rowData = rowsToAdd;
        that.numRows = rowsToAdd.length;
      });
  }

  ngOnInit() {
    const that = this;

    try {
      if (typeof (this.stompClient) !== 'undefined') {
        this.stompClient.disconnect();
      }
    } catch (ex) {
      // Do Nothing
    }

    try {
      this.bigRefresh.cancel();
    } catch (ex) {
      // Do Nothing
    }

    this.http.get<any>(this.globals.serverWebRoot + '/getAirports').subscribe(data => {
      that.globals.airports = data;
    });

    this.http.get<any>(this.globals.serverWebRoot + '/getColumns').subscribe(data => {
      that.arrColumns = data.arrColumns;
      that.depColumns = data.depColumns;
    });

    this.http.get<any>(this.globals.serverWebRoot + '/getClientConfig').subscribe(data => {
      that.title = data.title;
      that.globals.displayMode = data.displayMode;
      that.displayModeChangeCallback(false);
      this.showDateRange = data.showDateRange;
      that.loadData();
      that.initializeWebSocketConnection();
      // Do  a refresh every 5 minutes
      that.bigRefresh = setTimeout(() => {
        that.ngOnInit();
      }, 5 * 60000);
    });

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
    return row;
  }

  displayModeChangeCallback(loadData = true) {
    if (loadData) {
      this.loadData();
    }
    if (this.globals.displayMode === 'DEP') {
      this.gridColumnApi.setColumnsVisible(this.arrColumns, false);
      this.gridColumnApi.setColumnsVisible(this.depColumns, true);
    }
    if (this.globals.displayMode === 'ARR') {
      this.gridColumnApi.setColumnsVisible(this.depColumns, false);
      this.gridColumnApi.setColumnsVisible(this.arrColumns, true);
    }
    if (this.globals.displayMode === 'BOTH') {
      this.gridColumnApi.setColumnsVisible(this.depColumns, true);
      this.gridColumnApi.setColumnsVisible(this.arrColumns, true);
    }
  }

  checkAddRow(row: any): boolean {

    if (!row.arr.flight && this.globals.displayMode === 'ARR') {
      return false;
    }
    if (!row.dep.flight && this.globals.displayMode === 'DEP') {
      return false;
    }
    if (row.arr.S__G_FlightStatusText.includes('OB') && !this.showOnBlocks && this.globals.displayMode === 'ARR') {
      return false;
    }



    if (this.globals.displayMode === 'ARR') {
      const opArrTime = moment(row.arr.de_G_MostConfidentArrivalTime);
      const diff = opArrTime.diff(moment(), 'minutes');
      if (diff < this.globals.offsetFrom || diff > this.globals.offsetTo) {
        return false;
      }
    }

    if (this.globals.displayMode === 'DEP') {
      const opDepTime = moment(row.arr.de_G_MostConfidentDepartureTime);
      const diff = opDepTime.diff(moment(), 'minutes');
      if (diff < this.globals.offsetFrom || diff > this.globals.offsetTo) {
        return false;
      }
    }

    if (this.globals.displayMode === 'BOTH') {

      let arrInRange = false;
      let depInRange = false;

      if (!row.arr.flight) {
        arrInRange = false;
      } else {
        const opArrTime = moment(row.arr.de_G_MostConfidentArrivalTime);
        const diff = opArrTime.diff(moment(), 'minutes');
        if (diff < this.globals.offsetFrom || diff > this.globals.offsetTo) {
          arrInRange =  false;
        } else {
          arrInRange = true;
        }
      }

      if (!row.dep.flight) {
        depInRange = false;
      } else {
        const opDepTime = moment(row.arr.de_G_MostConfidentDepartureTime);
        const diff = opDepTime.diff(moment(), 'minutes');
        if (diff < this.globals.offsetFrom || diff > this.globals.offsetTo) {
          depInRange =  false;
        } else {
          depInRange = true;
        }
      }

      if (!arrInRange && !depInRange) {
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
    this.loadData();
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

    this.loadData();

  }

  zoom(d: number) {

    let x = this.globals.minutesPerPixel;
    x = x + d * (0.1 * x);
    this.globals.minutesPerPixel = x;
    this.director.minuteTick();
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

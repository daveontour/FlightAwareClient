import { GlobalsService } from './services/globals.service';
import { SortableHeaderComponent } from './components/sortable-header/sortable-header.component';
import { GanttRendererComponent } from './components/gantt-item/gantt-item.component';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DirectorService } from './services/director.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgZone } from '@angular/core';
import * as moment from 'moment';

import AbstractXHRObject from 'sockjs-client/lib/transport/browser/abstract-xhr';
import * as $ from 'jquery';
import { AddAllocationDialogComponent } from './dialogs/add-allocation-dialog/add-allocation-dialog.component';
import { UploadFileDialogComponent } from './dialogs/upload-file-dialog/upload-file-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog/delete-dialog.component';

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

  public title = 'Counter Allocation';
  public frameworkComponents: any;
  public rowData: any;
  public columnDefs: any;
  public context: any;
  public getRowNodeId: any;
  private gridApi: any;

  public count = 0;
  
  public defaultColDef;

  public reconnectTask;

  public offsetFrom: number;
  public offsetTo: number;

  public rangeFrom: number;
  public rangeTo: number;
  public rangeDate = new Date();

  public showOnBlocks = true;
  public showDateRange = true;
  public enableDisplaySwitcher = false;

  public resources = [];


  public static that: any;

  public dateLoad = new Date();

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
    public globals: GlobalsService,
    public zone: NgZone,
    private modalService: NgbModal
  ) {

    AppComponent.that = this;
    this.offsetFrom = this.globals.offsetFrom;
    this.offsetTo = this.globals.offsetTo;
    this.columnDefs = [
      {
        headercounter: 'Counter',
        field: 'externalName',
        width: 100,
        enableCellChangeFlash: true,
        sortable: true,
        enableRowGroup: true,
        hide: false
      },
      {
        headercounter: 'Counter  Allocation',
        colId: 'gantt',
        field: 'assignments',
        cellRenderer: 'ganttRenderer',
        width: 1000,
        headerComponent: 'sortableHeaderComponent',
        hide: false
      }
    ];
    this.defaultColDef = {
      sortable: true,
      filter: true
    };

    this.context = { componentParent: this };
    this.frameworkComponents = {
      ganttRenderer: GanttRendererComponent,
      sortableHeaderComponent: SortableHeaderComponent
    };


    this.getRowNodeId = (data: any) => {
      return data.externalName;
    };

  }
 getContextMenuItems(params) {


  var flights = params.node.data.assignments.flights;
  var counter = params.node.data.code;
  var result = [];

  result.push(      {
    // custom item
    name: 'View Allocations ',
    action: function () {
      AppComponent.that.openDeleteDialog(params.node.data);
    },
    cssClasses: ['redFont', 'bold'],
  })
  
  result.push( 'separator');

  if (flights != null){
    flights.forEach(element => {
      element.counter = counter;
      result.push(
        {
          name: 'Delete Allocation: ' +  element.airline+element.flightNumber+ ' Start Time: '+element.startTime+'  End Time: '+element.endTime,
          action: function () {
            AppComponent.that.openDeleteDialog(element);
          },
          cssClasses: ['redFont', 'bold']

        }
      );
    });
  }
 
  
    return result;
  }
  

  refresh() {
    this.gridApi.setRowData();
    this.loadData();
  }

  changeOnBlocks() {
    this.loadData();
  }

  loadData() {
    this.loadResourcesHTTP();
    this.loadAllocationsHTTP();
  }


  loadResourcesHTTP() {
    this.http.get<any>(this.globals.serverURL + '/getResources').subscribe(data => {

      const itemsToUpdate = [];
      this.resources = data.resource;
      this.resources.forEach(x => {
        itemsToUpdate.push(x);
      });

      this.gridApi.updateRowData({ add: itemsToUpdate });
    });
  }

  loadAllocationsHTTP() {
    this.http.get<any>(this.globals.serverURL + '/getAllocations?from=' + this.globals.offsetFrom + '&to=' + this.globals.offsetTo + '').subscribe(data => {
      let resources = [];
      const itemsToUpdate = [];
      resources = data.resource;
      resources.forEach(allocation => {
        itemsToUpdate.push(allocation);
      });

      this.gridApi.updateRowData({ update: itemsToUpdate });
 
    });
  }

  openAddDialog(message = ''): any {

    const that = this;
    const modalRef = this.modalService.open(AddAllocationDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.counters = this.resources;
    modalRef.result.then((result) => {
      if (result.login) {
        this.http.get<any>(this.globals.serverURL + '/addAllocation?first='+result.first+'&last='+result.last+'&day='+result.day+'&start='+result.start+'&end='+result.end+'&airline='+result.airline+'&flight='+result.flight+'&sto='+result.sto).subscribe(data => {
          this.gridApi.setRowData();
          this.loadData();
        });
      }
    });
  }

  openDeleteDialog(alloc: any): any {

    const that = this;
    const modalRef = this.modalService.open(DeleteDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.alloc = alloc;
    modalRef.result.then((result) => {
      if (result.login) {
        debugger;
        this.http.get<any>(this.globals.serverURL + '/deleteAllocation?counter='+result.allocation.counter+'&start='+result.allocation.startTime+'&end='+result.allocation.endTime+'&airline='+result.allocation.airline+'&flight='+result.allocation.flightNumber+'&sto='+result.allocation.scheduleTime).subscribe(data => {
            this.gridApi.setRowData();
            this.loadData();
        });
      }
    });
  }

  openViewDialog(row: any): any {

    const that = this;
    const modalRef = this.modalService.open(DeleteDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.row = row;
    modalRef.result.then((result) => {
      if (result.login) {
        alert("View Allocation");

      }
    });
  }

  openFileDialog(message = ''): any {

    const that = this;
    const modalRef = this.modalService.open(UploadFileDialogComponent, { centered: true, size: 'md', backdrop: 'static' });
    modalRef.componentInstance.message = message;
    modalRef.result.then((result) => {
      if (result.login) {
        this.postFile(result.file);
      }
    });
  }

  postFile(fileToUpload: File) {
    const endpoint = this.globals.serverURL + '/postFile';
    const formData: FormData = new FormData();
    formData.append('fileKey', fileToUpload, fileToUpload.name);
    this.http.post(endpoint, formData).subscribe(data => {
        this.gridApi.setRowData();
        this.loadData();
    });
}

  deleteToday(){
    this.http.get<any>(this.globals.serverURL + '/deleteTodaysAllocations').subscribe(data => {
      this.gridApi.setRowData();
      this.loadData();
    });
  }

  ngOnInit() {
    const that = this;

    // // Do  a refresh every 5 minutes
    // this.bigRefresh = setTimeout(() => {
    //   that.ngOnInit();
    // }, 5 * 60000);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.loadData();
  }

  displayModeChangeCallback(loadData = true) {
    if (loadData) {
      this.loadData();
    }
  }

  setCurrentRange() {
    this.globals.rangeMode = 'offset';
    this.globals.offsetFrom = this.offsetFrom;
    this.globals.offsetTo = this.offsetTo;
    this.globals.zeroTime = moment().add(this.offsetFrom, 'minutes');
    this.director.minuteTick();

    this.loadAllocationsHTTP();
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

    this.loadAllocationsHTTP();

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
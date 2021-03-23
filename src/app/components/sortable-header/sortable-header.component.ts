import { MessengerService } from 'src/app/services/messenger.service';
import { GlobalsService } from './../../services/globals.service';
import { Component, ElementRef, OnDestroy } from '@angular/core';
import { IHeaderParams } from 'ag-grid-community';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { ViewChild, ViewContainerRef, AfterViewInit, ComponentFactoryResolver } from '@angular/core';
import * as moment from 'moment';
import { SortableHeaderTimeMarkerComponent } from '../sortable-header-time-marker/sortable-header-time-marker.component';


interface MyParams extends IHeaderParams {
  menuIcon: string;
}

@Component({
  templateUrl: './sortable-header.component.html',
  styleUrls: ['./sortable-header.component.scss']
})
export class SortableHeaderComponent implements OnDestroy, IHeaderAngularComp, AfterViewInit {
  @ViewChild('markers', { read: ViewContainerRef, static: false }) markersPt;
  public params: MyParams;
  public sorted: string;


  constructor(
    public elementRef: ElementRef,
    public resolver: ComponentFactoryResolver,
    public globals: GlobalsService,
    private messenger: MessengerService) {

    this.elementRef = elementRef;
    const that = this;
    messenger.updateNow$.subscribe(data => {
      that.updateTimeMarkers();
    });
  }

  agInit(params: MyParams): void {
    this.params = params;
    this.params.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
    this.onSortChanged();
  }

  ngAfterViewInit() {
    this.updateTimeMarkers();
  }

  updateTimeMarkers() {

    this.markersPt.clear();

    const factory = this.resolver.resolveComponentFactory(SortableHeaderTimeMarkerComponent);

    // Time for the start of the time interval
   // const zeroMarker = this.markersPt.createComponent(factory).instance;
   // zeroMarker.setInput(0, this.globals.zeroTime.format('HH:mm'), true);

    // Current Time Marker
    const nowMinutes = moment().diff(this.globals.zeroTime, 'minutes');
    const nowOffset = nowMinutes * this.globals.minutesPerPixel;
    const nowMarker = this.markersPt.createComponent(factory).instance;
    nowMarker.setInput(nowOffset, moment().format('HH:mm'), true);

    // Hour markers
    const firstHour = this.globals.zeroTime.hour();
    const minutesLeftInFirstHour = 60 - this.globals.zeroTime.minutes();
    const firstOffSet = minutesLeftInFirstHour * this.globals.minutesPerPixel;

    let hour = firstHour + 1;

    let offset = 0;
    let i = 0;
    do {
      const val = hour++ % 24;
      offset = 60 * this.globals.minutesPerPixel * i + firstOffSet;
      const newObjRef = this.markersPt.createComponent(factory).instance;
      newObjRef.setInput(offset, val + ':00', false);

      i++;

    } while (offset < window.innerWidth - 100);
  }

  ngOnDestroy() {
    console.log(`Destroying HeaderComponent`);
  }

  onMenuClick() {
    this.params.showColumnMenu(this.querySelector('.customHeaderMenuButton'));
  }

  onSortRequested(order, event) {
    this.params.setSort(order, event.shiftKey);
  }

  onSortChanged() {
    if (this.params.column.isSortAscending()) {
      this.sorted = 'asc';
    } else if (this.params.column.isSortDescending()) {
      this.sorted = 'desc';
    } else {
      this.sorted = '';
    }
  }


  private querySelector(selector: string) {
    return <HTMLElement>this.elementRef.nativeElement.querySelector(
      '.customHeaderMenuButton', selector);
  }
}

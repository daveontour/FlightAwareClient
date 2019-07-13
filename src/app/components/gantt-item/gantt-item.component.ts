import { MessengerService } from 'src/app/services/messenger.service';
import { GlobalsService } from '../../services/globals.service';
import { Component, AfterViewInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as moment from 'moment';
import * as $ from 'jquery';

@Component({
    templateUrl: './gantt-item.component.html',
    styleUrls: ['./gantt-item.component.scss']
})
export class GanttRendererComponent implements ICellRendererAngularComp, AfterViewInit {
    public params: any;
    public html: any;


    public res = '-';
    public start: number;
    public width: number;

    public dres = '-';
    public dstart: number;
    public dwidth: number;

    public arrMCApx: number;
    public depMCDpx: number;

    constructor(public globals: GlobalsService, public messenger: MessengerService) {

        const that = this;
        messenger.updateNow$.subscribe(
            data => {
                that.calcBarParams();
            }
        );

    }
    agInit(params: any): void {
        this.params = params;
    }

    ngAfterViewInit() {

        this.calcBarParams();

        // Update the hour markers on the gantt
        $('.hourIndicator').css('left', '0px');

        // // Hour markers
        const firstHour = this.globals.zeroTime.hour();
        const minutesLeftInFirstHour = 60 - this.globals.zeroTime.minutes();
        const firstOffSet = minutesLeftInFirstHour * this.globals.minutesPerPixel;

        let hour = firstHour + 1;

        let offset = 0;
        let i = 0;
        do {
            const val = hour++ % 24;
            offset = 60 * this.globals.minutesPerPixel * i + firstOffSet;
            const clazz = '.' + i + 'Hour';
            $(clazz).css('left', offset + 'px');
            i++;
        } while (offset < 1000);

        // Now Marker
        const origin = moment().diff(this.globals.zeroTime, 'minutes');
        const nowLeft = origin * this.globals.minutesPerPixel;
        $('.nowIndicator').css('left', nowLeft + 'px');
    }

    calcBarParams() {
        const minutePerPixel = this.globals.minutesPerPixel;

        // Arrival or Both
        if (this.globals.displayMode !== 'DEP') {
            try {
                if (this.params.data.arr.standSlotStartTime === '-') {
                    this.res = '';
                    this.start = 0;
                    this.width = 0;
                } else {
                    const s = moment(this.params.data.arr.standSlotStartTime);
                    const e = moment(this.params.data.arr.standSlotEndTime);

                    this.res = this.params.data.arr.standExternalName;
                    if (this.res === 'Unassigned') {
                        this.res = '-';
                    }
                    this.res = this.res + ' / ' + this.params.data.arr.aircraftTypeIATA;
                    this.res = this.res + ' / ' + this.params.data.arr.S__G_CallSign;
                    this.res = this.res + ' / ' + this.params.data.arr.route;


                    const s1 = s.diff(this.globals.zeroTime, 'minutes');
                    const stay = e.diff(s, 'minutes');

                    if (s1 < 0) {
                        this.start = 0;
                        this.width = stay * minutePerPixel + s1 * minutePerPixel;
                    } else {
                        this.start = s1 * minutePerPixel;
                        this.width = stay * minutePerPixel;
                    }

                    const s2 = moment(this.params.data.arr.de_G_MostConfidentArrivalTime).diff(this.globals.zeroTime, 'minutes');
                    this.arrMCApx = s2 * minutePerPixel;
                }

            } catch (e) {
                console.log(this.params);
            }
        } else {
            this.res = '';
            this.start = 0;
            this.width = 0;
        }

        // Departure or Both
        if (this.globals.displayMode !== 'ARR') {
            try {
                if (this.params.data.dep.standSlotStartTime === '-') {
                    this.dres = '';
                    this.dstart = 0;
                    this.dwidth = 0;
                } else {
                    const s = moment(this.params.data.dep.standSlotStartTime);
                    const e = moment(this.params.data.dep.standSlotEndTime);

                    this.dres = this.params.data.dep.standExternalName;
                    if (this.dres === 'Unassigned') {
                        this.dres = '-';
                    }
                    this.dres = this.dres + ' / ' + this.params.data.dep.aircraftTypeIATA;
                    this.dres = this.dres + ' / ' + this.params.data.dep.S__G_CallSign;
                    this.dres = this.dres + ' / ' + this.params.data.dep.route;


                    const s1 = s.diff(this.globals.zeroTime, 'minutes');
                    const stay = e.diff(s, 'minutes');

                    if (s1 < 0) {
                        this.dstart = 0;
                        this.dwidth = stay * minutePerPixel + s1 * minutePerPixel;
                    } else {
                        this.dstart = s1 * minutePerPixel;
                        this.dwidth = stay * minutePerPixel;
                    }
                    const s2 = moment(this.params.data.dep.de_G_MostConfidentDepartureTime).diff(this.globals.zeroTime, 'minutes');
                    this.depMCDpx = s2 * minutePerPixel;
 
                }

            } catch (e) {
                console.log(this.params);
            }
        } else {
            this.dres = '';
            this.dstart = 0;
            this.dwidth = 0;
        }
    }

    refresh(params: any): boolean {
        this.agInit(params);
        this.ngAfterViewInit();
        return true;
    }

    getClassArr() {

        const clazz = [];

        if (this.globals.displayMode === 'ARR') {
            clazz.push('single');
        }


        if (this.params.data.arr.standName.startsWith('Unassigned')) {
           clazz.push('arrUnassigned');
        }

        clazz.push('ganttItemArr');

        return clazz;
    }

    getClassDep() {

        const clazz = [];

        if (this.globals.displayMode === 'DEP') {
            clazz.push('single');
        }


        if (this.params.data.dep.standName.startsWith('Unassigned')) {
           clazz.push('depUnassigned');
        }

        clazz.push('ganttItemDep');

        return clazz;
    }
}

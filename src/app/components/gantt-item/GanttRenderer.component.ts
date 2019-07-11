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



    constructor(public globals: GlobalsService) {

    }
    agInit(params: any): void {
        this.params = params;
    }

    ngAfterViewInit() {

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

                const minutePerPixel = this.globals.minutesPerPixel;

                const s1 = s.diff(this.globals.zeroTime, 'minutes');
                const stay = e.diff(s, 'minutes');

                if (s1 < 0) {
                    this.start = 0;
                    this.width = stay * minutePerPixel + s1 * minutePerPixel;
                } else {
                    this.start = s1 * minutePerPixel;
                    this.width = stay * minutePerPixel;
                }
            }

        } catch (e) {
            console.log(this.params);
        }

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

    refresh(params: any): boolean {
        this.agInit(params);
        this.ngAfterViewInit();
        return true;
    }

    getClass() {

        if (this.params.data.arr.standName.startsWith('Unassigned')) {
            return 'Unassigned ganttItem';
        } else {
        return 'ganttItem';
        }
        // if (this.stand.startsWith('Unassigned')) {
        //     return 'Unassigned ganttItem';
        // }
        // if (this.statusText.startsWith('SH')) {
        //     return 'SH ganttItem';
        // }
        // if (this.statusText.startsWith('OB')) {
        //     return 'OB ganttItem';
        // }
    }
}

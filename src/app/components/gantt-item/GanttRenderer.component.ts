import { GlobalsService } from '../../services/globals.service';
import { Component, AfterViewInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as moment from 'moment';

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
    public stand = ' ';
    public statusText = ' ';

    constructor(public globals: GlobalsService) {

    }
    agInit(params: any): void {
        this.params = params;
    }

    ngAfterViewInit() {

        try {
            if (typeof (this.params.data.Movement.Arrival.Flight.FlightState.StandSlots) === 'undefined' ||
                typeof (this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot) === 'undefined') {
                this.res = '';
                this.start = 0;
                this.width = 0;
            } else {

                const s = moment(this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime);
                const e = moment(this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime);

                this.res = '-';
                try {

                    this.res = this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName;
                } catch (ex) {
                    this.res = '-';
                }

                this.res = this.res + ' / ' +
                    this.params.data.Movement.Arrival.Flight.FlightState.AircraftType.AircraftTypeId.AircraftTypeCode.IATA;

                let flightNum = '';
                try {
                    flightNum = this.params.data.Movement.Arrival.Flight.FlightId.AirlineDesignator.IATA +
                        this.params.data.Movement.Arrival.Flight.FlightId.FlightNumber.content;
                } catch (ex) {
                    console.log('Error with Flight number');
                }

                this.res = this.res + ' / ' + flightNum;

                let route = '';
                try {

                    this.params.data.Movement.Arrival.Flight.FlightState.Route.ViaPoints.RouteViaPoint.forEach(element => {
                        route = route + element.AirportCode.IATA + ', ';
                    });

                } catch (ex) {
                    console.log('Error with Route number');
                }

                this.res = this.res + ' / ' + route.substring(0, route.length - 2);

                const now = moment();
                const minutePerPixel = 1000 / 300;

                const s1 = s.diff(this.globals.zeroTime, 'minutes');
                const stay = e.diff(s, 'minutes');

                try {
                    this.stand = this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName;
                } catch (e) {
                    this.stand = 'Unassigned';
                }

                this.statusText = this.params.data.Movement.Arrival.Flight.FlightState.Value.S__G_FlightStatusText;

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
    }

    refresh(params: any): boolean {
        this.agInit(params);
        this.ngAfterViewInit();
        return true;
    }

    getClass() {

        if (this.stand.startsWith('Unassigned')) {
            return 'Unassigned ganttItem';
        }
        if (this.statusText.startsWith('SH')) {
            return 'SH ganttItem';
        }
        if (this.statusText.startsWith('OB')) {
            return 'OB ganttItem';
        }
    }
}

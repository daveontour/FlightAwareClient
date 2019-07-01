import { GlobalsService } from '../services/globals.service';
import { GanttItemComponent } from './gantt-item/gantt-item.component';
import { Component, ViewChild, ViewContainerRef, AfterViewInit, ComponentFactoryResolver } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as moment from 'moment';



@Component({
    template: `<div style="width:100%; height:100%; position:relative; display:flex; align-items:center; border-left: solid 2px blue;" >
    <template #gantt></template></div>`
})
export class GanttRendererComponent implements ICellRendererAngularComp, AfterViewInit {
    @ViewChild('gantt', { read: ViewContainerRef, static: false }) itemsPt;
    public params: any;
    public html: any;

    constructor(public resolver: ComponentFactoryResolver, public globals: GlobalsService) {

    }
    agInit(params: any): void {
        this.params = params;
    }

    ngAfterViewInit() {
        const factory = this.resolver.resolveComponentFactory(GanttItemComponent);
        const newObjRef = this.itemsPt.createComponent(factory).instance;

        // Now Marker
        const newObjRef2 = this.itemsPt.createComponent(factory).instance;
        newObjRef2.setInput(moment().diff(this.globals.zeroTime, 'minutes') * this.globals.minutesPerPixel, 10, '', false, false);

        try {
            if (typeof (this.params.data.Movement.Arrival.Flight.FlightState.StandSlots) === 'undefined' ||
                typeof (this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot) === 'undefined') {
                newObjRef.setInput(0, 0, '');
            } else {

                const s = moment(this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.StartTime);
                const e = moment(this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Value.EndTime);

                let res = '-';
                try {

                    res = this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName;
                } catch (ex) {
                  //  console.log(ex);
                    res = '-';
                }

                res = res + ' / ' +  this.params.data.Movement.Arrival.Flight.FlightState.AircraftType.AircraftTypeId.AircraftTypeCode.IATA;

                let flightNum = '';
                try {
                    flightNum =  this.params.data.Movement.Arrival.Flight.FlightId.AirlineDesignator.IATA +
                    this.params.data.Movement.Arrival.Flight.FlightId.FlightNumber.content;
                } catch (ex) {
                    console.log('Error with Flight number');
                }

                res = res + ' / ' + flightNum;

                let route = '';

                try {

                    this.params.data.Movement.Arrival.Flight.FlightState.Route.ViaPoints.RouteViaPoint.forEach(element => {
                        route = route + element.AirportCode.IATA + ', ';
                    });

                } catch (ex) {
                    console.log('Error with Route number');
                }

                res = res + ' / ' + route.substring(0, route.length - 2);

                let stand = 'Unassigned';
                try {
                    stand = this.params.data.Movement.Arrival.Flight.FlightState.StandSlots.StandSlot.Stand.Value.ExternalName;
                  } catch (e) {
                    stand = 'Unassigned';
                  }

                const now = moment();
                const minutePerPixel = 1000 / 300;

                const s1 = s.diff(this.globals.zeroTime, 'minutes');
                const stay = e.diff(s, 'minutes');

                if (s1 < 0) {
                    newObjRef.setInput(0, stay * minutePerPixel + s1 * minutePerPixel, res, true, false,
                        this.params.data.Movement.Arrival.Flight.FlightState.Value.S__G_FlightStatusText, stand);
                } else {
                    newObjRef.setInput(s1 * minutePerPixel, stay * minutePerPixel, res, true, false,
                        this.params.data.Movement.Arrival.Flight.FlightState.Value.S__G_FlightStatusText, stand);
                }

            }

            const origin = moment().diff(this.globals.zeroTime, 'minutes');

        } catch (e) {
            console.log(this.params);
        }

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
            const newObjRef3 = this.itemsPt.createComponent(factory).instance;
            newObjRef3.setInput(offset, 10, '', false, true);
            i++;
        } while (offset < 1000);
    }

    refresh(params: any): boolean {
        this.itemsPt.clear();
        this.agInit(params);
        this.ngAfterViewInit();
        return true;
    }
}

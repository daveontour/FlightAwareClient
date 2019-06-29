import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as moment from 'moment';


@Component({
    // template: `{{params.data.Flight.FlightState.GateSlots.GateSlot.Value.StartTime | date: "HH:mm"}}
    //  - {{params.data.Flight.FlightState.GateSlots.GateSlot.Value.EndTime | date: "HH:mm"}}`
    template: '{{val}}'
})
export class GateSlotRendererComponent implements ICellRendererAngularComp {
    public params: any;
    public val: any;

    agInit(params: any): void {
        this.params = params;
        try {
            if (typeof (params.data.Flight.FlightState.GateSlots) === 'undefined' ||
             typeof (params.data.Flight.FlightState.GateSlots.GateSlot) === 'undefined') {
                this.val = '-';
            } else {
                this.val = moment(params.data.Flight.FlightState.GateSlots.GateSlot.Value.StartTime).format('HH:mm') +
                ' - ' + moment(params.data.Flight.FlightState.GateSlots.GateSlot.Value.EndTime).format('HH:mm');
            }
        } catch (e) {
            console.log(params);
        }
    }

    refresh(): boolean {
        return false;
    }
}

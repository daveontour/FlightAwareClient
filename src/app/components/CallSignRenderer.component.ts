import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import * as moment from 'moment';

@Component({
    selector: 'app-schedtime-cell',
    template: '{{getValue()}}'
})
export class CallSignRendererComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }

    getValue() {
        try {
        if (this.params.type === 'arrival') {
            return this.params.data.Movement.Arrival.Flight.FlightState.Value.S__G_CallSign;
        } else {
            return this.params.data.Movement.Departure.Flight.FlightState.Value.S__G_CallSign;
         }
        } catch (e) {
            return '-';
        }
    }
}

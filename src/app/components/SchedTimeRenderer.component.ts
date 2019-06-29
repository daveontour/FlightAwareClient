import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import * as moment from 'moment';

@Component({
    selector: 'app-schedtime-cell',
    template: '{{getValue()}}'
})
export class SchedTimeRendererComponent implements ICellRendererAngularComp {
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
            return moment(this.params.data.Movement.Arrival.Flight.FlightState.ScheduledTime.content).format('MMM DD  HH:mm');
        } else  if (this.params.type === 'departure') {
            return moment(this.params.data.Movement.Departure.Flight.FlightState.ScheduledTime.content).format('MMM DD   HH:mm');
         } else  if (this.params.type === 'mca') {
            return moment(this.params.data.Movement.Arrival.Flight.FlightState.Value.de_G_MostConfidentArrivalTime)
            .format('MMM DD   HH:mm');
         }
        } catch (e) {
            return '-';
        }
    }
}

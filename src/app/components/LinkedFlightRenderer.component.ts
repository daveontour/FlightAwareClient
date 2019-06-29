import {Component, OnInit} from '@angular/core';

import {ICellRendererAngularComp} from 'ag-grid-angular';

@Component({
    selector: 'app-flight-cell',
    template: `{{val}}`
})
export class LinkedFlightRendererComponent implements ICellRendererAngularComp {

    public val: any;

    agInit(params: any): void {
        if (typeof(params.data.Flight.FlightState.LinkedFlight) !== 'undefined' ) {
            this.val = params.data.Flight.FlightState.LinkedFlight.FlightId.AirlineDesignator.IATA +
             ' ' + params.data.Flight.FlightState.LinkedFlight.FlightId.FlightNumber.content;
        } else {
            this.val = '-';
        }
    }
    refresh(): boolean {
        return false;
    }
}

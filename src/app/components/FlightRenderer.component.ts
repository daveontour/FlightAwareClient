import { Component, OnInit } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-flight-cell',
    template: `{{getValue()}}`
})
export class FlightRendererComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }


    refresh(): boolean {
        return false;
    }

    getValue(): string {
        try {
            if (this.params.type === 'arrival') {
                return this.params.data.Movement.Arrival.Flight.FlightId.AirlineDesignator.IATA + ' ' +
                    this.params.data.Movement.Arrival.Flight.FlightId.FlightNumber.content;
            } else {
                return this.params.data.Movement.Departure.Flight.FlightId.AirlineDesignator.IATA + ' ' +
                    this.params.data.Movement.Departure.Flight.FlightId.FlightNumber.content;
            }
        } catch (e) {
            return '-';
        }

    }
}

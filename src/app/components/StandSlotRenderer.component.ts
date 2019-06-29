import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import * as moment from 'moment';

@Component({
    selector: 'app-standslot-cell',
    // template: `{{params.data.Flight.FlightState.StandSlots.StandSlot.Value.StartTime | date: "HH:mm"}}
    //  - {{params.data.Flight.FlightState.StandSlots.StandSlot.Value.EndTime | date: "HH:mm"}}`
     template: '{{getValue()}}'
})
export class StandSlotRendererComponent implements ICellRendererAngularComp {
    public params: any;
    public val: any;

    agInit(params: any): void {
        this.params = params;
        try {
            if (typeof (params.data.Flight.FlightState.StandSlots) === 'undefined' ||
             typeof (params.data.Flight.FlightState.StandSlots.StandSlot) === 'undefined') {
                this.val = '-';
            } else {
                this.val = moment(params.data.Flight.FlightState.StandSlots.StandSlot.Value.StartTime).format('HH:mm') +
                ' - ' + moment(params.data.Flight.FlightState.StandSlots.StandSlot.Value.EndTime).format('HH:mm');
            }
        } catch (e) {
            console.log(params);
        }
    }

    refresh(params: any): boolean {

        console.log ('Stand Slot Refresh Called');

        return false;
        // console.log ('Stand Slot Refresh Called');
        // this.params = params;
        // try {
        //     if (typeof (params.data.Flight.FlightState.StandSlots) === 'undefined' ||
        //      typeof (params.data.Flight.FlightState.StandSlots.StandSlot) === 'undefined') {
        //         this.val = '-';
        //     } else {
        //         this.val = moment(params.data.Flight.FlightState.StandSlots.StandSlot.Value.StartTime).format('HH:mm') +
        //         ' - ' + moment(params.data.Flight.FlightState.StandSlots.StandSlot.Value.EndTime).format('HH:mm');
        //     }
        // } catch (e) {
        //     console.log(params);
        // }

        // return true;
    }

    getValue() {
        //console.log ('Stand Slot Get Value Called');

        const params = this.params;
        try {
            if (typeof (params.data.Flight.FlightState.StandSlots) === 'undefined' ||
             typeof (params.data.Flight.FlightState.StandSlots.StandSlot) === 'undefined') {
                this.val = '-';
            } else {
                this.val = moment(params.data.Flight.FlightState.StandSlots.StandSlot.Value.StartTime).format('HH:mm') +
                ' - ' + moment(params.data.Flight.FlightState.StandSlots.StandSlot.Value.EndTime).format('HH:mm');
            }
        } catch (e) {
            console.log(params);
        }

        //console.log(this.val);
        return this.val;
    }
}

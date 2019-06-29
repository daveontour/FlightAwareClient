import { GlobalsService } from './globals.service';
import { TimeScale } from './../interfaces/interfaces';
import { Injectable } from '@angular/core';
import { MessengerService } from './messenger.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {

  constructor(private messenger: MessengerService, private globals: GlobalsService) {
    const that = this;

    // Set it so the update is on the minute
    const sec = (60 - moment().second()) * 1000;

    setTimeout( () => {
      that.updateNowIndicator();
      setInterval( () => {
        that.updateNowIndicator();
      }, 60000);
    }, sec);

    setInterval( () => {
      that.globals.zeroTime = moment().subtract(90, 'm');
      that.updateNowIndicator();
    }, 5 * 60000);
  }

  public updateNowIndicator() {

    const origin = moment().diff(this.globals.zeroTime, 'minutes');
    const scale: TimeScale = {
      left: origin * this.globals.minutesPerPixel
    };

    this.messenger.updateTimeScale(scale);

  }
}

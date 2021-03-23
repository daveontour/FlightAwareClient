import { GlobalsService } from './globals.service';
import { TimeScale } from './../interfaces/interfaces';
import { Injectable } from '@angular/core';
import { MessengerService } from './messenger.service';
import * as moment from 'moment';
import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {

  constructor(private messenger: MessengerService, private globals: GlobalsService) {
    const that = this;

    // Set it so the update is on the minute
    const sec = (60 - moment().second()) * 1000;

    
    setTimeout(() => {
      that.minuteTick();
      setInterval(() => {
        that.minuteTick();
      }, 60000);
    }, sec);
  }

  public minuteTick() {


    if (this.globals.rangeMode === 'offset') {
      this.globals.zeroTime = moment().add(this.globals.offsetFrom, 'minutes');
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
    } while (offset < window.innerWidth - 100);

    // Now Indicator
    const origin = moment().diff(this.globals.zeroTime, 'minutes');
    const nowLeft = origin * this.globals.minutesPerPixel;
    $('.nowIndicator').css('left', nowLeft + 'px');

    // The Header timer markers
    const scale: TimeScale = {
      left: origin * this.globals.minutesPerPixel
    };

    this.messenger.updateTimeScale(scale);
  }
}

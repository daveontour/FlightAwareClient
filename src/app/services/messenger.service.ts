import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TimeScale } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

  // Observable string sources
  private announceUpdateNow = new Subject<TimeScale>();

  // Observable string streams
  updateNow$ = this.announceUpdateNow.asObservable();


  updateTimeScale(scale: TimeScale) {
    this.announceUpdateNow.next(scale);
  }
}

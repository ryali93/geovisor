import { EventEmitter, Injectable, Output } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  @Output() disparadorSidebar: EventEmitter<any> = new EventEmitter()
  private areaSource = new BehaviorSubject<any>(null);
  currentArea = this.areaSource.asObservable();

  constructor() { }

  sendArea(area: any) {
    this.areaSource.next(area);
  }
}

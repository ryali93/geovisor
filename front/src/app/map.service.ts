import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  @Output() disparadorSidebar: EventEmitter<any> = new EventEmitter()

  constructor() { }
}

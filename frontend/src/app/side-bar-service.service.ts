import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideBarServiceService {
  private _sidebarActive = new BehaviorSubject<boolean>(false);
  get sidebarActive() {
    return this._sidebarActive.asObservable();
  }

  toggleSidebar() {
    this._sidebarActive.next(!this._sidebarActive.value);
    console.log(this._sidebarActive.value);
  }

  constructor() { }
}

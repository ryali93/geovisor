import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'geovisor';
  toggleSidebar: boolean = false;

  sendWidgetSidebar(param: any){
    this.toggleSidebar = param.toggle;
  }

  closeSideBar(toggle: boolean){
    this.toggleSidebar = toggle;
  }
}

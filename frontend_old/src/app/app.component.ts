import { Component, OnInit } from '@angular/core';
import { SideBarServiceService } from './side-bar-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'geovisor';
  toggleSidebar: boolean = false;

  sendWidgetSidebar(param: any){
    this.toggleSidebar = param.toggle;
  }

  closeSideBar(toggle: boolean){
    this.toggleSidebar = toggle;
  }

  sidebarVisible: boolean = false;
  constructor(private sideBarServiceService: SideBarServiceService){}

  ngOnInit(): void {
    this.sideBarServiceService.sidebarActive.subscribe(active => {
      this.sidebarVisible = active;
      console.log('sidebarVisible', this.sidebarVisible)
    });
  }
}

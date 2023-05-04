import { Component } from '@angular/core';
import { SideBarServiceService } from '../side-bar-service.service';

@Component({

  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private sideBarServiceService: SideBarServiceService) {}

  toggleSidebar(){
    console.log('toggleSidebar');
    this.sideBarServiceService.toggleSidebar();
  }
}


import { Component } from '@angular/core';
import { nls } from './nls';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public imageTidop:string;
  public urlTidop:string;
  public nls = nls;

  constructor() {
    this.imageTidop   = nls.img.tidop;
    this.urlTidop     = nls.web.tidop
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { SidebarService } from '../sidebar.service';
import { nls } from './nls';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnDestroy, OnInit {
  public imageLayers:string;
  public imageBasemap:string;
  public imageTidop:string;
  public iconTidop:string;
  public urlTidop:string;
  public dataListLayer:any;
  public mapLeaflet:any;
  public nls = nls;
  public listWidget:Array<any> = [];


  constructor(private MapService:MapService, private SidebarService:SidebarService) {
    (window as any).initialize_zIndex = 401;
    this.imageLayers  = nls.icon.listLayer;
    this.imageBasemap = nls.icon.baseMap;
    this.imageTidop   = nls.img.tidop;
    this.iconTidop    = nls.icon.tidop;
    this.urlTidop     = nls.web.tidop;
  }

  ngOnInit(): void {
    this.dataListLayer = this.initializeMap();
  }

  ngOnDestroy(): void { }

  initializeMap() {
    const MAP_CENTER = L.latLng(40.6518285, -4.6760404);
    const MAP_ZOOM = 13;
    this.mapLeaflet = L.map('map', { center: MAP_CENTER, zoom: 6, zoomControl: true }); 
    this.mapLeaflet.zoomControl.setPosition('bottomright');
    this.mapLeaflet.addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }));
  }

  onClickWidgetOpen(nameWidget:any) {
    try {
      (window as any).initialize_zIndex = (parseInt((window as any).initialize_zIndex) + 1);
      let idStyle = document.getElementById(nameWidget)!.style;
      idStyle.display = "block";
      idStyle.zIndex = String((window as any).initialize_zIndex);
    } catch(error) {
        console.error(`ERROR: widgetWidthDefault => ${error}`);
    }
  };

  widgetWidthDefault(nameWidget:any) {
    try {
        const widgetWidthDefault:any = {
            Widget_ListLayer : '275px',
            Widget_BaseMap   : '275px'
        };
        return widgetWidthDefault[nameWidget];
    } catch(error) {
        console.error(`ERROR: widgetWidthDefault => ${error}`);
    }
  };
 
}

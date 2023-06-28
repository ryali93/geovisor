import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import * as L from 'leaflet';
import { nls } from './nls';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{
  public imageLayers:string;
  public imageBasemap:string;
  public imageTidop:string;
  public urlTidop:string;
  public nls = nls;
  public dataListLayer:any;
  public mapLeaflet:any;
  public listWidget:Array<any> = [];

  constructor(private MapService:MapService) {
    this.imageLayers  = nls.icon.listLayer;
    this.imageBasemap = nls.icon.baseMap;
    this.imageTidop   = nls.img.tidop;
    this.urlTidop = nls.web.tidop;
  }

  ngOnInit() {
    this.dataListLayer = this.initializeMap();

    this.listWidget = [{
        title: "Mapa Base", icon: "assets/img/map/basemap/basemap_50.png",
        top: "10px", right: "150px", bottom: "", left: ""
    },{
        title: "Lista de capas", icon: "assets/img/map/listlayer/layers.png",
        top: "10px", right: "200px", bottom: "", left: ""
    }];
  }

  ngOnDestroy(): void{ }
  
  initializeMap(){
    const MAP_CENTER = L.latLng(40.6518285, -4.6760404);
    const MAP_ZOOM = 13;

    this.mapLeaflet = L.map('map', { center: MAP_CENTER, zoom: 6, zoomControl: true }); 
    this.mapLeaflet.zoomControl.setPosition('bottomright');
    this.mapLeaflet.addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }));
  }

  // options = {
  //   layers: [
  //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
  //       maxZoom: 18, 
  //       attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  //     }),
  //     L.tileLayer.wms('http://localhost:8080/geoserver/ne/wms', {
  //       layers: 'ne:gpo_countries',
  //       format: 'image/png',
  //       transparent: true,
  //       version: '1.1.0',
  //     })
  //   ],
  //   zoom: 5,
  //   center: L.latLng(-10, -75)
  // };
  onClickWidgetOpen(nameWidget:any) {
    try {
        (window as any).initialize_zIndex = (parseInt((window as any).initialize_zIndex) + 1);
        let idStyle = document.getElementById(nameWidget)!.style;
        idStyle.display = "block";
        idStyle.zIndex = String((window as any).initialize_zIndex);
    } catch (error) {
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

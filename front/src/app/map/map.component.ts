import { Component, OnDestroy, OnInit } from '@angular/core';
import { EarthEngineService } from '../earth-engine.service';
import { MapService } from '../map.service';
import { SidebarService } from '../sidebar.service';
import { nls } from './nls';
import * as L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw-src.js'; // add this
import 'leaflet-draw';

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
  public mapUrl: string="";
  public dataListLayer:any;
  public mapLeaflet:any;
  public nls = nls;
  public listWidget:Array<any> = [];
  private drawnPolygon: any;
  
  constructor(private MapService:MapService, private SidebarService:SidebarService, private earthEngineService: EarthEngineService) {
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
    const MAP_ZOOM = 10;
    this.mapLeaflet = L.map('map', { center: MAP_CENTER, zoom: MAP_ZOOM, zoomControl: true }); 
    this.mapLeaflet.zoomControl.setPosition('bottomright');
    this.mapLeaflet.addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }));

    // Earth engine map
    this.earthEngineService.getMapId().subscribe((url:any) => {
      this.mapUrl = url;
      console.log(this.mapUrl)
      this.mapLeaflet.addLayer(L.tileLayer(this.mapUrl, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        opacity: 0.5
      }));
    });

    // Add draw toolbar
    const drawControl = new (L.Control as any).Draw({
      draw: {
        polygon: true,
        polyline: false,
        circle: false,
        rectangle: <any>{ showArea: false },
        marker: false,
        circlemarker: false
      }
    });
    this.mapLeaflet.addControl(drawControl);

    this.mapLeaflet.on('draw:created', (e: any) => {
      const type = e.layerType;
      const layer = e.layer;
      // Si existe un polígono dibujado anteriormente, lo eliminamos
      if (this.drawnPolygon) {
        this.mapLeaflet.removeLayer(this.drawnPolygon);
      }
      // Agregamos el nuevo polígono al mapa y lo guardamos en this.drawnPolygon
      this.mapLeaflet.addLayer(layer);
      this.drawnPolygon = layer;

      console.log(layer.getLatLngs());
    });
    


    

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

import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{
  constructor() { }

  ngOnInit() {}

  options = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 18, 
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      }),
      L.tileLayer.wms('http://212.128.192.252:8080/geoserver/ne/wms', {
        layers: 'ne:gpo_countries',
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
      })
    ],
    zoom: 5,
    center: L.latLng(-10, -75)
  };

}

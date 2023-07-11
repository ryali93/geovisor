import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EarthEngineService {

  constructor(private http: HttpClient) { }

  getMapId(area: any) {
    const params = { area: area };
    return this.http.get('http://localhost:3000/mapid', { params, responseType: 'text' });
  }

  getTimeSeries(area: any) {
    const params = { area: area };
    const datos = this.http.get('http://localhost:3000/get-time-series', { params, responseType: 'text' })
    console.log("backend start")
    console.log(datos)
    console.log("backend end")
    return datos;
  }
}

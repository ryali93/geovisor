import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EarthEngineService {

  constructor(private http: HttpClient) { }

  getMapId() {
    return this.http.get('http://localhost:3000/mapid', { responseType: 'text' });
  }

  getTimeSeries() {
    return this.http.get('http://localhost:3000/timeseries');
  }
}

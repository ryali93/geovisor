import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EarthEngineService {

  constructor(private http: HttpClient) { }

  getMapId(area: any) {
    const params = { area: area };
    const response = this.http.get('http://localhost:3000/mapid', { params, responseType: 'text' });
    response.subscribe((data: any) => {
      return data;
    });
  }

  getTimeSeries(area: any) {
    const params = { area: area };
    const response = this.http.get('http://localhost:3000/get-time-series', { params, responseType: 'text' })
    return response;
  }

  getMisiones() {
    let url = "https://raw.githubusercontent.com/r-spatial/rgee/master/inst/dataset.json";
    return this.http.get(url);
  }
}

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EarthEngineService } from '../earth-engine.service';
import { RestService } from '../rest.service';
import { MapService } from '../map.service';

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale } from 'chart.js';
import { nls } from './nls';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale);

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit, OnInit {
  public chart_indices: any;
  private _url:string = "http://localhost:3000";
  public nls = nls;
  public Tab01 = "Combo1";
  public Tab02 = "Combo2";
  public ID_Tab01 = "ID_Tab01";
  public ID_Tab02 = "ID_Tab02";
  public area: any;
  public radioGroup = new FormControl('', [Validators.required]);
  public defaultRadio = this.Tab01; /* RADIO por defecto */
  private _selectVariable:string = 'bh_pc';
  private _selectVariableText:string = '';
  private _selectMision:number = 137554;
  public listOptionMision:any = [];
  public listOptionEscenario:any = [];


  constructor( private MapService: MapService, private RestService:RestService, private earthEngineService:EarthEngineService ) {
    this._selectVariableText = `Precipitación (mm)`;
  }

  ngOnInit(): void {
    this.chart_indices = null;
    this.loadDataMision()
  }

  ngAfterViewInit(): void {}

  createChart(): void {
    this.MapService.currentArea.subscribe(area => this.area = area); // Get the area from the map component
    this.earthEngineService.getTimeSeries(JSON.stringify([this.area])).subscribe((response: any) => {
      response = JSON.parse(response); // Convert the response to JSON
      let feats = response["features"] // Get the features from the response
      var props: { [key: string]: any[] } = {"dates":[], "NDMI": [], "NDVI": []} // Create an object to store the properties
      for (let i = 0; i < feats.length; i++) { 
        props["dates"].push(feats[i]["properties"]["system:time_start"]);
        props["NDMI"].push(feats[i]["properties"]["NDMI"]);
        props["NDVI"].push(feats[i]["properties"]["NDVI"]);
      }
      let dates = props["dates"].map(timestamp => new Date(timestamp)); // Convert the timestamps to dates
      let formattedDates = dates.map(date => {
        let d = new Date(date);
        return d.toLocaleDateString('en-CA'); // 'en-CA' format results in 'yyyy/mm/dd' format
      });
      
      if (this.chart_indices != null) {
        this.chart_indices.destroy(); // Destroy the chart if it already exists
      }

      this.chart_indices = new Chart("indicesChart", {
        type: 'line',
        data: {
          labels: formattedDates,
          datasets: [
            {
              label: 'NDMI',
              data: props["NDMI"],
              borderColor: 'rgba(255,99,132,1)',
              fill: false
            },
            {
              label: 'NDVI',
              data: props["NDVI"],
              borderColor: 'blue',
              fill: false
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Vegetation indices'
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                  }
                  return label;
                }
              }
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          interaction: {
            mode: 'x'
          },
          scales: {
            x: {
              title: {
                display: false,
                text: 'Month'
              }
            },
            y: {
              min: -0.5,
              max: 0.8,
              title: {
                display: true,
                text: 'Value'
              }
            }
          }
        }
      });
    });
    
  }

  loadDataMision() {
    try {
      var arrOption:any = [];
      var arrMision:any = [];
      this.earthEngineService.getMisiones().subscribe( response => {
        let _response:any = response;
        let values = Object.values(_response["ImageCollection"]);
        
        var a: string = ""
        for(let h = 0; h < values.length; h++){
          a = values[h] as string;
          arrMision.push(a.split("/")[0])
        }

        arrMision = [...new Set(arrMision)] // Remove duplicates

        var b:string = ""
        for(let h = 0; h < arrMision.length; h++){
          b = arrMision[h] as string;
          arrOption.push({"value": h, "name":b})
        }
        console.log(arrOption)
        this.listOptionMision = arrOption; // Filling the combobox of missions in sidebar
      });
    } catch (error) {
      console.error(`ERROR: ${error}`);
    } 
  }

  onChangeRadio(htmlElement: any) {
    try {
      const element = htmlElement || null;
      const ID_Node = element === null ? `ID_${this.defaultRadio}` : element.id;
      /* element.value - element.id */
      // document.getElementById(`${this.ID_Tab01}_Content`)!.style.display = "none";
      // document.getElementById(`${this.ID_Tab02}_Content`)!.style.display = "none";
      // document.getElementById(`${ID_Node}_Content`)!.style.display = "block";
    } catch (error) {
      console.error(`ERROR: ${error}`);
    }
  }

  /* CBO Change - Escenario */
  onChangeVariable(htmlElement: any) {
    try {
      const value = htmlElement.target.value;
      /* this.loadDataBh_Climatologia(this._chartDeCambio01, value, 'mm'); */
      this._selectVariable = value;
      this._selectVariableText = `${htmlElement.target.options[htmlElement.target.options.selectedIndex].text}`;
      /* this.loadDataBh_Delta(this._chartClimatologia01, value, 'YYYY'); */
      this.onChangeSelect();      
    } catch (error) {
      console.error(`ERROR: ${error}`);
    }
  }

  onChangeMision(htmlElement: any) {
    try {
      let value = htmlElement.target.value;
      value = (value == '' ? 0: value);
      this._selectMision = parseInt(value);
      this.onChangeSelect(); 
    } catch (error) {
      console.error(`ERROR: ${error}`);
    }
  }
  
  onChangeSelect() {
    try {
      const MISION   = this._selectMision;
      const VARIABLE = this._selectVariable;
      // this.loadDataBh_Climatologia(
      //   this._chartClimatologia, CUENCA, 'ACCESS 1.0', 'HadGEM2-ES', 'MPI-ESM-LR', 'Observado', VARIABLE
      // )
    } catch (error) {
      console.error(`ERROR: ${error}`);
    }
  }
}

import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MapComponent } from './map/map.component';
import { SidebarComponent } from './sidebar/sidebar.component';

import { EarthEngineService } from './earth-engine.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MapComponent,
    SidebarComponent
  ],
  imports: [
    NgbModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    EarthEngineService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component } from '@angular/core';
import { faHome, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Tab {
  id: string;
  title: string;
  buttonText: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.css']
})
export class TabContainerComponent {
  tabs:Tab[] = [
    { id:'tab1', title: 'Pestaña 1', buttonText: 'Botón 1', icon: faHome},
    { id:'tab2', title: 'Pestaña 2', buttonText: 'Botón 2', icon: faUser},
    { id:'tab3', title: 'Pestaña 3', buttonText: 'Botón 3', icon: faCog}
  ];

  activeTab = this.tabs[0];

}

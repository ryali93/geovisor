import { Component, Input } from '@angular/core';
import { faHome, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Option {
  value: string;
  label: string;
}

interface Comboboxes{
  'combo1': string,
  'combo2': string,
  'combo3': string,
  'combo4': string,
  'combo5': string,
  'combo6': string
};


@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent {
  @Input() isActive = false;
  @Input() icon = faHome;
  @Input() title = '';
  @Input() buttonText = '';
  @Input() id ='';

  options: Option[] = [
    { value: 'option1', label: 'Opción x' },
    { value: 'option2', label: 'Opción y' },
    { value: 'option3', label: 'Opción z' }
  ];

  selectedOptions: Comboboxes ={
    'combo1': '',
    'combo2': '',
    'combo3': '',
    'combo4': '',
    'combo5': '',
    'combo6': ''
  };


  selectOption(id:string, value: string) {
    this.selectedOptions[id as keyof Comboboxes] = value;
  }
}

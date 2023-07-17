import { TestBed } from '@angular/core/testing';

import { GeeapiService } from './geeapi.service';

describe('GeeapiService', () => {
  let service: GeeapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeeapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

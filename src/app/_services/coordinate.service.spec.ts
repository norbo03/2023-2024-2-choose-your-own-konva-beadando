import { TestBed } from '@angular/core/testing';

import { CoordinateService } from './coordinate.service';

describe('DistanceService', () => {
  let service: CoordinateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoordinateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

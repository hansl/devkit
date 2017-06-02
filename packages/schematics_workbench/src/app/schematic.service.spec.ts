import { TestBed, inject } from '@angular/core/testing';

import { SchematicService } from './schematic.service';

describe('SchematicService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchematicService]
    });
  });

  it('should be created', inject([SchematicService], (service: SchematicService) => {
    expect(service).toBeTruthy();
  }));
});

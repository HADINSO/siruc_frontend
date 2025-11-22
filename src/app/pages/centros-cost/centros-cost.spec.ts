import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrosCost } from './centros-cost';

describe('CentrosCost', () => {
  let component: CentrosCost;
  let fixture: ComponentFixture<CentrosCost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentrosCost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentrosCost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroDeCosto } from './centro-de-costo';

describe('CentroDeCosto', () => {
  let component: CentroDeCosto;
  let fixture: ComponentFixture<CentroDeCosto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentroDeCosto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentroDeCosto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

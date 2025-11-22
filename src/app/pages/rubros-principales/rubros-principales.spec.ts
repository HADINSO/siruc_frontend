import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubrosPrincipales } from './rubros-principales';

describe('RubrosPrincipales', () => {
  let component: RubrosPrincipales;
  let fixture: ComponentFixture<RubrosPrincipales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubrosPrincipales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubrosPrincipales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubrosSenarios } from './rubros-senarios';

describe('RubrosSenarios', () => {
  let component: RubrosSenarios;
  let fixture: ComponentFixture<RubrosSenarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubrosSenarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubrosSenarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

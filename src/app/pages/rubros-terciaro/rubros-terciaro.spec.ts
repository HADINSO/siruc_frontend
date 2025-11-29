import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubrosTerciaro } from './rubros-terciaro';

describe('RubrosTerciaro', () => {
  let component: RubrosTerciaro;
  let fixture: ComponentFixture<RubrosTerciaro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubrosTerciaro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubrosTerciaro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

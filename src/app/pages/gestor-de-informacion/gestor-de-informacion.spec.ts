import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestorDeInformacion } from './gestor-de-informacion';

describe('GestorDeInformacion', () => {
  let component: GestorDeInformacion;
  let fixture: ComponentFixture<GestorDeInformacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestorDeInformacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestorDeInformacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

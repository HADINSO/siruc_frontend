import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulacionPresupuestal } from './formulacion-presupuestal';

describe('FormulacionPresupuestal', () => {
  let component: FormulacionPresupuestal;
  let fixture: ComponentFixture<FormulacionPresupuestal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulacionPresupuestal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulacionPresupuestal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

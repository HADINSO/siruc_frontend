import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarCredenciales } from './recuperar-credenciales';

describe('RecuperarCredenciales', () => {
  let component: RecuperarCredenciales;
  let fixture: ComponentFixture<RecuperarCredenciales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperarCredenciales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarCredenciales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubrosSecundarios } from './rubros-secundarios';

describe('RubrosSecundarios', () => {
  let component: RubrosSecundarios;
  let fixture: ComponentFixture<RubrosSecundarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubrosSecundarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubrosSecundarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

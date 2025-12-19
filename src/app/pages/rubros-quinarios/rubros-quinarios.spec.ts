import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubrosQuinarios } from './rubros-quinarios';

describe('RubrosQuinarios', () => {
  let component: RubrosQuinarios;
  let fixture: ComponentFixture<RubrosQuinarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubrosQuinarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubrosQuinarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

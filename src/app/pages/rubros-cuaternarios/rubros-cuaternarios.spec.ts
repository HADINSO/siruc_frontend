import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubrosCuaternarios } from './rubros-cuaternarios';

describe('RubrosCuaternarios', () => {
  let component: RubrosCuaternarios;
  let fixture: ComponentFixture<RubrosCuaternarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubrosCuaternarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubrosCuaternarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

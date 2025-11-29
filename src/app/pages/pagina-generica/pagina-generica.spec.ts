import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaGenerica } from './pagina-generica';

describe('PaginaGenerica', () => {
  let component: PaginaGenerica;
  let fixture: ComponentFixture<PaginaGenerica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaGenerica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaGenerica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCompra } from './editar-compra';

describe('EditarCompra', () => {
  let component: EditarCompra;
  let fixture: ComponentFixture<EditarCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCompra],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarCompra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

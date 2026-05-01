import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCompra } from './crear-compra';

describe('CrearCompra', () => {
  let component: CrearCompra;
  let fixture: ComponentFixture<CrearCompra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCompra],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearCompra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

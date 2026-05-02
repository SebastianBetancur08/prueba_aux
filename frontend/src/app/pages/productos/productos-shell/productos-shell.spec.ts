import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosShell } from './productos-shell';

describe('ProductosShell', () => {
  let component: ProductosShell;
  let fixture: ComponentFixture<ProductosShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosShell],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCompraComponent } from './crear-compra';

describe('CrearCompraComponent', () => {
  let component: CrearCompraComponent;
  let fixture: ComponentFixture<CrearCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCompraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearCompraComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

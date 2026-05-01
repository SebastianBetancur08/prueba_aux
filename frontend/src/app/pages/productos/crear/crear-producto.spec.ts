import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearProductoComponent } from './crear-producto';

describe('CrearProductoComponent', () => {
  let component: CrearProductoComponent;
  let fixture: ComponentFixture<CrearProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearProductoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearProductoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

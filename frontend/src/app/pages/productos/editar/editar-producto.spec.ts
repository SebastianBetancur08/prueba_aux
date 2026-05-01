import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarProductoComponent } from './editar-producto';

describe('EditarProductoComponent', () => {
  let component: EditarProductoComponent;
  let fixture: ComponentFixture<EditarProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProductoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarProductoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

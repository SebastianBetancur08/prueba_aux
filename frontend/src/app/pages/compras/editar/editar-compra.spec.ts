import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCompraComponent } from './editar-compra';

describe('EditarCompraComponent', () => {
  let component: EditarCompraComponent;
  let fixture: ComponentFixture<EditarCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCompraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarCompraComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarComprasComponent } from './compras';

describe('ListarComprasComponent', () => {
  let component: ListarComprasComponent;
  let fixture: ComponentFixture<ListarComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarComprasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarComprasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

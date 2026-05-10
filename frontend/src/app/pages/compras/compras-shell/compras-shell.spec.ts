import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprasShell } from './compras-shell';

describe('ComprasShell', () => {
  let component: ComprasShell;
  let fixture: ComponentFixture<ComprasShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprasShell],
    }).compileComponents();

    fixture = TestBed.createComponent(ComprasShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

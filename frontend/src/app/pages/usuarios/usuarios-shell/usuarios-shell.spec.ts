import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosShell } from './usuarios-shell';

describe('UsuariosShell', () => {
  let component: UsuariosShell;
  let fixture: ComponentFixture<UsuariosShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosShell],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

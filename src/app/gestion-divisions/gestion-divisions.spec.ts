import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDivisions } from './gestion-divisions';

describe('GestionDivisions', () => {
  let component: GestionDivisions;
  let fixture: ComponentFixture<GestionDivisions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionDivisions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionDivisions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEnseignants } from './gestion-enseignants';

describe('GestionEnseignants', () => {
  let component: GestionEnseignants;
  let fixture: ComponentFixture<GestionEnseignants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEnseignants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionEnseignants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

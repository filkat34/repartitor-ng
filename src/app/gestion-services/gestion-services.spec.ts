import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionServices } from './gestion-services';

describe('GestionServices', () => {
  let component: GestionServices;
  let fixture: ComponentFixture<GestionServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

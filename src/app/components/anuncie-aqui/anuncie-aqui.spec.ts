import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnuncieAquiComponent } from './anuncie-aqui';

describe('AnuncieAquiComponent', () => {
  let component: AnuncieAquiComponent;
  let fixture: ComponentFixture<AnuncieAquiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnuncieAquiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnuncieAquiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

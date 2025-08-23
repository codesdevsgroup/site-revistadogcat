import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCaoComponent } from './cadastro-cao';

describe('CadastroCaoComponent', () => {
  let component: CadastroCaoComponent;
  let fixture: ComponentFixture<CadastroCaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroCaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroCaoComponent);
    component = fixtureInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

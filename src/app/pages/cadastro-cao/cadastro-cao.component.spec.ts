import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCaoComponent } from './cadastro-cao.component';

describe('CadastroCaoComponent', () => {
  let component: CadastroCaoComponent;
  let fixture: ComponentFixture<CadastroCaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroCaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroCaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

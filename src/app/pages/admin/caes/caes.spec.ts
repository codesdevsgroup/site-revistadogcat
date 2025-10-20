import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaesComponent } from './caes';

describe('CaesComponent', () => {
  let component: CaesComponent;
  let fixture: ComponentFixture<CaesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

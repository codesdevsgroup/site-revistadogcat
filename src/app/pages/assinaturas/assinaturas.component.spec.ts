import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssinaturasComponent } from './assinaturas.component';

describe('AssinaturasComponent', () => {
  let component: AssinaturasComponent;
  let fixture: ComponentFixture<AssinaturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssinaturasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssinaturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

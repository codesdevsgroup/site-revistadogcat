import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopCanisGatisComponent } from './top-canis-gatis.component';

describe('TopCanisGatisComponent', () => {
  let component: TopCanisGatisComponent;
  let fixture: ComponentFixture<TopCanisGatisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopCanisGatisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopCanisGatisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

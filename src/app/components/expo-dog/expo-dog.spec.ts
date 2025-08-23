import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpoDogComponent } from './expo-dog';

describe('ExpoDogComponent', () => {
  let component: ExpoDogComponent;
  let fixture: ComponentFixture<ExpoDogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpoDogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpoDogComponent);
    component = fixtureInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

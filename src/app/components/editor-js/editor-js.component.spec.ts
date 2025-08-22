import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorJsComponent } from './editor-js.component';

describe('EditorJsComponent', () => {
  let component: EditorJsComponent;
  let fixture: ComponentFixture<EditorJsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorJsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorJsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

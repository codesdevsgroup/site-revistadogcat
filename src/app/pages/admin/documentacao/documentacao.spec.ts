import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacaoComponent } from './documentacao';

describe('DocumentacaoComponent', () => {
  let component: DocumentacaoComponent;
  let fixture: ComponentFixture<DocumentacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

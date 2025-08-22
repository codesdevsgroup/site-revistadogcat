import { Component, OnInit, OnDestroy, Input, forwardRef, Inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-editor-js',
  imports: [],
  templateUrl: './editor-js.component.html',
  styleUrl: './editor-js.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorJsComponent),
      multi: true
    }
  ]
})
export class EditorJsComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @Input() placeholder: string = 'Digite o conteúdo aqui...';
  
  private editor: any;
  private onChange = (value: any) => {};
  private onTouched = () => {};
  private isDisabled = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeEditor();
    }
  }

  ngOnDestroy(): void {
    if (this.editor && this.editor.destroy) {
      this.editor.destroy();
    }
  }

  private async initializeEditor(): Promise<void> {
    try {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const Quote = (await import('@editorjs/quote')).default;
      const Code = (await import('@editorjs/code')).default;
      const Delimiter = (await import('@editorjs/delimiter')).default;

      this.editor = new EditorJS({
        holder: this.editorContainer.nativeElement,
        placeholder: this.placeholder,
        tools: {
          header: Header,
          quote: Quote,
          code: Code,
          delimiter: Delimiter
        },
        data: {
          blocks: []
        },
        onChange: async () => {
          if (this.editor) {
            try {
              const outputData = await this.editor.save();
              this.onChange(outputData);
              this.onTouched();
            } catch (error) {
              console.error('Erro ao salvar dados do editor:', error);
            }
          }
        },
        readOnly: this.isDisabled
      });
    } catch (error) {
      console.error('Erro ao inicializar Editor.js:', error);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (isPlatformBrowser(this.platformId) && this.editor && value) {
      this.editor.render(value).catch((error: any) => {
        console.error('Erro ao renderizar conteúdo:', error);
      });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isPlatformBrowser(this.platformId) && this.editor) {
      this.editor.readOnly.toggle(isDisabled);
    }
  }
}

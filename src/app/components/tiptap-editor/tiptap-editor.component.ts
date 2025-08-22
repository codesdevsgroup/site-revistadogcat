import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';

@Component({
  selector: 'app-tiptap-editor',
  templateUrl: './tiptap-editor.component.html',
  styleUrls: ['./tiptap-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TiptapEditorComponent),
      multi: true
    }
  ]
})
export class TiptapEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder: string = 'Digite seu texto aqui...';
  @Input() editable: boolean = true;
  @Output() contentChange = new EventEmitter<string>();

  editor!: Editor;
  private onChange = (value: string) => {};
  private onTouched = () => {};
  parseInt = parseInt;

  ngOnInit() {
    this.editor = new Editor({
      element: document.querySelector('#tiptap-editor'),
      extensions: [
        StarterKit,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TextStyle,
        Color,
        FontFamily,
        Highlight.configure({
          multicolor: true
        }),
        Underline,
        Image.configure({
          inline: true,
          allowBase64: true,
        })
      ],
      content: '',
      editable: this.editable,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.onChange(html);
        this.contentChange.emit(html);
      },
      onBlur: () => {
        this.onTouched();
      }
    });
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (this.editor && value !== this.editor.getHTML()) {
      this.editor.commands.setContent(value || '');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.setEditable(!isDisabled);
    }
  }

  // Toolbar methods
  toggleBold() {
    this.editor.chain().focus().toggleBold().run();
  }

  toggleItalic() {
    this.editor.chain().focus().toggleItalic().run();
  }

  toggleUnderline() {
    this.editor.chain().focus().toggleUnderline().run();
  }

  toggleStrike() {
    this.editor.chain().focus().toggleStrike().run();
  }

  setTextAlign(alignment: 'left' | 'center' | 'right' | 'justify') {
    this.editor.chain().focus().setTextAlign(alignment).run();
  }

  setHeading(level: number) {
    if (level === 0) {
      this.editor?.chain().focus().setParagraph().run();
    } else {
      this.editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  }

  toggleBulletList() {
    this.editor.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList() {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote() {
    this.editor.chain().focus().toggleBlockquote().run();
  }

  toggleCodeBlock() {
    this.editor.chain().focus().toggleCodeBlock().run();
  }

  setColor(color: string) {
    this.editor.chain().focus().setColor(color).run();
  }

  toggleHighlight(color?: string) {
    if (color) {
      this.editor.chain().focus().toggleHighlight({ color }).run();
    } else {
      this.editor.chain().focus().toggleHighlight().run();
    }
  }

  addImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.editor?.chain().focus().setImage({ src: e.target.result }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  undo() {
    this.editor.chain().focus().undo().run();
  }

  redo() {
    this.editor.chain().focus().redo().run();
  }

  // Helper methods for toolbar state
  isBold(): boolean {
    return this.editor?.isActive('bold') || false;
  }

  isItalic(): boolean {
    return this.editor?.isActive('italic') || false;
  }

  isUnderline(): boolean {
    return this.editor?.isActive('underline') || false;
  }

  isStrike(): boolean {
    return this.editor?.isActive('strike') || false;
  }

  isTextAlign(alignment: string): boolean {
    return this.editor?.isActive({ textAlign: alignment }) || false;
  }

  isHeading(level: number): boolean {
    return this.editor?.isActive('heading', { level }) || false;
  }

  isBulletList(): boolean {
    return this.editor?.isActive('bulletList') || false;
  }

  isOrderedList(): boolean {
    return this.editor?.isActive('orderedList') || false;
  }

  isBlockquote(): boolean {
    return this.editor?.isActive('blockquote') || false;
  }

  isCodeBlock(): boolean {
    return this.editor?.isActive('codeBlock') || false;
  }
}
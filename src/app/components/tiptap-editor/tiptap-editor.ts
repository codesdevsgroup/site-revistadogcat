import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

import { Link } from '@tiptap/extension-link';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Code } from '@tiptap/extension-code';
// import { FontSize } from 'tiptap-extension-font-size';


@Component({
  selector: 'app-tiptap-editor',
  templateUrl: './tiptap-editor.html',
  styleUrls: ['./tiptap-editor.scss'],
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
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
          // FontSize,
          Highlight.configure({
            multicolor: true
          }),
          Underline,
          Code,
          Image.configure({
            inline: true,
            allowBase64: true,
          }),

          Link.configure({
            openOnClick: false,
          }),
          Subscript,
          Superscript,
          HorizontalRule,
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
    if (isPlatformBrowser(this.platformId)) {
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
  }

  undo() {
    this.editor.chain().focus().undo().run();
  }

  redo() {
    this.editor.chain().focus().redo().run();
  }

  // Métodos para novas funcionalidades
  toggleSubscript() {
    this.editor?.chain().focus().toggleSubscript().run();
  }

  toggleSuperscript() {
    this.editor?.chain().focus().toggleSuperscript().run();
  }

  setLink() {
    if (isPlatformBrowser(this.platformId)) {
      const url = window.prompt('URL do link:');
      if (url) {
        this.editor?.chain().focus().setLink({ href: url }).run();
      }
    }
  }

  unsetLink() {
    this.editor?.chain().focus().unsetLink().run();
  }



  insertHorizontalRule() {
    this.editor?.chain().focus().setHorizontalRule().run();
  }

  // Métodos para ajuste de imagem
  resizeImage(size: 'small' | 'medium' | 'large' | 'original') {
    const selection = this.editor?.state.selection;
    if (selection && this.editor?.isActive('image')) {
      let width: string;
      switch (size) {
        case 'small':
          width = '25%';
          break;
        case 'medium':
          width = '50%';
          break;
        case 'large':
          width = '75%';
          break;
        case 'original':
          width = '100%';
          break;
      }
      this.editor?.chain().focus().updateAttributes('image', { style: `width: ${width}; height: auto;` }).run();
    }
  }

  alignImage(alignment: 'left' | 'center' | 'right') {
    const selection = this.editor?.state.selection;
    if (selection && this.editor?.isActive('image')) {
      let style: string;
      switch (alignment) {
        case 'left':
          style = 'float: left; margin: 0 16px 16px 0;';
          break;
        case 'center':
          style = 'display: block; margin: 16px auto;';
          break;
        case 'right':
          style = 'float: right; margin: 0 0 16px 16px;';
          break;
      }
      this.editor?.chain().focus().updateAttributes('image', { style }).run();
    }
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

  isSubscript(): boolean {
    return this.editor?.isActive('subscript') || false;
  }

  isSuperscript(): boolean {
    return this.editor?.isActive('superscript') || false;
  }

  isLink(): boolean {
    return this.editor?.isActive('link') || false;
  }

  isCode(): boolean {
    return this.editor?.isActive('code') || false;
  }

  // Novos métodos para as funcionalidades adicionadas
  toggleCode() {
    this.editor?.chain().focus().toggleCode().run();
  }

  setFontFamily(fontFamily: string) {
    if (fontFamily) {
      this.editor?.chain().focus().setFontFamily(fontFamily).run();
    } else {
      this.editor?.chain().focus().unsetFontFamily().run();
    }
  }

  setFontSize(fontSize: string) {
    if (fontSize) {
      this.editor?.chain().focus().setMark('textStyle', { fontSize }).run();
    } else {
      this.editor?.chain().focus().unsetMark('textStyle').run();
    }
  }

  setBackgroundColor(color: string) {
    this.editor?.chain().focus().setHighlight({ color }).run();
  }

  clearFormatting() {
    this.editor?.chain().focus().clearNodes().unsetAllMarks().run();
  }

  insertPageBreak() {
    this.editor?.chain().focus().setHardBreak().run();
  }


}
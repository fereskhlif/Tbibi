import {
    Directive,
    HostListener,
    Output,
    Input,
    OnChanges,
    SimpleChanges,
    OnDestroy,
    EventEmitter,
    Optional,
    Inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
    selector: '[appFilePicker]',
    exportAs: 'appFilePicker',
})
export class FilePickerDirective implements OnDestroy, OnChanges {
    private _form: HTMLFormElement;

    /**
     * Prevent dragover event so drop events register.
     **/
    @HostListener('dragover', ['$event'])
    _onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    /**
     * Set files on drop.
     * Emit selected files.
     **/
    @HostListener('drop', ['$event'])
    _drop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer && event.dataTransfer.files) {
            this._nativeFileElement.files = event.dataTransfer.files;
            this._onFilesChanged();
        }
    }

    /**
     * Invoke file browse on click.
     **/
    @HostListener('click', ['$event'])
    _onClick(event: Event) {
        if (event) {
            event.preventDefault();
        }
        this._nativeFileElement.click();
    }

    /**
     * Allow multiple file selection. Defaults to `false`.
     * **/
    @Input() multiple: boolean = false;

    /**
     * File list emitted on change.
     * **/
    @Output()
    filesChanged = new EventEmitter<FileList | null>();

    /**
     * File list emitted on reset.
     * **/
    @Output()
    filesReset = new EventEmitter<void>();

    /**
     * Native input[type=file] element.
     **/
    get nativeFileElement() {
        return this._nativeFileElement;
    }
    private _nativeFileElement: HTMLInputElement;

    private _onFilesChanged = () => {
        this.filesChanged.emit(this._nativeFileElement.files);
    };

    constructor(@Optional() @Inject(DOCUMENT) private _document: Document) {
        if (this._document) {
            this._form = this._document.createElement('form');
            this._nativeFileElement = this._document.createElement('input');
            this._nativeFileElement.type = 'file';
            this._nativeFileElement.multiple = this.multiple;
            this._nativeFileElement.addEventListener('change', this._onFilesChanged);
            this._form.appendChild(this._nativeFileElement);
        } else {
            // Fallbacks for SSR or environments without document
            this._form = {} as any;
            this._nativeFileElement = {} as any;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['multiple'] && this._nativeFileElement) {
            this._nativeFileElement.multiple = this.multiple;
        }
    }

    ngOnDestroy() {
        if (this._nativeFileElement && this._nativeFileElement.removeEventListener) {
            this._nativeFileElement.removeEventListener('change', this._onFilesChanged);
            if (this._nativeFileElement.remove) this._nativeFileElement.remove();
        }
        if (this._form && this._form.remove) {
            this._form.remove();
        }
    }

    /**
     * Reset file list.
     **/
    reset() {
        if (this._form && this._form.reset) {
            this._form.reset();
        }
        this.filesReset.emit();
    }
}

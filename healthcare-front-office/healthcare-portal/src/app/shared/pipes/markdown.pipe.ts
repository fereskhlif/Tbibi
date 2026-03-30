import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string): SafeHtml {
        if (!value) return '';

        // Configure marked for inline rendering (no wrapping <p> for short text)
        marked.setOptions({
            breaks: true,
            gfm: true
        });

        const html = marked.parse(value) as string;
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
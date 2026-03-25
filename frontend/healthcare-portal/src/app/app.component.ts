import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styles: [':host { display: block; }']
})
export class AppComponent {
  ngOnInit() {
  const token = localStorage.getItem('TokenUserConnect');
  if (token && (token.startsWith('"') || token.endsWith('"'))) {
    const cleanToken = token.replace(/^"|"$/g, '');
    localStorage.setItem('TokenUserConnect', cleanToken);
    console.log('Token nettoyé au démarrage');
  }
 }
}

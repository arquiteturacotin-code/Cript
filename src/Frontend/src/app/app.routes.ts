import { Routes } from '@angular/router';
import { guardaRotaCriptografada } from './nucleo/navegacao/guarda-rota-criptografada.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    canActivate: [guardaRotaCriptografada],
    loadComponent: () =>
      import('./paginas/inicio/inicio.component').then(m => m.InicioComponent),
  },
  {
    path: 'painel',
    canActivate: [guardaRotaCriptografada],
    loadComponent: () =>
      import('./paginas/painel/painel.component').then(m => m.PainelComponent),
  },
  {
    path: 'configuracoes',
    canActivate: [guardaRotaCriptografada],
    loadComponent: () =>
      import('./paginas/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];

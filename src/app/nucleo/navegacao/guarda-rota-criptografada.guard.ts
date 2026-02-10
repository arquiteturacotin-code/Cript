import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

const PREFIXO = '/-/';

export const guardaRotaCriptografada: CanActivateFn = () => {
  const router = inject(Router);
  const urlNavegador = window.location.pathname;

  const ehRaiz = urlNavegador === '/' || urlNavegador === '';
  const ehRotaCriptografada = urlNavegador.startsWith(PREFIXO);

  if (ehRaiz || ehRotaCriptografada) {
    return true;
  }

  router.navigateByUrl('/');
  return false;
};

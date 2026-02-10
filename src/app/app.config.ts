import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, UrlSerializer } from '@angular/router';
import { MotorCriptografia } from './nucleo/criptografia/motor-criptografia.service';
import { SerializadorUrlCriptografado } from './nucleo/criptografia/serializador-url-criptografado';
import { PilhaNavegacao } from './nucleo/navegacao/pilha-navegacao.service';
import { routes } from './app.routes';

function inicializarMotorCriptografia(motor: MotorCriptografia): () => void {
  return () => motor.inicializar();
}

function inicializarPilhaNavegacao(pilha: PilhaNavegacao): () => void {
  return () => pilha.inicializar();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: UrlSerializer,
      useClass: SerializadorUrlCriptografado,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: inicializarMotorCriptografia,
      deps: [MotorCriptografia],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: inicializarPilhaNavegacao,
      deps: [PilhaNavegacao],
      multi: true,
    },
  ],
};

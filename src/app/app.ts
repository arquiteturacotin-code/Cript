import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PilhaNavegacao } from './nucleo/navegacao/pilha-navegacao.service';
import { MotorCriptografia } from './nucleo/criptografia/motor-criptografia.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {

  urlCriptografada = '';
  rotaReal = '';
  private inscricao: Subscription | null = null;

  constructor(
    protected readonly pilhaNavegacao: PilhaNavegacao,
    private readonly motorCriptografia: MotorCriptografia,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.inscricao = this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.rotaReal = this.extrairRotaReal();
        this.urlCriptografada = this.motorCriptografia.criptografar(this.rotaReal);
      });
  }

  private extrairRotaReal(): string {
    let rotaAtiva: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;

    while (rotaAtiva.firstChild) {
      rotaAtiva = rotaAtiva.firstChild;
    }

    const segmentos = rotaAtiva.url.map(segmento => segmento.path);
    return segmentos.length > 0 ? '/' + segmentos.join('/') : '/';
  }

  ngOnDestroy(): void {
    this.inscricao?.unsubscribe();
  }

  voltar(): void {
    this.pilhaNavegacao.voltar();
  }

  navegarPara(rota: string): void {
    this.router.navigateByUrl(rota);
  }
}

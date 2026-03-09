import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MotorCriptografia } from '../criptografia/motor-criptografia.service';

const IDENTIFICADOR_STORAGE_PILHA = '\x70\x6e';

@Injectable({ providedIn: 'root' })
export class PilhaNavegacao implements OnDestroy {

  private pilha: string[] = [];
  private inscricao: Subscription | null = null;
  private navegandoViaPilha = false;

  constructor(
    private readonly router: Router,
    private readonly motorCriptografia: MotorCriptografia,
  ) {}

  inicializar(): void {
    this.restaurarPilha();
    this.escutarNavegacao();
  }

  voltar(): void {
    if (this.pilha.length <= 1) {
      return;
    }

    this.navegandoViaPilha = true;
    this.pilha.pop();
    const rotaAnterior = this.pilha[this.pilha.length - 1];
    this.sincronizarStorage();

    this.router.navigateByUrl(rotaAnterior).finally(() => {
      this.navegandoViaPilha = false;
    });
  }

  get rotaAtual(): string | null {
    return this.pilha.length > 0 ? this.pilha[this.pilha.length - 1] : null;
  }

  get rotaAnterior(): string | null {
    return this.pilha.length > 1 ? this.pilha[this.pilha.length - 2] : null;
  }

  get podeVoltar(): boolean {
    return this.pilha.length > 1;
  }

  get historico(): readonly string[] {
    return this.pilha;
  }

  limpar(): void {
    this.pilha = [];
    sessionStorage.removeItem(IDENTIFICADOR_STORAGE_PILHA);
  }

  ngOnDestroy(): void {
    this.inscricao?.unsubscribe();
  }

  private escutarNavegacao(): void {
    this.inscricao = this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => {
        if (this.navegandoViaPilha) {
          return;
        }

        const rota = evento.urlAfterRedirects || evento.url;
        this.adicionarRota(rota);
      });
  }

  private adicionarRota(rota: string): void {
    const ultimaRota = this.pilha[this.pilha.length - 1];

    if (ultimaRota === rota) {
      return;
    }

    this.pilha.push(rota);
    this.sincronizarStorage();
  }

  private sincronizarStorage(): void {
    const dadosBrutos = JSON.stringify(this.pilha);
    const dadosCifrados = this.motorCriptografia.criptografarDados(dadosBrutos);
    sessionStorage.setItem(IDENTIFICADOR_STORAGE_PILHA, dadosCifrados);
  }

  private restaurarPilha(): void {
    const dadosCifrados = sessionStorage.getItem(IDENTIFICADOR_STORAGE_PILHA);

    if (!dadosCifrados) {
      return;
    }

    try {
      const dadosBrutos = this.motorCriptografia.descriptografarDados(dadosCifrados);
      this.pilha = JSON.parse(dadosBrutos);
    } catch {
      this.pilha = [];
    }
  }
}

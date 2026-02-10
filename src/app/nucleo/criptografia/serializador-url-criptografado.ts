import { Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';
import { MotorCriptografia } from './motor-criptografia.service';

const PREFIXO = '/-/';
const ROTAS_IGNORADAS = ['/', ''];

@Injectable()
export class SerializadorUrlCriptografado implements UrlSerializer {

  private readonly serializadorPadrao = new DefaultUrlSerializer();

  constructor(private readonly motorCriptografia: MotorCriptografia) {}

  parse(url: string): UrlTree {
    const urlDescriptografada = this.descriptografarUrl(url);
    return this.serializadorPadrao.parse(urlDescriptografada);
  }

  serialize(tree: UrlTree): string {
    const urlOriginal = this.serializadorPadrao.serialize(tree);
    return this.criptografarUrl(urlOriginal);
  }

  private criptografarUrl(url: string): string {
    if (this.deveIgnorar(url)) {
      return url;
    }

    const cifrado = this.motorCriptografia.criptografar(url);
    return `${PREFIXO}${cifrado}`;
  }

  private descriptografarUrl(url: string): string {
    if (!url.startsWith(PREFIXO)) {
      return url;
    }

    const cifrado = url.substring(PREFIXO.length);
    const rotaOriginal = this.motorCriptografia.descriptografar(cifrado);

    if (!rotaOriginal) {
      return '/';
    }

    return rotaOriginal;
  }

  private deveIgnorar(url: string): boolean {
    return ROTAS_IGNORADAS.includes(url);
  }
}

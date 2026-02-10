import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

const ID_STORAGE = '\x63\x6b';

const CHAVE_MASCARA = CryptoJS.enc.Hex.parse(
  '5a3fc18b47e219d673ae04f8629d2bc5814efa37a30cd965b2581fe4907b26cd',
);
const IV_MASCARA = CryptoJS.enc.Hex.parse(
  '43bf0894db6a11f5a73ce0528e29c874',
);

@Injectable({ providedIn: 'root' })
export class MotorCriptografia {

  private chaveAes!: CryptoJS.lib.WordArray;
  private chaveHmac!: CryptoJS.lib.WordArray;
  private ivSessao!: CryptoJS.lib.WordArray;
  private nonceSessao = '';

  inicializar(): void {
    const armazenado = sessionStorage.getItem(ID_STORAGE);

    if (armazenado) {
      try {
        const segredo = this.desmascarar(armazenado);
        if (segredo) {
          this.derivarChaves(segredo);
          return;
        }
      } catch { /* dados corrompidos, gerar novo */ }
    }

    const segredo = CryptoJS.lib.WordArray.random(64).toString();
    sessionStorage.setItem(ID_STORAGE, this.mascarar(segredo));
    this.derivarChaves(segredo);
  }

  criptografar(rota: string): string {
    if (!rota) return '';

    const payload = this.nonceSessao + rota;
    const cifrado = this.cifrarAes(payload);
    const assinatura = this.assinar(cifrado);

    return `${cifrado}.${assinatura}`;
  }

  descriptografar(textoCifrado: string): string {
    if (!textoCifrado) return '';

    try {
      const indicePonto = textoCifrado.lastIndexOf('.');
      if (indicePonto === -1) return '';

      const cifrado = textoCifrado.substring(0, indicePonto);
      const assinatura = textoCifrado.substring(indicePonto + 1);

      if (!this.verificarAssinatura(cifrado, assinatura)) return '';

      const payload = this.decifrarAes(cifrado);
      if (!payload || !payload.startsWith(this.nonceSessao)) return '';

      return payload.substring(this.nonceSessao.length);
    } catch {
      return '';
    }
  }

  criptografarDados(dados: string): string {
    if (!dados) return '';
    return this.cifrarAes(dados);
  }

  descriptografarDados(dadosCifrados: string): string {
    if (!dadosCifrados) return '';

    try {
      return this.decifrarAes(dadosCifrados);
    } catch {
      return '';
    }
  }

  private derivarChaves(segredoHex: string): void {
    const segredo = CryptoJS.enc.Hex.parse(segredoHex);

    this.chaveAes = CryptoJS.HmacSHA256('derive-aes', segredo);
    this.chaveHmac = CryptoJS.HmacSHA256('derive-hmac', segredo);

    const ivCompleto = CryptoJS.HmacSHA256('derive-iv', segredo);
    this.ivSessao = CryptoJS.lib.WordArray.create(
      ivCompleto.words.slice(0, 4), 16,
    );

    this.nonceSessao = CryptoJS.HmacSHA256('derive-nonce', segredo)
      .toString()
      .substring(0, 16);
  }

  private cifrarAes(textoPlano: string): string {
    const resultado = CryptoJS.AES.encrypt(textoPlano, this.chaveAes, {
      iv: this.ivSessao,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return this.paraBase64Url(
      resultado.ciphertext.toString(CryptoJS.enc.Base64),
    );
  }

  private decifrarAes(cifradoBase64Url: string): string {
    const base64 = this.deBase64Url(cifradoBase64Url);
    const parametros = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(base64),
    });

    const resultado = CryptoJS.AES.decrypt(parametros, this.chaveAes, {
      iv: this.ivSessao,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return resultado.toString(CryptoJS.enc.Utf8);
  }

  private assinar(dados: string): string {
    return CryptoJS.HmacSHA256(dados, this.chaveHmac)
      .toString()
      .substring(0, 16);
  }

  private verificarAssinatura(dados: string, assinatura: string): boolean {
    return this.assinar(dados) === assinatura;
  }

  private mascarar(segredoHex: string): string {
    const cifrado = CryptoJS.AES.encrypt(segredoHex, CHAVE_MASCARA, {
      iv: IV_MASCARA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return this.paraBase64Url(
      cifrado.ciphertext.toString(CryptoJS.enc.Base64),
    );
  }

  private desmascarar(armazenado: string): string {
    const base64 = this.deBase64Url(armazenado);
    const parametros = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(base64),
    });

    const resultado = CryptoJS.AES.decrypt(parametros, CHAVE_MASCARA, {
      iv: IV_MASCARA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return resultado.toString(CryptoJS.enc.Utf8);
  }

  private paraBase64Url(base64: string): string {
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private deBase64Url(base64Url: string): string {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const complemento = base64.length % 4;
    if (complemento) base64 += '='.repeat(4 - complemento);
    return base64;
  }
}

# Criptografia de Rotas Angular

Motor de criptografia de rotas para Angular que impede a manipulacao manual de URLs na barra de endereco do navegador.

Toda rota interna da aplicacao eh criptografada com **AES-256-CBC** antes de aparecer na URL, assinada com **HMAC-SHA256** para garantir integridade, e protegida com um **nonce de sessao** que invalida URLs entre sessoes diferentes.

## Como Funciona

### Fluxo de Navegacao

```
Usuario clica em "Painel"
        |
        v
Angular Router chama serialize()
        |
        v
SerializadorUrlCriptografado intercepta
        |
        v
MotorCriptografia.criptografar("/painel")
        |
        v
AES-256-CBC(nonce + "/painel") --> cifrado Base64URL
        |
        v
HMAC-SHA256(cifrado) --> assinatura 16 hex chars
        |
        v
URL no browser: /-/XtBGXJWnC_DgCRNpNFwlnU_bakgx3B.345be1b7428216fa
```

### Camadas de Seguranca

| Camada | Tecnologia | O que protege |
|--------|-----------|---------------|
| Cifra | AES-256-CBC | Conteudo da rota (nao eh XOR trivial, eh criptografia real) |
| Integridade | HMAC-SHA256 | Qualquer modificacao na URL eh detectada e rejeitada |
| Sessao | Nonce derivado | URLs de uma sessao nao funcionam em outra |
| Storage | AES mascarado | Chave no sessionStorage eh criptografada com mascara fixa |
| Guard | CanActivate | Rotas digitadas manualmente (sem criptografia) sao bloqueadas |

### Estrutura de URL

```
/-/{CIPHERTEXT}.{HMAC}

/-/                          --> prefixo (nao obvio)
XtBGXJWnC_DgCRNpNFwlnU...  --> AES-256-CBC(nonce + rota) em Base64URL
.                            --> separador
345be1b7428216fa             --> HMAC-SHA256 (16 hex chars de assinatura)
```

### O que acontece em cada cenario

| Cenario | Resultado |
|---------|-----------|
| Navegacao normal (clique) | URL criptografada, rota correta carregada |
| F5 (refresh) | sessionStorage preserva chave, rota atual funciona |
| Botao Voltar (interno) | Pilha de navegacao restaura rota anterior |
| Digitar rota manualmente (`/painel`) | Guard bloqueia, redireciona para home |
| Modificar URL criptografada | HMAC falha, redireciona para home |
| Copiar URL para outra aba | Funciona (mesma sessao, mesmo sessionStorage) |
| Copiar URL para outro browser | Falha (chave de sessao diferente) |
| Fechar aba e reabrir | Nova sessao, nova chave, URLs antigas invalidadas |

## Arquitetura

```
src/app/
  nucleo/
    criptografia/
      motor-criptografia.service.ts    # Motor AES-256 + HMAC + nonce
      serializador-url-criptografado.ts # Custom UrlSerializer do Angular
    navegacao/
      pilha-navegacao.service.ts        # Stack de historico (sessionStorage sync)
      guarda-rota-criptografada.guard.ts # Guard contra manipulacao manual
  paginas/
    inicio/          # Pagina demo
    painel/          # Pagina demo
    configuracoes/   # Pagina demo
  app.config.ts      # Providers (UrlSerializer, APP_INITIALIZER)
  app.routes.ts      # Rotas protegidas com guard
  app.ts             # Componente raiz com barra de debug
```

### Componentes Principais

**MotorCriptografia** — Servico singleton que:
- Gera um segredo mestre de 64 bytes por sessao
- Deriva 4 chaves (AES, HMAC, IV, nonce) via HMAC-SHA256
- Criptografa/descriptografa com AES-256-CBC
- Assina/verifica com HMAC-SHA256
- Armazena o segredo mascarado no sessionStorage

**SerializadorUrlCriptografado** — Implementa `UrlSerializer` do Angular:
- `serialize()` — converte rota real em URL criptografada
- `parse()` — converte URL criptografada em UrlTree real
- O Router nunca sabe que as URLs sao criptografadas

**PilhaNavegacao** — Gerencia historico de navegacao:
- Escuta `NavigationEnd` do Router
- Mantém pilha em memoria sincronizada com sessionStorage (criptografada)
- Metodo `voltar()` para navegacao retroativa

**GuardaRotaCriptografada** — `CanActivate` guard:
- Verifica se a URL no browser tem o prefixo criptografado
- Bloqueia acesso direto a rotas sem criptografia

## Instalacao

### Pre-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** 9+
- **Angular CLI** 18+ (o projeto usa Angular 21)

### Passo a passo

1. Clonar o repositorio:

```bash
git clone https://github.com/arquiteturacotin-code/Cript.git
cd Cript
```

2. Instalar dependencias:

```bash
npm install
```

3. Rodar em desenvolvimento:

```bash
npm start
```

4. Acessar no navegador:

```
http://localhost:4200
```

5. Build de producao:

```bash
npm run build
```

O output fica em `dist/criptografia-rotas/`.

## Dependencias

| Pacote | Versao | Motivo |
|--------|--------|--------|
| `crypto-js` | ^4.2.0 | AES-256-CBC e HMAC-SHA256 sincronos (UrlSerializer do Angular eh sincrono) |
| `@types/crypto-js` | ^4.2.2 | Tipagem TypeScript para crypto-js |

## Limitacoes Conhecidas

**Criptografia client-side nao eh seguranca real.** A logica de descriptografia e a chave estao no browser. Qualquer pessoa com DevTools pode:
- Colocar breakpoint no `descriptografar()`
- Inspecionar a chave em memoria
- Chamar os metodos pelo console

Este sistema impede **manipulacao casual** por usuarios comuns. Para seguranca real de rotas, implemente **autorizacao no backend** (JWT, roles, policies).

## Tecnologias

- Angular 21 (standalone components)
- TypeScript 5.9
- crypto-js 4.2 (AES-256-CBC, HMAC-SHA256)
- SCSS

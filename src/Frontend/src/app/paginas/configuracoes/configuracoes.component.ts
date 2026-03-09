import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pagina">
      <div class="pagina-cabecalho">
        <h1>Configuracoes</h1>
        <p>Gerencie as configuracoes do sistema</p>
      </div>

      <div class="pagina-conteudo">
        <div class="configuracao-lista">
          <div class="configuracao-item">
            <div class="configuracao-info">
              <h3>Notificacoes</h3>
              <p>Receber alertas do sistema</p>
            </div>
            <div class="toggle ativo"></div>
          </div>

          <div class="configuracao-item">
            <div class="configuracao-info">
              <h3>Modo Escuro</h3>
              <p>Interface com tema escuro</p>
            </div>
            <div class="toggle"></div>
          </div>

          <div class="configuracao-item">
            <div class="configuracao-info">
              <h3>Auto-save</h3>
              <p>Salvar alteracoes automaticamente</p>
            </div>
            <div class="toggle ativo"></div>
          </div>
        </div>

        <div class="card-grupo">
          <a routerLink="/inicio" class="card-navegacao">
            <div class="card-icone">🏠</div>
            <div class="card-info">
              <h3>Inicio</h3>
              <p>Voltar para a pagina inicial</p>
            </div>
            <span class="card-seta">→</span>
          </a>

          <a routerLink="/painel" class="card-navegacao">
            <div class="card-icone">📊</div>
            <div class="card-info">
              <h3>Painel</h3>
              <p>Ver o painel de controle</p>
            </div>
            <span class="card-seta">→</span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ConfiguracoesComponent {}

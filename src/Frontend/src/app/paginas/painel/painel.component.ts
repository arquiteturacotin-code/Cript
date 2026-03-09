import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pagina">
      <div class="pagina-cabecalho">
        <h1>Painel</h1>
        <p>Painel de controle do sistema</p>
      </div>

      <div class="pagina-conteudo">
        <div class="metricas">
          <div class="metrica-card">
            <span class="metrica-valor">1.247</span>
            <span class="metrica-rotulo">Usuarios Ativos</span>
          </div>
          <div class="metrica-card">
            <span class="metrica-valor">89%</span>
            <span class="metrica-rotulo">Uptime</span>
          </div>
          <div class="metrica-card">
            <span class="metrica-valor">342</span>
            <span class="metrica-rotulo">Requisicoes/min</span>
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

          <a routerLink="/configuracoes" class="card-navegacao">
            <div class="card-icone">⚙️</div>
            <div class="card-info">
              <h3>Configuracoes</h3>
              <p>Ajustar configuracoes do sistema</p>
            </div>
            <span class="card-seta">→</span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class PainelComponent {}

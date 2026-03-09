import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pagina">
      <div class="pagina-cabecalho">
        <h1>Inicio</h1>
        <p>Pagina inicial da aplicacao</p>
      </div>

      <div class="pagina-conteudo">
        <div class="card-grupo">
          <a routerLink="/painel" class="card-navegacao">
            <div class="card-icone">📊</div>
            <div class="card-info">
              <h3>Painel</h3>
              <p>Acesse o painel de controle</p>
            </div>
            <span class="card-seta">→</span>
          </a>

          <a routerLink="/configuracoes" class="card-navegacao">
            <div class="card-icone">⚙️</div>
            <div class="card-info">
              <h3>Configuracoes</h3>
              <p>Gerencie as configuracoes do sistema</p>
            </div>
            <span class="card-seta">→</span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class InicioComponent {}

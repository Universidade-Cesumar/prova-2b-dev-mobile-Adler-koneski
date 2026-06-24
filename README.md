[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jOw_Hzd7)

# Sistema de Almoxarifado - Controle de Insumos

Sistema mobile de controle de estoque desenvolvido para modernizar a gestão de insumos do almoxarifado do Curso Técnico de Enfermagem da Unicesumar.

## Sobre o Projeto

A enfermeira responsável pelo almoxarifado precisava de mobilidade para registrar entradas e saídas de materiais em tempo real, substituindo o controle manual em planilhas Excel. Este aplicativo resolve esse problema permitindo o cadastro, retirada, entrada e exclusão de materiais na palma da mão.

## Tecnologias Utilizadas

- **React Native** — desenvolvimento mobile nativo
- **Expo** — plataforma de desenvolvimento e build
- **Hooks** — useState e useEffect para gerenciamento de estado e ciclo de vida
- **Fetch API** — requisições assíncronas com async/await
- **MockAPI.io** — back-end em nuvem para simulação da API RESTful

## Como Rodar o Projeto

### Pré-requisitos

- Node.js instalado (versão LTS)
- Expo Go instalado no celular (Android ou iOS)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/Universidade-Cesumar/prova-2b-dev-mobile-Adler-koneski.git
```

2. Entre na pasta do projeto:
```bash
cd prova-2b-dev-mobile-Adler-koneski
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o projeto:
```bash
npx expo start
```

5. Escaneie o QR Code com o Expo Go no celular ou pressione W para abrir no navegador.

## Funcionalidades

### Sprint 1 — Fundação, API e Inventário
- Listagem do estoque em tempo real (GET)
- Cadastro de novos materiais (POST)
- Validação dos campos do formulário
- Pull to refresh na lista
- Cards de resumo com total de tipos e unidades
- Busca por nome de material
- Ordenação alfabética
- Sistema de autenticação (login e cadastro)

### Sprint 2 — Regras de Negócio e Saídas
- Baixa de estoque com validação (PUT)
- Exclusão de materiais com confirmação (DELETE)
- Função validarRetirada com regras de negócio
- Entrada de estoque para reposição (PUT)
- Bloqueio de exclusão com estoque acima de zero
- Bloqueio de retirada em estoque zerado

### Sprint 3 — Dashboard e Publicação
- Filtro de pesquisa em tempo real
- Totalizador de itens na tela
- Indicador visual de estoque crítico (abaixo de 10 unidades)
- Tratamento de erros de conexão de rede
- Alertas amigáveis para o usuário
- README com documentação completa

## API

Base URL: https://6a2b34d9b687a7d5cbc4f27f.mockapi.io

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /materiais | Lista todos os materiais |
| POST | /materiais | Cadastra novo material |
| PUT | /materiais/:id | Atualiza quantidade do material |
| DELETE | /materiais/:id | Remove material do estoque |
| GET | /usuarios | Lista usuários |
| POST | /usuarios | Cadastra novo usuário |

## Screenshots

### Tela de Login
O sistema exige autenticação para acessar o almoxarifado. O usuário pode criar uma conta ou fazer login com credenciais existentes.

### Tela Principal
Dashboard com indicadores de estoque, formulário de cadastro, busca em tempo real e lista de materiais com opções de retirada, entrada e exclusão.

### Alertas Visuais
Materiais com estoque abaixo de 10 unidades recebem destaque visual em vermelho, indicando estoque crítico. Materiais zerados ficam com opacidade reduzida.

## Regras de Negócio

- Não é permitido retirar mais unidades do que o estoque disponível
- Não é permitido retirar quantidade zero ou negativa
- Não é permitido excluir material com estoque acima de zero
- Materiais com menos de 10 unidades recebem alerta visual de estoque crítico
- Materiais com menos de 20 unidades são sinalizados como estoque baixo

## Desenvolvedor

**Adler Koneski** — 5º Semestre ADS — Unicesumar 2026
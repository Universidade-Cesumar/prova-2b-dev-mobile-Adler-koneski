[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jOw_Hzd7)


# 🏥 Almoxarifado - Enfermagem

Sistema mobile de controle de estoque desenvolvido para modernizar a gestão de insumos do almoxarifado do Curso Técnico de Enfermagem.

## 📋 Sobre o Projeto

A enfermeira responsável pelo almoxarifado precisava de mobilidade para registrar entradas e saídas de materiais em tempo real, substituindo o controle manual em planilhas. Este aplicativo resolve esse problema permitindo o cadastro e visualização do estoque na palma da mão.

## 🚀 Tecnologias Utilizadas

- **React Native** — desenvolvimento mobile nativo
- **Expo** — plataforma de desenvolvimento e build
- **Hooks** — `useState` e `useEffect` para gerenciamento de estado e ciclo de vida
- **Fetch API** — requisições assíncronas com `async/await`
- **MockAPI.io** — back-end em nuvem para simulação da API RESTful

## ⚙️ Como Rodar o Projeto

### Pré-requisitos

- Node.js instalado
- Expo Go instalado no celular (Android ou iOS)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/Universidade-Cesumar/prova-2b-dev-mobile-Adler-koneski.git
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o projeto:
```bash
npx expo start
```

4. Escaneie o QR Code com o Expo Go no celular.

## 📱 Funcionalidades

- ✅ Listagem do estoque em tempo real (GET)
- ✅ Cadastro de novos materiais (POST)
- ✅ Validação dos campos do formulário
- ✅ Pull to refresh na lista
- ✅ Cards de resumo com total de tipos e unidades
- ✅ Feedback visual de loading
- ✅ Baixa de estoque com validação (PUT)
- ✅ Exclusão de materiais com confirmação (DELETE)
- ✅ Função validarRetirada com regras de negócio
- ✅ Sistema de autenticação (login e cadastro)

## 🔗 API

Base URL: `https://6a2b34d9b687a7d5cbc4f27f.mockapi.io/api/v1`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /materiais | Lista todos os materiais |
| POST | /materiais | Cadastra novo material |
| PUT | /materiais/:id | Atualiza quantidade do material |
| DELETE | /materiais/:id | Remove material do estoque |

## 👨‍💻 Desenvolvedor

**Adler Koneski** — 5º Semestre ADS — Unicesumar
## 🛠️ Tecnologias Utilizadas

O **Defesa Civil — Garanhuns/PE** utiliza tecnologias modernas para oferecer uma aplicação mobile com suporte offline, uma API para gerenciamento dos dados e uma arquitetura organizada para facilitar a manutenção e a evolução do sistema.

---

### 📱 Frontend — Aplicação Mobile

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="55" height="55" alt="React" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="55" height="55" alt="TypeScript" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ionic/ionic-original.svg" width="55" height="55" alt="Ionic" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" width="55" height="55" alt="Vite" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg" width="55" height="55" alt="SQLite" />
</p>

<p align="center">
  <strong>React</strong> &nbsp; • &nbsp; <strong>TypeScript</strong> &nbsp; • &nbsp; <strong>Ionic</strong> &nbsp; • &nbsp; <strong>Vite</strong> &nbsp; • &nbsp; <strong>SQLite</strong>
</p>

| Tecnologia | Finalidade |
|:--|:--|
| **React + TypeScript** | Construção de interfaces e componentes tipados. |
| **Ionic Framework** | Desenvolvimento de interfaces adaptadas para dispositivos móveis. |
| **Capacitor** | Integração com recursos nativos e execução em dispositivos móveis. |
| **Vite** | Ambiente de desenvolvimento e ferramenta de build. |
| **SQLite** | Armazenamento local para registrar e consultar vistorias offline. |

---

### ⚙️ Backend — API

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg" width="60" height="60" alt="PHP" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" width="55" height="55" alt="Laravel" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" width="55" height="55" alt="PostgreSQL" />
</p>

<p align="center">
  <strong>PHP</strong> &nbsp; • &nbsp; <strong>Laravel 13</strong> &nbsp; • &nbsp; <strong>PostgreSQL</strong> &nbsp; • &nbsp; <strong>Laravel Sanctum</strong>
</p>

| Tecnologia | Finalidade |
|:--|:--|
| **PHP** | Linguagem utilizada no desenvolvimento do backend. |
| **Laravel 13** | Implementação das rotas, regras de negócio e operações da API. |
| **PostgreSQL** | Banco de dados relacional para armazenamento centralizado no servidor. |
| **Laravel Sanctum** | Autenticação baseada em tokens para proteger o acesso à API. |

---

### 🏗️ Arquitetura de Software

**Clean Architecture**

O projeto adota uma organização em camadas para separar as responsabilidades da aplicação, favorecer a reutilização de código e facilitar testes, manutenção e evolução.

- **Domain:** entidades e regras de negócio.
- **Data e Repositories:** acesso e gerenciamento dos dados.
- **Services:** serviços e integrações da aplicação.
- **UI:** páginas, componentes e interfaces do usuário.
- **Sync:** mecanismos relacionados à sincronização entre o armazenamento local e o servidor.

---

### 🔧 Ferramentas de Desenvolvimento

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" width="48" height="48" alt="Git" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" width="48" height="48" alt="GitHub" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" width="48" height="48" alt="Node.js" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original-wordmark.svg" width="48" height="48" alt="npm" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/composer/composer-original.svg" width="48" height="48" alt="Composer" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/androidstudio/androidstudio-original.svg" width="48" height="48" alt="Android Studio" />
</p>

<p align="center">
  Git &nbsp; • &nbsp; GitHub &nbsp; • &nbsp; Node.js &nbsp; • &nbsp; npm &nbsp; • &nbsp; Composer &nbsp; • &nbsp; Android Studio
</p>

Essas ferramentas auxiliam no controle de versão, gerenciamento de dependências, execução do ambiente de desenvolvimento e compilação da aplicação Android.

---

### 🔄 Estratégia de Persistência

O sistema utiliza dois bancos de dados com responsabilidades distintas:

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg" width="60" height="60" alt="SQLite" />
  &nbsp;&nbsp;&nbsp; ⟷ &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" width="60" height="60" alt="PostgreSQL" />
</p>

<p align="center">
  <strong>SQLite — Dispositivo Mobile</strong><br/>
  Registro local e funcionamento offline.
</p>

<p align="center">
  ⬇️ Sincronização por meio da API Laravel ⬇️
</p>

<p align="center">
  <strong>PostgreSQL — Servidor</strong><br/>
  Armazenamento centralizado e gerenciamento dos dados.
</p>

A aplicação permite registrar informações em campo sem depender de uma conexão constante com a internet. Quando a conectividade estiver disponível, os dados poderão ser sincronizados com o servidor conforme as regras implementadas no sistema.

---

## ⚖️ Licença e Uso

Este projeto é desenvolvido para atender às necessidades institucionais da **Defesa Civil de Garanhuns/PE**, em parceria com as instituições participantes.

As condições de uso, distribuição e contribuição devem respeitar as autorizações institucionais e os termos definidos pelos responsáveis pelo projeto.

---

## 💙 Desenvolvimento

Desenvolvido no âmbito do **Laboratório Multidisciplinar de Tecnologia(s) Social(is) (LMTS)**, da **Universidade Federal do Agreste de Pernambuco (UFAPE)**, em parceria com a **Prefeitura de Garanhuns** e a **Defesa Civil de Garanhuns/PE**.

<p align="center">
  <strong>Tecnologia a serviço da comunidade. 🛡️</strong>
</p>

# 🏗️ Arquitetura do Projeto - Defesa Civil Vistorias

Este documento explica a arquitetura modular baseada em Clean Architecture, organizada para separar responsabilidades e facilitar a manutenção.

---

## 📁 Estrutura de Pastas

```
frontend/src/
├── pages/          # Como o usuário interage com o sistema?
├── components/     # Componentes UI reutilizáveis
├── domain/         # O que é o dado? O que o sistema faz? (REGRAS)
│   ├── entities/   # Entidades de negócio
│   └── useCases/   # Casos de uso
├── repositories/   # CONTRATOS - interfaces de dados
├── data/           # IMPLEMENTAÇÃO - como os dados são persistidos
├── sync/           # Sincronização offline → online
├── services/       # Como executar operações técnicas? (nativos)
├── store/          # Estado global da aplicação
├── routes/         # Configuração de rotas
├── utils/          # Funções auxiliares
├── theme/          # Tema visual
└── App.tsx
```

---

## 🧩 Conceitos Fundamentais

### 1. ENTITY (Entidade) → `domain/entities/`
> **O que é o objeto/dado?**

São as classes/modelos que representam o **negócio puro**. Não dependem de nenhuma biblioteca, framework ou tecnologia externa.

**Exemplo:**
```typescript
// Vistoria.ts
export class Vistoria {
  id: string;
  imovelId: string;
  dataVistoria: Date;
  status: 'pendente' | 'em_andamento' | 'finalizada';
  fotos: Foto[];
  // ...
}
```

**Localização:** `src/domain/entities/`
- `Vistoria.ts` — objeto vistoria
- `Imovel.ts` — objeto imóvel
- `Foto.ts` — objeto foto/evidência

---

### 2. USE CASE (Caso de Uso) → `domain/useCases/`
> **O que o sistema precisa fazer?**

Representam as **regras de negócio** — as ações que o usuário pode realizar. Cada caso de uso tem **uma única responsabilidade**. Ele sabe O QUE fazer, mas não sabe COMO fazer (delega para repositories/services).

**Exemplo:**
```typescript
// CriarVistoria.ts
export class CriarVistoria {
  constructor(private vistoriaRepo: VistoriaRepository) {}

  async execute(dados: DadosNovaVistoria): Promise<Vistoria> {
    // 1. Valida dados (regra de negócio)
    // 2. Cria entidade
    // 3. Persiste via repository
    // 4. Retorna resultado
  }
}
```

**Localização:** `src/domain/useCases/`
- `CriarVistoria.ts` — iniciar uma nova vistoria
- `FinalizarVistoria.ts` — marcar vistoria como concluída
- `BuscarVistorias.ts` — listar vistorias do usuário
- `SincronizarVistorias.ts` — enviar dados locais para API

---

### 3. REPOSITORY → `repositories/` (Contrato) + `data/` (Implementação)
> **Como os dados são armazenados/recuperados?**

#### 3.1 Contrato (`repositories/`) — Interface
Define **o que** o repositório deve fazer, sem dizer **como**.
```typescript
// VistoriaRepository.ts
export interface VistoriaRepository {
  criar(vistoria: Vistoria): Promise<Vistoria>;
  buscarTodos(): Promise<Vistoria[]>;
  atualizar(id: string, dados: Partial<Vistoria>): Promise<Vistoria>;
}
```

#### 3.2 Implementação (`data/`)
- **SQLite** (`data/sqlite/`) — armazenamento local/offline no dispositivo
- **API** (`data/api/`) — comunicação com o backend via HTTP

**Isso permite:**
✅ Usar SQLite quando offline  
✅ Usar API quando online  
✅ Trocar implementação sem tocar no Use Case

---

### 4. SERVICE → `services/`
> **Como executar determinada operação técnica?**

Serviços são wrappers para APIs nativas ou operações técnicas complexas. Isolam dependências externas.

**Localização:** `src/services/`
- `camera.ts` — tira fotos, acessa câmera do dispositivo (`@capacitor/camera`)
- `location.ts` — pega GPS/coordenadas (`@capacitor/geolocation`)
- `network.ts` — verifica se tem internet (`@capacitor/network`)

**Exemplo:**
```typescript
// services/camera.ts
export async function tirarFoto(): Promise<Foto> {
  // Usa @capacitor/camera → retorna Foto (entidade)
}
```

---

### 5. PAGE → `pages/`
> **Como o usuário interage com isso?**

São as telas do app. A página:
1. Ouve ações do usuário (clique, digitação)
2. Chama um **Use Case**
3. Atualiza a **Store** ou estado local
4. Renderiza os **Components**

**Localização:** `src/pages/`
| Pasta               | Descrição                          |
|---------------------|------------------------------------|
| `Login/`            | Tela de autenticação               |
| `Home/`             | Dashboard inicial                  |
| `Vistorias/`        | Lista de vistorias cadastradas     |
| `NovaVistoria/`     | Formulário de nova vistoria        |
| `DetalhesVistoria/` | Visualizar/editar vistoria existente |

**Exemplo de fluxo:**
```
Usuário clica "Nova Vistoria" 
  → Page chama CriarVistoriaUseCase
    → UseCase valida e pede Repository.criar()
      → Repository salva no SQLite local
    → UseCase retorna Vistoria
  → Page navega para DetalhesVistoria
```

---

### 6. COMPONENTS → `components/`
Peças reutilizáveis de interface usadas pelas páginas.

| Pasta            | Descrição                               |
|------------------|-----------------------------------------|
| `Button/`        | Botão padrão do app                     |
| `Input/`         | Campo de texto com validação            |
| `VistoriaCard/`  | Card que resume uma vistoria na lista   |
| `Loading/`       | Tela/spinner de carregamento            |

---

### 7. STORE → `store/`
Estado global da aplicação (usando Zustand, por exemplo).

| Arquivo               | O que guarda?                          |
|-----------------------|----------------------------------------|
| `useAuthStore.ts`     | Dados do usuário logado, token JWT     |
| `useVistoriaStore.ts` | Lista de vistorias, vistoria atual, filtros |

---

### 8. SYNC → `sync/`
Motor de sincronização offline-first.

| Arquivo             | Responsabilidade                              |
|---------------------|-----------------------------------------------|
| `SyncEngine.ts`     | Orquestra todo o processo de sync             |
| `SyncQueue.ts`      | Fila de operações pendentes (criar/atualizar) |
| `SyncStatus.ts`     | Estado: 'sincronizado' / 'pendente' / 'erro'  |

Funcionamento:
1. Toda operação offline entra na `SyncQueue`
2. Quando a internet voltar, o `SyncEngine` processa a fila
3. Envia para API e marca como sincronizado

---

## 🔁 Fluxo Completo de Dados

```
┌──────────┐   chama   ┌───────────┐   usa    ┌──────────────┐
│  PAGE    │──────────▶│ USE CASE  │─────────▶│ REPOSITORY   │
│ (UI)     │           │ (Regras)  │          │ (Interface)  │
└──────────┘           └───────────┘          └──────┬───────┘
     ▲                                               │
     │ atualiza                                  implementa
     │                                               ▼
┌────┴─────┐                                   ┌──────────────┐
│  STORE   │                                   │  SQLite /    │
│ (Estado) │                                   │  API Rest    │
└──────────┘                                   └──────────────┘
```

---

## 🎯 Por que essa arquitetura?

| Benefício            | Como isso ajuda?                                         |
|----------------------|---------------------------------------------------------|
| **Testável**         | Use cases não dependem de UI → teste unitário fácil     |
| **Offline-first**    | SQLite local + SyncEngine = app funciona sem internet   |
| **Manutenível**      | Trocar API por outro backend = só mudar `data/api/`     |
| **Equipe**           | Frontender mexe em `pages/`, backender em `domain/`     |
| **Escalável**        | Adicionar "RelatorioVistoria" = 1 Entity + 1 UseCase    |

---

## 🚀 Começando

```bash
# Instalar dependências
npm install

# Rodar em dev (web)
npm run dev

# Build para produção
npm run build

# Adicionar plataforma Android
npx cap add android

# Sincronizar mudanças
npx cap sync
```

---

> 💡 **Regra de ouro:** Se você está em dúvida onde colocar o código, pergunte:
> - É um **dado**? → `domain/entities`
> - É uma **ação do negócio**? → `domain/useCases`
> - É **câmera/GPS/rede**? → `services/`
> - É **salvar no banco/API**? → `data/`
> - É **tela do usuário**? → `pages/`

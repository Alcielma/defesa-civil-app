# Documentação da API e Novos Campos - Defesa Civil

Esta documentação descreve todos os endpoints disponíveis na API do backend, os novos campos adicionados ao banco de dados e os mecanismos de armazenamento e gerenciamento de arquivos (fotos e PDFs).

---

## 1. Configuração e Autenticação

* **Base URL:** `http://localhost:8000/api` (ou URL do servidor de produção)
* **Autenticação:** [Laravel Sanctum](https://laravel.com/docs/sanctum) via Bearer Token.
* **Headers obrigatórios para rotas autenticadas:**
  ```http
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer <seu_token_aqui>
  ```

---

## 2. Novos Campos Adicionados (Tabela `formularios`)

| Campo | Tipo no Banco | Descrição | Exemplo de Valor |
| :--- | :--- | :--- | :--- |
| **`pdf_path`** | `VARCHAR(255)` (nullable) | Caminho relativo do arquivo PDF salvo no storage público. | `"vistorias/pdfs/vistoria_1_20261112130000_a1b2c3.pdf"` |
| **`fotos`** | `JSON` (nullable) | Dicionário/mapa relacionando cada chave de foto ao seu caminho salvo no storage. | `{"imagemLocalizacao": "vistorias/fotos/...", "imagemPiso": "..."}` |
| **`percentual_revestimento_externo`** | `JSON` (nullable) | Percentual ou valores selecionados para o revestimento externo. | `["0%"]` ou `"0"` |

### Accessors Virtuais no Model `Formulario.php`
Ao consultar qualquer formulário via API (`GET /api/formularios` ou `GET /api/formularios/{id}`), o backend automaticamente adiciona:
* **`pdf_url`**: URL pública direta do PDF (ex: `http://localhost:8000/storage/vistorias/pdfs/...`).
* **`fotos_urls`**: Dicionário com as URLs públicas diretas de cada foto salva (ex: `{"imagemLocalizacao": "http://localhost:8000/storage/vistorias/fotos/..."}`).

---

## 3. Armazenamento Físico de Arquivos (Storage)

Os arquivos enviados são organizados dentro do storage público do Laravel:
* **Diretório das fotos:** `storage/app/public/vistorias/fotos/`
* **Diretório dos relatórios PDF:** `storage/app/public/vistorias/pdfs/`
* **Link público:** Os arquivos são servidos diretamente em `/storage/...` através do link configurado (`php artisan storage:link`).
* **Limpeza Automática:** 
  * Ao atualizar ou deletar um PDF (`DELETE /api/formularios/{id}/pdf`), o arquivo anterior é removido fisicamente do disco.
  * Ao deletar uma foto específica (`DELETE /api/formularios/{id}/fotos/{campo}`), o arquivo é apagado do disco.
  * Ao excluir a vistoria inteira (`DELETE /api/formularios/{id}`), **todos os arquivos físicos (PDF e fotos)** associados àquela vistoria são automaticamente excluídos do storage.

---

## 4. Tabela de Endpoints

| Método | Endpoint | Protegido | Descrição |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/register` | Não | Cadastro de novo usuário/agente |
| `POST` | `/api/login` | Não | Login e obtenção do Bearer Token |
| `GET` | `/api/user` | Sim | Retorna os dados do agente logado |
| `POST` | `/api/logout` | Sim | Revoga o token e encerra a sessão |
| `POST` | `/api/formularios` | Sim | Cria um novo formulário de vistoria |
| `GET` | `/api/formularios` | Sim | Lista todas as vistorias do agente logado |
| `GET` | `/api/formularios/{id}` | Sim | Exibe os detalhes completos de uma vistoria |
| `PUT` | `/api/formularios/{id}` | Sim | Atualiza todos os dados de uma vistoria |
| `PATCH` | `/api/formularios/{id}` | Sim | Atualização parcial de campos de uma vistoria |
| `DELETE` | `/api/formularios/{id}` | Sim | Exclui a vistoria e seus arquivos físicos (PDF e fotos) |
| `POST` | `/api/formularios/{id}/pdf` | Sim | Faz upload/salva o PDF da vistoria |
| `GET` | `/api/formularios/{id}/pdf` | Sim | Download ou visualização direta do PDF |
| `DELETE` | `/api/formularios/{id}/pdf` | Sim | Remove o PDF da vistoria do storage e do banco |
| `POST` | `/api/formularios/{id}/fotos` | Sim | Faz upload de fotos (multipart ou base64) |
| `DELETE` | `/api/formularios/{id}/fotos/{campo}` | Sim | Remove uma foto específica do storage e do banco |

---

## 5. Detalhamento dos Endpoints e Exemplos de Payloads

### 5.1. Autenticação

#### `POST /api/register`
* **Request Body:**
```json
{
  "name": "Paulo Agente",
  "email": "paulo@defesacivil.pe.gov.br",
  "password": "senhaSegura123",
  "password_confirmation": "senhaSegura123"
}
```
* **Response (201 Created):**
```json
{
  "message": "Usuário registrado com sucesso!",
  "user": {
    "id": 1,
    "name": "Paulo Agente",
    "email": "paulo@defesacivil.pe.gov.br"
  },
  "token": "1|xyz..."
}
```

#### `POST /api/login`
* **Request Body:**
```json
{
  "email": "paulo@defesacivil.pe.gov.br",
  "password": "senhaSegura123"
}
```
* **Response (200 OK):**
```json
{
  "message": "Login realizado com sucesso!",
  "token": "2|abc...",
  "user": {
    "id": 1,
    "name": "Paulo Agente",
    "email": "paulo@defesacivil.pe.gov.br"
  }
}
```

---

### 5.2. Formulários de Vistoria

#### `POST /api/formularios`
Cria uma nova vistoria. Suporta envio de campos normais e também permite enviar fotos em base64 diretamente no payload.

* **Request Body:**
```json
{
  "localidade": "Alto do Magano",
  "setor": "Setor 03 - Encosta",
  "titular": "Maria das Dores Silva",
  "endereco": "Rua da Esperança",
  "numero": "45-B",
  "localizacao": ["encosta"],
  "causas_problemas": ["deslizamento", "fenda"],
  "num_pavimentos": 1,
  "area_aproximada": 65.5,
  "num_comodos": 4,
  "num_dormitorios": 2,
  "tempo_construcao_anos": 8,
  "piso": ["Cimento"],
  "situacao_piso": ["Rachadura"],
  "estrutura": ["Alvenaria"],
  "vedacao": ["Alvenaria"],
  "situacao_parede": ["Fissura", "Infiltração"],
  "revestimento_externo": ["Sem revestimento"],
  "percentual_revestimento_externo": "0",
  "revestimento_interno": ["Reboco"],
  "percentual_revestimento_interno": "70",
  "cobertura": ["Cerâmica - Inglesa"],
  "conservacao_cobertura": ["Regular"],
  "conservacao_edificacao": ["Precária com risco"],
  "instalacao_eletrica": ["Regular"],
  "sanitario": ["Fossa"],
  "destino_esgoto_primario": ["Fossa rudimentar"],
  "destino_aguas_servidas": ["Céu aberto"],
  "destino_lixo": ["Coleta pública"],
  "intervencao_parede": ["Reparo"],
  "intervencao_coberta": ["Manutenção"],
  "indicacao_atuacao": ["Monitoramento"],
  "observacoes": "Imóvel construído próximo à encosta. Apresenta fissura na parede dos fundos.",
  "motivo_remocao": ["Risco de deslizamento"],
  "encaminhamentos": ["Monitoramento", "Retirada em caso de chuva"],
  "grau_risco": ["R3 Alto"],
  "analista_tecnico": "Paulo Henrique - Eng. Civil",
  "chefia_gerente": "Coordenação Defesa Civil",
  "data_conclusao": "2026-11-12",
  "preenchido_em": "2026-11-12T13:00:00Z"
}
```
* **Response (201 Created):**
```json
{
  "message": "Formulário recebido e salvo com sucesso!",
  "formulario": {
    "id": 1,
    "user_id": 1,
    "titular": "Maria das Dores Silva",
    "grau_risco": ["R3 Alto"],
    "pdf_path": null,
    "fotos": null,
    "pdf_url": null,
    "fotos_urls": {},
    "created_at": "2026-11-12T13:00:00.000000Z",
    "updated_at": "2026-11-12T13:00:00.000000Z"
  }
}
```

#### `GET /api/formularios`
Lista todas as vistorias cadastradas pelo agente autenticado.
* **Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "titular": "Maria das Dores Silva",
      "localidade": "Alto do Magano",
      "grau_risco": ["R3 Alto"],
      "pdf_url": "http://localhost:8000/storage/vistorias/pdfs/vistoria_1.pdf",
      "fotos_urls": {
        "imagemLocalizacao": "http://localhost:8000/storage/vistorias/fotos/vistoria_1_imagemLocalizacao.jpg"
      },
      "created_at": "2026-11-12T13:00:00.000000Z"
    }
  ]
}
```

#### `GET /api/formularios/{id}`
Obtém os dados completos de uma vistoria específica pelo ID.
* **Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "titular": "Maria das Dores Silva",
    "localidade": "Alto do Magano",
    "grau_risco": ["R3 Alto"],
    "pdf_path": "vistorias/pdfs/vistoria_1.pdf",
    "pdf_url": "http://localhost:8000/storage/vistorias/pdfs/vistoria_1.pdf",
    "fotos": {
      "imagemLocalizacao": "vistorias/fotos/vistoria_1_imagemLocalizacao.jpg"
    },
    "fotos_urls": {
      "imagemLocalizacao": "http://localhost:8000/storage/vistorias/fotos/vistoria_1_imagemLocalizacao.jpg"
    }
  }
}
```

#### `PUT /api/formularios/{id}` ou `PATCH /api/formularios/{id}`
Edita os dados de uma vistoria existente.
* **Request Body (exemplo de atualização parcial):**
```json
{
  "grau_risco": ["R4 Muito Alto"],
  "motivo_remocao": ["Deslizamento de encosta", "Risco iminente"],
  "encaminhamentos": ["Retirada imediata", "Auxílio moradia"],
  "observacoes": "Agravamento de fissura diagonal após chuva torrencial. Recomendada desocupação imediata."
}
```
* **Response (200 OK):**
```json
{
  "message": "Formulário atualizado com sucesso!",
  "formulario": {
    "id": 1,
    "titular": "Maria das Dores Silva",
    "grau_risco": ["R4 Muito Alto"]
  }
}
```

#### `DELETE /api/formularios/{id}`
Exclui a vistoria do banco e deleta do disco todos os arquivos físicos de fotos e PDF vinculados a ela.
* **Response (200 OK):**
```json
{
  "message": "Formulário e arquivos associados excluídos com sucesso!"
}
```

---

### 5.3. Gerenciamento de PDF

#### `POST /api/formularios/{id}/pdf`
Salva o relatório em PDF da vistoria. Suporta envio tanto como arquivo tradicional (`multipart/form-data`) quanto em string `base64` dentro de JSON.

* **Opção 1 — JSON com base64:**
```json
{
  "pdf_base64": "JVBERi0xLjQKJcTl8uXr... (conteúdo base64 aqui)"
}
```
* **Opção 2 — Multipart:**
  * Enviar no campo `pdf` o arquivo `.pdf`.

* **Response (200 OK):**
```json
{
  "message": "PDF da vistoria salvo com sucesso!",
  "pdf_path": "vistorias/pdfs/vistoria_1_1731420000_a1b2c3.pdf",
  "pdf_url": "http://localhost:8000/storage/vistorias/pdfs/vistoria_1_1731420000_a1b2c3.pdf"
}
```

#### `GET /api/formularios/{id}/pdf`
Faz o download ou a visualização do arquivo PDF diretamente no navegador.
* **Response:** Stream binário do arquivo (`application/pdf`) com o cabeçalho `Content-Disposition`.

#### `DELETE /api/formularios/{id}/pdf`
Remove o arquivo PDF do disco e limpa a coluna `pdf_path` no banco de dados.
* **Response (200 OK):**
```json
{
  "message": "PDF excluído com sucesso!"
}
```

---

### 5.4. Gerenciamento de Fotos

#### `POST /api/formularios/{id}/fotos`
Permite enviar fotos adicionais para a vistoria. Suporta tanto `multipart/form-data` quanto envio de Data URLs em Base64 dentro de JSON.

* **Exemplo de Envio em JSON (Base64):**
```json
{
  "fotos": {
    "imagemLocalizacao": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "imagemSituacaoParede": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "imagemPiso": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }
}
```
* **Response (200 OK):**
```json
{
  "message": "Fotos salvas com sucesso!",
  "total": 3,
  "fotos": {
    "imagemLocalizacao": "vistorias/fotos/vistoria_1_imagemLocalizacao_1731420000_a1b2c3.jpg",
    "imagemSituacaoParede": "vistorias/fotos/vistoria_1_imagemSituacaoParede_1731420000_d4e5f6.jpg",
    "imagemPiso": "vistorias/fotos/vistoria_1_imagemPiso_1731420000_g7h8i9.jpg"
  },
  "fotos_urls": {
    "imagemLocalizacao": "http://localhost:8000/storage/vistorias/fotos/vistoria_1_imagemLocalizacao_1731420000_a1b2c3.jpg",
    "imagemSituacaoParede": "http://localhost:8000/storage/vistorias/fotos/vistoria_1_imagemSituacaoParede_1731420000_d4e5f6.jpg",
    "imagemPiso": "http://localhost:8000/storage/vistorias/fotos/vistoria_1_imagemPiso_1731420000_g7h8i9.jpg"
  }
}
```

#### `DELETE /api/formularios/{id}/fotos/{campo}`
Exclui uma foto específica vinculada à vistoria.
* **Exemplo de chamada:** `DELETE /api/formularios/1/fotos/imagemLocalizacao`
* **Response (200 OK):**
```json
{
  "message": "Foto 'imagemLocalizacao' removida com sucesso!",
  "fotos": {
    "imagemSituacaoParede": "vistorias/fotos/vistoria_1_imagemSituacaoParede_1731420000_d4e5f6.jpg"
  },
  "fotos_urls": {
    "imagemSituacaoParede": "http://localhost:8000/storage/vistorias/fotos/vistoria_1_imagemSituacaoParede_1731420000_d4e5f6.jpg"
  }
}
```

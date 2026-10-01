# 💻 AssetOS — Gestão de Infraestrutura de TI & Auditoria

![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-brightgreen?style=for-the-badge&logo=springboot)
![Docker](https://img.shields.io/badge/Docker-24.0-blue?style=for-the-badge&logo=docker)
![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-success?style=for-the-badge)

> **Plataforma Full Stack para monitoramento, controle de inventário de hardware, alocação de ativos e trilha imutável de auditoria.**

O **AssetOS** automatiza a governança de ativos de Tecnologia da Informação, unificando a alocação de dispositivos a colaboradores, gestão por unidades físicas e registro cronológico de auditoria para conformidade e segurança.

---

## 🚀 Funcionalidades Principais

- **📊 Painel de Controle (KPIs):** Indicadores analíticos em tempo real de ativos disponíveis, em uso e sob manutenção.
- **🖥️ Inventário Inteligente de Ativos:** Cadastro, exclusão e alteração dinâmica de status (*Disponível*, *Em Uso*, *Manutenção*) diretamente na tabela.
- **👥 Gestão de Colaboradores:** Vinculação e desvinculação direta de equipamentos ao perfil e histórico do funcionário.
- **🏢 Mapeamento de Locais & Unidades:** Controle unificado da distribuição de hardware entre escritórios regionais e data centers.
- **🛡️ Trilha de Auditoria (Audit Trail):** Histórico detalhado e cronológico de alterações, inclusões e exclusões de ativos para governança de TI.
- **🔍 Pesquisa e Filtro Instantâneo:** Busca dinâmica por tag, nome do ativo, categoria ou localização.

---
<img width="400" height="206" alt="AssetOS _ Gestão e Auditoria Corporativa(online-video-cutter com)" src="https://github.com/user-attachments/assets/a8c52c60-eb72-47c2-a58b-250a2d00e6b4" />

## 📐 Matriz de Categorização & Ciclo de Ativos

| Status do Ativo | Ação Permitida no Menu | Descrição da Condição |
| :--- | :---: | :--- |
| 🟢 **Disponível** | *Em Uso, Manutenção* | Equipamento pronto em estoque para alocação imediata |
| 🔵 **Em Uso** | *Disponível, Manutenção* | Ativo atribuído a um colaborador ou posto de trabalho |
| 🟠 **Manutenção** | *Disponível, Em Uso* | Equipamento em reparo técnico ou verificação de garantia |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3, Spring Data JPA, REST API, Maven |
| **Database** | H2 Database (In-Memory Data Store) |
| **Frontend** | HTML5, CSS3 Moderno (Flexbox & Grid), JavaScript ES6+ (Fetch API) |
| **DevOps** | Docker, Docker Compose |

---

## 📂 Estrutura do Projeto

```text
asset-audit-system/
├── backend/
│   ├── src/main/java/com/assetos/backend/
│   │   ├── controller/      # Endpoints da API REST (AssetController, AuditController)
│   │   ├── model/           # Entidades JPA (Asset, AuditLog, Employee)
│   │   ├── repository/      # Persistência de dados (AssetRepository, AuditRepository)
│   │   └── service/         # Regras de negócio e geração de logs de auditoria
│   └── pom.xml              # Gestão de dependências Maven
├── docker/
│   └── docker-compose.yml   # Configuração de orquestração de containers
└── frontend/
    ├── index.html           # Dashboard principal e navegação do sistema
    ├── style.css            # Estilização visual, temas e componentes
    └── app.js               # Manipulação do DOM e integração Fetch API
```

---

## 🔧 Como Executar o Projeto Localmente

### Pré-requisitos
- **Java JDK 17** ou superior instalado
- **Git** instalado
- **Docker & Docker Compose** *(opcional)*

### Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/Pedro-H-Dev/asset-audit-system.git
   cd asset-audit-system
   ```

2. **Iniciar o Backend (Spring Boot)**:
   ```bash
   cd backend
   .\mvnw spring-boot:run
   ```

3. **Acessar a Aplicação**:
   - Abra o arquivo `frontend/index.html` diretamente em seu navegador web.
   - O backend estará rodando no endereço: `http://localhost:8080/api/assets`

---

## 👨‍💻 Autor

**Pedro Henrique**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/pedro-h-devv)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Pedro-H-Dev)



https://github.com/user-attachments/assets/389ff438-3a26-4213-8937-353056c7c6ba


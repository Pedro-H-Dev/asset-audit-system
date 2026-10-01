const API_URL = '/api/assets';
let allAssets = [];
let currentSelectedStatus = 'ALL';

// Banco de dados em memória para Colaboradores
let employeesList = [
    { id: 1, name: 'Carlos Eduardo', role: 'Dev Full Stack', dept: 'Engenharia', tag: 'AST-101', status: 'Ativo' },
    { id: 2, name: 'Mariana Lima', role: 'Analista TI', dept: 'Operações', tag: 'AST-100', status: 'Ativo' },
    { id: 3, name: 'Pedro Henrique', role: 'Engenheiro DevOps', dept: 'Infraestrutura', tag: null, status: 'Ativo' }
];

// Banco de dados em memória para Locais
const locationDetails = {
    'Escritorio Fortaleza': {
        address: 'Av. Santos Dumont, 2828 - Aldeota, Fortaleza - CE, 60150-161',
        manager: 'Pedro Henrique',
        phone: '(85) 3456-7890'
    },
    'FORTALEZA': {
        address: 'Rua Desembargador Leite Albuquerque, 1000 - Aldeota, Fortaleza - CE',
        manager: 'Mariana Lima',
        phone: '(85) 3110-2030'
    }
};

const STATUS_MAP = {
    'AVAILABLE': { label: 'Disponível', css: 'DISPONIVEL' },
    'IN_USE': { label: 'Em Uso', css: 'EM_USO' },
    'MAINTENANCE': { label: 'Manutenção', css: 'MANUTENCAO' }
};

document.addEventListener('DOMContentLoaded', () => {
    loadAssets();

    // Listener para fechar dropdowns abertos ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-status-container')) {
            closeAllStatusDropdowns();
        }
    });

    // Listener para o formulário de Ativo
    const assetModalForm = document.getElementById('assetModalForm');
    if (assetModalForm) {
        assetModalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createAssetFromModal();
        });
    }

    // Listener para o formulário de Colaborador
    const employeeModalForm = document.getElementById('employeeModalForm');
    if (employeeModalForm) {
        employeeModalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createEmployeeFromModal();
        });
    }

    // Listener para o formulário de Local
    const locationModalForm = document.getElementById('locationModalForm');
    if (locationModalForm) {
        locationModalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createLocationFromModal();
        });
    }
});

function closeAllStatusDropdowns() {
    document.querySelectorAll('.dropdown-status-menu').forEach(menu => {
        menu.style.display = 'none';
    });
}

async function loadAssets() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao conectar com a API');

        allAssets = await response.json();
        updateDashboardKPIs(allAssets);
        applyFilters();
        renderRecentActivityPanel(allAssets);
        renderLocationsGrid(allAssets);
        renderEmployeesTable();
    } catch (error) {
        console.error('Erro na requisição dos ativos:', error);
    }
}

/* RENDERIZAÇÃO DA TABELA COM DROPDOWN CORRIGIDO E ALINHADO */
function renderAssets(assets) {
    const tableBody = document.getElementById('assetsTableBody');
    const tableBodyExpanded = document.getElementById('assetsTableBodyExpanded');
    
    [tableBody, tableBodyExpanded].forEach(tbody => {
        if (!tbody) return;
        
        // Garante que containers da tabela permitam o dropdown se sobrepor sem barras de rolagem
        if (tbody.parentElement) {
            tbody.parentElement.style.overflow = 'visible';
            if (tbody.parentElement.parentElement) {
                tbody.parentElement.parentElement.style.overflow = 'visible';
            }
        }

        tbody.innerHTML = '';

        if (assets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                        <i class="fas fa-folder-open" style="font-size: 1.8rem; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                        Nenhum ativo encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        assets.forEach(asset => {
            const statusInfo = STATUS_MAP[asset.status] || { label: asset.status, css: asset.status };
            
            // Oculta o status atual das opções do menu
            const options = [
                { key: 'AVAILABLE', label: 'Disponível', color: '#10b981' },
                { key: 'IN_USE', label: 'Em Uso', color: '#3b82f6' },
                { key: 'MAINTENANCE', label: 'Manutenção', color: '#f59e0b' }
            ].filter(opt => opt.key !== asset.status);

            const optionsHTML = options.map(opt => `
                <button 
                    type="button" 
                    style="width: 100%; text-align: left; padding: 8px 12px; background: transparent; border: none; color: #e2e8f0; font-size: 0.78rem; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap;"
                    onmouseover="this.style.background='#1e293b'" 
                    onmouseout="this.style.background='transparent'"
                    onclick="selectNewStatus(${asset.id}, '${opt.key}', '${asset.name}', '${asset.category}', '${asset.location}')"
                >
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${opt.color}; flex-shrink: 0;"></span>
                    ${opt.label}
                </button>
            `).join('');

            const row = document.createElement('tr');
            row.style.position = 'relative';

            row.innerHTML = `
                <td><strong>${asset.name}</strong></td>
                <td><code style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-size: 0.78rem;">${asset.tagNumber || 'N/A'}</code></td>
                <td style="color: var(--text-muted);">${asset.category}</td>
                <td style="color: var(--text-muted);">${asset.location}</td>
                <td><span class="badge badge-${statusInfo.css}">${statusInfo.label}</span></td>
                <td style="position: relative;">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        
                        <!-- Container do Dropdown -->
                        <div class="dropdown-status-container" style="position: relative; display: inline-block;">
                            <button 
                                type="button" 
                                id="btn-status-${asset.id}"
                                class="btn btn-secondary" 
                                style="padding: 4px 8px; font-size: 0.75rem; display: flex; align-items: center; gap: 5px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 6px; cursor: pointer;"
                                onclick="toggleStatusDropdown(event, ${asset.id})"
                                title="Mudar Status"
                            >
                                <span>Mudar</span>
                                <i class="fas fa-chevron-down" style="font-size: 0.6rem;"></i>
                            </button>

                            <!-- Menu Flutuante Alinhado -->
                            <div 
                                id="dropdown-menu-${asset.id}" 
                                class="dropdown-status-menu" 
                                style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); z-index: 9999; min-width: 130px; overflow: hidden; padding: 4px 0;"
                            >
                                ${optionsHTML}
                            </div>
                        </div>

                        <button class="btn-icon" onclick="viewAuditTrail(${asset.id}, '${asset.name}')" title="Ver Histórico"><i class="fas fa-history"></i></button>
                        <button class="btn-icon" onclick="deleteAsset(${asset.id}, '${asset.name}')" title="Excluir"><i class="fas fa-trash-alt" style="color: var(--danger);"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

/* CONTROLE DO DROPDOWN */
function toggleStatusDropdown(event, id) {
    event.stopPropagation();
    
    const targetMenu = document.getElementById(`dropdown-menu-${id}`);
    const isCurrentlyOpen = targetMenu.style.display === 'block';

    closeAllStatusDropdowns();

    if (!isCurrentlyOpen) {
        targetMenu.style.display = 'block';
    }
}

function selectNewStatus(id, newStatus, name, category, location) {
    closeAllStatusDropdowns();
    updateStatus(id, newStatus, name, category, location);
}

/* CADASTRO E GESTÃO DE COLABORADORES */
function renderEmployeesTable() {
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    employeesList.forEach(emp => {
        const row = document.createElement('tr');
        
        let tagBadge = emp.tag 
            ? `<code style="background: rgba(99,102,241,0.2); color: var(--accent-primary); padding: 3px 8px; border-radius: 6px; font-weight: 700;">${emp.tag}</code>`
            : `<span style="color: var(--text-muted); font-size: 0.8rem;">Nenhum ativo</span>`;

        let actionBtn = emp.tag
            ? `<button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.75rem;" onclick="unlinkEmployeeAsset(${emp.id}, '${emp.name}')"><i class="fas fa-unlink"></i> Desvincular</button>`
            : `<button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="linkEmployeeAsset(${emp.id})"><i class="fas fa-link"></i> Vincular</button>`;

        row.innerHTML = `
            <td><strong>${emp.name}</strong></td>
            <td>${emp.role}</td>
            <td>${emp.dept}</td>
            <td>${tagBadge}</td>
            <td><span class="badge badge-DISPONIVEL">${emp.status}</span></td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(row);
    });
}

function createEmployeeFromModal() {
    const name = document.getElementById('empNameInput').value;
    const role = document.getElementById('empRoleInput').value;
    const dept = document.getElementById('empDeptInput').value;

    const newEmp = {
        id: Date.now(),
        name,
        role,
        dept,
        tag: null,
        status: 'Ativo'
    };

    employeesList.push(newEmp);
    document.getElementById('employeeModalForm').reset();
    closeModal('newEmployeeModal');
    renderEmployeesTable();
}

function unlinkEmployeeAsset(empId, empName) {
    if (confirm(`Deseja realmente desvincular o equipamento de ${empName}?`)) {
        const emp = employeesList.find(e => e.id === empId);
        if (emp) {
            emp.tag = null;
            renderEmployeesTable();
        }
    }
}

function linkEmployeeAsset(empId) {
    const available = allAssets.filter(a => a.status === 'AVAILABLE');
    if (available.length === 0) {
        alert('Não há ativos com status DISPONÍVEL no momento.');
        return;
    }

    const tagList = available.map(a => `${a.tagNumber} (${a.name})`).join('\n');
    const selectedTag = prompt(`Selecione ou digite a Tag de um ativo disponível:\n\n${tagList}`);

    if (selectedTag) {
        const found = available.find(a => selectedTag.includes(a.tagNumber));
        if (found) {
            const emp = employeesList.find(e => e.id === empId);
            if (emp) {
                emp.tag = found.tagNumber;
                renderEmployeesTable();
            }
        } else {
            alert('Tag inválida ou equipamento indisponível.');
        }
    }
}

/* CADASTRO E GESTÃO DE LOCAIS */
function renderLocationsGrid(assets) {
    const locationsGrid = document.getElementById('locationsGrid');
    if (!locationsGrid) return;

    const registeredLocations = Object.keys(locationDetails);
    const assetLocations = assets.map(a => a.location);
    const locations = [...new Set([...registeredLocations, ...assetLocations])];

    locationsGrid.innerHTML = '';

    locations.forEach(loc => {
        const locAssets = assets.filter(a => a.location === loc);
        const availableCount = locAssets.filter(a => a.status === 'AVAILABLE').length;
        const inUseCount = locAssets.filter(a => a.status === 'IN_USE').length;
        
        const details = locationDetails[loc] || {
            address: 'Endereço não cadastrado',
            manager: 'N/A',
            phone: 'N/A'
        };
        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `
            <div>
                <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-building" style="color: var(--accent-primary);"></i> ${loc}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: flex-start; gap: 6px;">
                    <i class="fas fa-map-marker-alt" style="margin-top: 3px;"></i> ${details.address}
                </div>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 8px; font-size: 0.78rem;">
                    <span style="background: rgba(16, 185, 129, 0.15); color: var(--success); padding: 3px 8px; border-radius: 6px;">
                        ${availableCount} Livre
                    </span>
                    <span style="background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); padding: 3px 8px; border-radius: 6px;">
                        ${inUseCount} Em Uso
                    </span>
                </div>
                <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 5px 10px;" onclick="openLocationDetailsModal('${loc}')">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
            </div>
        `;
        locationsGrid.appendChild(card);
    });
}

function createLocationFromModal() {
    const name = document.getElementById('locNameInput').value;
    const address = document.getElementById('locAddressInput').value;
    const manager = document.getElementById('locManagerInput').value;
    const phone = document.getElementById('locPhoneInput').value;

    locationDetails[name] = { address, manager, phone };

    document.getElementById('locationModalForm').reset();
    closeModal('newLocationModal');
    renderLocationsGrid(allAssets);
}

function openLocationDetailsModal(locName) {
    const details = locationDetails[locName] || {
        address: 'Endereço não informado',
        manager: 'Geral',
        phone: 'N/A'
    };

    document.getElementById('locModalTitle').innerHTML = `<i class="fas fa-building" style="color: var(--accent-primary);"></i> ${locName}`;
    document.getElementById('locModalAddress').innerText = details.address;
    document.getElementById('locModalManager').innerText = details.manager;
    document.getElementById('locModalPhone').innerText = details.phone;

    const locAssets = allAssets.filter(a => a.location === locName);
    const tbody = document.getElementById('locModalAssetsBody');
    tbody.innerHTML = '';

    if (locAssets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding: 12px;">Nenhum ativo associado a esta unidade.</td></tr>';
    } else {
        locAssets.forEach(a => {
            const statusInfo = STATUS_MAP[a.status] || { label: a.status, css: a.status };
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${a.name}</strong></td>
                <td><code>${a.tagNumber || 'N/A'}</code></td>
                <td><span class="badge badge-${statusInfo.css}">${statusInfo.label}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    openModal('locationDetailsModal');
}

/* FILTROS E PESQUISA */
function filterByKpiStatus(status) {
    if (currentSelectedStatus === status && status !== 'ALL') {
        currentSelectedStatus = 'ALL'; 
    } else {
        currentSelectedStatus = status;
    }

    document.querySelectorAll('.kpi-card').forEach(card => card.classList.remove('active-filter'));
    const activeCard = document.getElementById(`kpiCard-${currentSelectedStatus}`);
    if (activeCard) activeCard.classList.add('active-filter');

    const badge = document.getElementById('activeFilterBadge');
    if (badge) {
        if (currentSelectedStatus === 'ALL') {
            badge.style.display = 'none';
        } else {
            const statusLabel = STATUS_MAP[currentSelectedStatus] ? STATUS_MAP[currentSelectedStatus].label : currentSelectedStatus;
            badge.innerText = `Filtrado: ${statusLabel}`;
            badge.style.display = 'inline-block';
        }
    }

    applyFilters();
}

function applyFilters() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();

    const filtered = allAssets.filter(asset => {
        const matchesStatus = (currentSelectedStatus === 'ALL') || (asset.status === currentSelectedStatus);
        const matchesQuery = asset.name.toLowerCase().includes(query) ||
                             (asset.tagNumber && asset.tagNumber.toLowerCase().includes(query)) ||
                             asset.location.toLowerCase().includes(query);

        return matchesStatus && matchesQuery;
    });

    renderAssets(filtered);
}

function filterAssets() { applyFilters(); }
function filterAssetsTab() {
    const query = (document.getElementById('searchInputAssetsTab')?.value || '').toLowerCase();
    const filtered = allAssets.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        (asset.tagNumber && asset.tagNumber.toLowerCase().includes(query)) ||
        asset.location.toLowerCase().includes(query)
    );
    renderAssets(filtered);
}

async function createAssetFromModal() {
    const assetData = {
        tagNumber: document.getElementById('modalTagNumber').value,
        name: document.getElementById('modalName').value,
        category: document.getElementById('modalCategory').value,
        location: document.getElementById('modalLocation').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
        });

        if (response.ok) {
            document.getElementById('assetModalForm').reset();
            closeModal('newAssetModal');
            loadAssets();
        }
    } catch (error) {
        console.error('Erro na solicitação:', error);
    }
}

async function updateStatus(id, newStatus, name, category, location) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, location, status: newStatus })
        });

        if (response.ok) {
            loadAssets();
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

async function deleteAsset(id, name) {
    if (confirm(`Deseja remover o ativo "${name}"?`)) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadAssets();
            }
        } catch (error) {
            console.error('Erro ao excluir ativo:', error);
        }
    }
}

async function renderRecentActivityPanel(assets) {
    const container = document.getElementById('recentActivityPanel');
    const fullAuditContainer = document.getElementById('fullAuditTrail');
    if (!container) return;

    container.innerHTML = '';
    if (fullAuditContainer) fullAuditContainer.innerHTML = '';

    let combinedLogs = [];

    for (const asset of assets) {
        try {
            const res = await fetch(`${API_URL}/${asset.id}/audit-logs`);
            if (res.ok) {
                const logs = await res.json();
                combinedLogs = combinedLogs.concat(logs);
            }
        } catch (e) {
            console.error(e);
        }
    }

    combinedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (combinedLogs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem;">Nenhuma atividade registrada.</p>';
        return;
    }

    combinedLogs.slice(0, 5).forEach(log => {
        const timeStr = new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        let icon = 'fa-plus';
        let color = 'var(--success)';
        if (log.action === 'UPDATE') { icon = 'fa-pen'; color = 'var(--warning)'; }
        if (log.action === 'DELETE') { icon = 'fa-trash'; color = 'var(--danger)'; }

        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-icon" style="color: ${color};"><i class="fas ${icon}"></i></div>
            <div>
                <div class="timeline-text"><strong>${log.action}</strong></div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${log.details}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top:2px;">${timeStr}</div>
            </div>
        `;
        container.appendChild(item);
    });

    if (fullAuditContainer) {
        combinedLogs.forEach(log => {
            const fullDate = new Date(log.timestamp).toLocaleString('pt-BR');
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-icon"><i class="fas fa-shield-alt" style="color: var(--accent-primary);"></i></div>
                <div>
                    <div class="timeline-text"><strong>Ação: ${log.action}</strong></div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">${log.details}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${fullDate}</div>
                </div>
            `;
            fullAuditContainer.appendChild(item);
        });
    }
}

function switchTab(tabId, element) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');

    const titles = {
        'overview': { title: 'Visão Geral de Infraestrutura', sub: 'Monitore, gerencie e audite os ativos de TI da empresa.' },
        'assets': { title: 'Inventário Geral de Ativos', sub: 'Gerencie cadastros, tags e status de equipamentos.' },
        'employees': { title: 'Gestão de Colaboradores', sub: 'Atribua equipamentos a equipes e funcionários.' },
        'locations': { title: 'Locais e Unidades', sub: 'Mapeamento físico dos ativos entre escritórios e data centers.' },
        'audit': { title: 'Trilha Completa de Auditoria', sub: 'Histórico detalhado e imutável de todas as ações no sistema.' },
        'security': { title: 'Parâmetros de Segurança', sub: 'Status de proteção, chaves e integridade dos dados.' },
        'settings': { title: 'Configurações do Sistema', sub: 'Preferências gerais do AssetOS.' }
    };

    if (titles[tabId]) {
        document.getElementById('pageTitle').innerText = titles[tabId].title;
        document.getElementById('pageSubtitle').innerText = titles[tabId].sub;
    }
}

function updateDashboardKPIs(assets) {
    document.getElementById('kpiTotal').innerText = assets.length;
    document.getElementById('kpiAvailable').innerText = assets.filter(a => a.status === 'AVAILABLE').length;
    document.getElementById('kpiInUse').innerText = assets.filter(a => a.status === 'IN_USE').length;
    document.getElementById('kpiMaintenance').innerText = assets.filter(a => a.status === 'MAINTENANCE').length;
}

async function viewAuditTrail(assetId, assetName) {
    try {
        const response = await fetch(`${API_URL}/${assetId}/audit-logs`);
        const logs = await response.json();

        const nameElement = document.getElementById('modalAssetName');
        if (nameElement) nameElement.innerText = `Ativo: ${assetName || '#' + assetId}`;

        const container = document.getElementById('modalAuditLogs');
        container.innerHTML = '';

        if (logs.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 10px;">Nenhum registro de auditoria encontrado para este ativo.</p>';
        } else {
            logs.forEach(log => {
                const date = new Date(log.timestamp).toLocaleString('pt-BR');
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.innerHTML = `
                    <div class="timeline-icon"><i class="fas fa-history" style="color: var(--accent-primary);"></i></div>
                    <div>
                        <div class="timeline-text"><strong>Ação: ${log.action}</strong></div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${log.details}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">${date}</div>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        openModal('auditModal');
    } catch (e) {
        console.error(e);
    }
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
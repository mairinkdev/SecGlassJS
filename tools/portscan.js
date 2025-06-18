(function (tool) {
    const utils = window.SecGlassUtils || {};

    function renderInterface() {
        if (utils.addFormStyles) {
            utils.addFormStyles();
        }

        tool.container.innerHTML = `
            <div class="portscan-tool">
                <h2 class="tool-section-header">Escaneamento de Portas</h2>
                <div class="secglass-form-row">
                    <div class="secglass-form-col" style="flex: 2">
                        <div class="secglass-input-group">
                            <label for="hostInput">Host ou IP</label>
                            <input type="text" id="hostInput" class="secglass-input" placeholder="Ex: example.com ou 192.168.1.1">
                        </div>
                    </div>
                    <div class="secglass-form-col">
                        <div class="secglass-input-group">
                            <label for="portRangeInput">Portas</label>
                            <input type="text" id="portRangeInput" class="secglass-input" placeholder="Ex: 80,443,8080 ou 1-1000" value="21-23,25,53,80,443,3306,8080,8443">
                        </div>
                    </div>
                </div>

                <div class="secglass-form-row">
                    <div class="secglass-form-col">
                        <div class="scan-options">
                            <label class="secglass-checkbox">
                                <input type="checkbox" id="useHttpCheck">
                                <span>Detectar serviços HTTP</span>
                            </label>
                            <label class="secglass-checkbox">
                                <input type="checkbox" id="showClosedCheck">
                                <span>Mostrar portas fechadas</span>
                            </label>
                        </div>
                    </div>
                    <div class="secglass-form-col" style="display: flex; align-items: flex-end; justify-content: flex-end;">
                        <button id="scanBtn" class="secglass-button secglass-button-primary">
                            <i class="fas fa-search"></i>
                            <span>Escanear</span>
                        </button>
                    </div>
                </div>

                <div class="scan-info">
                    <div class="secglass-info-box">
                        <div class="secglass-info-header">
                            <i class="fas fa-info-circle"></i>
                            <span>Informação</span>
                        </div>
                        <div class="secglass-info-content">
                            <p>Este é um escaneador de portas simulado para fins educacionais. Em um ambiente real, o escaneamento de portas seria feito através de uma API ou serviço backend.</p>
                            <p>O escaneamento de portas sem autorização pode ser ilegal em muitos países e violar os termos de serviço de provedores.</p>
                        </div>
                    </div>
                </div>

                <div id="resultContainer" class="result-container"></div>
            </div>
        `;

        addToolStyles();
        setupEventListeners();
    }

    function addToolStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .portscan-tool { padding: 15px; }
            .scan-options {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 15px;
            }
            .secglass-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            }
            .secglass-checkbox input {
                width: 16px;
                height: 16px;
                accent-color: #42a5f5;
            }
            .scan-info {
                margin: 15px 0;
            }
            .result-container {
                margin-top: 20px;
            }
            .port-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                overflow: hidden;
            }
            .port-table th, .port-table td {
                padding: 10px 15px;
                text-align: left;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .port-table th {
                background: rgba(0, 0, 0, 0.3);
                font-weight: 500;
                color: rgba(255, 255, 255, 0.9);
            }
            .port-table tr:last-child td {
                border-bottom: none;
            }
            .port-status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
            }
            .status-open {
                background: rgba(76, 175, 80, 0.2);
                color: #81c784;
            }
            .status-closed {
                background: rgba(244, 67, 54, 0.2);
                color: #e57373;
            }
            .status-filtered {
                background: rgba(255, 152, 0, 0.2);
                color: #ffb74d;
            }
            .scan-summary {
                margin-bottom: 15px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .summary-stats {
                display: flex;
                gap: 15px;
            }
            .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .stat-open {
                color: #81c784;
            }
            .stat-closed {
                color: #e57373;
            }
            .stat-filtered {
                color: #ffb74d;
            }
            .loading-scan {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 30px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                margin-bottom: 15px;
            }
            .loading-scan i {
                font-size: 2rem;
                margin-bottom: 15px;
                color: #42a5f5;
            }
            .progress-bar {
                width: 100%;
                max-width: 300px;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                margin-top: 15px;
                position: relative;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #5e35b1, #42a5f5);
                border-radius: 3px;
                transition: width 0.3s;
            }
        `;
        document.head.appendChild(style);
    }

    function setupEventListeners() {
        const hostInput = document.getElementById('hostInput');
        const portRangeInput = document.getElementById('portRangeInput');
        const scanBtn = document.getElementById('scanBtn');
        const resultContainer = document.getElementById('resultContainer');

        scanBtn.addEventListener('click', () => {
            const host = hostInput.value.trim();
            const portRange = portRangeInput.value.trim();
            const useHttp = document.getElementById('useHttpCheck').checked;
            const showClosed = document.getElementById('showClosedCheck').checked;

            if (!host) {
                alert('Por favor, insira um host ou IP válido');
                return;
            }

            if (!portRange) {
                alert('Por favor, insira um intervalo de portas válido');
                return;
            }

            // Simular escaneamento
            simulatePortScan(host, portRange, useHttp, showClosed);
        });
    }

    function parsePortRange(portRange) {
        const ports = [];
        const parts = portRange.split(',');

        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(p => parseInt(p.trim()));
                for (let i = start; i <= end; i++) {
                    ports.push(i);
                }
            } else {
                ports.push(parseInt(part.trim()));
            }
        });

        return ports.filter(port => !isNaN(port) && port > 0 && port < 65536);
    }

    function simulatePortScan(host, portRange, useHttp, showClosed) {
        const resultContainer = document.getElementById('resultContainer');
        const ports = parsePortRange(portRange);

        if (ports.length === 0) {
            alert('Nenhuma porta válida especificada');
            return;
        }

        // Mostrar carregamento
        resultContainer.innerHTML = `
            <div class="loading-scan">
                <i class="fas fa-radar fa-pulse"></i>
                <p>Escaneando ${ports.length} portas em ${host}...</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;

        const progressFill = document.querySelector('.progress-fill');
        let scannedCount = 0;

        // Simular resultados com base em portas comuns
        const commonPorts = {
            21: { service: 'FTP', status: 'open' },
            22: { service: 'SSH', status: 'open' },
            23: { service: 'Telnet', status: 'closed' },
            25: { service: 'SMTP', status: 'filtered' },
            53: { service: 'DNS', status: 'open' },
            80: { service: 'HTTP', status: 'open' },
            443: { service: 'HTTPS', status: 'open' },
            3306: { service: 'MySQL', status: 'filtered' },
            8080: { service: 'HTTP-Proxy', status: 'open' },
            8443: { service: 'HTTPS-Alt', status: 'closed' }
        };

        const results = [];
        const totalPorts = ports.length;

        // Simular escaneamento com atraso
        const scanInterval = setInterval(() => {
            const port = ports[scannedCount];
            let result;

            if (commonPorts[port]) {
                result = { ...commonPorts[port], port };
            } else {
                // Gerar resultado aleatório para portas não comuns
                const statuses = ['open', 'closed', 'filtered'];
                const randomStatus = statuses[Math.floor(Math.random() * (host.includes('example.com') ? 3 : 2) + (host.includes('example.com') ? 0 : 1))];
                result = {
                    port,
                    service: 'unknown',
                    status: randomStatus
                };
            }

            // Se for porta HTTP e useHttp está ativado, adicionar informações
            if (useHttp && (port === 80 || port === 443 || port === 8080 || port === 8443) && result.status === 'open') {
                result.httpInfo = {
                    title: `${host} - ${port === 443 || port === 8443 ? 'Secure Website' : 'Website'}`,
                    server: port === 443 || port === 8443 ? 'nginx/1.18.0' : 'Apache/2.4.41'
                };
            }

            results.push(result);
            scannedCount++;

            // Atualizar progresso
            const progress = (scannedCount / totalPorts) * 100;
            progressFill.style.width = `${progress}%`;

            if (scannedCount >= totalPorts) {
                clearInterval(scanInterval);
                displayResults(host, results, showClosed);
            }
        }, 100);
    }

    function displayResults(host, results, showClosed) {
        const resultContainer = document.getElementById('resultContainer');

        // Filtrar resultados se necessário
        const filteredResults = showClosed ? results : results.filter(r => r.status !== 'closed');

        // Contar estatísticas
        const stats = {
            open: results.filter(r => r.status === 'open').length,
            closed: results.filter(r => r.status === 'closed').length,
            filtered: results.filter(r => r.status === 'filtered').length
        };

        let html = `
            <div class="scan-summary">
                <div>
                    <h3>Resultado do escaneamento para ${host}</h3>
                    <p>${results.length} portas escaneadas</p>
                </div>
                <div class="summary-stats">
                    <div class="stat-item stat-open">
                        <i class="fas fa-check-circle"></i>
                        <span>${stats.open} abertas</span>
                    </div>
                    <div class="stat-item stat-closed">
                        <i class="fas fa-times-circle"></i>
                        <span>${stats.closed} fechadas</span>
                    </div>
                    <div class="stat-item stat-filtered">
                        <i class="fas fa-filter"></i>
                        <span>${stats.filtered} filtradas</span>
                    </div>
                </div>
            </div>
        `;

        if (filteredResults.length > 0) {
            html += `
                <table class="port-table">
                    <thead>
                        <tr>
                            <th>Porta</th>
                            <th>Status</th>
                            <th>Serviço</th>
                            <th>Informações</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            filteredResults.forEach(result => {
                const statusClass = `status-${result.status}`;

                html += `
                    <tr>
                        <td>${result.port}</td>
                        <td><span class="port-status ${statusClass}">${result.status}</span></td>
                        <td>${result.service}</td>
                        <td>
                            ${result.httpInfo ?
                        `${result.httpInfo.title}<br><small>Server: ${result.httpInfo.server}</small>` :
                        ''}
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;
        } else {
            html += `
                <div class="secglass-info-box">
                    <div class="secglass-info-content">
                        <p>Nenhuma porta ${showClosed ? '' : 'aberta '} encontrada no host.</p>
                    </div>
                </div>
            `;
        }

        resultContainer.innerHTML = html;
    }

    // Inicialização da ferramenta
    tool.init = function () {
        renderInterface();
    };

    // Método de limpeza ao fechar a ferramenta
    tool.cleanup = function () {
        // Limpeza adicional, se necessário
    };
})(window.SecGlassTool || {});

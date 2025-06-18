(function (tool) {
    const utils = window.SecGlassUtils || {};

    function renderInterface() {
        if (utils.addFormStyles) {
            utils.addFormStyles();
        }

        tool.container.innerHTML = `
            <div class="httpsec-tool">
                <h2 class="tool-section-header">Análise de Cabeçalhos de Segurança HTTP</h2>
                <div class="secglass-form-row">
                    <div class="secglass-form-col" style="flex: 3">
                        <div class="secglass-input-group">
                            <label for="urlInput">URL do Site</label>
                            <input type="url" id="urlInput" class="secglass-input"
                                placeholder="https://exemplo.com">
                        </div>
                    </div>
                    <div class="secglass-form-col" style="flex: 1; display: flex; align-items: flex-end;">
                        <button id="analyzeBtn" class="secglass-button secglass-button-primary secglass-button-medium" style="width: 100%">
                            <i class="fas fa-shield-alt"></i>
                            <span>Analisar</span>
                        </button>
                    </div>
                </div>

                <div class="examples">
                    <span>Exemplos: </span>
                    <a href="#" class="example-link" data-url="https://github.com">github.com</a>
                    <a href="#" class="example-link" data-url="https://google.com">google.com</a>
                    <a href="#" class="example-link" data-url="https://mozilla.org">mozilla.org</a>
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
            .httpsec-tool { padding: 15px; }
            .examples { font-size: 0.85rem; margin: 5px 0 20px; opacity: 0.7; }
            .example-link { color: #42a5f5; margin: 0 5px; cursor: pointer; text-decoration: none; }
            .example-link:hover { text-decoration: underline; }
            .result-container { min-height: 50px; }
            .headers-card {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
            }
            .headers-url {
                font-size: 1.1rem;
                font-weight: 500;
                margin-bottom: 10px;
                word-break: break-all;
            }
            .header-status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
                margin-right: 8px;
            }
            .status-good {
                background: rgba(76, 175, 80, 0.3);
                color: #81c784;
            }
            .status-warning {
                background: rgba(255, 152, 0, 0.3);
                color: #ffb74d;
            }
            .status-bad {
                background: rgba(244, 67, 54, 0.3);
                color: #e57373;
            }
            .status-info {
                background: rgba(33, 150, 243, 0.3);
                color: #64b5f6;
            }
            .header-group {
                margin-bottom: 20px;
            }
            .header-group-title {
                font-size: 1rem;
                margin-bottom: 10px;
                color: #b3e5fc;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .header-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 8px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.05);
            }
            .header-name {
                font-weight: 500;
            }
            .header-value {
                opacity: 0.8;
                word-break: break-all;
                max-width: 60%;
                text-align: right;
            }
            .missing-headers {
                padding: 15px;
                background: rgba(255, 82, 82, 0.1);
                border-radius: 8px;
                margin-top: 15px;
            }
            .missing-header-title {
                font-size: 1rem;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .missing-header-title i {
                color: #ff5252;
            }
            .missing-header-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 8px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.05);
            }
            .missing-header-name {
                font-weight: 500;
            }
            .missing-header-desc {
                opacity: 0.8;
                font-size: 0.9rem;
            }
            .score-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 15px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                margin-bottom: 20px;
            }
            .score-value {
                font-size: 2rem;
                font-weight: 700;
            }
            .score-label {
                font-size: 0.9rem;
                opacity: 0.7;
            }
            .score-good {
                color: #66bb6a;
            }
            .score-medium {
                color: #ffb74d;
            }
            .score-bad {
                color: #ef5350;
            }
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 30px;
                opacity: 0.7;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
            }
            .loading-container i {
                font-size: 2rem;
                margin-bottom: 15px;
                color: #42a5f5;
            }
            .error-message {
                color: #ff6b6b;
                padding: 15px;
                text-align: center;
                background: rgba(255, 0, 0, 0.1);
                border-radius: 8px;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    function setupEventListeners() {
        const urlInput = document.getElementById('urlInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const resultContainer = document.getElementById('resultContainer');
        const exampleLinks = document.querySelectorAll('.example-link');

        const analyzeHeaders = () => {
            const url = urlInput.value.trim();
            if (!url) return;

            let targetUrl = url;
            // Adicionar https:// se não tiver protocolo
            if (!/^https?:\/\//i.test(targetUrl)) {
                targetUrl = 'https://' + targetUrl;
                urlInput.value = targetUrl;
            }

            resultContainer.innerHTML = `
                <div class="loading-container">
                    <i class="fas fa-shield-alt fa-spin"></i>
                    <p>Analisando cabeçalhos de segurança de ${targetUrl}...</p>
                </div>
            `;

            // Usando um serviço proxy para contornar limitações CORS
            fetch(`https://cors-anywhere.herokuapp.com/${targetUrl}`, {
                method: 'HEAD',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {
                    const headers = {};
                    response.headers.forEach((value, name) => {
                        headers[name.toLowerCase()] = value;
                    });
                    displayHeadersAnalysis(headers, targetUrl);
                })
                .catch(error => {
                    // Plano B: Vamos tentar uma solução alternativa com JSONP ou outro método
                    // Para fins de demonstração, vamos mostrar alguns cabeçalhos fictícios
                    console.error('Erro na solicitação:', error);

                    const mockHeaders = getMockHeaders(targetUrl);
                    displayHeadersAnalysis(mockHeaders, targetUrl, true);
                });
        };

        analyzeBtn.addEventListener('click', analyzeHeaders);
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                analyzeHeaders();
            }
        });

        exampleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const exampleUrl = link.dataset.url;
                urlInput.value = exampleUrl;
                analyzeHeaders();
            });
        });
    }

    function getMockHeaders(url) {
        // Função para simular cabeçalhos quando a requisição falha (para demonstração)
        // Em produção, seria melhor usar um serviço backend ou API pública

        // Cabeçalhos comuns baseados no domínio
        const isGithub = url.includes('github');
        const isGoogle = url.includes('google');
        const isMozilla = url.includes('mozilla');

        let mockHeaders = {
            'content-type': 'text/html; charset=utf-8',
            'content-security-policy': isGithub ?
                "default-src 'none'; base-uri 'self'; child-src github.com/assets-cdn/worker/ gist.github.com/assets-cdn/worker/; connect-src 'self' uploads.github.com objects-origin.githubusercontent.com www.githubstatus.com collector.github.com raw.githubusercontent.com api.github.com github-cloud.s3.amazonaws.com github-production-repository-file-5c1aeb.s3.amazonaws.com github-production-upload-manifest-file-7fdce7.s3.amazonaws.com github-production-user-asset-6210df.s3.amazonaws.com cdn.optimizely.com logx.optimizely.com/v1/events translator.github.com wss://alive.github.com; font-src github.githubassets.com; form-action 'self' github.com gist.github.com objects-origin.githubusercontent.com; frame-ancestors 'none'; frame-src render.githubusercontent.com viewscreen.githubusercontent.com notebooks.githubusercontent.com; img-src 'self' data: github.githubassets.com identicons.github.com github-cloud.s3.amazonaws.com secured-user-images.githubusercontent.com/ *.githubusercontent.com; manifest-src 'self'; media-src github.com user-images.githubusercontent.com/; script-src github.githubassets.com; style-src 'unsafe-inline' github.githubassets.com; worker-src github.com/assets-cdn/worker/ gist.github.com/assets-cdn/worker/" :
                "default-src 'self'",
            'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
            'x-content-type-options': 'nosniff',
            'x-frame-options': 'DENY',
            'x-xss-protection': '1; mode=block',
            'referrer-policy': 'strict-origin-when-cross-origin'
        };

        // Adicionar ou modificar cabeçalhos específicos por site
        if (isGoogle) {
            mockHeaders['permissions-policy'] = 'geolocation=(), midi=(), sync-xhr=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), fullscreen=(), payment=()';
        }

        if (isMozilla) {
            mockHeaders['content-security-policy'] = "default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com; img-src 'self' data: https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'; form-action 'self'";
            mockHeaders['feature-policy'] = "accelerometer 'none'; camera 'none'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; payment 'none'; usb 'none'";
        }

        return mockHeaders;
    }

    function displayHeadersAnalysis(headers, url, isMock = false) {
        const resultContainer = document.getElementById('resultContainer');

        const securityHeaders = {
            'content-security-policy': {
                name: 'Content-Security-Policy',
                desc: 'Define as políticas de carregamento de recursos',
                importance: 'high'
            },
            'strict-transport-security': {
                name: 'Strict-Transport-Security',
                desc: 'Força conexões HTTPS',
                importance: 'high'
            },
            'x-content-type-options': {
                name: 'X-Content-Type-Options',
                desc: 'Previne MIME type sniffing',
                importance: 'medium'
            },
            'x-frame-options': {
                name: 'X-Frame-Options',
                desc: 'Previne clickjacking',
                importance: 'medium'
            },
            'x-xss-protection': {
                name: 'X-XSS-Protection',
                desc: 'Filtro XSS para navegadores antigos',
                importance: 'low'
            },
            'referrer-policy': {
                name: 'Referrer-Policy',
                desc: 'Controla informações de referência',
                importance: 'medium'
            },
            'feature-policy': {
                name: 'Feature-Policy (Legacy)',
                desc: 'Controla recursos do navegador',
                importance: 'low'
            },
            'permissions-policy': {
                name: 'Permissions-Policy',
                desc: 'Controla permissões de recursos',
                importance: 'medium'
            }
        };

        // Calcular pontuação de segurança
        let score = 0;
        let maxScore = 0;

        Object.keys(securityHeaders).forEach(header => {
            const importance = securityHeaders[header].importance;
            const points = importance === 'high' ? 3 : importance === 'medium' ? 2 : 1;
            maxScore += points;

            if (headers[header]) {
                score += points;
            }
        });

        const scorePercentage = Math.round((score / maxScore) * 100);
        let scoreClass = 'score-bad';
        if (scorePercentage >= 80) {
            scoreClass = 'score-good';
        } else if (scorePercentage >= 50) {
            scoreClass = 'score-medium';
        }

        // Dividir os cabeçalhos em presentes e ausentes
        const presentHeaders = {};
        const missingHeaders = {};

        Object.keys(securityHeaders).forEach(header => {
            if (headers[header]) {
                presentHeaders[header] = headers[header];
            } else {
                missingHeaders[header] = securityHeaders[header];
            }
        });

        let resultsHTML = `
            <div class="headers-card">
                <div class="headers-url">${url}</div>
                ${isMock ? `<div class="header-status status-warning">Simulação (CORS bloqueado)</div>` : ''}

                <div class="score-container">
                    <div>
                        <div class="score-value ${scoreClass}">${scorePercentage}%</div>
                        <div class="score-label">Pontuação de Segurança</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="header-status ${scorePercentage >= 80 ? 'status-good' : scorePercentage >= 50 ? 'status-warning' : 'status-bad'}">
                            ${scorePercentage >= 80 ? 'Boa Segurança' : scorePercentage >= 50 ? 'Segurança Moderada' : 'Segurança Insuficiente'}
                        </div>
                        <div class="score-label">${Object.keys(presentHeaders).length} de ${Object.keys(securityHeaders).length} cabeçalhos</div>
                    </div>
                </div>
        `;

        // Mostrar cabeçalhos presentes
        if (Object.keys(presentHeaders).length > 0) {
            resultsHTML += `
                <div class="header-group">
                    <div class="header-group-title">
                        <i class="fas fa-check-circle" style="color: #66bb6a;"></i>
                        Cabeçalhos de Segurança Presentes
                    </div>
            `;

            Object.keys(presentHeaders).forEach(header => {
                const headerName = securityHeaders[header].name;
                const headerValue = presentHeaders[header];

                resultsHTML += `
                    <div class="header-item">
                        <div class="header-name">${headerName}</div>
                        <div class="header-value">${utils.escapeHTML ? utils.escapeHTML(headerValue) : headerValue}</div>
                    </div>
                `;
            });

            resultsHTML += `</div>`;
        }

        // Mostrar cabeçalhos ausentes
        if (Object.keys(missingHeaders).length > 0) {
            resultsHTML += `
                <div class="missing-headers">
                    <div class="missing-header-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        Cabeçalhos de Segurança Ausentes
                    </div>
            `;

            Object.keys(missingHeaders).forEach(header => {
                const headerInfo = missingHeaders[header];

                resultsHTML += `
                    <div class="missing-header-item">
                        <div>
                            <div class="missing-header-name">${headerInfo.name}</div>
                            <div class="missing-header-desc">${headerInfo.desc}</div>
                        </div>
                        <div class="header-status ${headerInfo.importance === 'high' ? 'status-bad' : headerInfo.importance === 'medium' ? 'status-warning' : 'status-info'}">
                            ${headerInfo.importance === 'high' ? 'Crítico' : headerInfo.importance === 'medium' ? 'Importante' : 'Recomendado'}
                        </div>
                    </div>
                `;
            });

            resultsHTML += `</div>`;
        }

        resultsHTML += `</div>`;

        resultContainer.innerHTML = resultsHTML;
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

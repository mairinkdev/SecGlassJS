(function (tool) {
    const utils = window.SecGlassUtils || {};

    function renderInterface() {
        if (utils.addFormStyles) {
            utils.addFormStyles();
        }

        tool.container.innerHTML = `
            <div class="ip-info-tool">
                <div class="secglass-form-row">
                    <div class="secglass-form-col" style="flex: 3">
                        <div class="secglass-input-group">
                            <label for="ipInput">Endereço IP ou Domínio</label>
                            <input type="text" id="ipInput" class="secglass-input" placeholder="Ex: 8.8.8.8 ou github.com">
                        </div>
                    </div>
                    <div class="secglass-form-col" style="flex: 1; display: flex; align-items: flex-end;">
                        <button id="lookupBtn" class="secglass-button secglass-button-primary secglass-button-medium" style="width: 100%">
                            <i class="fas fa-search"></i>
                            <span>Consultar</span>
                        </button>
                    </div>
                </div>

                <div class="examples">
                    <span>Exemplos: </span>
                    <a href="#" class="example-link" data-ip="8.8.8.8">8.8.8.8</a>
                    <a href="#" class="example-link" data-ip="1.1.1.1">1.1.1.1</a>
                    <a href="#" class="example-link" data-ip="github.com">github.com</a>
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
            .ip-info-tool { padding: 10px; }
            .examples { font-size: 0.85rem; margin: 5px 0 20px; opacity: 0.7; }
            .example-link { color: #42a5f5; margin: 0 5px; cursor: pointer; text-decoration: none; }
            .example-link:hover { text-decoration: underline; }
            .result-container { min-height: 50px; border-radius: 10px; overflow: hidden; transition: all 0.3s; }
            .ip-info-card { background: rgba(0, 0, 0, 0.2); border-radius: 10px; padding: 20px; animation: fadeIn 0.3s ease-out; }
            .ip-info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
            .ip-address { font-size: 1.4rem; font-weight: 600; color: #fff; }
            .country-flag { width: 32px; height: 24px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
            .info-item { background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; }
            .info-label { font-size: 0.8rem; opacity: 0.7; margin-bottom: 5px; }
            .info-value { font-size: 1rem; font-weight: 500; }
            .map-container { margin-top: 20px; border-radius: 10px; overflow: hidden; height: 200px; background: rgba(0, 0, 0, 0.2); }
            .error-message { color: #ff6b6b; padding: 15px; text-align: center; background: rgba(255, 0, 0, 0.1); border-radius: 8px; margin-top: 10px; }
            .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; opacity: 0.7; background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
            .loading-container i { font-size: 2rem; margin-bottom: 15px; color: #42a5f5; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .copy-btn { background: rgba(255, 255, 255, 0.1); border: none; color: rgba(255, 255, 255, 0.7); cursor: pointer; padding: 5px 8px; border-radius: 4px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px; margin-left: 10px; transition: all 0.2s; }
            .copy-btn:hover { background: rgba(255, 255, 255, 0.2); color: white; }
        `;
        document.head.appendChild(style);
    }

    function setupEventListeners() {
        const ipInput = document.getElementById('ipInput');
        const lookupBtn = document.getElementById('lookupBtn');
        const resultContainer = document.getElementById('resultContainer');
        const exampleLinks = document.querySelectorAll('.example-link');

        const lookupIP = () => {
            const query = ipInput.value.trim();
            if (!query) return;

            resultContainer.innerHTML = `
                <div class="loading-container">
                    <i class="fas fa-circle-notch fa-spin"></i>
                    <p>Consultando informações sobre ${query}...</p>
                </div>
            `;

            fetch(`https://ipinfo.io/${query}/json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Não foi possível obter informações sobre este IP/domínio');
                    }
                    return response.json();
                })
                .then(data => displayIPInfo(data))
                .catch(error => {
                    resultContainer.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            ${error.message}
                        </div>
                    `;
                });
        };

        lookupBtn.addEventListener('click', lookupIP);
        ipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                lookupIP();
            }
        });

        exampleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const exampleIP = link.dataset.ip;
                ipInput.value = exampleIP;
                lookupIP();
            });
        });
    }

    function displayIPInfo(data) {
        const resultContainer = document.getElementById('resultContainer');

        if (data.error) {
            resultContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    ${data.error.title || 'Erro ao consultar IP'}
                </div>
            `;
            return;
        }

        const {
            ip, hostname, city, region, country, loc, org, postal, timezone, readme
        } = data;

        if (readme) {
            resultContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-info-circle"></i>
                    IP não encontrado ou limite de requisições excedido.
                </div>
            `;
            return;
        }

        const countryCode = country ? country.toLowerCase() : '';
        const [latitude, longitude] = loc ? loc.split(',') : ['0', '0'];

        resultContainer.innerHTML = `
            <div class="ip-info-card">
                <div class="ip-info-header">
                    ${countryCode ? `<img src="https://flagcdn.com/32x24/${countryCode}.png" class="country-flag" alt="${country}">` : ''}
                    <span class="ip-address">${ip}</span>
                    <button class="copy-btn" data-value="${ip}">
                        <i class="fas fa-copy"></i>
                        <span>Copiar</span>
                    </button>
                </div>

                <div class="info-grid">
                    ${hostname ? `
                        <div class="info-item">
                            <div class="info-label">Hostname</div>
                            <div class="info-value">${hostname}</div>
                        </div>
                    ` : ''}
                    ${city && region ? `
                        <div class="info-item">
                            <div class="info-label">Localização</div>
                            <div class="info-value">${city}, ${region}</div>
                        </div>
                    ` : ''}
                    ${country ? `
                        <div class="info-item">
                            <div class="info-label">País</div>
                            <div class="info-value">${getCountryName(country)}</div>
                        </div>
                    ` : ''}
                    ${postal ? `
                        <div class="info-item">
                            <div class="info-label">Código Postal</div>
                            <div class="info-value">${postal}</div>
                        </div>
                    ` : ''}
                    ${org ? `
                        <div class="info-item">
                            <div class="info-label">Organização</div>
                            <div class="info-value">${org}</div>
                        </div>
                    ` : ''}
                    ${timezone ? `
                        <div class="info-item">
                            <div class="info-label">Fuso Horário</div>
                            <div class="info-value">${timezone}</div>
                        </div>
                    ` : ''}
                    ${loc ? `
                        <div class="info-item">
                            <div class="info-label">Coordenadas</div>
                            <div class="info-value">
                                ${loc}
                                <button class="copy-btn" data-value="${loc}">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                ${loc ? `
                    <div class="map-container">
                        <iframe
                            width="100%"
                            height="100%"
                            frameborder="0"
                            scrolling="no"
                            marginheight="0"
                            marginwidth="0"
                            src="https://maps.google.com/maps?q=${latitude},${longitude}&z=10&output=embed"
                        ></iframe>
                    </div>
                ` : ''}
            </div>
        `;

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;
                if (utils.copyToClipboard) {
                    utils.copyToClipboard(value);
                } else {
                    navigator.clipboard.writeText(value)
                        .then(() => alert('Copiado para a área de transferência!'))
                        .catch(err => console.error('Erro ao copiar:', err));
                }
            });
        });
    }

    function getCountryName(countryCode) {
        const countries = {
            "US": "Estados Unidos", "BR": "Brasil", "CA": "Canadá", "GB": "Reino Unido",
            "AU": "Austrália", "DE": "Alemanha", "FR": "França", "JP": "Japão", "CN": "China",
            "RU": "Rússia", "ES": "Espanha", "IT": "Itália", "NL": "Holanda", "SE": "Suécia",
            "NO": "Noruega", "DK": "Dinamarca", "FI": "Finlândia", "PT": "Portugal", "CH": "Suíça",
            "AT": "Áustria", "BE": "Bélgica", "IE": "Irlanda", "IN": "Índia", "MX": "México",
            "AR": "Argentina", "CL": "Chile", "CO": "Colômbia", "PE": "Peru", "ZA": "África do Sul"
        };
        return countries[countryCode] || countryCode;
    }

    renderInterface();
});

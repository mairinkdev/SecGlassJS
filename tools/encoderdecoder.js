(function (tool) {
    const utils = window.SecGlassUtils || {};

    function renderInterface() {
        if (utils.addFormStyles) {
            utils.addFormStyles();
        }

        tool.container.innerHTML = `
            <div class="encoderdecoder-tool">
                <div class="secglass-tabs">
                    <button class="secglass-tab active" data-tab="encode">
                        <i class="fas fa-lock"></i>
                        <span>Codificar</span>
                    </button>
                    <button class="secglass-tab" data-tab="decode">
                        <i class="fas fa-unlock"></i>
                        <span>Decodificar</span>
                    </button>
                </div>

                <div class="encoding-content">
                    <div class="secglass-form-row">
                        <div class="secglass-form-col">
                            <div class="secglass-input-group">
                                <label for="inputText">Texto de Entrada</label>
                                <textarea id="inputText" class="secglass-textarea" rows="5" placeholder="Digite o texto para codificar/decodificar..."></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="secglass-form-row encoding-options">
                        <div class="secglass-form-col">
                            <label>Selecione o Método</label>
                            <div class="encoder-methods">
                                <button class="encoder-method active" data-method="base64">Base64</button>
                                <button class="encoder-method" data-method="url">URL</button>
                                <button class="encoder-method" data-method="html">HTML</button>
                                <button class="encoder-method" data-method="hex">Hex</button>
                                <button class="encoder-method" data-method="md5">MD5</button>
                                <button class="encoder-method" data-method="sha1">SHA-1</button>
                                <button class="encoder-method" data-method="sha256">SHA-256</button>
                            </div>
                        </div>
                    </div>

                    <div class="secglass-form-row">
                        <div class="secglass-form-col" style="display: flex; justify-content: center;">
                            <button id="convertBtn" class="secglass-button secglass-button-primary">
                                <i class="fas fa-exchange-alt"></i>
                                <span id="convertBtnText">Codificar</span>
                            </button>
                        </div>
                    </div>

                    <div class="secglass-form-row">
                        <div class="secglass-form-col">
                            <div class="secglass-input-group">
                                <div class="result-header">
                                    <label for="outputText">Resultado</label>
                                    <button id="copyBtn" class="secglass-button secglass-button-text secglass-button-small">
                                        <i class="fas fa-copy"></i>
                                        <span>Copiar</span>
                                    </button>
                                </div>
                                <textarea id="outputText" class="secglass-textarea" rows="5" placeholder="Resultado aparecerá aqui..." readonly></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        addToolStyles();
        setupEventListeners();
    }

    function addToolStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .encoderdecoder-tool { padding: 15px; }
            .secglass-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 10px;
            }
            .secglass-tab {
                background: rgba(255, 255, 255, 0.05);
                border: none;
                color: var(--text-color);
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .secglass-tab.active {
                background: rgba(66, 165, 245, 0.2);
                color: #42a5f5;
            }
            .secglass-tab:hover:not(.active) {
                background: rgba(255, 255, 255, 0.1);
            }
            .encoder-methods {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }
            .encoder-method {
                background: rgba(255, 255, 255, 0.05);
                border: none;
                color: var(--text-color);
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            }
            .encoder-method.active {
                background: rgba(66, 165, 245, 0.2);
                color: #42a5f5;
            }
            .encoder-method:hover:not(.active) {
                background: rgba(255, 255, 255, 0.1);
            }
            .result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }
            .encoding-content {
                animation: fadeIn 0.3s;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    function setupEventListeners() {
        const tabs = document.querySelectorAll('.secglass-tab');
        const methods = document.querySelectorAll('.encoder-method');
        const convertBtn = document.getElementById('convertBtn');
        const convertBtnText = document.getElementById('convertBtnText');
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        const copyBtn = document.getElementById('copyBtn');

        let activeTab = 'encode';
        let activeMethod = 'base64';

        // Gerenciamento de abas
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeTab = tab.dataset.tab;
                convertBtnText.textContent = activeTab === 'encode' ? 'Codificar' : 'Decodificar';
                outputText.value = '';
            });
        });

        // Gerenciamento de métodos de codificação
        methods.forEach(method => {
            method.addEventListener('click', () => {
                methods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                activeMethod = method.dataset.method;
                outputText.value = '';
            });
        });

        // Botão de conversão
        convertBtn.addEventListener('click', () => {
            const input = inputText.value;
            if (!input) return;

            try {
                let result;
                if (activeTab === 'encode') {
                    result = encode(input, activeMethod);
                } else {
                    result = decode(input, activeMethod);
                }
                outputText.value = result;
            } catch (error) {
                outputText.value = `Erro: ${error.message}`;
            }
        });

        // Copiar resultado
        copyBtn.addEventListener('click', () => {
            if (!outputText.value) return;

            if (utils.copyToClipboard) {
                utils.copyToClipboard(outputText.value);
            } else {
                navigator.clipboard.writeText(outputText.value)
                    .then(() => {
                        alert('Copiado para a área de transferência!');
                    })
                    .catch(err => {
                        console.error('Erro ao copiar:', err);
                        alert('Erro ao copiar texto');
                    });
            }
        });
    }

    // Função de codificação
    function encode(input, method) {
        switch (method) {
            case 'base64':
                return btoa(unescape(encodeURIComponent(input)));
            case 'url':
                return encodeURIComponent(input);
            case 'html':
                return input.replace(/[\u00A0-\u9999<>&]/gim, char => {
                    return '&#' + char.charCodeAt(0) + ';';
                });
            case 'hex':
                return Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
            case 'md5':
                return md5(input);
            case 'sha1':
                return sha1(input);
            case 'sha256':
                return sha256(input);
            default:
                throw new Error('Método de codificação não suportado');
        }
    }

    // Função de decodificação
    function decode(input, method) {
        switch (method) {
            case 'base64':
                try {
                    return decodeURIComponent(escape(atob(input)));
                } catch (e) {
                    throw new Error('Input não é um Base64 válido');
                }
            case 'url':
                try {
                    return decodeURIComponent(input);
                } catch (e) {
                    throw new Error('Input não é um URL encoded válido');
                }
            case 'html':
                const doc = new DOMParser().parseFromString(input, 'text/html');
                return doc.documentElement.textContent;
            case 'hex':
                try {
                    if (input.length % 2 !== 0) {
                        throw new Error('Input hex inválido (comprimento ímpar)');
                    }
                    return input.match(/.{1,2}/g)
                        .map(byte => String.fromCharCode(parseInt(byte, 16)))
                        .join('');
                } catch (e) {
                    throw new Error('Input não é um hexadecimal válido');
                }
            case 'md5':
            case 'sha1':
            case 'sha256':
                throw new Error('Não é possível reverter funções hash');
            default:
                throw new Error('Método de decodificação não suportado');
        }
    }

    // Implementações simples de algoritmos de hash
    function md5(string) {
        // Isso é apenas para fins de demonstração - em produção deve-se usar uma biblioteca real
        // Retornamos um placeholder já que implementar MD5 aqui seria muito complexo
        return "[MD5 hash seria calculado aqui - use uma biblioteca de criptografia real]";
    }

    function sha1(string) {
        // Placeholder - mesma razão do MD5
        return "[SHA-1 hash seria calculado aqui - use uma biblioteca de criptografia real]";
    }

    function sha256(string) {
        // Placeholder - mesma razão do MD5
        return "[SHA-256 hash seria calculado aqui - use uma biblioteca de criptografia real]";
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

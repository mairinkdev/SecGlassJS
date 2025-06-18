/**
 * SecGlassJS - Security Tools Panel
 * Main loader for script injection via bookmarklet or browser console
 *
 * SecGlassJS - Painel de Ferramentas de Segurança
 * Carregador principal para injeção de scripts via bookmarklet ou console do navegador
 *
 * SecGlassJS - 安全工具面板
 * 通过书签工具或浏览器控制台注入脚本的主加载器
 *
 * Powered by: @mairinkdev
 */


(function () {
    const config = {
        baseURL: (() => {
            const currentScript = document.currentScript;
            if (currentScript) {
                const scriptURL = new URL(currentScript.src);
                return `${scriptURL.protocol}//${scriptURL.host}${scriptURL.pathname.substring(0, scriptURL.pathname.lastIndexOf('/') + 1)}`;
            }
            // Quando executado via console ou como string literal, não há script atual
            // Neste caso, usar uma URL base padrão ou GitHub como fallback
            return 'https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/';
        })(),
        version: '1.0.0',
        debug: true // Habilitando logs para debug
    };

    const logger = {
        info: (msg) => config.debug && console.info(`[SecGlassJS] ${msg}`),
        error: (msg) => console.error(`[SecGlassJS] ${msg}`),
        warn: (msg) => console.warn(`[SecGlassJS] ${msg}`)
    };

    const resources = {
        loadedResources: [],
        loadCSS: (url) => {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                link.onload = () => {
                    resources.loadedResources.push(url);
                    resolve(link);
                };
                link.onerror = () => reject(new Error(`Falha ao carregar CSS: ${url}`));
                document.head.appendChild(link);
            });
        },
        loadJS: (url) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                script.onload = () => {
                    resources.loadedResources.push(url);
                    resolve(script);
                };
                script.onerror = () => reject(new Error(`Falha ao carregar JS: ${url}`));
                document.body.appendChild(script);
            });
        },
        loadHTML: (url) => {
            return fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                    return response.text();
                })
                .then(html => {
                    resources.loadedResources.push(url);
                    return html;
                });
        }
    };

    const state = {
        isInitialized: false,
        isDOMReady: false,
        isPanelVisible: false,
        activeToolId: null,
        tools: []
    };

    function createRootElement() {
        const root = document.createElement('div');
        root.id = 'secglass-root';
        document.body.appendChild(root);
        return root;
    }

    async function loadVisualResources() {
        logger.info('Carregando recursos visuais...');

        try {
            await resources.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
            logger.info('Font Awesome carregado com sucesso');
        } catch (err) {
            logger.error(`Erro ao carregar Font Awesome: ${err.message}`);
        }

        // Em vez de tentar carregar o CSS externo, vamos usar diretamente o CSS inline
        logger.info('Carregando CSS embutido...');
        const mainCSS = createInlineCSS();
        const style = document.createElement('style');
        style.id = 'secglass-styles';
        style.textContent = mainCSS;
        document.head.appendChild(style);
        logger.info('CSS embutido aplicado com sucesso');
    }

    function createInlineCSS() {
        return `
            #secglass-root * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            }

            #secglass-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: rgba(30, 30, 30, 0.85);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                color: #e0e0e0;
                z-index: 999999;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }

            #secglass-panel.hidden {
                transform: translateX(110%);
                opacity: 0;
            }

            #secglass-header {
                padding: 15px;
                background: rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            #secglass-header h1 {
                font-size: 1.2rem;
                font-weight: 600;
                margin: 0;
                background: linear-gradient(90deg, #5e35b1, #42a5f5);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            #secglass-close-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: #e0e0e0;
                width: 30px;
                height: 30px;
                border-radius: 15px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            #secglass-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            #secglass-search {
                padding: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            #secglass-search input {
                width: 100%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 10px 15px;
                color: #e0e0e0;
                font-size: 0.9rem;
                outline: none;
                transition: all 0.2s;
            }

            #secglass-search input:focus {
                border-color: rgba(255, 255, 255, 0.2);
                box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.2);
            }

            #secglass-tools {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
            }

            #secglass-tools::-webkit-scrollbar {
                width: 6px;
            }

            #secglass-tools::-webkit-scrollbar-track {
                background: transparent;
            }

            #secglass-tools::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }

            .secglass-tool-button {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border: none;
                border-radius: 10px;
                color: #e0e0e0;
                cursor: pointer;
                width: 100%;
                text-align: left;
                margin-bottom: 8px;
                transition: all 0.2s;
            }

            .secglass-tool-button:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }

            .secglass-tool-button i {
                color: #42a5f5;
                font-size: 1rem;
                width: 20px;
                text-align: center;
            }

            .secglass-tool-button .tool-name {
                font-weight: 500;
                display: block;
                margin-bottom: 3px;
            }

            .secglass-tool-button .tool-desc {
                font-size: 0.8rem;
                opacity: 0.7;
            }

            #secglass-footer {
                padding: 10px;
                font-size: 0.8rem;
                opacity: 0.7;
                text-align: center;
                background: rgba(0, 0, 0, 0.2);
            }

            #secglass-tool-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 800px;
                height: 70vh;
                background: rgba(40, 40, 40, 0.9);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                z-index: 999998;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            #secglass-tool-header {
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            #secglass-tool-title {
                font-size: 1.2rem;
                font-weight: 500;
            }

            #secglass-tool-close {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: #e0e0e0;
                width: 30px;
                height: 30px;
                border-radius: 15px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            #secglass-tool-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            #secglass-tool-content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }

            .secglass-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(3px);
                -webkit-backdrop-filter: blur(3px);
                z-index: 999997;
                display: none;
            }

            /* Estilos adicionados da main.css */
            .tool-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                height: 100%;
                padding: 40px;
            }

            .tool-loading i {
                font-size: 2rem;
                margin-bottom: 15px;
                color: #42a5f5;
                animation: spin 1.5s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .error-message {
                background: rgba(255, 0, 0, 0.1);
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .error-message i {
                color: #ff6b6b;
                font-size: 2rem;
                margin-bottom: 15px;
            }

            .error-message h3 {
                margin-bottom: 10px;
                color: #ff6b6b;
            }
        `;
    }

    function renderInterface() {
        logger.info('Renderizando interface...');

        const root = createRootElement();

        root.innerHTML = `
            <div id="secglass-panel" class="hidden">
                <div id="secglass-header">
                    <h1>SecGlass<span style="font-weight:400">JS</span></h1>
                    <button id="secglass-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="secglass-search">
                    <input type="text" placeholder="Pesquisar ferramentas (Ctrl+K)">
                </div>
                <div id="secglass-tools">
                    <!-- Ferramentas serão injetadas aqui -->
                </div>
                <div id="secglass-footer">
                    Powered by <a href="https://github.com/mairinkdev" target="_blank">@mairinkdev</a>
                </div>
            </div>
            <div id="secglass-tool-container">
                <div id="secglass-tool-header">
                    <div id="secglass-tool-title">Nome da Ferramenta</div>
                    <button id="secglass-tool-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="secglass-tool-content"></div>
            </div>
            <div class="secglass-overlay"></div>
        `;

        setTimeout(() => {
            document.getElementById('secglass-panel').classList.remove('hidden');
        }, 100);

        setupInterfaceEvents();
    }

    function setupInterfaceEvents() {
        document.getElementById('secglass-close-btn').addEventListener('click', togglePanel);

        document.getElementById('secglass-tool-close').addEventListener('click', closeActiveTool);

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                togglePanel();
            }
        });

        document.querySelector('.secglass-overlay').addEventListener('click', closeActiveTool);
    }

    function togglePanel() {
        const panel = document.getElementById('secglass-panel');
        panel.classList.toggle('hidden');
        state.isPanelVisible = !panel.classList.contains('hidden');
    }

    async function loadTools() {
        logger.info('Carregando ferramentas...');

        // Incluindo apenas a ferramenta que temos implementada diretamente
        state.tools = [
            {
                id: 'ipinfo',
                name: 'IP Info',
                description: 'Consulta informações detalhadas sobre endereços IP',
                icon: 'fa-globe',
                inlineScript: `
            (function (tool) {
                // Renderiza a interface básica da ferramenta
                tool.container.innerHTML = \`
                    <div style="text-align: center; padding: 20px;">
                        <h2>IP Info</h2>
                        <p>Ferramenta para consulta de informações sobre IPs</p>
                        <div style="margin: 20px 0;">
                            <input type="text" id="ipInput" placeholder="Digite um IP ou domínio"
                                style="padding: 10px; width: 70%; border-radius: 4px; border: 1px solid #ccc; margin-right: 10px;">
                            <button id="lookupBtn"
                                style="padding: 10px 15px; background: #5e35b1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Consultar
                            </button>
                        </div>
                        <div id="ipResult" style="margin-top: 20px; text-align: left;"></div>
                    </div>
                \`;

                // Adiciona event listeners
                const ipInput = document.getElementById('ipInput');
                const lookupBtn = document.getElementById('lookupBtn');
                const ipResult = document.getElementById('ipResult');

                lookupBtn.addEventListener('click', () => {
                    const ip = ipInput.value.trim();
                    if (!ip) return;

                    ipResult.innerHTML = '<div style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Consultando...</div>';

                    // Faz a consulta usando a API ipinfo.io
                    fetch(\`https://ipinfo.io/\${ip}/json\`)
                        .then(response => response.json())
                        .then(data => {
                            let html = '<div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">';

                            if (data.error) {
                                html = \`<div style="color: #ff6b6b; text-align: center;">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <h3>Erro</h3>
                                    <p>\${data.error.title || 'Erro ao consultar IP'}</p>
                                </div>\`;
                            } else {
                                html += \`
                                    <h3>\${data.ip}</h3>
                                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                        \${data.hostname ? \`<tr><td style="padding: 8px 0; opacity: 0.7;">Hostname</td><td>\${data.hostname}</td></tr>\` : ''}
                                        \${data.city ? \`<tr><td style="padding: 8px 0; opacity: 0.7;">Localização</td><td>\${data.city}, \${data.region}</td></tr>\` : ''}
                                        \${data.country ? \`<tr><td style="padding: 8px 0; opacity: 0.7;">País</td><td>\${data.country}</td></tr>\` : ''}
                                        \${data.loc ? \`<tr><td style="padding: 8px 0; opacity: 0.7;">Coordenadas</td><td>\${data.loc}</td></tr>\` : ''}
                                        \${data.org ? \`<tr><td style="padding: 8px 0; opacity: 0.7;">Organização</td><td>\${data.org}</td></tr>\` : ''}
                                        \${data.postal ? \`<tr><td style="padding: 8px 0; opacity: 0.7;">Código Postal</td><td>\${data.postal}</td></tr>\` : ''}
                                        \${data.timezone ? \`<tr><td style="padding: 8px 0; opacity: 0.7;">Fuso Horário</td><td>\${data.timezone}</td></tr>\` : ''}
                                    </table>
                                \`;
                            }

                            html += '</div>';
                            ipResult.innerHTML = html;
                        })
                        .catch(error => {
                            ipResult.innerHTML = \`
                                <div style="color: #ff6b6b; text-align: center; background: rgba(255,0,0,0.1); padding: 15px; border-radius: 8px;">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <h3>Erro ao consultar</h3>
                                    <p>\${error.message}</p>
                                </div>
                            \`;
                        });
                });
            })
        `
            }
        ];

        renderToolButtons();
        logger.info('Ferramentas carregadas');
    }

    function renderToolButtons() {
        const container = document.getElementById('secglass-tools');

        state.tools.forEach(tool => {
            const button = document.createElement('button');
            button.className = 'secglass-tool-button';
            button.dataset.toolId = tool.id;
            button.innerHTML = `
                <i class="fas ${tool.icon}"></i>
                <div>
                    <span class="tool-name">${tool.name}</span>
                    <small class="tool-desc">${tool.description}</small>
                </div>
            `;

            button.addEventListener('click', () => openTool(tool));
            container.appendChild(button);
        });
    }

    function openTool(tool) {
        state.activeToolId = tool.id;

        document.getElementById('secglass-tool-title').textContent = tool.name;

        const contentContainer = document.getElementById('secglass-tool-content');
        contentContainer.innerHTML = `
            <div class="tool-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando ${tool.name}...</p>
            </div>
        `;

        document.getElementById('secglass-tool-container').style.display = 'flex';
        document.querySelector('.secglass-overlay').style.display = 'block';

        try {
            if (tool.inlineScript) {
                // Usar o script inline em vez de carregar do arquivo
                setTimeout(() => {
                    const toolInterface = {
                        container: contentContainer,
                        name: tool.name,
                        id: tool.id
                    };

                    const scriptFunction = new Function('tool', tool.inlineScript);
                    contentContainer.innerHTML = '';
                    scriptFunction(toolInterface);
                }, 300); // Pequeno atraso para mostrar o loading
            } else {
                // Fallback para carregamento via URL (caso implementado no futuro)
                fetch(`${config.baseURL}tools/${tool.id}.js`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Erro ao carregar ferramenta: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(scriptText => {
                        const toolInterface = {
                            container: contentContainer,
                            name: tool.name,
                            id: tool.id
                        };

                        const scriptFunction = new Function('tool', scriptText);
                        contentContainer.innerHTML = '';
                        scriptFunction(toolInterface);
                    })
                    .catch(error => {
                        contentContainer.innerHTML = `
                            <div class="error-message">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h3>Erro ao carregar ferramenta</h3>
                                <p>${error.message}</p>
                            </div>
                        `;
                        logger.error(`Falha ao carregar ferramenta ${tool.id}: ${error.message}`);
                    });
            }
        } catch (error) {
            contentContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao executar ferramenta</h3>
                    <p>${error.message}</p>
                </div>
            `;
            logger.error(`Erro ao executar ferramenta ${tool.id}: ${error.message}`);
        }
    }

    function closeActiveTool() {
        document.getElementById('secglass-tool-container').style.display = 'none';
        document.querySelector('.secglass-overlay').style.display = 'none';
        state.activeToolId = null;
    }

    async function init() {
        if (state.isInitialized) return;

        try {
            logger.info('Inicializando SecGlassJS...');
            logger.info(`URL base: ${config.baseURL}`);

            await loadVisualResources();

            renderInterface();

            await loadTools();

            state.isInitialized = true;
            logger.info('SecGlassJS inicializado com sucesso');
        } catch (error) {
            logger.error(`Falha na inicialização: ${error.message}`);
            console.error(error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SecGlassJS = {
        toggle: togglePanel,
        version: config.version
    };

    // Incorporar utilitários básicos diretamente
    window.SecGlassUtils = {
        showToast: function (message, type = 'info') {
            const toast = document.createElement('div');
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.background = 'rgba(30, 30, 30, 0.9)';
            toast.style.color = 'white';
            toast.style.padding = '15px';
            toast.style.borderRadius = '10px';
            toast.style.zIndex = '9999999';
            toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            toast.style.backdropFilter = 'blur(10px)';
            toast.style.minWidth = '250px';

            const color = type === 'error' ? '#ff5252' : type === 'success' ? '#66bb6a' : '#42a5f5';

            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}" style="color: ${color}"></i>
                    <span>${message}</span>
                </div>
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, 3000);

            return toast;
        },

        copyToClipboard: function (text) {
            return navigator.clipboard.writeText(text)
                .then(() => {
                    this.showToast('Copiado para a área de transferência!', 'success');
                    return true;
                })
                .catch(err => {
                    this.showToast('Erro ao copiar texto', 'error');
                    console.error('Erro ao copiar:', err);
                    throw err;
                });
        }
    };
})();

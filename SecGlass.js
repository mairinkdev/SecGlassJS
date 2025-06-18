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
            return window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        })(),
        version: '1.0.0',
        debug: false
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

        await resources.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        const mainCSS = await fetch(`${config.baseURL}visuals/main.css`)
            .then(res => res.text())
            .catch(err => {
                logger.error(`Falha ao carregar CSS principal: ${err.message}`);
                return createInlineCSS();
            });

        const style = document.createElement('style');
        style.id = 'secglass-styles';
        style.textContent = mainCSS;
        document.head.appendChild(style);
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

            #secglass-tools {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
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

        state.tools = [
            {
                id: 'ipinfo',
                name: 'IP Info',
                description: 'Consulta informações detalhadas sobre endereços IP',
                icon: 'fa-globe',
                path: `${config.baseURL}tools/ipinfo.js`
            },
            {
                id: 'reverseshell',
                name: 'Reverse Shell Generator',
                description: 'Gera comandos para conexões reversas',
                icon: 'fa-terminal',
                path: `${config.baseURL}tools/reverseshell.js`
            },
            {
                id: 'xss',
                name: 'XSS Payload Launcher',
                description: 'Biblioteca de payloads para testes XSS',
                icon: 'fa-code',
                path: `${config.baseURL}tools/xss.js`
            },
            {
                id: 'headers',
                name: 'HTTP Header Scanner',
                description: 'Analisa cabeçalhos HTTP de segurança',
                icon: 'fa-shield-alt',
                path: `${config.baseURL}tools/headers.js`
            },
            {
                id: 'subfinder',
                name: 'Subdomain Finder',
                description: 'Descobre subdomínios de um domínio alvo',
                icon: 'fa-sitemap',
                path: `${config.baseURL}tools/subfinder.js`
            }
        ];

        renderToolButtons();
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

        fetch(tool.path)
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

    function closeActiveTool() {
        document.getElementById('secglass-tool-container').style.display = 'none';
        document.querySelector('.secglass-overlay').style.display = 'none';
        state.activeToolId = null;
    }

    async function init() {
        if (state.isInitialized) return;

        try {
            logger.info('Inicializando SecGlassJS...');

            await loadVisualResources();

            renderInterface();

            await loadTools();

            state.isInitialized = true;
            logger.info('SecGlassJS inicializado com sucesso');
        } catch (error) {
            logger.error(`Falha na inicialização: ${error.message}`);
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
})();

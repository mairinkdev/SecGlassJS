const SecGlassUtils = {
    showToast: function (message, type = 'info') {
        const existingToasts = document.querySelectorAll('.secglass-toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `secglass-toast secglass-toast-${type}`;
        toast.innerHTML = `
            <div class="secglass-toast-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="secglass-toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const style = document.createElement('style');
        if (!document.getElementById('secglass-toast-styles')) {
            style.id = 'secglass-toast-styles';
            style.textContent = `
                .secglass-toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(30, 30, 30, 0.9);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 10px;
                    padding: 15px;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    z-index: 9999999;
                    min-width: 250px;
                    max-width: 350px;
                    animation: secglass-toast-slide-in 0.3s ease-out forwards;
                }

                .secglass-toast-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .secglass-toast-info i {
                    color: #42a5f5;
                }

                .secglass-toast-success i {
                    color: #66bb6a;
                }

                .secglass-toast-error i {
                    color: #ff5252;
                }

                .secglass-toast-close {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    padding: 5px;
                    transition: all 0.2s;
                }

                .secglass-toast-close:hover {
                    color: white;
                }

                @keyframes secglass-toast-slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes secglass-toast-slide-out {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        const closeBtn = toast.querySelector('.secglass-toast-close');
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'secglass-toast-slide-out 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        });

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.animation = 'secglass-toast-slide-out 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);

        return toast;
    },

    copyToClipboard: function (text) {
        return new Promise((resolve, reject) => {
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.showToast('Copiado para a área de transferência!', 'success');
                    resolve(true);
                })
                .catch(err => {
                    this.showToast('Erro ao copiar texto', 'error');
                    console.error('Erro ao copiar:', err);
                    reject(err);
                });
        });
    },

    escapeHTML: function (unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    formatJSON: function (json) {
        if (typeof json === 'string') {
            try {
                json = JSON.parse(json);
            } catch (e) {
                return this.escapeHTML(json);
            }
        }

        return this.syntaxHighlight(JSON.stringify(json, null, 2));
    },

    syntaxHighlight: function (json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    },

    addJSONStyles: function () {
        if (!document.getElementById('secglass-json-styles')) {
            const style = document.createElement('style');
            style.id = 'secglass-json-styles';
            style.textContent = `
                .json-container {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    padding: 15px;
                    overflow-x: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9rem;
                    white-space: pre;
                }

                .json-container::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }

                .json-container::-webkit-scrollbar-track {
                    background: transparent;
                }

                .json-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }

                .json-key {
                    color: #9cdcfe;
                }

                .json-string {
                    color: #ce9178;
                }

                .json-number {
                    color: #b5cea8;
                }

                .json-boolean {
                    color: #569cd6;
                }

                .json-null {
                    color: #569cd6;
                }
            `;
            document.head.appendChild(style);
        }
    },

    createInput: function (options) {
        const {
            id,
            label,
            type = 'text',
            placeholder = '',
            value = '',
            onChange = null
        } = options;

        const container = document.createElement('div');
        container.className = 'secglass-input-group';

        if (label) {
            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', id);
            labelElement.textContent = label;
            container.appendChild(labelElement);
        }

        const input = document.createElement('input');
        input.id = id;
        input.type = type;
        input.className = 'secglass-input';
        input.placeholder = placeholder;
        input.value = value;

        if (onChange) {
            input.addEventListener('input', onChange);
        }

        container.appendChild(input);

        return container;
    },

    createButton: function (options) {
        const {
            text,
            icon = null,
            onClick = null,
            type = 'primary',
            size = 'medium'
        } = options;

        const button = document.createElement('button');
        button.className = `secglass-button secglass-button-${type} secglass-button-${size}`;

        if (icon) {
            const iconElement = document.createElement('i');
            iconElement.className = `fas ${icon}`;
            button.appendChild(iconElement);
        }

        const span = document.createElement('span');
        span.textContent = text;
        button.appendChild(span);

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    },

    addFormStyles: function () {
        if (!document.getElementById('secglass-form-styles')) {
            const style = document.createElement('style');
            style.id = 'secglass-form-styles';
            style.textContent = `
                .secglass-input-group {
                    margin-bottom: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .secglass-input-group label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .secglass-input {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 10px 15px;
                    color: white;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .secglass-input:focus {
                    border-color: rgba(255, 255, 255, 0.3);
                    box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.2);
                }

                .secglass-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 15px center;
                    background-size: 16px;
                    padding-right: 40px;
                }

                .secglass-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                    white-space: nowrap;
                    padding: 0 20px;
                }

                .secglass-button i {
                    font-size: 1rem;
                }

                .secglass-button-primary {
                    background: rgba(124, 77, 255, 0.8);
                    color: white;
                }

                .secglass-button-primary:hover {
                    background: rgba(124, 77, 255, 0.9);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .secglass-button-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .secglass-button-secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .secglass-button-danger {
                    background: rgba(244, 67, 54, 0.8);
                    color: white;
                }

                .secglass-button-danger:hover {
                    background: rgba(244, 67, 54, 0.9);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .secglass-button-small {
                    height: 32px;
                    font-size: 0.8rem;
                }

                .secglass-button-medium {
                    height: 40px;
                    font-size: 0.9rem;
                }

                .secglass-button-large {
                    height: 48px;
                    font-size: 1rem;
                }

                .secglass-form-row {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }

                .secglass-form-col {
                    flex: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecGlassUtils;
} else {
    window.SecGlassUtils = SecGlassUtils;
}

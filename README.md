# SecGlassJS

[![GitHub stars](https://img.shields.io/github/stars/mairinkdev/SecGlassJS?style=for-the-badge)](https://github.com/mairinkdev/SecGlassJS/stargazers)
[![License](https://img.shields.io/github/license/mairinkdev/SecGlassJS?style=for-the-badge)](https://github.com/mairinkdev/SecGlassJS/blob/main/LICENSE)

## Português

Um painel de ferramentas de segurança ofensiva em JavaScript com design moderno estilo "liquid glass". Leve, rápido e visualmente bonito, com ferramentas úteis para devs e pentesters iniciantes.

### Recursos

- Interface moderna com efeito vidro fosco (glassmorphism)
- Carregamento dinâmico de ferramentas
- Atalho de teclado `Ctrl+K` para abrir/fechar o painel
- Estrutura modular e extensível
- Pode ser injetado em qualquer página com um único comando

### Ferramentas Incluídas

- **IP Info**: Consulta detalhada sobre endereços IP
- **Reverse Shell Generator**: Comandos para conexões reversas
- **XSS Payload Launcher**: Biblioteca de payloads para testes XSS
- **HTTP Header Scanner**: Análise de cabeçalhos HTTP de segurança
- **Subdomain Finder**: Descobre subdomínios de um domínio alvo

### Como Usar

#### Método 1: Bookmarklet (Recomendado)

1. Crie um novo favorito no seu navegador
2. Dê um nome (ex: "SecGlassJS")
3. No campo URL, cole o seguinte código:

```javascript
javascript:fetch("https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js").then(t=>t.text()).then(eval);
```

4. Salve o favorito
5. Em qualquer site, clique no favorito para ativar o SecGlassJS

#### Método 2: Console do Navegador

1. Abra o console do navegador (F12 ou Ctrl+Shift+I)
2. Cole o seguinte comando:

```javascript
fetch("https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js").then(t=>t.text()).then(eval);
```

3. Pressione Enter para executar

### Estrutura do Projeto

```
/SecGlassJS
├── SecGlass.js         # Script principal para injeção
├── SecGlass.min.js     # Versão minificada para uso como bookmarklet
├── /visuals/           # Recursos visuais
│   └── main.css        # Estilos principais
├── /functions/         # Funções utilitárias
│   └── utils.js        # Utilitários comuns
└── /tools/             # Ferramentas individuais
    └── ipinfo.js       # Ferramenta de consulta de IPs
```

### Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

### Autor

**@mairinkdev** - [GitHub](https://github.com/mairinkdev)

⭐ Gostou do projeto? [Favorita ai ;)](https://github.com/mairinkdev/SecGlassJS)

---

## English

A JavaScript offensive security tools panel with modern "liquid glass" design. Lightweight, fast, and visually appealing, with useful tools for developers and beginner pentesters.

### Features

- Modern interface with frosted glass effect (glassmorphism)
- Dynamic tool loading
- Keyboard shortcut `Ctrl+K` to open/close panel
- Modular and extensible structure
- Can be injected into any page with a single command

### Included Tools

- **IP Info**: Detailed query about IP addresses
- **Reverse Shell Generator**: Commands for reverse connections on various platforms
- **XSS Payload Launcher**: Payload library for Cross-Site Scripting tests
- **HTTP Header Scanner**: Security HTTP header analysis
- **Subdomain Finder**: Discovers subdomains of a target domain

### How to Use

#### Method 1: Bookmarklet (Recommended)

1. Create a new bookmark in your browser
2. Give it a name (ex: "SecGlassJS")
3. In the URL field, paste the following code:

```javascript
javascript:fetch("https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js").then(t=>t.text()).then(eval);
```

4. Save the bookmark
5. On any site, click the bookmark to activate SecGlassJS

#### Method 2: Browser Console

1. Open the browser console (F12 or Ctrl+Shift+I)
2. Paste the following command:

```javascript
fetch("https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js").then(t=>t.text()).then(eval);
```

3. Press Enter to execute

### Project Structure

```
/SecGlassJS
├── SecGlass.js         # Main injection script
├── SecGlass.min.js     # Minified version for bookmarklet use
├── /visuals/           # Visual resources
│   └── main.css        # Main styles
├── /functions/         # Utility functions
│   └── utils.js        # Common utilities
└── /tools/             # Individual tools
    └── ipinfo.js       # IP lookup tool
```

### License

This project is licensed under the [MIT License](LICENSE).

### Author

**@mairinkdev** - [GitHub](https://github.com/mairinkdev)

⭐ Like the project? [Star it on GitHub!](https://github.com/mairinkdev/SecGlassJS)

---

## 中文

SecGlassJS 是一个具有现代"液态玻璃"设计的 JavaScript 攻击性安全工具面板。轻量级、快速且视觉上吸引人，为开发人员和初学者提供有用的工具。

### 功能

- 带有磨砂玻璃效果的现代界面 (玻璃态设计)
- 动态工具加载
- 键盘快捷键 `Ctrl+K` 打开/关闭面板
- 模块化和可扩展结构
- 可以通过单个命令注入到任何页面中

### 包含的工具

- **IP 信息**: 关于 IP 地址的详细查询
- **反向 Shell 生成器**: 在各种平台上进行反向连接的命令
- **XSS 有效载荷启动器**: 用于跨站脚本测试的有效载荷库
- **HTTP 标头扫描器**: 安全 HTTP 标头分析
- **子域名查找器**: 发现目标域的子域名

### 如何使用

#### 方法 1: 书签小工具 (推荐)

1. 在浏览器中创建一个新书签
2. 给它一个名称 (例如: "SecGlassJS")
3. 在 URL 字段中，粘贴以下代码:

```javascript
javascript:fetch("https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js").then(t=>t.text()).then(eval);
```

4. 保存书签
5. 在任何网站上，点击书签激活 SecGlassJS

#### 方法 2: 浏览器控制台

1. 打开浏览器控制台 (F12 或 Ctrl+Shift+I)
2. 粘贴以下命令:

```javascript
fetch("https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js").then(t=>t.text()).then(eval);
```

3. 按 Enter 键执行

### 项目结构

```
/SecGlassJS
├── SecGlass.js         # 主注入脚本
├── SecGlass.min.js     # 用于书签工具的压缩版本
├── /visuals/           # 视觉资源
│   └── main.css        # 主要样式
├── /functions/         # 实用函数
│   └── utils.js        # 通用实用程序
└── /tools/             # 单独工具
    └── ipinfo.js       # IP 查询工具
```

### 许可证

该项目根据 [MIT 许可证](LICENSE) 授权。

### 作者

**@mairinkdev** - [GitHub](https://github.com/mairinkdev)

⭐ 喜欢这个项目吗？[在 GitHub 上加星！](https://github.com/mairinkdev/SecGlassJS)

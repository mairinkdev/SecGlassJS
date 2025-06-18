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

- **IP Info**: Consulta informações detalhadas sobre endereços IP

### Como Usar

#### Método 1: Bookmarklet

Adicione um novo favorito no seu navegador com a seguinte URL:

```
javascript:fetch('https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js').then(r=>r.text()).then(eval);
```

#### Método 2: Console do Navegador

Abra o console do navegador (F12) e cole o seguinte comando:

```javascript
fetch('https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js').then(r=>r.text()).then(eval);
```

### Estrutura do Projeto

```
SecGlassJS/
├── SecGlass.js           # Script principal completo
├── SecGlass.min.js       # Versão minificada para bookmarklet
├── visuals/
│   └── main.css          # Estilos embutidos no script principal
├── functions/
│   └── utils.js          # Utilitários embutidos no script principal
└── tools/
    └── ipinfo.js         # Ferramenta IP Info (funcionalidade embutida no script principal)
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

### How to Use

#### Method 1: Bookmarklet

Add a new bookmark in your browser with the following URL:

```
javascript:fetch('https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js').then(r=>r.text()).then(eval);
```

#### Method 2: Browser Console

Open the browser console (F12) and paste the following command:

```javascript
fetch('https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js').then(r=>r.text()).then(eval);
```

### Project Structure

```
SecGlassJS/
├── SecGlass.js           # Complete main script
├── SecGlass.min.js       # Minified version for bookmarklet
├── visuals/
│   └── main.css          # Styles embedded in the main script
├── functions/
│   └── utils.js          # Utilities embedded in the main script
└── tools/
    └── ipinfo.js         # IP Info tool (functionality embedded in the main script)
```

### License

This project is licensed under the [MIT License](LICENSE).

### Author

**@mairinkdev** - [GitHub](https://github.com/mairinkdev)

⭐ Like the project? [Star it on GitHub!](https://github.com/mairinkdev/SecGlassJS)

---

## 中文

具有现代"液态玻璃"设计的JavaScript攻击性安全工具面板。轻量级、快速且视觉上具有吸引力，为开发人员和初学者渗透测试人员提供有用的工具。

### 功能

- 采用磨砂玻璃效果(glassmorphism)的现代界面
- 动态工具加载
- 键盘快捷键`Ctrl+K`打开/关闭面板
- 模块化和可扩展结构
- 可以通过单个命令注入到任何页面

### 包含的工具

- **IP信息**：查询关于IP地址的详细信息

### 使用方法

#### 方法1：书签工具

在您的浏览器中添加一个具有以下URL的新书签：

```
javascript:fetch('https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js').then(r=>r.text()).then(eval);
```

#### 方法2：浏览器控制台

打开浏览器控制台(F12)并粘贴以下命令：

```javascript
fetch('https://raw.githubusercontent.com/mairinkdev/SecGlassJS/main/SecGlass.min.js').then(r=>r.text()).then(eval);
```

### 项目结构

```
SecGlassJS/
├── SecGlass.js           # 完整主脚本
├── SecGlass.min.js       # 书签工具的精简版本
├── visuals/
│   └── main.css          # 主脚本中嵌入的样式
├── functions/
│   └── utils.js          # 主脚本中嵌入的实用程序
└── tools/
    └── ipinfo.js         # IP信息工具（功能嵌入在主脚本中）
```

### 许可证

该项目根据 [MIT 许可证](LICENSE) 授权。

### 作者

**@mairinkdev** - [GitHub](https://github.com/mairinkdev)

⭐ 喜欢这个项目吗？[在 GitHub 上加星！](https://github.com/mairinkdev/SecGlassJS)

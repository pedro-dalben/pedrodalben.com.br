import { Controller } from "@hotwired/stimulus";
import "easymde/dist/easymde.min.css";

export default class extends Controller {
  static targets = ["textarea"];
  static values = { uploadUrl: String };

  connect() {
    console.log("MarkdownEditor: Controller conectado");
    console.log("MarkdownEditor: element:", this.element);
    console.log("MarkdownEditor: textareaTarget:", this.textareaTarget);
    console.log("MarkdownEditor: uploadUrlValue:", this.uploadUrlValue);
    
    if (!this.hasTextareaTarget) {
      console.error("MarkdownEditor: textarea target não encontrado");
      console.error("MarkdownEditor: Element HTML:", this.element.innerHTML);
      return;
    }
    
    if (!this.textareaTarget) {
      console.error("MarkdownEditor: textareaTarget é null ou undefined");
      return;
    }
    
    console.log("MarkdownEditor: Iniciando conexão...");
    console.log("MarkdownEditor: textarea element:", this.textareaTarget);
    
    setTimeout(() => {
      this.loadEasyMDE();
    }, 100);
  }
  
  async loadEasyMDE() {
    try {
      // Converte HTML para sintaxe especial ANTES de inicializar o EasyMDE
      if (this.textareaTarget) {
        const originalContent = this.textareaTarget.value;
        if (originalContent && originalContent.trim() !== '') {
          let converted = originalContent.replace(/<span\s+style=["']color:\s*([^"']+)["'][^>]*>(.*?)<\/span>/gis, (match, color, text) => {
            return `[color:${color.trim()}]${text}[/color]`;
          });
          
          converted = converted.replace(/<span\s+style=["']background-color:\s*([^"']+)["'][^>]*>(.*?)<\/span>/gis, (match, color, text) => {
            return `[bg:${color.trim()}]${text}[/bg]`;
          });
          
          if (converted !== originalContent) {
            this.textareaTarget.value = converted;
          }
        }
      }
      
      let EasyMDE;
      
      // Tentar importar do caminho padrão
      try {
        const module = await import("easymde");
        EasyMDE = module.default || module;
        console.log("MarkdownEditor: EasyMDE importado de 'easymde'");
      } catch (e1) {
        // Tentar importar do caminho src
        try {
          const module = await import("easymde/src/js/easymde");
          EasyMDE = module.default || module;
          console.log("MarkdownEditor: EasyMDE importado de 'easymde/src/js/easymde'");
        } catch (e2) {
          console.error("MarkdownEditor: Erro ao importar EasyMDE", e1, e2);
          return;
        }
      }
      
      if (!EasyMDE) {
        console.error("MarkdownEditor: EasyMDE não está disponível");
        return;
      }
      
      console.log("MarkdownEditor: EasyMDE carregado", typeof EasyMDE);
      
      this.editor = new EasyMDE({
      element: this.textareaTarget,
      forceSync: true,
      spellChecker: false,
      autosave: {
        enabled: true,
        uniqueId: `post-${this.textareaTarget.id}`,
        delay: 1000,
      },
      placeholder: "Comece a escrever seu post em Markdown...",
      status: ["lines", "words", "cursor"],
      toolbar: [
        "bold",
        "italic",
        "strikethrough",
        "|",
        "heading-1",
        "heading-2",
        "heading-3",
        "heading-4",
        "heading-5",
        "heading-6",
        "|",
        "code",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "table",
        "horizontal-rule",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
        "|",
        "guide",
        "|",
        "undo",
        "redo"
      ],
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true
      },
      previewClass: ["prose", "prose-invert", "max-w-none", "dark:prose-invert"],
      uploadImage: true,
      imageUploadEndpoint: this.uploadUrlValue || "/admin/images",
      imageCSRFToken: document.querySelector('meta[name="csrf-token"]')?.content,
      imageCSRFName: "authenticity_token",
      imageTexts: {
        sbInit: "Arraste uma imagem aqui ou clique para selecionar",
        sbOnDragEnter: "Solte a imagem aqui",
        sbOnDrop: "Enviando imagem...",
        sbProgress: "Enviando...",
        sbOnUploaded: "Imagem enviada com sucesso!"
      },
      imageAccept: "image/*",
      imageMaxSize: 5 * 1024 * 1024,
      imageUploadFunction: (file, onSuccess, onError) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        
        fetch(this.uploadUrlValue || "/admin/images", {
          method: "POST",
          headers: {
            "X-CSRF-Token": csrfToken
          },
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success === 1) {
            onSuccess(data.file.url);
          } else {
            onError(data.message || "Erro ao enviar imagem");
          }
        })
        .catch(error => {
          onError(error.message || "Erro ao enviar imagem");
        });
      },
      showIcons: ["code", "table"],
      insertTexts: {
        horizontalRule: ["", "\n\n-----\n\n"],
        image: ["![](http://", ")"],
        link: ["[", "](http://)"],
        table: ["", "\n\n| Coluna 1 | Coluna 2 | Coluna 3 |\n| -------- | -------- | -------- |\n| Texto    | Texto    | Texto    |\n\n"]
      }
      });
      
      this.editor.codemirror.setOption("lineWrapping", true);
      
      this.addColorButtons();
      
      // Aguarda um pouco para garantir que o conteúdo foi carregado
      setTimeout(() => {
        // Converter HTML para sintaxe de cor ao carregar (primeiro converte o textarea, depois o editor)
        this.convertHtmlToColorSyntax();
        
        // Re-converte após o EasyMDE carregar o conteúdo
        setTimeout(() => {
          this.convertHtmlToColorSyntax();
          // Configurar overlay mode para esconder sintaxe de cor e mostrar visualmente
          this.setupColorSyntaxHighlighting();
        }, 100);
        
        // Converter sintaxe de cor para HTML antes de salvar
        this.setupColorSyntaxConversion();
      }, 300);
      
      console.log("MarkdownEditor: Editor inicializado com sucesso");
    } catch (error) {
      console.error("MarkdownEditor: Erro ao inicializar editor", error);
    }
  }
  
  addColorButtons() {
    if (!this.editor) return;
    
    const toolbarElement = this.element.querySelector('.editor-toolbar');
    if (!toolbarElement) {
      setTimeout(() => this.addColorButtons(), 100);
      return;
    }
    
    const textColorButton = this.createColorButton("Cor do Texto", "text", [
      { name: "Vermelho", value: "#ef4444" },
      { name: "Verde", value: "#22c55e" },
      { name: "Azul", value: "#3b82f6" },
      { name: "Amarelo", value: "#eab308" },
      { name: "Roxo", value: "#a855f7" },
      { name: "Rosa", value: "#ec4899" },
      { name: "Laranja", value: "#f97316" },
      { name: "Ciano", value: "#06b6d4" },
      { name: "Branco", value: "#ffffff" },
      { name: "Cinza", value: "#9ca3af" }
    ]);
    
    const bgColorButton = this.createColorButton("Cor de Fundo", "bg", [
      { name: "Vermelho", value: "#ef4444" },
      { name: "Verde", value: "#22c55e" },
      { name: "Azul", value: "#3b82f6" },
      { name: "Amarelo", value: "#eab308" },
      { name: "Roxo", value: "#a855f7" },
      { name: "Rosa", value: "#ec4899" },
      { name: "Laranja", value: "#f97316" },
      { name: "Ciano", value: "#06b6d4" },
      { name: "Preto", value: "#000000" },
      { name: "Cinza", value: "#6b7280" }
    ]);
    
    const separator = document.createElement("span");
    separator.className = "separator";
    
    const headingButtons = toolbarElement.querySelectorAll('button[title*="Heading"]');
    if (headingButtons.length > 0) {
      const lastHeadingButton = headingButtons[headingButtons.length - 1];
      lastHeadingButton.after(separator);
      separator.after(textColorButton);
      textColorButton.after(bgColorButton);
    } else {
      const separators = toolbarElement.querySelectorAll('.separator');
      if (separators.length > 1) {
        separators[1].after(textColorButton);
        textColorButton.after(bgColorButton);
      } else {
        toolbarElement.appendChild(textColorButton);
        toolbarElement.appendChild(bgColorButton);
      }
    }
  }

  disconnect() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }
  }

  createColorButton(title, type, colors) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "editor-toolbar-button";
    button.setAttribute("title", title);
    button.innerHTML = type === "text" 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16M6 16l6-12 6 12M8 12h8"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';
    
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Mantém o foco no editor para preservar a seleção
      if (this.editor && this.editor.codemirror) {
        this.editor.codemirror.focus();
      }
      // Aguarda um momento para garantir que a seleção foi preservada
      setTimeout(() => {
        this.showColorPicker(type, colors);
      }, 10);
    });
    
    return button;
  }

  showColorPicker(type, colors) {
    const editor = this.editor.codemirror;
    
    // Salva a seleção ANTES de qualquer coisa - tanto o texto quanto as posições
    const selections = editor.listSelections();
    const selectedText = editor.getSelection();
    
    // Salva as posições da seleção para usar depois
    let savedSelection = null;
    if (selections.length > 0 && selectedText) {
      const selection = selections[0];
      const anchor = { line: selection.anchor.line, ch: selection.anchor.ch };
      const head = { line: selection.head.line, ch: selection.head.ch };
      
      // Determina início e fim
      let startPos, endPos;
      if (anchor.line < head.line || (anchor.line === head.line && anchor.ch <= head.ch)) {
        startPos = anchor;
        endPos = head;
      } else {
        startPos = head;
        endPos = anchor;
      }
      
      savedSelection = {
        text: selectedText,
        start: startPos,
        end: endPos
      };
    }
    
    const existingPicker = document.querySelector('.color-picker');
    if (existingPicker) {
      document.body.removeChild(existingPicker);
    }

    const isDark = document.documentElement.classList.contains('dark') || 
                   document.documentElement.classList.contains('theme-bg');

    const picker = document.createElement("div");
    picker.className = "color-picker";
    picker.style.cssText = `
      position: fixed;
      background: ${isDark ? 'rgb(31 41 55)' : 'white'};
      border: 1px solid ${isDark ? 'rgb(55 65 81)' : '#ccc'};
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 10000;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      min-width: 200px;
    `;

    const title = document.createElement("div");
    title.textContent = type === "text" ? "Cor do Texto" : "Cor de Fundo";
    title.style.cssText = `grid-column: 1 / -1; font-weight: bold; margin-bottom: 8px; color: ${isDark ? 'rgb(243 244 246)' : '#1f2937'};`;
    picker.appendChild(title);

    colors.forEach(color => {
      const colorBtn = document.createElement("button");
      colorBtn.type = "button";
      colorBtn.style.cssText = `
        width: 32px;
        height: 32px;
        border: 2px solid #ddd;
        border-radius: 4px;
        background: ${color.value};
        cursor: pointer;
        transition: transform 0.2s;
      `;
      colorBtn.title = color.name;
      colorBtn.addEventListener("mouseenter", () => {
        colorBtn.style.transform = "scale(1.1)";
        colorBtn.style.borderColor = "#333";
      });
      colorBtn.addEventListener("mouseleave", () => {
        colorBtn.style.transform = "scale(1)";
        colorBtn.style.borderColor = "#ddd";
      });
      colorBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyColorWithSelection(savedSelection, color.value, type);
        if (document.body.contains(picker)) {
          document.body.removeChild(picker);
        }
      });
      picker.appendChild(colorBtn);
    });

    const customColorBtn = document.createElement("button");
    customColorBtn.type = "button";
    customColorBtn.textContent = "Personalizado";
    customColorBtn.style.cssText = `
      grid-column: 1 / -1;
      padding: 8px;
      margin-top: 8px;
      border: 1px solid ${isDark ? 'rgb(75 85 99)' : '#ddd'};
      border-radius: 4px;
      background: ${isDark ? 'rgb(55 65 81)' : '#f9fafb'};
      color: ${isDark ? 'rgb(243 244 246)' : '#333'};
      cursor: pointer;
    `;
    customColorBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "color";
      input.value = "#000000";
      input.addEventListener("change", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.applyColorWithSelection(savedSelection, e.target.value, type);
        if (document.body.contains(picker)) {
          document.body.removeChild(picker);
        }
      });
      input.click();
    });
    picker.appendChild(customColorBtn);

    const toolbarElement = this.element.querySelector('.editor-toolbar');
    if (toolbarElement) {
      const toolbarButtons = toolbarElement.querySelectorAll('button');
      const lastButton = toolbarButtons[toolbarButtons.length - 1];
      const rect = lastButton ? lastButton.getBoundingClientRect() : toolbarElement.getBoundingClientRect();
      
      picker.style.top = `${rect.bottom + window.scrollY + 5}px`;
      picker.style.left = `${rect.left + window.scrollX}px`;
    } else {
      // Fallback: posicionar no centro da tela
      picker.style.top = `${window.innerHeight / 2}px`;
      picker.style.left = `${window.innerWidth / 2}px`;
      picker.style.transform = 'translate(-50%, -50%)';
    }

    document.body.appendChild(picker);
    
    if (!selectedText) {
      const info = document.createElement("div");
      info.textContent = "Selecione o texto primeiro";
      info.style.cssText = `grid-column: 1 / -1; padding: 8px; text-align: center; color: ${isDark ? 'rgb(243 244 246)' : '#374151'}; font-size: 0.875rem;`;
      picker.insertBefore(info, picker.firstChild.nextSibling);
    }

    const closePicker = (e) => {
      if (!picker.contains(e.target)) {
        if (document.body.contains(picker)) {
          document.body.removeChild(picker);
        }
        document.removeEventListener("click", closePicker);
      }
    };
    setTimeout(() => document.addEventListener("click", closePicker), 100);
    
    // Previne que o clique no picker faça o editor perder a seleção
    picker.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });
  }
  
  applyColorWithSelection(savedSelection, color, type) {
    const editor = this.editor.codemirror;
    
    if (savedSelection && savedSelection.text) {
      // Restaura a seleção usando as posições salvas
      editor.setSelection(savedSelection.start, savedSelection.end);
      
      // Agora aplica a cor usando a seleção restaurada
      const openTag = type === "text" ? `[color:${color}]` : `[bg:${color}]`;
      const closeTag = type === "text" ? `[/color]` : `[/bg]`;
      const coloredText = `${openTag}${savedSelection.text}${closeTag}`;
      
      // Substitui a seleção
      editor.replaceSelection(coloredText);
      
      // Mantém a seleção apenas no texto interno (sem as tags)
      const newStartPos = {
        line: savedSelection.start.line,
        ch: savedSelection.start.ch + openTag.length
      };
      const newEndPos = {
        line: savedSelection.end.line,
        ch: savedSelection.end.ch + openTag.length
      };
      
      // Restaura a seleção apenas no texto interno
      editor.setSelection(newStartPos, newEndPos);
      
      // Aplica o highlight
      editor.focus();
      
      // Previne que o EasyMDE converta para HTML temporariamente
      if (this.textareaTarget) {
        const currentValue = editor.getValue();
        this.textareaTarget.value = currentValue;
      }
      
      // Aplica o highlight depois de garantir que o conteúdo está correto
      setTimeout(() => this.highlightColorSyntax(), 10);
    } else {
      // Se não havia seleção, usa o método normal
      this.applyColor(null, color, type);
    }
  }

  applyColor(text, color, type) {
    const editor = this.editor.codemirror;
    const selections = editor.listSelections();
    
    if (selections.length === 0) return;
    
    const selection = selections[0];
    const selected = editor.getSelection();
    
    // Salva a posição do cursor/seleção antes de substituir
    const anchor = { line: selection.anchor.line, ch: selection.anchor.ch };
    const head = { line: selection.head.line, ch: selection.head.ch };
    
    // Determina qual é o início e fim da seleção (anchor pode estar depois de head)
    // Compara manualmente: linha primeiro, depois coluna
    let startPos, endPos;
    if (anchor.line < head.line || (anchor.line === head.line && anchor.ch <= head.ch)) {
      startPos = anchor;
      endPos = head;
    } else {
      startPos = head;
      endPos = anchor;
    }
    
    if (!selected || selected.trim() === "") {
      // Se não há texto selecionado, insere texto com cor
      const coloredText = type === "text" 
        ? `[color:${color}]texto[/color]` 
        : `[bg:${color}]texto[/bg]`;
      
      editor.replaceSelection(coloredText);
      
      // Seleciona apenas o texto interno "texto" para edição
      const cursor = editor.getCursor();
      const openTag = type === "text" ? `[color:${color}]` : `[bg:${color}]`;
      const closeTag = type === "text" ? `[/color]` : `[/bg]`;
      const from = { line: cursor.line, ch: cursor.ch - closeTag.length - 5 }; // 5 = "texto".length
      const to = { line: cursor.line, ch: cursor.ch - closeTag.length };
      editor.setSelection(from, to);
    } else {
      // Se há texto selecionado, envolve com sintaxe de cor
      const openTag = type === "text" ? `[color:${color}]` : `[bg:${color}]`;
      const closeTag = type === "text" ? `[/color]` : `[/bg]`;
      const coloredText = `${openTag}${selected}${closeTag}`;
      
      // Substitui a seleção
      editor.replaceSelection(coloredText);
      
      // Mantém a seleção apenas no texto interno (sem as tags)
      const newStartPos = {
        line: startPos.line,
        ch: startPos.ch + openTag.length
      };
      const newEndPos = {
        line: endPos.line,
        ch: endPos.ch + openTag.length
      };
      
      // Restaura a seleção apenas no texto interno
      editor.setSelection(newStartPos, newEndPos);
    }
    
    // Aplica o highlight imediatamente sem delay
    editor.focus();
    
    // Previne que o EasyMDE converta para HTML temporariamente
    if (this.textareaTarget) {
      const currentValue = editor.getValue();
      this.textareaTarget.value = currentValue;
    }
    
    // Aplica o highlight depois de garantir que o conteúdo está correto
    setTimeout(() => this.highlightColorSyntax(), 10);
  }
  
  convertHtmlToColorSyntax() {
    if (!this.editor || !this.editor.codemirror) return;
    
    const content = this.editor.codemirror.getValue();
    if (!content || content.trim() === '') return;
    
    // Converte <span style="color: #ef4444">texto</span> para [color:#ef4444]texto[/color]
    // Suporta variações: style="color: ..." ou style='color: ...' e com espaços extras
    let converted = content.replace(/<span\s+style=["']color:\s*([^"']+)["'][^>]*>(.*?)<\/span>/gis, (match, color, text) => {
      return `[color:${color.trim()}]${text}[/color]`;
    });
    
    // Converte <span style="background-color: #ef4444">texto</span> para [bg:#ef4444]texto[/bg]
    converted = converted.replace(/<span\s+style=["']background-color:\s*([^"']+)["'][^>]*>(.*?)<\/span>/gis, (match, color, text) => {
      return `[bg:${color.trim()}]${text}[/bg]`;
    });
    
    if (converted !== content) {
      this.editor.codemirror.setValue(converted);
      // Atualiza o textarea sincronizado
      if (this.textareaTarget) {
        this.textareaTarget.value = converted;
      }
      // Reaplica o highlight após a conversão
      setTimeout(() => this.highlightColorSyntax(), 50);
    }
  }
  
  setupColorSyntaxHighlighting() {
    const editor = this.editor.codemirror;
    
    // Define overlay mode para substituir sintaxe visualmente
    this.setupColorOverlayMode(editor);
    
    // Marca o texto para aplicar cor quando o conteúdo muda
    let highlightTimeout;
    editor.on('change', () => {
      // Debounce para evitar muitas atualizações
      clearTimeout(highlightTimeout);
      highlightTimeout = setTimeout(() => {
        this.highlightColorSyntax();
        // Garante que o textarea sempre tenha a sintaxe especial, não HTML
        if (this.textareaTarget && this.editor) {
          const editorValue = this.editor.codemirror.getValue();
          // Converte qualquer HTML que apareça de volta para sintaxe especial
          let converted = editorValue.replace(/<span\s+style=["']color:\s*([^"']+)["'][^>]*>(.*?)<\/span>/gis, (match, color, text) => {
            return `[color:${color.trim()}]${text}[/color]`;
          });
          converted = converted.replace(/<span\s+style=["']background-color:\s*([^"']+)["'][^>]*>(.*?)<\/span>/gis, (match, color, text) => {
            return `[bg:${color.trim()}]${text}[/bg]`;
          });
          if (converted !== editorValue) {
            this.editor.codemirror.setValue(converted);
          }
          this.textareaTarget.value = converted;
        }
      }, 50);
    });
    
    // Inicializa o highlight
    setTimeout(() => this.highlightColorSyntax(), 100);
  }
  
  setupColorOverlayMode(editor) {
    const colorOverlay = {
      token: (stream) => {
        // Procura por [color:...] ou [bg:...]
        if (stream.match(/\[color:[^\]]+\]/, false)) {
          // Captura a sintaxe completa [color:...]texto[/color]
          const match = stream.match(/\[color:([^\]]+)\](.*?)\[\/color\]/);
          if (match) {
            return "color-syntax-hidden";
          }
        }
        if (stream.match(/\[bg:[^\]]+\]/, false)) {
          const match = stream.match(/\[bg:([^\]]+)\](.*?)\[\/bg\]/);
          if (match) {
            return "color-syntax-hidden";
          }
        }
        stream.next();
        return null;
      }
    };
    
    editor.setOption("mode", {
      name: "markdown",
      overlay: colorOverlay
    });
  }
  
  highlightColorSyntax() {
    const editor = this.editor.codemirror;
    const content = editor.getValue();
    
    if (this.colorMarkers) {
      this.colorMarkers.forEach(marker => marker.clear());
      this.colorMarkers = [];
    } else {
      this.colorMarkers = [];
    }
    
    const indexToPos = (index) => {
      const lines = content.substring(0, index).split('\n');
      return {
        line: lines.length - 1,
        ch: lines[lines.length - 1].length
      };
    };
    
    const colorRegex = /\[color:([^\]]+)\](.*?)\[\/color\]/g;
    const bgRegex = /\[bg:([^\]]+)\](.*?)\[\/bg\]/g;
    
    let match;
    while ((match = colorRegex.exec(content)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const color = match[1];
      const textStart = start + match[0].indexOf(']') + 1;
      const textEnd = textStart + match[2].length;
      
      const startPos = indexToPos(start);
      const endPos = indexToPos(end);
      const textStartPos = indexToPos(textStart);
      const textEndPos = indexToPos(textEnd);
      
      const textMarker = editor.markText(textStartPos, textEndPos, {
        className: "color-syntax-text",
        css: `color: ${color}; font-weight: 500;`
      });
      
      const syntaxStartMarker = editor.markText(startPos, textStartPos, {
        className: "color-syntax-hidden",
        readOnly: false,
        clearOnEnter: false
      });
      
      const syntaxEndMarker = editor.markText(textEndPos, endPos, {
        className: "color-syntax-hidden",
        readOnly: false,
        clearOnEnter: false
      });
      
      this.colorMarkers.push(textMarker, syntaxStartMarker, syntaxEndMarker);
    }
    
    while ((match = bgRegex.exec(content)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const color = match[1];
      const textStart = start + match[0].indexOf(']') + 1;
      const textEnd = textStart + match[2].length;
      
      const startPos = indexToPos(start);
      const endPos = indexToPos(end);
      const textStartPos = indexToPos(textStart);
      const textEndPos = indexToPos(textEnd);
      
      const textMarker = editor.markText(textStartPos, textEndPos, {
        className: "color-syntax-bg",
        css: `background-color: ${color}; padding: 2px 4px; border-radius: 3px;`
      });
      
      const syntaxStartMarker = editor.markText(startPos, textStartPos, {
        className: "color-syntax-hidden",
        readOnly: false,
        clearOnEnter: false
      });
      
      const syntaxEndMarker = editor.markText(textEndPos, endPos, {
        className: "color-syntax-hidden",
        readOnly: false,
        clearOnEnter: false
      });
      
      this.colorMarkers.push(textMarker, syntaxStartMarker, syntaxEndMarker);
    }
  }
  
  setupColorSyntaxConversion() {
    // Converte sintaxe de cor para HTML antes do form submit
    const form = this.element.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        this.convertColorSyntaxToHtml();
      });
    }
    
    // Também converte quando o EasyMDE sincroniza
    if (this.editor && this.editor.codemirror) {
      this.editor.codemirror.on('blur', () => {
        this.convertColorSyntaxToHtml();
      });
    }
  }
  
  convertColorSyntaxToHtml() {
    const content = this.editor.codemirror.getValue();
    
    // Converte [color:#ef4444]texto[/color] para <span style="color: #ef4444">texto</span>
    let converted = content.replace(/\[color:([^\]]+)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>');
    
    // Converte [bg:#ef4444]texto[/bg] para <span style="background-color: #ef4444">texto</span>
    converted = converted.replace(/\[bg:([^\]]+)\](.*?)\[\/bg\]/g, '<span style="background-color: $1">$2</span>');
    
    if (converted !== content) {
      this.editor.codemirror.setValue(converted);
      // Atualiza o textarea sincronizado
      this.textareaTarget.value = converted;
    }
  }
}


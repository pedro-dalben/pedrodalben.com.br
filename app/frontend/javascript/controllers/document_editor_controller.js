import { Controller } from "@hotwired/stimulus"
import Quill from "quill"
import MarkdownIt from "markdown-it"
import DOMPurify from "dompurify"
import TurndownService from "turndown"

export default class extends Controller {
  static targets = ["editor", "content", "toc", "preview"]
  static values = {
    content: String
  }

  connect() {
    this.initializeMarkdown()
    this.initializeQuill()
    this.setupSlashCommands()
    this.updateContent()
    this.updatePreview()
    this.updateTOC()
  }

  initializeQuill() {
    const options = {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          ['link', 'image'],
          ['clean']
        ]
      },
      placeholder: 'Start typing your document here...'
    }

    this.quill = new Quill(this.editorTarget, options)
    
    if (this.contentValue) {
      const html = this.md.render(this.contentValue)
      this.quill.root.innerHTML = html
      this.updateContent()
    }

    this.quill.on('text-change', () => {
      this.updateContent()
      this.updatePreview()
      this.updateTOC()
    })
  }

  initializeMarkdown() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })

    this.turndownService = new TurndownService({
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      headingStyle: 'atx'
    })
  }

  setupSlashCommands() {
    this.quill.on('text-change', (delta, oldDelta, source) => {
      if (source !== 'user') return
      this.maybeShowSlashMenu()
    })

    this.quill.root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.hideSlashMenu()
      }
    })
  }

  maybeShowSlashMenu() {
    const range = this.quill.getSelection()
    if (!range) return

    const text = this.quill.getText(0, range.index)
    const lineStart = text.lastIndexOf('\n') + 1
    const currentLine = text.substring(lineStart, range.index)

    if (currentLine === '/') {
      this.showSlashMenu(range)
    } else {
      this.hideSlashMenu()
    }
  }

  showSlashMenu(range) {
    const commands = this.slashCommands()

    if (this.menuElement) {
      this.menuElement.remove()
    }

    const menuHtml = commands.map((cmd, index) =>
      `<button type="button" class="slash-command-item" data-index="${index}">${cmd.text}</button>`
    ).join('')

    const menu = document.createElement('div')
    menu.className = 'slash-command-menu'
    menu.innerHTML = menuHtml

    const rect = this.quill.getBounds(range.index)
    const editorRect = this.editorTarget.getBoundingClientRect()
    menu.style.left = `${editorRect.left + rect.left}px`
    menu.style.top = `${editorRect.top + rect.bottom + window.scrollY + 6}px`

    document.body.appendChild(menu)
    this.menuElement = menu

    menu.addEventListener('click', (event) => {
      const item = event.target.closest('.slash-command-item')
      if (!item) return

      const index = parseInt(item.dataset.index, 10)
      const command = commands[index]
      this.executeCommand(range, command)
      this.hideSlashMenu()
    })

    document.addEventListener('click', this.handleOutsideClick)
  }

  hideSlashMenu() {
    if (this.menuElement) {
      this.menuElement.remove()
      this.menuElement = null
      document.removeEventListener('click', this.handleOutsideClick)
    }
  }

  handleOutsideClick = (event) => {
    if (this.menuElement && !this.menuElement.contains(event.target)) {
      this.hideSlashMenu()
    }
  }

  slashCommands() {
    return [
      { text: '/h1 Heading 1', type: 'format', format: 'header', value: 1 },
      { text: '/h2 Heading 2', type: 'format', format: 'header', value: 2 },
      { text: '/h3 Heading 3', type: 'format', format: 'header', value: 3 },
      { text: '/table Table', type: 'insert', value: this.generateTableMarkdown() },
      { text: '/code Code Block', type: 'format', format: 'code-block', value: true },
      { text: '/quote Quote', type: 'format', format: 'blockquote', value: true },
      { text: '/toc Table of Contents', type: 'insert', value: '[TOC]' },
      { text: '/image Image', type: 'insert', value: '![alt text](url)' },
      { text: '/callout Callout', type: 'insert', value: this.generateCalloutMarkdown() }
    ]
  }

  executeCommand(range, command) {
    this.quill.deleteText(range.index - 1, 1)

    if (command.type === 'format') {
      this.quill.formatLine(range.index - 1, 1, command.format, command.value)
      this.quill.setSelection(range.index)
      return
    }

    this.quill.insertText(range.index - 1, command.value)
    this.quill.setSelection(range.index - 1 + command.value.length)
  }

  generateTableMarkdown() {
    return '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n'
  }

  generateCalloutMarkdown() {
    return '\n> **Note:** This is a callout block for important information.\n'
  }

  updateContent() {
    if (!this.hasContentTarget) return

    const markdown = this.toMarkdown()
    this.contentTarget.value = markdown
  }

  updatePreview() {
    if (!this.hasPreviewTarget) return

    const html = this.quill.root.innerHTML
    const cleanHtml = DOMPurify.sanitize(html)
    this.previewTarget.innerHTML = cleanHtml
  }

  updateTOC() {
    if (!this.hasTocTarget) return
    
    const markdown = this.hasContentTarget ? this.contentTarget.value : this.toMarkdown()
    const toc = this.generateTOC(markdown)
    this.tocTarget.innerHTML = toc
  }

  generateTOC(markdown) {
    const lines = markdown.split('\n')
    const items = []

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.*)$/)
      if (!match) return

      const level = match[1].length
      const text = match[2].trim()
      const anchor = this.generateAnchor(text, index)
      items.push({ level, text, anchor })
    })

    if (items.length === 0) return '<p>No table of contents available</p>'

    let toc = '<ul class="table-of-contents">'
    items.forEach((item) => {
      const indent = `margin-left: ${(item.level - 1) * 20}px;`
      toc += `<li style="${indent}"><a href="#${item.anchor}">${item.text}</a></li>`
    })
    toc += '</ul>'
    return toc
  }

  generateAnchor(text, index) {
    const anchor = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return anchor.length > 0 ? anchor : `heading-${index}`
  }

  toMarkdown() {
    const html = this.quill.root.innerHTML
    return this.turndownService.turndown(html)
  }

  insertMarkdown(markdown) {
    const range = this.quill.getSelection()
    if (range) {
      this.quill.insertText(range.index, markdown)
      this.quill.setSelection(range.index + markdown.length)
    }
  }

  disconnect() {
    if (this.quill) {
      this.quill.off('text-change')
    }
    this.hideSlashMenu()
  }
}

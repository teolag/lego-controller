export class HtmlWrapper {
  protected rootElement: HTMLDivElement

  constructor() {
    this.rootElement = document.createElement('div')
  }

  public appendTo(parentElement: HTMLElement) {
    parentElement.appendChild(this.rootElement)
  }

  public remove() {
    this.rootElement.parentElement.removeChild(this.rootElement)
  }
}
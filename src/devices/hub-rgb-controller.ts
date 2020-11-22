import { HubRGB, HubRGBColor } from "lego-connect-browser";

export class HubRGBController {
  private colors = [HubRGBColor.BLUE, HubRGBColor.YELLOW, HubRGBColor.RED]
  private rootElem: HTMLDivElement

  constructor(device: HubRGB) {
    this.rootElem = document.createElement('div')

    this.colors.forEach(color => {
      const button = document.createElement('button')
      button.innerText = HubRGBColor[color]
      button.addEventListener('click', () => {
        device.setColor(color)
      })
      this.rootElem.appendChild(button)
    })
  }

  public appendTo(parentElem: HTMLElement) {
    parentElem.appendChild(this.rootElem)
  }

}
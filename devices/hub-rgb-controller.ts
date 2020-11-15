import { HubRGB, HubRGBColor } from "lego-connect-browser";

export class HubRGBController {
  private colors = [HubRGBColor.BLUE, HubRGBColor.YELLOW, HubRGBColor.RED]

  constructor(htmlRoot: HTMLDivElement, device: HubRGB) {
    this.colors.forEach(color => {
      const button = document.createElement('button')
      button.innerText = HubRGBColor[color]
      button.addEventListener('click', () => {
        device.setColor(color)
      })
      htmlRoot.appendChild(button)
    })

  }

}
import { HubRGB, HubRGBColor } from "lego-connect-browser";
import { HtmlWrapper } from "../html-wrapper";

export class HubRGBController extends HtmlWrapper {
  private colors = [HubRGBColor.BLUE, HubRGBColor.YELLOW, HubRGBColor.RED]

  constructor(device: HubRGB) {
    super()

    this.colors.forEach(color => {
      const button = document.createElement('button')
      button.innerText = HubRGBColor[color]
      button.addEventListener('click', () => {
        device.setColor(color)
      })
      this.rootElement.appendChild(button)
    })
  }
}
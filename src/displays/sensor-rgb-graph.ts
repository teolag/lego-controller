import { DistanceColorSensor } from "lego-connect-browser"
import { HtmlWrapper } from "../html-wrapper"
import { IRGB } from "../typings/IRGB"

export class SensorRGBGraph extends HtmlWrapper {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private history: IRGB[] = new Array(100).fill({r: 0, g: 0, b: 0})
  private channels = [
    {prop: 'r', color: 'red'},
    {prop: 'g', color: 'green'},
    {prop: 'b', color: 'blue'},
  ]
  

  constructor(sensor: DistanceColorSensor) {
    super()
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    sensor.on('change', this.onColorChange.bind(this))

    this.rootElement.appendChild(this.canvas)
  }

  private onColorChange(data) {
    const lighten = 1.3
    this.history = [...this.history.slice(1, 100), {r:data.r*1.4*lighten, g:data.g*1.45*lighten, b:data.b*lighten}]
    this.redrawGraph()
  }

  private redrawGraph() {
    const ctx = this.ctx
    const canvas = this.canvas

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.channels.forEach(channel => {
      ctx.beginPath()
      ctx.strokeStyle = channel.color
      const y = canvas.height-30 - (this.history[0][channel.prop]/255 * (canvas.height-30))
      ctx.moveTo(0, y)
      this.history.forEach((color, i) => {
        const x = i/this.history.length * canvas.width
        const y = canvas.height-30 - (color[channel.prop]/255 * (canvas.height-30))
        ctx.lineTo(x, y)
      })
      ctx.stroke()
    })
    this.history.forEach((color, i) => {
      const x = (i/this.history.length) * canvas.width
      const y = canvas.height-25
      ctx.beginPath()
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
      ctx.rect(x, y, 30, 25)
      ctx.fill()
    })
  }

}

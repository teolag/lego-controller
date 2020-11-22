import { DistanceColorModes, DistanceColorSensor } from "lego-connect-browser"

interface IRGB {
  r: number
  g: number
  b: number
}

export class SensorRGBGraph {
  private rootElem: HTMLDivElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private sensor: DistanceColorSensor
  private history: IRGB[] = new Array(100).fill({r: 0, g: 0, b: 0})
  private channels = [
    {prop: 'r', color: 'red'},
    {prop: 'g', color: 'green'},
    {prop: 'b', color: 'blue'},
  ]
  

  constructor(sensor: DistanceColorSensor) {
    this.rootElem = document.createElement('div')
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.sensor = sensor
    this.sensor.on('change', this.onColorChange.bind(this))
    this.sensor.subscribe(DistanceColorModes.RGB, 5)

    this.rootElem.appendChild(this.canvas)
  }

  private onColorChange(data) {
    this.history = [...this.history.slice(1, 100), {r:data.r, g:data.g, b:data.b}]
    this.redrawGraph()
  }

  public appendTo(parentElement: HTMLElement) {
    parentElement.appendChild(this.rootElem)
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

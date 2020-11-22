import { DistanceColorModes, DistanceColorSensor } from "lego-connect-browser"
import {rgbToHsl} from '../utils'

interface IHSL {
  h: number
  s: number
  l: number
}

export class SensorHSLGraph {
  private rootElem: HTMLDivElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private sensor: DistanceColorSensor
  private history: IHSL[] = new Array(100).fill({h: 0, s: 0, l: 0})
  private channels = [
    {prop: 'h', max: 1, color: '#444'},
    {prop: 's', max: 1, color: '#444'},
    {prop: 'l', max: 1, color: '#444'},
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
    const hsl = rgbToHsl(data.r, data.g, data.b)
    this.history = [...this.history.slice(1, 100), {h: hsl.h, s: hsl.s, l: hsl.l}]
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
      const y = canvas.height-30 - (this.history[0][channel.prop]/channel.max * (canvas.height-30))
      ctx.moveTo(0, y)
      this.history.forEach((color, i) => {
        const x = i/this.history.length * canvas.width
        const y = canvas.height-30 - (color[channel.prop]/channel.max * (canvas.height-30))
        ctx.lineTo(x, y)
      })
      ctx.stroke()
    })
    this.history.forEach((color, i) => {
      const x = (i/this.history.length) * canvas.width
      const y = canvas.height-25
      ctx.beginPath()
      ctx.fillStyle = `hsl(${color.h*360}, ${color.s*100}%, 70%)`
      ctx.rect(x, y, 30, 25)
      ctx.fill()
    })
  }

}

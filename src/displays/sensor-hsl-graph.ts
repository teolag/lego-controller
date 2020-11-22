import { DistanceColorSensor } from "lego-connect-browser"
import { HtmlWrapper } from "../html-wrapper"
import {rgbToHsl} from '../utils'
import {IHSL} from '../typings/IHSL'


export class SensorHSLGraph extends HtmlWrapper {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private history: IHSL[] = new Array(100).fill({h: 0, s: 0, l: 0})
  private channels = [
    {prop: 'h', max: 1, color: '#00a'},
    {prop: 's', max: 1, color: '#444'},
    {prop: 'l', max: 1, color: '#999'},
  ]
  

  constructor(sensor: DistanceColorSensor) {
    super()
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    sensor.on('change', this.onColorChange.bind(this))
    this.rootElement.appendChild(this.canvas)
  }

  private onColorChange(data) {
    const hsl = rgbToHsl(data.r, data.g, data.b)
    this.history = [...this.history.slice(1, 100), {h: hsl.h, s: hsl.s, l: hsl.l}]
    this.redrawGraph()
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

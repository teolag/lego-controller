import { DistanceColorSensor } from "lego-connect-browser"
import { HtmlWrapper } from "../html-wrapper"
import {IRGB} from '../typings/IRGB'

export class SensorRecorder extends HtmlWrapper {
  private recordButton: HTMLButtonElement
  private sensor: DistanceColorSensor
  private isRecording: boolean
  private recording: IRGB[] = []
  private downloadLink: HTMLAnchorElement

  constructor(sensor: DistanceColorSensor) {
    super()
    
    this.recordButton = document.createElement('button') as HTMLButtonElement
    this.recordButton.textContent = "Record"
    this.recordButton.addEventListener('click', this.toggleRecording.bind(this))
    
    this.sensor = sensor
    this.sensor.on('change', this.onColorChange.bind(this))
    
    this.rootElement.appendChild(this.recordButton)
  }

  private onColorChange(data) {
    if(!this.isRecording) return
    this.recording.push({r:data.r, g:data.g, b:data.b})
  }

  private toggleRecording() {
    if(this.isRecording) {
      this.isRecording = false
      this.recordButton.textContent = "Record"
      
      const data = new Blob([JSON.stringify(this.recording)], {type: 'application/json'})
      this.downloadLink = document.createElement('a')
      this.downloadLink.textContent = "Download"
      this.downloadLink.setAttribute('download', 'rgb-recording.json')
      this.downloadLink.href = window.URL.createObjectURL(data)
      this.rootElement.appendChild(this.downloadLink)
    } else {
      this.recording.length = 0
      this.isRecording = true
      this.recordButton.textContent = "Stop"
      if(this.downloadLink) {
        this.rootElement.removeChild(this.downloadLink)
      }
    }
    
  }

}

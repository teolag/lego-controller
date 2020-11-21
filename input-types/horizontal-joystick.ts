export class HorizontalJoystick {
  private rootDiv: HTMLDivElement 
  private valueElem: HTMLDivElement
  private plupp: HTMLDivElement 
  private grabbed: boolean
  private downX: number

  private pointerUpCall
  private pointerMoveCall

  private minOutput:number
  private maxOutput:number
  private steps: number

  private changeHandler

  private value = 0

  constructor({name, minOutput = -1, maxOutput = 1, steps = 0.1}) {
    this.minOutput = minOutput
    this.maxOutput = maxOutput
    this.steps = steps

    this.rootDiv = document.createElement('div')
    this.rootDiv.classList.add('horizontal-joystick')

    const nameElement = document.createElement("div")
    nameElement.textContent = name
    nameElement.classList.add('name')
    
    this.valueElem = document.createElement("div")
    this.valueElem.textContent = this.value.toString()
    this.valueElem.classList.add('value')
    
    this.plupp= document.createElement('div')
    this.plupp.classList.add('plupp')
    this.rootDiv.addEventListener('pointerdown', this.pointerDown.bind(this))
    
    this.rootDiv.appendChild(this.plupp)
    this.rootDiv.appendChild(nameElement)
    this.rootDiv.appendChild(this.valueElem)
  }

  private pointerDown(e: PointerEvent) {
    if(e.button!==0) return

    e.preventDefault()
    this.plupp.setPointerCapture(e.pointerId);
    this.downX = e.clientX
    console.log("pointer down")
    this.pointerUpCall = this.pointerUp.bind(this)
    this.pointerMoveCall = this.pointerMove.bind(this)
    this.plupp.addEventListener('pointerup', this.pointerUpCall)
    this.plupp.addEventListener('pointermove', this.pointerMoveCall)
    this.grabbed = true
    this.plupp.classList.add('grabbed')
  }
  
  private pointerMove(e) {
    e.preventDefault()
    let diff = e.clientX-this.downX
    const max = this.rootDiv.clientWidth/2 - this.plupp.offsetWidth/2
    if(diff>max) diff=max
    if(diff<-max) diff=-max
    this.plupp.style.transform = `translate(${diff}px, 0)`
    this.setRawValue(diff/max)
    
  }

  private pointerUp(e) {
    if(!this.grabbed) return 
    console.log("pointer up", e.type)
    this.plupp.removeEventListener('pointerup', this.pointerUpCall)
    this.plupp.removeEventListener('pointermove', this.pointerMoveCall)
    this.plupp.style.transform = `translate(0, 0)`
    this.grabbed =  false
    this.plupp.classList.remove('grabbed')
    this.setRawValue(0)
  }

  public setRawValue(raw: number) {
    let newValue:number
    let multi:number
    if(raw < 0) {
      multi = this.minOutput/this.steps
      newValue = this.minOutput * Math.abs(Math.round(raw * multi) / multi)
    } else {
      multi = this.maxOutput/this.steps
      newValue = this.maxOutput *  Math.abs(Math.round(raw * multi) / multi)
    }

    if(newValue != this.value){
      this.value = newValue
      if(this.changeHandler) this.changeHandler(this.value)
      this.valueElem.textContent = this.value.toString()
    }
  }

  public getRootElement() {
    return this.rootDiv
  }

  public onChange(changeHandler: (value)=>void) {
    this.changeHandler = changeHandler
  }
}
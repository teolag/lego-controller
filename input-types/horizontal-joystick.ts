export class HorizontalJoystick {
  private rootDiv: HTMLDivElement 
  private plupp: HTMLDivElement 
  private grabbed: boolean
  private downX: number

  private pointerUpCall
  private pointerMoveCall
  private value = 0

  constructor() {
    this.rootDiv = document.createElement('div')
    this.rootDiv.classList.add('horizontal-joystick')
    
    this.plupp= document.createElement('div')
    this.plupp.classList.add('horizontal-joystick--plupp')
    this.plupp.addEventListener('pointerdown', this.pointerDown.bind(this))
    this.rootDiv.appendChild(this.plupp)
  }
  
  private pointerDown(e) {
    e.preventDefault()
    this.downX = e.clientX
    console.log("pointer down")
    this.pointerUpCall = this.pointerUp.bind(this)
    this.pointerMoveCall = this.pointerMove.bind(this)
    document.addEventListener('pointerup', this.pointerUpCall)
    document.addEventListener('pointermove', this.pointerMoveCall)
    this.grabbed =  true
  }
  
  private pointerMove(e) {
    e.preventDefault()
    let diff = e.clientX-this.downX
    const max = this.rootDiv.clientWidth/2 - 20
    if(diff>max) diff=max
    if(diff<-max) diff=-max
    this.value = diff/max

    this.plupp.style.transform = `translate(${diff}px, 0)`
    console.log("pointer move", this.value)
  }

  private pointerUp(e) {
    if(!this.grabbed) return 
    console.log("pointer up", e.type)
    this.plupp.style.transform = `translate(0, 0)`
    document.removeEventListener('pointerup', this.pointerUpCall)
    document.removeEventListener('pointermove', this.pointerMoveCall)
    this.grabbed =  false
  }

  public getRootElement() {
    return this.rootDiv
  }
}
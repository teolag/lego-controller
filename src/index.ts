import {Device, DeviceType, DistanceColorSensor, Hub, HubRGB, HubRGBColor, Port, scanForHubs, TachoMotor} from 'lego-connect-browser'
import { HubRGBController } from './devices/hub-rgb-controller'
import { SensorHSLGraph } from './displays/sensor-hsl-graph'
import { SensorRGBGraph } from './displays/sensor-rgb-graph'
import { HorizontalJoystick } from './input-types/horizontal-joystick'
import {version} from '../package.json'
let hub: Hub
let connectButton: HTMLButtonElement
let shutdownButton: HTMLButtonElement
let devicesDiv: HTMLDivElement

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded")

  const versionElem = document.getElementById("version") as HTMLDivElement
  console.log("versionElem", versionElem)
  if(versionElem) versionElem.textContent = 'Version: ' + version
  
  connectButton = document.getElementById('connectButton') as HTMLButtonElement
  connectButton.addEventListener("click", connectToBoost)
  
  shutdownButton = document.getElementById('shutdownButton') as HTMLButtonElement
  shutdownButton.addEventListener("click", shutdown)
  
  devicesDiv = document.getElementById('devices') as HTMLDivElement
})


const swPath= 'service-worker.js'
navigator.serviceWorker.register(swPath).then(reg => {
  console.log("Service worker registered", reg)
  reg.onupdatefound = onUpdateFound
})

console.log("MUPP!")

function onUpdateFound(event: Event) {
  const reg = event.target as ServiceWorkerRegistration
  
  const installingWorker = reg.installing;
  installingWorker.onstatechange = () => {
    switch (installingWorker.state) {
      case 'installed':
        if (navigator.serviceWorker.controller) {
          console.log('New or updated content is available.');
          location.reload()
        } else {
          console.log('Content is now available offline!');
        }
        break;

      case 'redundant':
        console.error('The installing service worker became redundant.');
        break;
    }
  }
}

async function connectToBoost() {
  hub = await scanForHubs();
  if (!hub) return;
  await navigator['wakeLock'].request('screen')

  connectButton.hidden = true
  shutdownButton.hidden = false

  hub.on('disconnect', () => {
    console.log("disconnect")
  })
  
  hub.on("deviceConnected", (device: Device) => {
    console.log("Device found", device);
    
    if (isHubRGB(device)) {
      device.setColor(HubRGBColor.PINK)
      const hubRGB = new HubRGBController(device)
      hubRGB.appendTo(devicesDiv)
    }

    if(isInternalTachoMotor(device, Port.A)) {
      console.log("Motor on port A found", device)
      const joy = new HorizontalJoystick({name: 'Motor A', minOutput: -5, maxOutput: 30, steps: 1})
      joy.onChange(value => device.startMotor(value, value===0 ? 0 : 100))
      joy.appendTo(devicesDiv)
    }
    
    if(isInternalTachoMotor(device, Port.B)) {
      console.log("Motor on port B found", device)
      const joy = new HorizontalJoystick({name: 'Motor B', minOutput: -20, maxOutput: 50, steps: 1})
      joy.appendTo(devicesDiv)
      joy.onChange(value => device.startMotor(value, value===0 ? 0 : 100))
    }

    if(isDistanceColorSensor(device)) {
      console.log("Color sensor found!", device)
      const rgbGraph = new SensorRGBGraph(device)
      rgbGraph.appendTo(devicesDiv)

      const hslGraph = new SensorHSLGraph(device)
      hslGraph.appendTo(devicesDiv)
    }

    device.on('disconnect', () => {
      console.log("Disconnect device", device)
    })

  });
  const name = await hub.getAdvertisingName();
  console.log("NAME!!", name);
}

function shutdown() {
  if(!hub) return
  hub.shutDown()
  connectButton.hidden = false
  shutdownButton.hidden = true
}

function isHubRGB(device: Device): device is HubRGB {
  return device.type === DeviceType.HUB_RGB
}

function isConnectedToPort(device: Device, port?: Port) {
  return port===undefined || port===device.port
}

function isInternalTachoMotor(device: Device, port?:Port): device is TachoMotor {
  return device.type === DeviceType.INTERNAL_TACHO_MOTOR && isConnectedToPort(device, port)
}

function isDistanceColorSensor(device: Device, port?:Port): device is DistanceColorSensor {
  return device.type === DeviceType.DISTANCE_COLOR_SENSOR && isConnectedToPort(device, port)
}
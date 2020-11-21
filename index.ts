import {Device, DeviceType, DistanceColorSensor, FakeHub, Hub, HubRGB, HubRGBColor, Port, scanForHubs, TachoMotor} from 'lego-connect-browser'
import { HubRGBController } from './devices/hub-rgb-controller'
import { SensorHSLGraph } from './displays/sensor-hsl-graph'
import { SensorRGBGraph } from './displays/sensor-rgb-graph'
import { HorizontalJoystick } from './input-types/horizontal-joystick'
let hub: Hub

const connectButton = document.getElementById('connectButton')
connectButton.addEventListener("click", connectToBoost)

const shutdownButton = document.getElementById('shutdownButton')
shutdownButton.addEventListener("click", shutdown)

const devicesDiv = document.getElementById('devices') as HTMLDivElement

const swPath= 'service-worker.js'
navigator.serviceWorker.register(swPath).then(reg => {
  console.log("Service worker registered", reg)
})


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
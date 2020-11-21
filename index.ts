import {Device, DeviceType, FakeHub, Hub, HubRGB, HubRGBColor, Port, scanForHubs, TachoMotor} from 'lego-connect-browser'
import { HubRGBController } from './devices/hub-rgb-controller'
import { HorizontalJoystick } from './input-types/horizontal-joystick'
let hub: Hub
let fakeHub: FakeHub

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
      devicesDiv.appendChild(joy.getRootElement())
      joy.onChange(value => device.startMotor(value, value===0 ? 0 : 100))
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
function isInternalTachoMotor(device: Device, port?:Port): device is TachoMotor {
  console.log("is motor?", device.type, device.port)
  return device.type === DeviceType.INTERNAL_TACHO_MOTOR && (port===undefined || port===device.port)
}
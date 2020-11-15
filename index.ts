import {Device, DeviceType, FakeHub, Hub, HubRGB, HubRGBColor, Port, scanForHubs, TachoMotor} from 'lego-connect-browser'
import { HubRGBController } from './devices/hub-rgb-controller'
import { HorizontalJoystick } from './input-types/horizontal-joystick'
let hub: Hub
let fakeHub: FakeHub

const connectButton = document.getElementById('connectButton')
connectButton.addEventListener("click", connectToBoost)

const shutdownButton = document.getElementById('shutdownButton')
shutdownButton.addEventListener("click", shutdown)

const devicesDiv = document.getElementById('devices')

const swPath= 'service-worker.js'
navigator.serviceWorker.register(swPath).then(reg => {
  console.log("Service worker registered", reg)
})

fakeHub = new FakeHub()
fakeHub.on('deviceConnected', device => {
  console.log("fake device found", device)
  const joy = new HorizontalJoystick()
  devicesDiv.appendChild(joy.getRootElement())

})
fakeHub.addFakeDevice(DeviceType.INTERNAL_TACHO_MOTOR, Port.A)
  

async function connectToBoost() {
  hub = await scanForHubs();
  if (!hub) return;
  await navigator.wakeLock.request('screen')

  connectButton.hidden = true
  shutdownButton.hidden = false

  hub.on('disconnect', () => {
    console.log("disconnect")
  })
  
  hub.on("deviceConnected", (device: Device) => {
    console.log("Device found", device);
    
    if (isHubRGB(device)) {
      device.setColor(HubRGBColor.PINK)
      const root = document.createElement('div')
      const hubRGB = new HubRGBController(root, device)
      devicesDiv.appendChild(root)
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
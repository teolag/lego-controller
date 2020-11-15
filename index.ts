import {Device, DeviceType, Hub, HubRGB, HubRGBColor, scanForHubs} from 'lego-connect-browser'
import { HubRGBController } from './devices/hub-rgb-controller'
let hub: Hub

const connectButton = document.getElementById('connectButton')
connectButton.addEventListener("click", connectToBoost)

const shutdownButton = document.getElementById('shutdownButton')
shutdownButton.addEventListener("click", shutdown)

const devicesDiv = document.getElementById('devices')

const swPath= 'service-worker.js'
navigator.serviceWorker.register(swPath).then(reg => {
  console.log("Service worker registered", reg)
})
  

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
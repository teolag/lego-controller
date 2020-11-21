export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const hsl = {h:0, s: 0, l:0}
  hsl.l = (max + min) / 2

  if (max === min){
      hsl.h = 0
      hsl.s = 0
  } else {
      const d = max - min
      hsl.s = hsl.l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch(max){
          case r: hsl.h = (g - b) / d + (g < b ? 6 : 0); break
          case g: hsl.h = (b - r) / d + 2; break
          case b: hsl.h = (r - g) / d + 4; break
      }
      hsl.h /= 6
  }

  return hsl
}

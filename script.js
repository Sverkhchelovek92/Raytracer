const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

function resizeCanvas() {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
}

window.addEventListener('resize', resizeCanvas)
resizeCanvas()

const light = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  rays: 720,
  radius: 5,
}

let isDraggingLight = false

function drawRays(light) {
  const maxLength = Math.hypot(canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)'
  ctx.lineWidth = 1

  for (let i = 0; i < light.rays; i++) {
    const angle = (i / light.rays) * Math.PI * 2

    const rayDir = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }

    let closestIntersection = null
    let minT = Infinity

    // check intersection
    for (const wall of walls) {
      const hit = raySegmentIntersection(
        { x: light.x, y: light.y },
        rayDir,
        wall.a,
        wall.b
      )

      if (hit && hit.t < minT) {
        minT = hit.t
        closestIntersection = hit
      }
    }

    ctx.beginPath()
    ctx.moveTo(light.x, light.y)

    if (closestIntersection) {
      ctx.lineTo(closestIntersection.x, closestIntersection.y)
    } else {
      ctx.lineTo(light.x + rayDir.x * maxLength, light.y + rayDir.y * maxLength)
    }

    ctx.stroke()
  }
}

function drawLight(light) {
  ctx.fillStyle = 'yellow'
  ctx.beginPath()
  ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2)
  ctx.fill()
}

function isMouseOnLight(mouseX, mouseY, light) {
  const dx = mouseX - light.x
  const dy = mouseY - light.y
  return Math.sqrt(dx * dx + dy * dy) <= light.radius
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

// Walls array
const walls = [
  { a: { x: 100, y: 100 }, b: { x: 500, y: 120 } },
  { a: { x: 600, y: 200 }, b: { x: 650, y: 300 } },
  // { a: { x: 250, y: 450 }, b: { x: 800, y: 465 } },
]

function drawWalls() {
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 2

  for (const wall of walls) {
    ctx.beginPath()
    ctx.moveTo(wall.a.x, wall.a.y)
    ctx.lineTo(wall.b.x, wall.b.y)
    ctx.stroke()
  }
}

function raySegmentIntersection(rayOrigin, rayDir, a, b) {
  // const r_px = rayOrigin.x
  // const r_py = rayOrigin.y
  // const r_dx = rayDir.x
  // const r_dy = rayDir.y

  // const s_px = a.x
  // const s_py = a.y
  // const s_dx = b.x - a.x
  // const s_dy = b.y - a.y

  // const r_mag = Math.hypot(r_dx, r_dy)
  // const s_mag = Math.hypot(s_dx, s_dy)

  // if (r_dx / r_mag === s_dx / s_mag && r_dy / r_mag === s_dy / s_mag) {
  //   return null
  // }
  // const T2 =
  //   (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx)

  // const T1 = (s_px + s_dx * T2 - r_px) / r_dx

  // if (T1 < 0) return null
  // if (T2 < 0 || T2 > 1) return null

  // return {
  //   x: r_px + r_dx * T1,
  //   y: r_py + r_dy * T1,
  //   t: T1,
  // }

  const dx = b.x - a.x
  const dy = b.y - a.y

  const denominator = rayDir.x * dy - rayDir.y * dx
  if (Math.abs(denominator) < 1e-6) return null

  const t = ((a.x - rayOrigin.x) * dy - (a.y - rayOrigin.y) * dx) / denominator
  const u =
    ((a.x - rayOrigin.x) * rayDir.y - (a.y - rayOrigin.y) * rayDir.x) /
    denominator

  if (t >= 0 && u >= 0 && u <= 1) {
    return {
      x: rayOrigin.x + rayDir.x * t,
      y: rayOrigin.y + rayDir.y * t,
      t: t,
    }
  }
  return null
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawRays(light)
  drawWalls()
  drawLight(light)
}

canvas.addEventListener('mousedown', (e) => {
  const { x, y } = getMousePos(e)

  if (isMouseOnLight(x, y, light)) {
    isDraggingLight = true
  }
})

canvas.addEventListener('mousemove', (e) => {
  const { x, y } = getMousePos(e)

  // меняем курсор
  canvas.style.cursor = isMouseOnLight(x, y, light) ? 'pointer' : 'default'

  if (isDraggingLight) {
    light.x = x
    light.y = y
    draw()
  }
})

canvas.addEventListener('mouseup', () => {
  isDraggingLight = false
})

draw()

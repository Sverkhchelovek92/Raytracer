const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

function resizeCanvas() {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
}

const light = {
  rays: 720,
  radius: 10,
}

function updateLightPosition() {
  light.x = canvas.width / 2
  light.y = canvas.height / 2
}

window.addEventListener('resize', () => {
  resizeCanvas()
  updateLightPosition()
  draw()
})

resizeCanvas()
updateLightPosition()

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

function drawLightArea(light) {
  const points = []
  const maxLength = Math.hypot(canvas.width, canvas.height) * 1.5

  // let's collect ending points of rays

  for (let i = 0; i < light.rays; i++) {
    const angle = (i / light.rays) * Math.PI * 2
    const rayDir = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }

    let closestIntersection = null
    let minT = Infinity

    for (const wall of walls) {
      const hit = raySegmentIntersection(light, rayDir, wall.a, wall.b)
      if (hit && hit.t < minT) {
        minT = hit.t
        closestIntersection = hit
      }
    }

    let endPoint
    if (closestIntersection) {
      endPoint = closestIntersection
    } else {
      endPoint = {
        x: light.x + rayDir.x * maxLength,
        y: light.y + rayDir.y * maxLength,
      }
    }

    points.push({
      x: endPoint.x,
      y: endPoint.y,
      angle: angle,
    })
  }

  // let's sort for some reason
  points.sort((a, b) => a.angle - b.angle)

  // let's make gradient
  const gradient = ctx.createRadialGradient(
    light.x,
    light.y,
    0,
    light.x,
    light.y,
    maxLength
  )
  gradient.addColorStop(0, 'rgba(255, 255, 180, 0.8)')
  gradient.addColorStop(0.4, 'rgba(255, 220, 100, 0.4)')
  gradient.addColorStop(0.7, 'rgba(255, 200, 50, 0.1)')
  gradient.addColorStop(1, 'rgba(255, 180, 0, 0)')

  ctx.fillStyle = gradient

  // let's draw this stuff
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.closePath()
  ctx.fill()
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

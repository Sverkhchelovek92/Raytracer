const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

function resizeCanvas() {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
}

// Lights and Walls

let lights = []
let walls = [
  { a: { x: 100, y: 100 }, b: { x: 500, y: 120 } },
  { a: { x: 600, y: 200 }, b: { x: 650, y: 300 } },
  // { a: { x: 250, y: 450 }, b: { x: 800, y: 465 } },
]

let drawingWall = null
let lastMousePos = { x: 0, y: 0 }

const availableColors = [
  'rgba(255, 240, 180',
  'rgba(180, 220, 255',
  'rgba(255, 180, 200',
  'rgba(180, 255, 180',
  'rgba(255, 200, 100',
  'rgba(200, 180, 255',
]
let currentColorIndex = 0

function updateLightsAndBoundaries() {
  // Update lights
  // lights = [
  //   {
  //     x: canvas.width / 4,
  //     y: canvas.height / 2,
  //     color: 'rgba(255, 240, 180',
  //     range: 600,
  //     rays: 1000,
  //     radius: 14,
  //   },
  //   {
  //     x: (canvas.width * 3) / 4,
  //     y: canvas.height / 2,
  //     color: 'rgba(180, 220, 255',
  //     range: 600,
  //     rays: 1000,
  //     radius: 14,
  //   },
  // ]
  // Delete old walls
  walls = walls.filter((w) => !w.isBoundary)

  // New walls
  const w = canvas.width
  const h = canvas.height
  walls.push(
    { a: { x: 0, y: 0 }, b: { x: w, y: 0 }, isBoundary: true },
    { a: { x: w, y: 0 }, b: { x: w, y: h }, isBoundary: true },
    { a: { x: w, y: h }, b: { x: 0, y: h }, isBoundary: true },
    { a: { x: 0, y: h }, b: { x: 0, y: 0 }, isBoundary: true }
  )
}

window.addEventListener('resize', () => {
  resizeCanvas()
  updateLightsAndBoundaries()
  draw()
})

resizeCanvas()
updateLightsAndBoundaries()

if (lights.length === 0) {
  lights.push(
    {
      x: canvas.width / 4,
      y: canvas.height / 2,
      color: 'rgba(255, 240, 180',
      range: 600,
      rays: 1000,
      radius: 14,
    },
    {
      x: (canvas.width * 3) / 4,
      y: canvas.height / 2,
      color: 'rgba(255, 240, 180',
      range: 600,
      rays: 1000,
      radius: 14,
    }
  )
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

function drawLightArea(light) {
  const points = []
  const maxDist = light.range

  // let's collect ending points of rays

  for (let i = 0; i < light.rays; i++) {
    const angle = (i / light.rays) * Math.PI * 2
    const rayDir = { x: Math.cos(angle), y: Math.sin(angle) }

    let closest = null
    let minT = Infinity

    for (const wall of walls) {
      const hit = raySegmentIntersection(light, rayDir, wall.a, wall.b)
      if (hit && hit.t < minT) {
        minT = hit.t
        closest = hit
      }
    }

    let endPoint
    if (closest && minT <= maxDist) {
      endPoint = closest
    } else {
      endPoint = {
        x: light.x + rayDir.x * maxDist,
        y: light.y + rayDir.y * maxDist,
      }
    }

    points.push({ x: endPoint.x, y: endPoint.y, angle })
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
    maxDist
  )
  // Gradient

  gradient.addColorStop(0.0, light.color + ', 1)')
  gradient.addColorStop(0.1, light.color + ', 0.8)')
  gradient.addColorStop(0.3, light.color + ', 0.5)')
  gradient.addColorStop(0.6, light.color + ', 0.2)')
  gradient.addColorStop(0.9, light.color + ', 0.05)')
  gradient.addColorStop(1.0, light.color + ', 0)')

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

function drawWalls() {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2

  for (const wall of walls) {
    if (wall.isBoundary) continue
    ctx.beginPath()
    ctx.moveTo(wall.a.x, wall.a.y)
    ctx.lineTo(wall.b.x, wall.b.y)
    ctx.stroke()
  }
}

function drawLight(light) {
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1
  ctx.stroke()
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.globalCompositeOperation = 'lighter'

  for (const light of lights) {
    drawLightArea(light)
  }

  ctx.globalCompositeOperation = 'source-over'

  drawWalls()

  for (const light of lights) {
    drawLight(light)
  }

  // Walls preview
  if (drawingWall && lastMousePos) {
    ctx.strokeStyle = '#aaa'
    ctx.lineWidth = 3
    ctx.setLineDash([10, 8])
    ctx.beginPath()
    ctx.moveTo(drawingWall.x, drawingWall.y)
    ctx.lineTo(lastMousePos.x, lastMousePos.y)
    ctx.stroke()
    ctx.setLineDash([])
  }
}

let draggedLight = null

function isMouseOnLight(mouseX, mouseY, light) {
  const dx = mouseX - light.x
  const dy = mouseY - light.y
  return Math.hypot(dx, dy) <= light.radius
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function distanceToSegment(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const proj = { x: a.x + t * dx, y: a.y + t * dy }
  return Math.hypot(p.x - proj.x, p.y - proj.y)
}

function findHoveredObject(pos) {
  // Checking lights
  for (let i = 0; i < lights.length; i++) {
    if (isMouseOnLight(pos.x, pos.y, lights[i])) {
      return { type: 'light', index: i }
    }
  }

  // Checking walls
  for (let i = 0; i < walls.length; i++) {
    const wall = walls[i]
    if (wall.isBoundary) continue
    const dist = distanceToSegment(pos, wall.a, wall.b)
    if (dist < 15) {
      return { type: 'wall', index: i }
    }
  }

  return null
}

canvas.addEventListener('mousedown', (e) => {
  const pos = getMousePos(e)

  // Draw Walls
  if (e.button === 2) {
    drawingWall = { x: pos.x, y: pos.y }
    e.preventDefault()
    return
  }

  if (e.button === 0) {
    if (drawingWall) {
      walls.push({
        a: { x: drawingWall.x, y: drawingWall.y },
        b: { x: pos.x, y: pos.y },
      })
      drawingWall = null
      draw()
      return
    }
  }

  // Drag Light
  draggedLight = null
  for (const light of lights) {
    if (isMouseOnLight(pos.x, pos.y, light)) {
      draggedLight = light
      break
    }
  }
})

canvas.addEventListener('mousemove', (e) => {
  const pos = getMousePos(e)
  lastMousePos = pos

  const hoveredLight = lights.some((light) =>
    isMouseOnLight(pos.x, pos.y, light)
  )
  const hoveredObject = findHoveredObject(pos)

  if (drawingWall) {
    canvas.style.cursor = 'crosshair'
  } else if (draggedLight) {
    canvas.style.cursor = 'grabbing'
  } else if (hoveredLight) {
    canvas.style.cursor = 'grab'
  } else if (hoveredObject && hoveredObject.type === 'wall') {
    canvas.style.cursor = 'pointer'
  } else {
    canvas.style.cursor = 'default'
  }

  if (draggedLight) {
    draggedLight.x = pos.x
    draggedLight.y = pos.y
    draw()
  } else if (drawingWall) {
    draw()
  }
})

canvas.addEventListener('mouseup', () => {
  draggedLight = null
})

canvas.addEventListener('mouseleave', () => {
  draggedLight = null
})

canvas.addEventListener('dblclick', (e) => {
  const pos = getMousePos(e)

  if (drawingWall) return

  const onExistingLight = lights.some(
    (light) => Math.hypot(pos.x - light.x, pos.y - light.y) <= light.radius
  )
  if (onExistingLight) return

  lights.push({
    x: pos.x,
    y: pos.y,
    color: availableColors[currentColorIndex],
    range: 600,
    rays: 1000,
    radius: 14,
  })

  currentColorIndex = (currentColorIndex + 1) % availableColors.length
  draw()
})

window.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (drawingWall) {
      drawingWall = null
      draw()
      return
    }

    const obj = findHoveredObject(lastMousePos)
    if (!obj) return

    if (obj.type === 'light') {
      lights.splice(obj.index, 1)
    } else if (obj.type === 'wall') {
      walls.splice(obj.index, 1)
    }

    draw()
  }
})

canvas.addEventListener('contextmenu', (e) => e.preventDefault())

draw()

// Modal Window Help Button Logic

const helpButton = document.getElementById('help-button')
const helpModal = document.getElementById('help-modal')

helpButton.addEventListener('click', (e) => {
  e.stopPropagation()
  helpModal.style.display = 'flex'
})

helpModal.addEventListener('click', () => {
  helpModal.style.display = 'none'
})

document.getElementById('help-content').addEventListener('click', (e) => {
  e.stopPropagation()
})

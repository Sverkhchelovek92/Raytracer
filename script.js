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
  const maxLength = Math.max(canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)'
  ctx.lineWidth = 1

  for (let i = 0; i < light.rays; i++) {
    const angle = (i / light.rays) * Math.PI * 2

    const dx = Math.cos(angle)
    const dy = Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(light.x, light.y)
    ctx.lineTo(light.x + dx * maxLength, light.y + dy * maxLength)
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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawRays(light)
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

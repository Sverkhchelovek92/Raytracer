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
  rays: 180,
  radius: 5,
}

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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawRays(light)
  drawLight(light)
}

draw()

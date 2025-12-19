const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

function resizeCanvas() {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
}

window.addEventListener('resize', resizeCanvas)
resizeCanvas()

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // canvas center
  const cx = canvas.width / 2
  const cy = canvas.height / 2

  //axis
  ctx.strokeStyle = '#555'
  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(canvas.width, cy)
  ctx.moveTo(cx, 0)
  ctx.lineTo(cx, canvas.height)
  ctx.stroke()

  // center dot
  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fill()
}

draw()

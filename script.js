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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // canvas center
  const cx = canvas.width / 2
  const cy = canvas.height / 2
}

draw()

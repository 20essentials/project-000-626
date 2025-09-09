import  { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import "virtual:windi.css"

function App() {
  useEffect(() => {
    const $ = el => document.querySelector(el)
    const $canvas = $(".stack-tower")
    const $ctx = $canvas.getContext("2d")
    const $modal = $(".stack-modal")

    let animationFrameId
    const INITIAL_X_SPEED = 5
    const INITIAL_Y_SPEED = 6
    const BOX_WIDTH = 200
    const BOX_HEIGTH = 50
    const INITIAL_Y_CANVAS = 600
    const MODES = { BOX_BOUNCE: "box-bounce", BOX_FALL: "box-fall", GAME_OVER: "game-over" }
    let current, cameraY, scrollCounter, speedX, speedY, mode
    let boxes = []
    let restBox = { x: 0, y: 0, width: 0 }

    function generateColor() {
      return `rgb(${~~(Math.random() * 200) + 50},${~~(Math.random() * 200) + 50},${~~(Math.random() * 200) + 50})`
    }

    function initialGameState() {
      boxes = [{ x: $canvas.width / 2 - BOX_WIDTH / 2, y: 200, width: BOX_WIDTH, color: generateColor() }]
      current = 1
      scrollCounter = 0
      cameraY = 0
      mode = MODES.BOX_BOUNCE
      speedX = INITIAL_X_SPEED
      speedY = INITIAL_Y_SPEED
      createNexBox()
    }

    function createNexBox() {
      boxes[current] = { width: boxes[current - 1].width, x: 0, y: (current + 10) * BOX_HEIGTH, color: generateColor() }
    }

    function drawBoxes() {
      boxes.forEach(({ x, y, width, color }) => {
        const newY = INITIAL_Y_CANVAS - y + cameraY
        $ctx.fillStyle = color
        $ctx.fillRect(x, newY, width, BOX_HEIGTH)
      })
    }

    function drawRestOfBox() {
      const { x, y, width } = restBox
      const newY = INITIAL_Y_CANVAS - y + cameraY
      $ctx.fillStyle = "red"
      $ctx.fillRect(x, newY, width, BOX_HEIGTH)
    }

    function createNewRestOfBox(difference) {
      const currentBox = boxes[current]
      const prevBox = boxes[current - 1]
      const restX = currentBox.x > prevBox.x ? currentBox.x + currentBox.width : prevBox.x
      restBox = { x: restX, y: currentBox.y, width: difference }
    }

    function drawBackground() {
      const newGradient = $ctx.createLinearGradient($canvas.width / 2, 0, $canvas.width / 2, $canvas.height)
      newGradient.addColorStop(0, "#000")
      newGradient.addColorStop(1, "darkblue")
      $ctx.fillStyle = newGradient
      $ctx.fillRect(0, 0, $canvas.width, $canvas.height)
    }

    function boxBounceMoveAndCollision() {
      const currentBox = boxes[current]
      currentBox.x += speedX
      if (currentBox.x + currentBox.width > $canvas.width || currentBox.x < 0) speedX *= -1
    }

    function gameOver() {
      $ctx.fillStyle = "#f008"
      $ctx.fillRect(0, 0, $canvas.width, $canvas.height)
      $modal.classList.add("modal-open")
    }

    function boxFallCollision() {
      const currentBox = boxes[current]
      const previousBox = boxes[current - 1]
      currentBox.y -= speedY
      if (previousBox.y + BOX_HEIGTH === currentBox.y) {
        const diffWidth = currentBox.x - previousBox.x
        if (currentBox.x > previousBox.x) currentBox.width -= diffWidth
        else {
          currentBox.width += diffWidth
          currentBox.x = previousBox.x
        }
        if (Math.abs(diffWidth) > previousBox.width || Math.abs(diffWidth) < 1) {
          mode = MODES.GAME_OVER
          gameOver()
          return
        }
        createNewRestOfBox(diffWidth)
        current++
        scrollCounter = BOX_HEIGTH
        mode = MODES.BOX_BOUNCE
        createNexBox()
      }
    }

    function updateCamera() {
      if (scrollCounter > 0) {
        scrollCounter--
        cameraY++
      }
    }

    function drawGame() {
      if (mode === MODES.GAME_OVER) return
      drawBackground()
      drawBoxes()
      drawRestOfBox()
      if (mode === MODES.BOX_BOUNCE) boxBounceMoveAndCollision()
      else if (mode === MODES.BOX_FALL) boxFallCollision()
      restBox.y -= speedY
      updateCamera()
      animationFrameId = requestAnimationFrame(drawGame)
    }

    function initGame() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      initialGameState()
      drawGame()
    }

    document.addEventListener("DOMContentLoaded", initGame)
    document.addEventListener("click", e => {
      if (e.target.matches(".again-game") || (e.target.matches(".stack-tower") && mode === MODES.GAME_OVER)) {
        $modal.classList.remove("modal-open")
        initGame()
      } else if (mode === MODES.BOX_BOUNCE && e.target.matches(".stack-tower")) {
        mode = MODES.BOX_FALL
      }
    })
  }, [])

  return (
    <>
      <canvas className="stack-tower shadow-[0_0_5px_#fff]" width="320" height="500"></canvas>
      <aside className="stack-modal absolute rounded-lg top-1/2 left-1/2 w-[170px] h-[150px] flex flex-col place-content-center p-4 text-center gap-4 transition-transform duration-400 ease-in-out bg-gradient-to-b from-springgreen to-orange z-30 transform -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0">
        <h2>GAME OVER</h2>
        <button className="again-game relative cursor-pointer rounded-[24px] font-semibold text-[16px] leading-6 tracking-[0.02em] text-white">
          <div className="wrapper relative overflow-hidden rounded-[24px] min-w-[132px] py-3">
            <span>AGAIN</span>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={`circle circle-${12 - i} absolute rounded-full`}></div>
            ))}
          </div>
        </button>
      </aside>
    </>
  )
}

const root = document.createElement("div")
document.body.appendChild(root)
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)

const style = document.createElement("style")
style.textContent = `
  body { height: 100dvh; width: 100%; display: flex; flex-wrap: wrap; place-content: center; background: linear-gradient(90deg,#fc3977,#ffadbd); }
  .stack-modal.modal-open { transform: translate(-50%,-50%) scale(1); opacity: 1; }
  ${document.querySelector("style")?.textContent || ""}
`
document.head.appendChild(style)

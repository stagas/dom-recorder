import { DOMRecorder } from '../src'

declare const window: any

window.recorder = new DOMRecorder()
document.body.appendChild(window.recorder.el)

const button = Object.assign(
  document.createElement('button'),
  { textContent: 'click me' }
)
const circle = document.createElement('div')
const textarea = Object.assign(
  document.createElement('textarea'),
  { rows: 10, spellcheck: false, value: 'click record & type in here\n' }
)

let val = 0
function onclick() {
  button.textContent = `clicks: ${val++}`
}

function onkeydown(ev: KeyboardEvent) {
  ev.preventDefault()
  textarea.value += ev.key
}

function onpointermove(ev: PointerEvent) {
  requestAnimationFrame(() => {
    circle.style.cssText = /*css*/`
      position: absolute;
      left: ${ev.pageX + 5}px;
      top: ${ev.pageY + 15}px;
      width: 30px;
      height: 30px;
      background: pink;
      border-radius: 100%;
    `
  })
}

button.addEventListener('click', onclick)
textarea.addEventListener('keydown', onkeydown)
window.addEventListener('pointermove', onpointermove)

document.body.appendChild(textarea)
document.body.appendChild(button)
document.body.appendChild(circle)

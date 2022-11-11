import { MapMap, mutable, pick } from 'everyday-utils'
import type { StringKeys } from 'everyday-types'

export type SavedEvent = Events & {
  is: StringKeys<typeof EventConstructorsMap>
  capture: boolean | undefined
}

export interface Action {
  selectors: string[]
  event: SavedEvent
}

export type Events =
  & InputEvent
  & KeyboardEvent
  & MouseEvent
  & PointerEvent
  & WheelEvent

const MIN_IDLE_TIME = parseInt(localStorage.recorderMinIdleTime) || 50
const FRAME_TIME = 1000 / 60

const allEvents = [
  ['misc', [
    'blur',
    'focus',
    'click',
    'dblclick',
    'wheel',
    'input',
    'change',
    'contextmenu',
  ]],

  ['pointer', [
    'pointerdown',
    'pointerup',
    'pointermove',
    'pointerover',
    'pointerenter',
    'pointerleave',
    'pointercancel',
  ]],

  ['mouse', [
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseover',
    'mouseenter',
    'mouseleave',
    'mousecancel',
  ]],

  ['keyboard', [
    'keydown',
    'keyup',
    'keypress',
  ]],
] as const

const copyEventProps = [
  'pointerId',
  'buttons',
  'altKey',
  'ctrlKey',
  'shiftKey',
  'metaKey',
  'pageX',
  'pageY',
  'deltaX',
  'deltaY',
  'key',
  'which',
] as const

const saveEventProps = [
  'type',
  'timeStamp',
] as const

const dispatchProps = [
  'bubbles',
  'composed',
  'cancelable',
] as const

const EventConstructorsMap = {
  InputEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  WheelEvent,
} as const

function copyEvent(event: Events): PropertyDescriptorMap {
  return Object.fromEntries(
    copyEventProps.map(
      (key): [string, PropertyDescriptor] =>
        [key, { value: event[key] }]
    )
  )
}

function saveEvent(event: Events, capture: boolean | undefined): SavedEvent {
  return {
    is: event.constructor.name as keyof typeof EventConstructorsMap,
    capture,
    ...(Object.fromEntries(
      [...copyEventProps, ...saveEventProps, ...dispatchProps].map(
        (key): [string, Events[keyof Events]] =>
          [key, event[key]]
      )
    ) as unknown as Events),
  }
}

// const filterOutElements = [
//   HTMLHtmlElement,
//   Document,
//   Window,
// ]

function getElementSelector(el: Element | null) {
  const parts: string[] = []

  while (el) {
    parts.unshift(el.tagName.toLowerCase())

    const parent = el.parentNode

    if (parent) {
      // nth-child indexes are 1-based
      const children = [...parent.children]
      if (children.length > 1) {
        const index = children.indexOf(el) + 1
        if (index) {
          parts[0] += `:nth-child(${index})`
        }
      }
    }

    if (el.hasAttribute('part')) {
      const sel = `[part=${el.getAttribute('part')}]`
      parts[0] += sel
    }

    if (parent instanceof Element) {
      el = parent
    } else {
      break
    }
  }

  return parts.join(' > ')
}

function nodeToSelectors(el: Element | Window) {
  if (el instanceof Window) return ['window']

  const selectors: string[] = []

  let rootNode

  while (rootNode = el.getRootNode()) {
    selectors.unshift(getElementSelector(el))

    if (rootNode === document || rootNode === el) break

    el = (rootNode as ShadowRoot).host
  }

  return selectors
}

function selectorsToNode(selectors: string[]) {
  let rootNode = document as Document | ShadowRoot | Element | null

  let current, el

  for (const sel of selectors) {
    if (sel === 'window') {
      return window
    }

    el = rootNode?.querySelector(sel)
    if (!el) return current
    current = el
    rootNode = (el as Element)?.shadowRoot
    if (!rootNode) break
  }
  return current
}

const patchEventTarget = () => {
  const original = {
    addEventListener: EventTarget.prototype.addEventListener,
    removeEventListener: EventTarget.prototype.removeEventListener,
  } as const

  const handler = {
    lastEventTime: 0,
    recording: false,
    onaction: (_action: Action) => { }
  }

  const callbacks = new MapMap<EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined, EventListener>()

  function callbackFor(
    callback: EventListener,
    options: boolean | AddEventListenerOptions | undefined
  ) {
    if (callbacks.has(callback, options)) {
      return callbacks.get(callback, options)!
    }

    function listener(this: Element, event: Event) {
      const isRecording = handler.recording && (event.constructor.name in EventConstructorsMap)

      let selectors!: string[]

      if (isRecording) {
        selectors = nodeToSelectors(this)
      }

      const result = callback.call(this, event)

      // used to detect idle for autoplay
      handler.lastEventTime = event.timeStamp

      if (isRecording) {
        if (selectors.filter(Boolean).length) {
          handler.onaction({
            selectors,
            event: saveEvent(
              event as Events,
              typeof options === 'boolean' ? options : options?.capture
            )
          })
        } else {
          console.warn('no selectors', this)
        }
      }

      return result
    }

    if (typeof options === 'boolean' || !options?.once) {
      callbacks.set(callback, options, listener)
    }

    return listener
  }

  EventTarget.prototype.addEventListener = function (
    type,
    callback: EventListener,
    options
  ) {
    const listener = callbackFor(callback, options)
    return original.addEventListener.call(this, type, listener, options)
  }

  EventTarget.prototype.removeEventListener = function (
    type,
    callback: EventListener,
    options
  ) {
    const listener = callbacks.get(callback, options)
    if (listener) {
      callbacks.delete(callback, options)
      return original.removeEventListener.call(this, type, listener, options)
    }
    else return original.removeEventListener.call(this, type, callback, options)
  }

  return handler
}

const handler = patchEventTarget()

export class DOMRecorder {
  actions = [] as Action[]

  eventTypes: string[] = (
    localStorage.recorderEventTypes
    ?? 'click,pointermove,keydown'
  ).split(',')

  enabledGroups: string[] = (
    localStorage.recorderEnabledGroups
    ?? 'misc,pointer,keyboard'
  ).split(',')

  el!: HTMLDivElement
  controlsEl!: HTMLDivElement
  statusEl!: HTMLElement
  status = ''
  actionsEl!: HTMLDetailsElement
  events = ''
  formEl!: HTMLFormElement
  pointerEl!: HTMLDivElement

  autoplay = false
  skipped = 0
  replayed = 0
  replaying = false
  dirtyActions = false
  unsavedActions = false

  onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (this.unsavedActions) {
      event.preventDefault()
      return (event.returnValue = 'There are unsaved actions, are you sure you want to exit?')
    }
  }

  constructor() {
    this.render()

    this.getActions().then(() => {
      this.maybeAutoplay()
    })

    window.addEventListener(
      'beforeunload',
      this.onBeforeUnload,
      { capture: true }
    )
  }

  render() {
    this.el ??= document.createElement('div')
    this.el.id = 'recorder-ui'
    this.paintEl()

    this.pointerEl = this.el.querySelector('.recorder-ui-pointer')!

    this.controlsEl = this.el.querySelector('.recorder-ui-controls')!
    this.paintControls()

    this.formEl = this.el.querySelector('form')!
    this.paintForm()

    this.actionsEl = this.el.querySelector('details')!
    this.paintActions()

    this.paintStatus(0)

    allEvents
      .flatMap(([, events]) => events)
      .map((eventType) => {
        this.el.addEventListener(eventType, (e) => {
          this.autoplay = false
          e.stopPropagation()
        }, { passive: false })
      })
  }

  paintEl() {
    this.el.innerHTML = /*html*/`
      <style>
        #recorder-ui {
          --background: #222e;
          position: fixed;
          z-index: 99999999;
          top: 0;
          right: 0;
          user-select: none;
          max-width: 100%;
          display: flex;
          flex-flow: column;
        }
        #recorder-ui * {
          font-family: system-ui;
          font-size: 14px;
        }
        .recorder-ui-controls {
          background: var(--background);
        }
        .recorder-ui-controls,
        .recorder-ui-controls > * {
          display: flex;
          flex-flow: row wrap;
          place-items: center;
        }
        #recorder-ui input[type=checkbox] {
          vertical-align: middle;
        }
        #recorder-ui form {
          background: var(--background);
          overflow: scroll;
          display: flex;
          flex-flow: column;
        }
        #recorder-ui form.hidden {
          display: none;
        }
        #recorder-ui form > div {
          display: flex;
          flex-flow: row;
        }
        #recorder-ui label {
          white-space: nowrap;
        }
        #recorder-ui form fieldset {
          padding: 0;
          display: flex;
          flex-flow: column wrap;
          flex: 1;
        }
        #recorder-ui form fieldset legend {
          text-align: center;
        }
        #recorder-ui form fieldset.recorder-ui-groups {
          flex: 0;
          min-width: 100px;
          justify-content: center;
        }
        #recorder-ui details {
          position: relative;
          max-width: 100%;
          white-space: pre;
        }
        #recorder-ui details[open] {
          height: 200px;
          overflow: scroll;
          resize: vertical;
        }
        #recorder-ui details summary {
          background: #333;
          position: sticky;
          z-index: 1;
          top: 0;
        }
        #recorder-ui details div {
          opacity: 0.15;
        }
        #recorder-ui:hover details {
          background: var(--background);
        }
        #recorder-ui:hover details div {
          opacity: 0.5;
        }
        #recorder-ui details summary:hover,
        #recorder-ui details div:hover {
          color: #000;
          background: #888;
          opacity: 1;
        }
        .recorder-ui-event-skipped {
          color: #777;
        }
        .recorder-ui-pointer {
          position: fixed;
          z-index: 99999999;
          mix-blend-mode: difference;
        }
        .recorder-ui-pointer svg {
          position: relative;
          left: -6px;
          top: -3px;
        }
        .recorder-ui-pointer.hidden {
          display: none;
        }
      </style>
      <div class="recorder-ui-pointer">
        <!-- https://github.com/grommet/grommet-icons/blob/master/public/img/cursor.svg -->
        <svg width="30" height="30" viewBox="0 0 24 24">
        <polygon
          fill="#666a"
          stroke="#fff"
          stroke-width="1.15"
          points="6 3 18 14 13 15 16 20.5 13 22 10 16 6 19"
        />
      </div>
      <div class="recorder-ui-controls"></div>
      <form onchange="recorder.getFormData(this)"></form>
      <details open></details>
    `
  }

  paintControls() {
    this.controlsEl.innerHTML = /*html*/`
      <div>
        <button ${this.replaying ? 'disabled' : 'onclick="recorder.startRecording()"'}>record</button>
        <button ${!handler.recording ? 'disabled' : 'onclick="recorder.stopRecording()"'}>stop</button>
      </div>
      &nbsp;
      <div>
        <button ${this.replaying || (!this.actions.length && !handler.recording) ? 'disabled' : 'onclick="recorder.startReplaying()"'}>replay</button>
        <button ${!this.replaying ? 'disabled' : 'onclick="recorder.stopReplaying()"'}>stop</button>
      </div>
      &nbsp;
      <div>
        server:
        <button ${!this.unsavedActions || this.replaying || !this.actions.length || handler.recording ? 'disabled' : 'onclick="recorder.postActions()"'}>post</button>
        <button  ${this.replaying || !this.actions.length || handler.recording ? 'disabled' : 'onclick="recorder.replayServer()"'}>replay</button>
      </div>
      &nbsp;
      <label
        oncontextmenu="event.preventDefault();localStorage.recorderMinIdleTime=parseInt(prompt('Enter idle time(ms) needed for autoplay to begin:', parseInt(localStorage.recorderMinIdleTime) || 50))"
      >
        auto:<input
          type="checkbox"
          onchange="localStorage.recorderAutoplay=this.checked"
          ${localStorage.recorderAutoplay === 'true' ? 'checked' : ''}
        />
      </label>
      <label>
        loop:<input
          type="checkbox"
          onchange="localStorage.recorderLoop=!!this.checked"
          ${localStorage.recorderLoop === 'true' ? 'checked' : ''}
        />
      </label>
    `
  }

  paintForm() {
    const disabledEvents = allEvents
      .filter(([group]) => !this.enabledGroups.includes(group))

    const enabledEvents = allEvents
      .filter(([group]) => this.enabledGroups.includes(group))

    this.formEl.innerHTML = /*html*/`
      ${!disabledEvents.length ? '' : /*html*/`
      <div class="recorder-ui-groups">
        ${disabledEvents.map(([group, events]) => /*html*/`
        <label>
          <input
            type="checkbox"
            name="enabledGroups[]"
            value="${group}"
          />
          ${group}
        </label>
        ${mutable(events)
        .filter((type) =>
          this.eventTypes.includes(type)
        )
        .map((type) => /*html*/`
          <input
            type="hidden"
            name="recorderEventTypes[]"
            value="${type}"
          />
        `).join('')}
      `).join('')}
      </div>`}
      <div>
        ${enabledEvents.map(([group, events]) => /*html*/`
        <fieldset>
          <legend>
            <label>
              <input
                type="checkbox"
                name="enabledGroups[]"
                value="${group}"
                checked
              />
              ${group}
            </label>
          </legend>
          <label>
            <input
              type="checkbox"
              ${mutable(events).every((type) => this.eventTypes.length && this.eventTypes.includes(type)) ? `
                checked
                onclick="recorder.deselectAll('${group}')"
              ` : `
                onclick="recorder.selectAll('${group}')"
              `}
            />
            all ${group}
          </label>
          ${events.map((type) => /*html*/`
          <label>
            <input
              type="checkbox"
              name="recorderEventTypes[]"
              value="${type}"
              ${this.eventTypes.includes(type) ? 'checked' : ''}
            />
            ${type}
          </label>
          `).join('')}
        </fieldset>`).join('')}
      </div>
    `
  }

  paintActions() {
    if (this.actions.length) {
      const firstTimeStamp = this.actions[0].event.timeStamp | 0

      this.actionsEl.innerHTML = this.actions.map(
        (action, index) =>
          `<div id="action${index}" onclick="recorder.showDetails(this)">${(action.event.timeStamp | 0) - firstTimeStamp} ${action.event.type} ${action.selectors.at(-1)!.split(' > ').pop()}</div>`
      ).join('')
    }

    this.actionsEl.prepend(
      this.statusEl ??= document.createElement('summary')
    )

    this.actionsEl.open = true
  }

  paintStatus(kind: number) {
    let status: string
    if (kind === 1) {
      status = `${this.actions.length - this.replayed - this.skipped} remaining (${this.skipped} skipped, ${this.actions.length} total)`
    } else {
      status = `${this.actions.length} actions, ${this.skipped} skipped`
    }
    requestAnimationFrame(() => {
      this.statusEl.textContent = this.status = status
    })
  }

  async waitUntilIdle() {
    while (performance.now() - handler.lastEventTime < MIN_IDLE_TIME) {
      await new Promise((resolve) =>
        setTimeout(resolve, 50)
      )
    }
  }

  async maybeAutoplay() {
    if (!this.actions.length) return

    if (localStorage.recorderAutoplay === 'true') {
      this.autoplay = true
      await this.waitUntilIdle()
      if (this.autoplay) {
        this.startReplaying()
      }
    }
  }

  getFormData(form: HTMLFormElement) {
    const formData = new FormData(form)

    this.eventTypes = localStorage.recorderEventTypes = formData.getAll('recorderEventTypes[]') as string[]

    this.enabledGroups = localStorage.recorderEnabledGroups = formData.getAll('enabledGroups[]') as string[]

    this.paintForm()
  }

  selectAll(group: string) {
    this.eventTypes = localStorage.recorderEventTypes = [...new Set([
      ...this.eventTypes,
      ...allEvents
        .find(([g]) => group === g)![1]
    ])]

    this.paintForm()
  }

  deselectAll(group: string) {
    const toDeselect = allEvents
      .find(([g]) => group === g)![1]

    this.eventTypes = localStorage.recorderEventTypes = this.eventTypes.filter((type) => !toDeselect.includes(type as never))

    this.paintForm()
  }

  showDetails(el: HTMLDivElement) {
    if (el.dataset.expanded === 'true') return
    el.dataset.expanded = 'true'
    const action = this.actions[+el.id.split('action')!.pop()!]
    const eventDetails = `\n${action.selectors.join('\n > ')}\n${JSON.stringify(action.event, null, 2)}`
    this.actionsEl.querySelector(`#${el.id}`)!.append(eventDetails)
  }

  async postActions() {
    this.stopRecording()

    const res = await fetch(
      new URL('/store?key=recorder-actions', location.origin), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.actions)
    })

    if (!res.ok) {
      console.warn(res)
    } else {
      this.unsavedActions = false
      this.paintControls()
      console.log('posted')
    }
  }

  async getActions() {
    const res = await fetch(
      new URL('/store?key=recorder-actions', location.origin), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!res.ok) {
      console.warn(res)
    } else {
      const json = await res.json()
      this.actions = json
      this.paintActions()
      this.paintControls()
      this.paintStatus(0)
    }
  }

  async replayServer() {
    await this.getActions()
    this.startReplaying()
  }

  startRecording() {
    if (this.replaying) return

    const ownUISelector = getElementSelector(this.el)

    this.actionsEl.open = false
    this.formEl.classList.add('hidden')
    this.actions.splice(0)
    this.skipped = 0
    this.dirtyActions = true
    this.unsavedActions = true
    handler.recording = true

    this.paintControls()
    this.paintStatus(0)

    let prev: Action | void

    handler.onaction = (action: Action) => {
      if (action.selectors.includes(ownUISelector)) return false

      if (!this.eventTypes.includes(action.event.type)
        || !this.enabledGroups.includes(
          allEvents.find(
            ([, events]) =>
              events.includes(action.event.type as never)
          )![0]
        )
      ) {
        this.skipped++
      } else {
        if (
          !prev
          || action.event.timeStamp !== prev.event.timeStamp
          || action.event.type !== prev.event.type
          || action.selectors.join(':::') !== prev.selectors.join(':::')
          || JSON.stringify(action.event) !== JSON.stringify(prev.event)
        ) {
          this.actions.push(prev = action)
        }
      }

      this.paintStatus(0)
    }
  }

  stopRecording() {
    if (this.replaying) return

    handler.recording = false

    if (this.dirtyActions) {
      this.formEl.classList.remove('hidden')
      this.trimActions()
      this.paintActions()
      this.paintControls()
      this.dirtyActions = false
    }
  }


  trimActions() {
    let last = this.actions.at(-1)

    if (last?.selectors[0] === 'window'
      && last.event.type === 'pointerdown') {
      this.actions.pop()
      while (last = this.actions.at(-1)) {
        if (last.selectors[0] !== 'window'
          || last.event.type !== 'pointermove') {
          break
        }
        this.actions.pop()
      }
    }

    this.paintStatus(0)
  }

  stopReplaying() {
    this.replaying = false
    this.stopRecording()
  }

  async startReplaying(n?: number | null, actions?: Action[]) {
    if (this.replaying) return

    this.stopRecording()
    this.replaying = true
    this.actionsEl.open = false
    this.formEl.classList.add('hidden')
    this.pointerEl.classList.remove('hidden')

    this.paintControls()

    actions ??= this.actions

    const play = async () => {
      console.log('start of replay')
      console.time('replay time')

      this.statusEl.textContent = `${actions!.length} remaining`

      let prevAction: Action | void

      const replayOne = (action: Action) => {
        const ctor = EventConstructorsMap[action.event.is] as any

        if (!ctor) {
          console.warn('Missing Event constructor for: ' + action.event.is)
          return
        }

        const dispatchOptions = pick(
          action.event,
          mutable(dispatchProps)
        )

        const event: PointerEvent = Object.defineProperties(
          new ctor(action.event.type, { view: window, ...dispatchOptions }),
          copyEvent(action.event)
        )

        requestAnimationFrame(() => {
          this.pointerEl.style.left = event.pageX + 'px'
          this.pointerEl.style.top = event.pageY + 'px'
        })

        if (action.selectors) {
          const el = selectorsToNode(action.selectors)
          if (el) {
            el.dispatchEvent(event)
          } else {
            console.warn('Missing node for selectors:', action.selectors)
          }
        }
      }

      if (n == null) {
        this.skipped = 0
        this.replayed = 0

        actions: for (const [i, action] of actions!.entries()) {
          if (!this.replaying) break

          if (prevAction) {
            const dt = action.event.timeStamp - prevAction.event.timeStamp

            // if next event is bigger than 2/3 of a frame then wait
            if (dt > FRAME_TIME * (2 / 3)) {
              // if less than 2+(1/2) frames, wait one frame
              if (dt < FRAME_TIME * (2 + (1 / 2))) {
                await new Promise((resolve) => requestAnimationFrame(resolve)
                )
              } else {
                // wait until its time minus 1.5ms for our init time
                await new Promise((resolve) => setTimeout(resolve, dt - 1.5)
                )
              }
            }
          }

          // this selector is window and tangent event is the same event,
          // then it's a .capture so we skip and let it propagate normally.
          const nextAction = actions!.at(i + 1)

          for (const tangentAction of action.event.capture ? [nextAction] : [prevAction]) {
            if (tangentAction?.event.type === action.event.type
              && tangentAction.event.timeStamp === action.event.timeStamp) {
              this.skipped++
              requestAnimationFrame(() => {
                this.actionsEl.querySelector(`#action${i}`)?.classList.add('recorder-ui-event-skipped')
                this.paintStatus(1)
              })
              continue actions
            }
          }

          replayOne(action)
          prevAction = action

          this.replayed++
          this.paintStatus(1)
        }
      } else {
        replayOne(actions![n])
      }

      console.log('end of replay')
      console.timeEnd('replay time')
    }

    do {
      await play()
    } while (this.replaying && localStorage.recorderLoop === 'true')

    this.replaying = false
    this.formEl.classList.remove('hidden')
    this.pointerEl.classList.add('hidden')
    this.paintControls()
  }
}



<h1>
dom-recorder <a href="https://npmjs.org/package/dom-recorder"><img src="https://img.shields.io/badge/npm-v1.1.0-F00.svg?colorA=000"/></a> <a href="src"><img src="https://img.shields.io/badge/loc-783-FFF.svg?colorA=000"/></a> <a href="https://cdn.jsdelivr.net/npm/dom-recorder@1.1.0/dist/dom-recorder.min.js"><img src="https://img.shields.io/badge/brotli-4.9K-333.svg?colorA=000"/></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F0B.svg?colorA=000"/></a>
</h1>

<p></p>

Record and replay DOM interactions for e2e frontend testing.

<h4>
<table><tr><td title="Triple click to select and copy paste">
<code>npm i dom-recorder </code>
</td><td title="Triple click to select and copy paste">
<code>pnpm add dom-recorder </code>
</td><td title="Triple click to select and copy paste">
<code>yarn add dom-recorder</code>
</td></tr></table>
</h4>

## Examples

<details id="example$web" title="web" open><summary><span><a href="#example$web">#</a></span>  <code><strong>web</strong></code></summary>  <ul>  <p><a href="https://stagas.github.io/dom-recorder/example/web.html"><strong>Try it live</strong></a></p>  <details id="source$web" title="web source code" ><summary><span><a href="#source$web">#</a></span>  <code><strong>view source</strong></code></summary>  <a href="example/web.ts">example/web.ts</a>  <p>

```ts
import { DOMRecorder } from 'dom-recorder'

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
```

</p>
</details></ul></details>


```ts
import { DOMRecorder } from 'dom-recorder'

declare const window: any

window.recorder = new DOMRecorder()
document.body.appendChild(window.recorder.el)
```

Server endpoints to implement are:

### `/store?key=recorder-actions`

| Method | Content-Type     |
|--------|------------------|
| POST   | application/json |
| GET    | application/json |




## API

<p>  <details id="DOMRecorder$9" title="Class" ><summary><span><a href="#DOMRecorder$9">#</a></span>  <code><strong>DOMRecorder</strong></code>    </summary>  <a href=""></a>  <ul>        <p>  <details id="constructor$10" title="Constructor" ><summary><span><a href="#constructor$10">#</a></span>  <code><strong>constructor</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>  <details id="new DOMRecorder$11" title="ConstructorSignature" ><summary><span><a href="#new DOMRecorder$11">#</a></span>  <code><strong>new DOMRecorder</strong></code><em>()</em>    </summary>    <ul><p><a href="#DOMRecorder$9">DOMRecorder</a></p>        </ul></details></p>    </ul></details><details id="actions$12" title="Property" ><summary><span><a href="#actions$12">#</a></span>  <code><strong>actions</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>...</code></span>  </summary>  <a href=""></a>  <ul><p><a href="#Action$5">Action</a>  []</p>        </ul></details><details id="actionsEl$19" title="Property" ><summary><span><a href="#actionsEl$19">#</a></span>  <code><strong>actionsEl</strong></code>    </summary>  <a href=""></a>  <ul><p><span>HTMLDetailsElement</span></p>        </ul></details><details id="autoplay$23" title="Property" ><summary><span><a href="#autoplay$23">#</a></span>  <code><strong>autoplay</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>  </summary>  <a href=""></a>  <ul><p>boolean</p>        </ul></details><details id="controlsEl$16" title="Property" ><summary><span><a href="#controlsEl$16">#</a></span>  <code><strong>controlsEl</strong></code>    </summary>  <a href=""></a>  <ul><p><span>HTMLDivElement</span></p>        </ul></details><details id="dirtyActions$27" title="Property" ><summary><span><a href="#dirtyActions$27">#</a></span>  <code><strong>dirtyActions</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>  </summary>  <a href=""></a>  <ul><p>boolean</p>        </ul></details><details id="el$15" title="Property" ><summary><span><a href="#el$15">#</a></span>  <code><strong>el</strong></code>    </summary>  <a href=""></a>  <ul><p><span>HTMLDivElement</span></p>        </ul></details><details id="enabledGroups$14" title="Property" ><summary><span><a href="#enabledGroups$14">#</a></span>  <code><strong>enabledGroups</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>...</code></span>  </summary>  <a href=""></a>  <ul><p>string  []</p>        </ul></details><details id="eventTypes$13" title="Property" ><summary><span><a href="#eventTypes$13">#</a></span>  <code><strong>eventTypes</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>...</code></span>  </summary>  <a href=""></a>  <ul><p>string  []</p>        </ul></details><details id="events$20" title="Property" ><summary><span><a href="#events$20">#</a></span>  <code><strong>events</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>''</code></span>  </summary>  <a href=""></a>  <ul><p>string</p>        </ul></details><details id="formEl$21" title="Property" ><summary><span><a href="#formEl$21">#</a></span>  <code><strong>formEl</strong></code>    </summary>  <a href=""></a>  <ul><p><span>HTMLFormElement</span></p>        </ul></details><details id="pointerEl$22" title="Property" ><summary><span><a href="#pointerEl$22">#</a></span>  <code><strong>pointerEl</strong></code>    </summary>  <a href=""></a>  <ul><p><span>HTMLDivElement</span></p>        </ul></details><details id="replayed$25" title="Property" ><summary><span><a href="#replayed$25">#</a></span>  <code><strong>replayed</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>0</code></span>  </summary>  <a href=""></a>  <ul><p>number</p>        </ul></details><details id="replaying$26" title="Property" ><summary><span><a href="#replaying$26">#</a></span>  <code><strong>replaying</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>  </summary>  <a href=""></a>  <ul><p>boolean</p>        </ul></details><details id="skipped$24" title="Property" ><summary><span><a href="#skipped$24">#</a></span>  <code><strong>skipped</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>0</code></span>  </summary>  <a href=""></a>  <ul><p>number</p>        </ul></details><details id="status$18" title="Property" ><summary><span><a href="#status$18">#</a></span>  <code><strong>status</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>''</code></span>  </summary>  <a href=""></a>  <ul><p>string</p>        </ul></details><details id="statusEl$17" title="Property" ><summary><span><a href="#statusEl$17">#</a></span>  <code><strong>statusEl</strong></code>    </summary>  <a href=""></a>  <ul><p><span>HTMLElement</span></p>        </ul></details><details id="unsavedActions$28" title="Property" ><summary><span><a href="#unsavedActions$28">#</a></span>  <code><strong>unsavedActions</strong></code>  <span><span>&nbsp;=&nbsp;</span>  <code>false</code></span>  </summary>  <a href=""></a>  <ul><p>boolean</p>        </ul></details><details id="deselectAll$55" title="Method" ><summary><span><a href="#deselectAll$55">#</a></span>  <code><strong>deselectAll</strong></code><em>(group)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="group$57" title="Parameter" ><summary><span><a href="#group$57">#</a></span>  <code><strong>group</strong></code>    </summary>    <ul><p>string</p>        </ul></details>  <p><strong>deselectAll</strong><em>(group)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="getActions$63" title="Method" ><summary><span><a href="#getActions$63">#</a></span>  <code><strong>getActions</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>getActions</strong><em>()</em>  &nbsp;=&gt;  <ul><span>Promise</span>&lt;void&gt;</ul></p></p>    </ul></details><details id="getFormData$49" title="Method" ><summary><span><a href="#getFormData$49">#</a></span>  <code><strong>getFormData</strong></code><em>(form)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="form$51" title="Parameter" ><summary><span><a href="#form$51">#</a></span>  <code><strong>form</strong></code>    </summary>    <ul><p><span>HTMLFormElement</span></p>        </ul></details>  <p><strong>getFormData</strong><em>(form)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="maybeAutoplay$47" title="Method" ><summary><span><a href="#maybeAutoplay$47">#</a></span>  <code><strong>maybeAutoplay</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>maybeAutoplay</strong><em>()</em>  &nbsp;=&gt;  <ul><span>Promise</span>&lt;void&gt;</ul></p></p>    </ul></details><details id="onBeforeUnload$29" title="Method" ><summary><span><a href="#onBeforeUnload$29">#</a></span>  <code><strong>onBeforeUnload</strong></code><em>(event)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="event$31" title="Parameter" ><summary><span><a href="#event$31">#</a></span>  <code><strong>event</strong></code>    </summary>    <ul><p><span>BeforeUnloadEvent</span></p>        </ul></details>  <p><strong>onBeforeUnload</strong><em>(event)</em>  &nbsp;=&gt;  <ul>undefined | <code>"There are unsaved actions, are you sure you want to exit?"</code></ul></p></p>    </ul></details><details id="paintActions$40" title="Method" ><summary><span><a href="#paintActions$40">#</a></span>  <code><strong>paintActions</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>paintActions</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="paintControls$36" title="Method" ><summary><span><a href="#paintControls$36">#</a></span>  <code><strong>paintControls</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>paintControls</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="paintEl$34" title="Method" ><summary><span><a href="#paintEl$34">#</a></span>  <code><strong>paintEl</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>paintEl</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="paintForm$38" title="Method" ><summary><span><a href="#paintForm$38">#</a></span>  <code><strong>paintForm</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>paintForm</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="paintStatus$42" title="Method" ><summary><span><a href="#paintStatus$42">#</a></span>  <code><strong>paintStatus</strong></code><em>(kind)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="kind$44" title="Parameter" ><summary><span><a href="#kind$44">#</a></span>  <code><strong>kind</strong></code>    </summary>    <ul><p>number</p>        </ul></details>  <p><strong>paintStatus</strong><em>(kind)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="postActions$61" title="Method" ><summary><span><a href="#postActions$61">#</a></span>  <code><strong>postActions</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>postActions</strong><em>()</em>  &nbsp;=&gt;  <ul><span>Promise</span>&lt;void&gt;</ul></p></p>    </ul></details><details id="render$32" title="Method" ><summary><span><a href="#render$32">#</a></span>  <code><strong>render</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>render</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="replayServer$65" title="Method" ><summary><span><a href="#replayServer$65">#</a></span>  <code><strong>replayServer</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>replayServer</strong><em>()</em>  &nbsp;=&gt;  <ul><span>Promise</span>&lt;void&gt;</ul></p></p>    </ul></details><details id="selectAll$52" title="Method" ><summary><span><a href="#selectAll$52">#</a></span>  <code><strong>selectAll</strong></code><em>(group)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="group$54" title="Parameter" ><summary><span><a href="#group$54">#</a></span>  <code><strong>group</strong></code>    </summary>    <ul><p>string</p>        </ul></details>  <p><strong>selectAll</strong><em>(group)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="showDetails$58" title="Method" ><summary><span><a href="#showDetails$58">#</a></span>  <code><strong>showDetails</strong></code><em>(el)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="el$60" title="Parameter" ><summary><span><a href="#el$60">#</a></span>  <code><strong>el</strong></code>    </summary>    <ul><p><span>HTMLDivElement</span></p>        </ul></details>  <p><strong>showDetails</strong><em>(el)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="startRecording$67" title="Method" ><summary><span><a href="#startRecording$67">#</a></span>  <code><strong>startRecording</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>startRecording</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="startReplaying$75" title="Method" ><summary><span><a href="#startReplaying$75">#</a></span>  <code><strong>startReplaying</strong></code><em>(n, actions)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="n$77" title="Parameter" ><summary><span><a href="#n$77">#</a></span>  <code><strong>n</strong></code>    </summary>    <ul><p><code>null</code> | number</p>        </ul></details><details id="actions$78" title="Parameter" ><summary><span><a href="#actions$78">#</a></span>  <code><strong>actions</strong></code>    </summary>    <ul><p><a href="#Action$5">Action</a>  []</p>        </ul></details>  <p><strong>startReplaying</strong><em>(n, actions)</em>  &nbsp;=&gt;  <ul><span>Promise</span>&lt;void&gt;</ul></p></p>    </ul></details><details id="stopRecording$69" title="Method" ><summary><span><a href="#stopRecording$69">#</a></span>  <code><strong>stopRecording</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>stopRecording</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="stopReplaying$73" title="Method" ><summary><span><a href="#stopReplaying$73">#</a></span>  <code><strong>stopReplaying</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>stopReplaying</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="trimActions$71" title="Method" ><summary><span><a href="#trimActions$71">#</a></span>  <code><strong>trimActions</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>trimActions</strong><em>()</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="waitUntilIdle$45" title="Method" ><summary><span><a href="#waitUntilIdle$45">#</a></span>  <code><strong>waitUntilIdle</strong></code><em>()</em>    </summary>  <a href=""></a>  <ul>    <p>      <p><strong>waitUntilIdle</strong><em>()</em>  &nbsp;=&gt;  <ul><span>Promise</span>&lt;void&gt;</ul></p></p>    </ul></details></p></ul></details><details id="Action$5" title="Interface" ><summary><span><a href="#Action$5">#</a></span>  <code><strong>Action</strong></code>    </summary>  <a href=""></a>  <ul>        <p>  <details id="event$7" title="Property" ><summary><span><a href="#event$7">#</a></span>  <code><strong>event</strong></code>    </summary>  <a href=""></a>  <ul><p><a href="#SavedEvent$1">SavedEvent</a></p>        </ul></details><details id="selectors$6" title="Property" ><summary><span><a href="#selectors$6">#</a></span>  <code><strong>selectors</strong></code>    </summary>  <a href=""></a>  <ul><p>string  []</p>        </ul></details></p></ul></details><details id="Events$8" title="TypeAlias" ><summary><span><a href="#Events$8">#</a></span>  <code><strong>Events</strong></code>    </summary>  <a href=""></a>  <ul><p><span>InputEvent</span> &amp; <span>KeyboardEvent</span> &amp; <span>MouseEvent</span> &amp; <span>PointerEvent</span> &amp; <span>WheelEvent</span></p>        </ul></details><details id="SavedEvent$1" title="TypeAlias" ><summary><span><a href="#SavedEvent$1">#</a></span>  <code><strong>SavedEvent</strong></code>    </summary>  <a href=""></a>  <ul><p><a href="#Events$8">Events</a> &amp; {<p>  <details id="capture$4" title="Property" ><summary><span><a href="#capture$4">#</a></span>  <code><strong>capture</strong></code>    </summary>  <a href=""></a>  <ul><p>boolean | undefined</p>        </ul></details><details id="is$3" title="Property" ><summary><span><a href="#is$3">#</a></span>  <code><strong>is</strong></code>    </summary>  <a href=""></a>  <ul><p><span>StringKeys</span>&lt;typeof   <span>EventConstructorsMap</span>&gt;</p>        </ul></details></p>}</p>        </ul></details></p>

## Credits
- [everyday-types](https://npmjs.org/package/everyday-types) by [stagas](https://github.com/stagas) &ndash; Everyday utility types
- [everyday-utils](https://npmjs.org/package/everyday-utils) by [stagas](https://github.com/stagas) &ndash; Everyday utilities

## Contributing

[Fork](https://github.com/stagas/dom-recorder/fork) or [edit](https://github.dev/stagas/dom-recorder) and submit a PR.

All contributions are welcome!

## License

<a href="LICENSE">MIT</a> &copy; 2022 [stagas](https://github.com/stagas)

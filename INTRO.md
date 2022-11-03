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

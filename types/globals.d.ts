/* when needed to enable jsx */

// declare namespace JSX {
//   declare interface IntrinsicElements {
//     [k: string]: any
//   }
// }

declare class MIDIMessageEvent extends Event implements WebMidi.MIDIMessageEvent {
  data: Uint8Array
  receivedTime: number
  constructor(kind: string, payload?: { data: Uint8Array })
}

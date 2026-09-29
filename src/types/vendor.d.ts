declare module 'fengari-web' {
  export const lua: any
  export const lauxlib: any
  export const lualib: any
  export const to_jsstring: any
}

declare module 'howler' {
  export class Howl {
    constructor(options: any)
    play(): any
    state(): string
  }
}

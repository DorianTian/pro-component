/** Vite worker import suffix — resolved at build time */
declare module '*?worker' {
  const workerConstructor: new () => Worker
  export default workerConstructor
}

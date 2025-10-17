import moment from 'moment'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$moment = moment
})

declare module '#app' {
  interface NuxtApp {
    $moment: typeof moment
  }
}
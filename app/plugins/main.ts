import moment from "moment";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$moment = moment;
});
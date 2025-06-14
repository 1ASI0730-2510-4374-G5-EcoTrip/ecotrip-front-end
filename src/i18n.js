import {createI18n} from "vue-i18n";
import en from "./Locale/en.json"
import es from "./Locale/es.json"

const i18n = createI18n({
    legacy: false, // Set to false to enable Composition API mode
    globalInjection: true, // Enables global injection of $t
    locale: 'en',
    fallbackLocale: 'en',
    messages: {en,es}
})

export default i18n;
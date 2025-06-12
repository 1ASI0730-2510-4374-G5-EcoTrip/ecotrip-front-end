import {createI18n} from "vue-i18n";
import en from "./Locale/en.json"
import es from "./Locale/es.json"

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {en,es}
})

export default i18n;
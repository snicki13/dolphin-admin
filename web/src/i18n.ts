import { createI18n } from 'vue-i18n'

import de_DE from '@/locales/de_DE.json'
import en_US from '@/locales/en_US.json'
import type { Lang, MessageSchema } from '@/types'

const i18n = createI18n<[MessageSchema], Lang>({
  legacy: false,
  locale: LangUtils.getDefaultLang(),
  fallbackLocale: 'en_US',
  globalInjection: true,
  messages: {
    en_US,
    de_DE
  }
})

export default i18n

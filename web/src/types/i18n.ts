import type enUS from '@/locales/en_US.json'

export type Lang = 'de_DE' | 'en_US'

export type MessageSchema = typeof enUS

type Concat<K extends string, V extends string> = `${K}.${V}`

type Flatten<T, K extends string = ''> = T extends Record<string, any>
  ? {
      [P in keyof T]: Flatten<T[P], K extends '' ? P : Concat<K, P & string>>
    }[keyof T]
  : K

export type MessageKeySchema = Flatten<MessageSchema>

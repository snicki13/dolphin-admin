<script setup lang="ts">
import type { Lang, MessageSchema } from '@/types'

import { EnglishLyrics } from './private'

const { t, locale } = useI18n<{ message: MessageSchema }, Lang>({
  useScope: 'global'
})

const message = useMessage()

const clipboardValue = ref('')

/**
 * Copy
 */
const handleCopy = async () => {
  try {
    await BrowserUtils.setClipBoardText(clipboardValue.value)
    message.success(t('Message.Copy.Success'))
  } catch {
    message.error(t('Message.Copy.Failed'))
  }
}

// Change the language of the listening language, give silent recognition
watch(
  () => locale.value,
  () => {
    switch (locale.value) {
      case 'de_DE':
        clipboardValue.value = EnglishLyrics
        break
      case 'en_US':
        clipboardValue.value = EnglishLyrics
        break
      default:
        break
    }
  },
  { immediate: true }
)
</script>

<template>
  <main class="absolute inset-0 flex">
    <NCard
      class="flex w-full flex-col space-y-2"
      hoverable
    >
      <NInput
        v-model:value="clipboardValue"
        class="h-[calc(100%-46px)]"
        type="textarea"
        show-count
        clearable
        hoverable
      />
      <div class="flex items-center justify-center">
        <NButton
          type="primary"
          class="!mt-3"
          @click="handleCopy"
        >
          {{ t('Common.Copy') }}
        </NButton>
      </div>
    </NCard>
  </main>
</template>

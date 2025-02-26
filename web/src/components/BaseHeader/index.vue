<script setup lang="ts">
import type { Lang, MessageSchema } from '@/types'
import UserAvatarIcon from '~icons/carbon/user-avatar-filled-alt'
import NotificationIcon from '~icons/ic/baseline-notifications-none'
import SettingIcon from '~icons/ic/outline-settings'
import FullScreenIcon from '~icons/ic/round-fullscreen'
import ExitFullscreenIcon from '~icons/ic/round-fullscreen-exit'
import LanguageIcon from '~icons/ion/language-outline'
import DiscordIcon from '~icons/line-md/discord'
import DocsIcon from '~icons/line-md/document-list'
import GithubIcon from '~icons/line-md/github-loop'
import HideMenuIcon from '~icons/line-md/menu-fold-left'
import ShowMenuIcon from '~icons/line-md/menu-fold-right'
import SunIcon from '~icons/line-md/moon-alt-to-sunny-outline-loop-transition'
import MoonIcon from '~icons/line-md/sunny-filled-loop-to-moon-alt-filled-loop-transition'

import type { UserOptionKey } from './private'
import { languageOptions, userOptions } from './private'

const { t, locale } = useI18n<{ message: MessageSchema }, Lang>({
  useScope: 'global'
})

const { repoGitHubURL, discordURL, docsURL } = siteMetaData

const { openNewWindow } = BrowserUtils

const themeStore = useThemeStore()
const sidebarStore = useSidebarStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const message = useMessage()
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const languages = ref(languageOptions)

/**
 * 重置语言选项，当前语言不可选
 */
const resetLanguageOptions = (lang: Lang) =>
  setTimeout(() => {
    languages.value.forEach((language) => {
      const currentLanguage = language
      currentLanguage.disabled = currentLanguage.key === lang
    })
  }, 150)

/**
 * 更新语言
 * @param lang 语言
 * @description
 * - 为了更好的用户体验（因为下拉框选项消失的过渡动画），这里延迟 150ms 执行更新语言的操作
 * - 更新 Document 的标题
 * - 将选择的语言存储到 localStorage 中，以便下次进入应用时加载上次选择的语言
 */
const handleUpdateLocale = (lang: Lang) => {
  resetLanguageOptions(lang)
  locale.value = lang
  themeStore.changeLocale(lang)
  SiteUtils.setDocumentTitle(route.meta.title)
  LangUtils.setLang(lang)
}

/**
 * 退出登录
 */
const logout = () =>
  router.replace('/login').then(() => {
    message.success(t('Logout.Success'))
    userStore.clearUser()
    AuthUtils.clearToken()
  })

/**
 * 选择用户下拉框选项
 * @param key 选项的 key
 */
const selectUserOption = (key: UserOptionKey) => {
  switch (key) {
    case 'Lock':
      break
    case 'Quit':
      logout()
      break
    case 'UserInfo':
      router.push('/user-info')
      break
    case 'ChangePassword':
      router.push('/change-password')
      break
    default:
      break
  }
}

onMounted(() => {
  resetLanguageOptions(locale.value)
})
</script>

<template>
  <header
    class="bg-default-light dark:bg-default-dark sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-300 p-2 dark:border-gray-950 sm:p-4"
  >
    <div class="flex h-full items-center justify-start space-x-3">
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NIcon
            class="cursor-pointer"
            size="20"
            :component="sidebarStore.isDisplay ? HideMenuIcon : ShowMenuIcon"
            @click="sidebarStore.toggleSidebarDisplay"
          />
        </template>
        {{ sidebarStore.isDisplay ? t('Sidebar.Hide') : t('Sidebar.Show') }}
      </NTooltip>

      <BaseBreadcrumb />
    </div>

    <div class="flex h-full items-center justify-end space-x-4">
      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NIcon
            class="cursor-pointer"
            size="20"
            color="#5865F2"
            :component="DiscordIcon"
            @click="openNewWindow(discordURL)"
          />
        </template>
        Discord
      </NTooltip>

      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NIcon
            class="cursor-pointer"
            size="20"
            :component="GithubIcon"
            @click="openNewWindow(repoGitHubURL)"
          />
        </template>
        GitHub
      </NTooltip>

      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NIcon
            class="cursor-pointer"
            size="20"
            :component="DocsIcon"
            @click="openNewWindow(docsURL)"
          />
        </template>
        {{ t('Common.Docs') }}
      </NTooltip>

      <template v-if="false">
        <NTooltip
          placement="bottom"
          trigger="hover"
        >
          <template #trigger>
            <NIcon
              class="cursor-pointer"
              size="20"
              :component="NotificationIcon"
            />
          </template>
          {{ t('Header.Notification') }}
        </NTooltip>
      </template>

      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NIcon
            class="hidden cursor-pointer sm:block"
            size="24"
            :component="isFullscreen ? ExitFullscreenIcon : FullScreenIcon"
            @click="toggleFullscreen"
          />
        </template>
        {{ t(isFullscreen ? 'Header.ExitFullScreen' : 'Header.FullScreen') }}
      </NTooltip>

      <NDropdown
        trigger="hover"
        :options="languages"
        @select="handleUpdateLocale"
      >
        <NIcon
          class="cursor-pointer"
          size="20"
          :component="LanguageIcon"
        />
      </NDropdown>

      <NTooltip
        placement="bottom"
        trigger="hover"
      >
        <template #trigger>
          <NIcon
            class="cursor-pointer"
            size="20"
            :color="themeStore.themeMode === 'light' ? '#FDC022' : '#FED736'"
            :component="themeStore.themeMode === 'light' ? SunIcon : MoonIcon"
            @click="
              themeStore.changeThemeMode(
                themeStore.themeMode === 'light' ? 'dark' : 'light'
              )
            "
          />
        </template>
        {{ t('Header.SwitchTheme') }}
      </NTooltip>

      <template v-if="false">
        <NTooltip
          placement="bottom"
          trigger="hover"
        >
          <template #trigger>
            <NIcon
              class="cursor-pointer"
              size="20"
              :component="SettingIcon"
            />
          </template>
          {{ t('Header.Settings') }}
        </NTooltip>
      </template>

      <template v-if="userStore.hasData()">
        <NDropdown
          trigger="hover"
          :options="userOptions"
          @select="selectUserOption"
        >
          <template v-if="userStore.user.avatarUrl">
            <NAvatar
              class="cursor-pointer select-none shadow-md !transition-all hover:opacity-90 active:opacity-70"
              round
              size="small"
              :src="userStore.user.avatarUrl"
            />
          </template>
          <template v-else>
            <NIcon
              class="cursor-pointer"
              size="22"
              :component="UserAvatarIcon"
            />
          </template>
        </NDropdown>
      </template>
    </div>
  </header>
</template>

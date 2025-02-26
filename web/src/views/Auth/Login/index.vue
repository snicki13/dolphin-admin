<script setup lang="ts">
import type { MessageSchema } from '@/types'

import { GitHubLogin, GoogleLogin } from './components'
import type { RememberedAccountData } from './private'

const { t } = useI18n<{ message: MessageSchema }>({ useScope: 'global' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const [submitLoading, submitLoadingDispatcher] = useLoading(false)

const submitType = ref<'BASIC' | 'ADMIN'>('BASIC')

const formData = reactive({
  username: '',
  password: ''
})
const formRef = ref<FormInst | null>(null)
const rememberPassword = ref(false)

const redirectUrl = computed(() => route.query.redirect as string)

const rules: FormRules = {
  username: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('Validation.Username'),
      renderMessage: () => t('Validation.Username')
    }
  ],
  password: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('Validation.Password'),
      renderMessage: () => t('Validation.Password')
    },
    {
      validator: (_: FormItemRule, value: string) => value.length >= 6,
      trigger: ['blur', 'input'],
      message: () => t('Validation.PasswordLength'),
      renderMessage: () => t('Validation.PasswordLength')
    }
  ]
}

/**
 * Log in
 */
const login = async () => {
  try {
    await formRef.value!.validate()
  } catch (errors) {
    const errorMessage = (errors as FormValidationError[])[0][0].message
    if (errorMessage) {
      message.error(errorMessage)
    }
    return
  }

  if (submitLoading.value) {
    return
  }

  submitLoadingDispatcher.loading()

  AuthAPI.login(formData)
    .then((res) => {
      const { accessToken, user } = res.data || {}
      AuthUtils.setToken(accessToken)
      userStore.setUser(user)
      if (res.message) {
        message.success(res.message)
      }
      if (rememberPassword.value) {
        AuthUtils.setRememberedAccount(JSON.stringify(formData))
      } else {
        AuthUtils.clearRememberedAccount()
      }

      if (redirectUrl.value) {
        router.replace(redirectUrl.value)
      } else {
        router.replace('/')
      }
    })
    .catch((err) => {
      if (err.message) {
        message.error(err.message)
      }
      submitLoadingDispatcher.loaded()
      formData.password = ''
    })
}

/**
 * Basic login
 */
const loginAsBasic = () => {
  submitType.value = 'BASIC'
  login()
}

/**
 * Log in as an administrator
 */
const loginAsAdmin = () => {
  submitType.value = 'ADMIN'
  formData.username = AuthUtils.DEFAULT_ADMIN_USERNAME
  formData.password = AuthUtils.DEFAULT_PASSWORD
  login()
}

/**
 * forget the password
 */
const forgetPassword = () => {}

onMounted(() => {
  // from localStorage Get the account password to be remembered
  const localStorageData = AuthUtils.getRememberedAccount()
  if (localStorageData) {
    try {
      const { username, password } = JSON.parse(
        localStorageData
      ) as RememberedAccountData
      formData.username = username
      formData.password = password
      rememberPassword.value = true
    } catch {
      //
    }
  }
})
</script>

<template>
  <NForm
    ref="formRef"
    :rules="rules"
    :model="formData"
    class="bg-default-light dark:bg-default-dark absolute inset-0 m-auto flex h-fit w-[340px] max-w-[85%] flex-col space-y-4 rounded-lg px-4 py-8 shadow-md transition-colors sm:w-[260px] md:w-[340px]"
  >
    <div class="select-none text-center text-lg font-semibold">
      {{ t('Menu.Login') }}
    </div>

    <NFormItem
      path="username"
      :show-label="false"
      :show-feedback="false"
    >
      <NInput
        v-model:value="formData.username"
        type="text"
        :placeholder="t('User.Username')"
        :input-props="{ autocomplete: 'username' }"
        @keyup.enter="loginAsBasic"
      />
    </NFormItem>

    <NFormItem
      path="password"
      :show-label="false"
      :show-feedback="false"
    >
      <NInput
        v-model:value="formData.password"
        type="password"
        show-password-on="click"
        :placeholder="t('User.Password')"
        :maxlength="16"
        :input-props="{ autocomplete: 'current-password' }"
        @keyup.enter="loginAsBasic"
      />
    </NFormItem>

    <div
      class="text-grey-300 flex items-center justify-between text-xs font-light"
    >
      <NCheckbox
        v-model:checked="rememberPassword"
        size="small"
        class="!text-xs"
      >
        {{ t('Common.RememberPassword') }}
      </NCheckbox>
      <div
        v-if="false"
        class="cursor-pointer hover:text-blue-600"
        @click="forgetPassword"
      >
        {{ t('Common.ForgetPassword') }}
      </div>
    </div>

    <div class="flex w-full flex-1 items-center space-x-2">
      <NButton
        class="!w-[calc(50%-4px)]"
        type="primary"
        :disabled="submitLoading"
        :loading="submitType === 'BASIC' && submitLoading"
        @click="loginAsBasic"
      >
        {{ t('Menu.Login') }}
      </NButton>
      <NButton
        class="!w-[calc(50%-4px)]"
        secondary
        type="primary"
        :disabled="submitLoading"
        :loading="submitType === 'ADMIN' && submitLoading"
        @click="loginAsAdmin"
      >
        {{ t('Login.AsAdmin') }}
      </NButton>
    </div>

    <div class="flex items-center space-x-1 text-xs">
      <span>{{ t('Login.NeedAccount') }}</span>
      <NButton
        type="primary"
        text
        @click="() => router.push('/signup')"
      >
        <span class="text-xs font-semibold underline-offset-4 hover:underline">
          {{ t('Menu.Signup') }}
        </span>
      </NButton>
    </div>

    <NDivider>
      <span class="text-xs">{{ t('Login.ThirdPartyLogin') }}</span>
    </NDivider>

    <div class="flex flex-col space-y-2">
      <GitHubLogin />
      <GoogleLogin />
    </div>
  </NForm>
</template>

<style scoped lang="scss">
:deep(.n-checkbox__label) {
  padding: 0 6px;
}
</style>

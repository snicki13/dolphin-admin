<script setup lang="ts">
import type { MessageSchema, User } from '@/types'
import UserAvatarIcon from '~icons/carbon/user-avatar-filled-alt'
import NameIcon from '~icons/mdi/account-outline'
import BirthDateIcon from '~icons/mdi/bookmark-minus-outline'
import EmailIcon from '~icons/mdi/email-outline'
import FemaleIcon from '~icons/mdi/gender-female'
import MaleIcon from '~icons/mdi/gender-male'
import PhoneIcon from '~icons/mdi/phone'
import AddressIcon from '~icons/mdi/store-plus-outline'

const { t } = useI18n<{ message: MessageSchema }>({ useScope: 'global' })

const userStore = useUserStore()
const message = useMessage()
const [submitLoading, submitLoadingDispatcher] = useLoading()

const formRef = ref<FormInst | null>(null)
const uploadRef = ref<UploadInst | null>(null)
const formData = ref<Partial<User>>({})
const currentFile = ref<File | null>(null)

const rules: FormRules = {
  name: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('Validation.Name'),
      renderMessage: () => t('Validation.Name')
    }
  ],
  firstName: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('Validation.FirstName'),
      renderMessage: () => t('Validation.FirstName')
    }
  ],
  lastName: [
    {
      required: true,
      trigger: ['blur', 'input'],
      message: () => t('Validation.LastName'),
      renderMessage: () => t('Validation.LastName')
    }
  ],
  email: [
    {
      required: true,
      trigger: ['blur', 'change'],
      message: () => t('Validation.Email'),
      renderMessage: () => t('Validation.Email')
    },
    {
      pattern: /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
      trigger: ['input', 'blur'],
      message: () => t('Validation.EmailFormat'),
      renderMessage: () => t('Validation.EmailFormat')
    }
  ],
  phoneNumber: [
    {
      pattern: /^[1][3456789]\d{9}$/,
      trigger: ['input', 'blur'],
      message: () => t('Validation.PhoneNumberFormat'),
      renderMessage: () => t('Validation.PhoneNumberFormat')
    }
  ]
}
const computedUserInfo = computed(() => userStore.user)

const handleValidateButtonClick = () => {
  formRef.value!.validate(async (errors) => {
    if (errors) {
      message.error(errors[0][0].message!)
      return
    }
    if (submitLoading.value) {
      return
    }
    submitLoadingDispatcher.loading()

    uploadRef.value!.submit()
    if (currentFile.value) {
      try {
        const { data, message: resMessage } = await UploadAPI.uploadFile({
          file: currentFile.value
        })
        formData.value.avatarUrl = data.path
        if (resMessage) {
          message.success(resMessage)
        }
      } catch (err) {
        if (err instanceof Error && err.message) {
          message.error(err.message)
        }
        submitLoadingDispatcher.loaded()
        return
      }
    }

    try {
      const { data, message: successMessage } = await UserAPI.updateUser(
        formData.value.id!,
        formData.value
      )
      data.birthDate =
        data.birthDate && TimeUtils.formatTime(data.birthDate, 'YYYY-MM-DD')
      userStore.setUser(data)
      message.success(successMessage!)
    } catch (err: any) {
      if (err.message) {
        message.error(err.message)
      }
    }

    submitLoadingDispatcher.loaded()
  })
}

const uploadAvatarUrl = (options: { fileList: UploadFileInfo[] }) => {
  const [file] = options.fileList
  currentFile.value = file?.file ?? null
}

onMounted(() =>
  UserAPI.getUserInfo().then((res) => {
    const { data } = res
    data.birthDate =
      data.birthDate && TimeUtils.formatTime(data.birthDate, 'YYYY-MM-DD')
    userStore.setUser(data)
    formData.value = data
  })
)
</script>

<template>
  <div
    class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 sm:p-4"
  >
    <NCard class="flex w-full space-y-4 font-medium sm:!w-2/5">
      <div class="flex flex-col items-center space-y-2">
        <template v-if="computedUserInfo?.avatarUrl">
          <NAvatar
            round
            :size="80"
            :src="computedUserInfo?.avatarUrl"
          />
        </template>
        <template v-else>
          <NIcon
            size="80"
            depth="3"
            :component="UserAvatarIcon"
          />
        </template>

        <div class="flex items-center justify-center space-x-1 text-lg">
          <span>{{ computedUserInfo?.username }}</span>
          <template v-if="computedUserInfo?.gender === 1">
            <MaleIcon class="w-[18px] text-blue-300" />
          </template>
          <template v-if="computedUserInfo?.gender === 0">
            <FemaleIcon class="w-[18px] text-pink-300" />
          </template>
        </div>

        <NEllipsis
          class="text-xs"
          :line-clamp="3"
        >
          {{ computedUserInfo?.biography }}
          <template #tooltip>
            <div class="!max-w-[300px]">{{ computedUserInfo?.biography }}</div>
          </template>
        </NEllipsis>
      </div>

      <NDivider class="!my-4">
        <span>{{ t('UserInfo.PersonalInfo') }}</span>
      </NDivider>
      <div class="space-y-4">
        <div class="flex space-x-2">
          <span class="self-center">
            <NameIcon />
          </span>
          <span>{{ computedUserInfo?.name }}</span>
        </div>
        <template v-if="computedUserInfo?.birthDate">
          <div class="flex space-x-2">
            <span class="pt-0.5">
              <BirthDateIcon />
            </span>
            <span>{{ computedUserInfo?.birthDate }}</span>
          </div>
        </template>
        <div class="flex space-x-2">
          <span class="self-center">
            <PhoneIcon />
          </span>
          <span>{{ computedUserInfo?.phoneNumber }}</span>
        </div>
        <div class="flex space-x-2">
          <span class="self-center">
            <EmailIcon />
          </span>
          <span>{{ computedUserInfo?.email }}</span>
        </div>
        <div class="flex space-x-2">
          <div class="shrink-0 pt-0.5">
            <AddressIcon />
          </div>
          <span>{{ computedUserInfo?.address }}</span>
        </div>
      </div>
    </NCard>

    <NCard class="sm:!w-3/5">
      <template #header>
        <div class="space-x-6 border-b pb-1 text-center sm:text-left">
          <span>{{ t('UserInfo.BasicInfo') }}</span>
        </div>
      </template>
      <NForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100"
        require-mark-placement="right-hanging"
      >
        <NFormItem
          path="avatarUrl"
          :label="t('User.Avatar')"
        >
          <NUpload
            ref="uploadRef"
            full-path
            :max="1"
            list-type="image-card"
            :default-upload="false"
            @change="uploadAvatarUrl"
          >
            <template v-if="formData.avatarUrl">
              <NAvatar
                :size="80"
                :src="formData.avatarUrl"
                class="cursor-pointer"
              />
            </template>
            <template v-else>
              <NIcon
                size="88"
                class="cursor-pointer"
                depth="3"
                :component="UserAvatarIcon"
              />
            </template>
          </NUpload>
        </NFormItem>
        <NFormItem
          path="name"
          :label="t('User.Name')"
        >
          <NInput
            v-model:value="formData.name"
            :placeholder="t('Validation.Name')"
            maxlength="20"
            show-count
            clearable
          />
        </NFormItem>
        <NFormItem
          path="firstName"
          :label="t('User.FirstName')"
        >
          <NInput
            v-model:value="formData.firstName"
            maxlength="20"
            show-count
            clearable
            :placeholder="t('Validation.FirstName')"
          />
        </NFormItem>
        <NFormItem
          path="lastName"
          :label="t('User.LastName')"
        >
          <NInput
            v-model:value="formData.lastName"
            maxlength="10"
            show-count
            clearable
            :placeholder="t('Validation.LastName')"
          />
        </NFormItem>
        <NFormItem
          :label="t('User.Email')"
          path="email"
        >
          <NInput
            v-model:value="formData.email"
            maxlength="20"
            show-count
            clearable
            :placeholder="t('Validation.Email')"
          />
        </NFormItem>
        <NFormItem
          path="gender"
          :label="t('User.Gender')"
        >
          <NRadioGroup
            v-model:value="formData.gender"
            :name="t('User.Gender')"
          >
            <NSpace>
              <NRadio :value="1"> {{ t('User.Male') }} </NRadio>
              <NRadio :value="0"> {{ t('User.Female') }} </NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
        <NFormItem
          path="phoneNumber"
          :label="t('User.PhoneNumber')"
        >
          <NInput
            v-model:value="formData.phoneNumber"
            maxlength="20"
            show-count
            clearable
            :placeholder="t('Validation.PhoneNumber')"
          />
        </NFormItem>
        <NFormItem
          path="birthDate"
          :label="t('User.BirthDate')"
        >
          <NDatePicker
            v-model:formatted-value="formData.birthDate"
            class="w-full"
            clearable
          />
        </NFormItem>
        <NFormItem
          path="address"
          :label="t('User.Address')"
        >
          <NInput
            v-model:value="formData.address"
            maxlength="30"
            show-count
            clearable
            :placeholder="t('Validation.Address')"
          />
        </NFormItem>
        <NFormItem
          path="biography"
          :label="t('User.Biography')"
        >
          <NInput
            v-model:value="formData.biography"
            maxlength="300"
            show-count
            clearable
            :placeholder="t('Validation.Biography')"
          />
        </NFormItem>

        <div class="flex justify-center">
          <NButton
            round
            type="primary"
            :loading="submitLoading"
            :disabled="submitLoading"
            @click="handleValidateButtonClick"
          >
            {{ t('Common.Save') }}
          </NButton>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

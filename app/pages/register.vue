<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth'
})

const notify = useNotify()

const slugPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

const schema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters').max(200, 'Shop name is too long'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(63, 'Slug is too long')
    .regex(slugPattern, 'Only lowercase letters, numbers and hyphens allowed'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100)
})

type RegisterSchema = z.output<typeof schema>

const state = reactive<RegisterSchema>({
  shopName: '',
  slug: '',
  email: '',
  password: '',
  firstName: '',
  lastName: ''
})

const isLoading = ref(false)
const slugManuallyEdited = ref(false)

watch(() => state.shopName, (name) => {
  if (!slugManuallyEdited.value) {
    state.slug = toSlug(name)
  }
})

function onSlugInput() {
  slugManuallyEdited.value = true
}

async function onSubmit() {
  isLoading.value = true

  try {
    const response = await $fetch<{ slug: string, adminUrl: string }>('/api/register', {
      method: 'POST',
      body: {
        shopName: state.shopName,
        slug: state.slug,
        email: state.email,
        password: state.password,
        firstName: state.firstName,
        lastName: state.lastName
      }
    })

    notify.success('Your shop has been created!')

    await navigateTo(response.adminUrl, { external: true })
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    notify.error(err.data?.message || 'Registration failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UCard class="w-full max-w-lg">
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold">
          Create your shop
        </h1>
        <p class="text-muted mt-1">
          Set up your online store in seconds
        </p>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="Shop name"
        name="shopName"
      >
        <UInput
          v-model="state.shopName"
          class="w-full"
          placeholder="My Cool Shop"
          icon="i-lucide-store"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField
        label="Shop URL"
        name="slug"
        hint="This will be your subdomain"
      >
        <UInput
          v-model="state.slug"
          class="w-full"
          placeholder="my-cool-shop"
          icon="i-lucide-globe"
          :disabled="isLoading"
          @input="onSlugInput"
        >
          <template #trailing>
            <span class="text-muted text-xs">.example.com</span>
          </template>
        </UInput>
      </UFormField>

      <USeparator />

      <div class="grid grid-cols-2 gap-4">
        <UFormField
          label="First name"
          name="firstName"
        >
          <UInput
            v-model="state.firstName"
            class="w-full"
            placeholder="John"
            icon="i-lucide-user"
            :disabled="isLoading"
          />
        </UFormField>

        <UFormField
          label="Last name"
          name="lastName"
        >
          <UInput
            v-model="state.lastName"
            class="w-full"
            placeholder="Doe"
            :disabled="isLoading"
          />
        </UFormField>
      </div>

      <UFormField
        label="Email"
        name="email"
      >
        <UInput
          v-model="state.email"
          class="w-full"
          type="email"
          placeholder="john@example.com"
          icon="i-lucide-mail"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField
        label="Password"
        name="password"
      >
        <UInput
          v-model="state.password"
          class="w-full"
          type="password"
          placeholder="At least 8 characters"
          icon="i-lucide-lock"
          :disabled="isLoading"
        />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="isLoading"
        :disabled="isLoading"
      >
        Create shop
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm text-muted">
        Already have a shop?
        <span class="text-primary font-medium">Sign in from your admin panel</span>
      </p>
    </template>
  </UCard>
</template>

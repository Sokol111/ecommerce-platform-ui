<script setup lang="ts">
// eslint-disable-next-line vue/multi-word-component-names
defineOptions({ name: 'Breadcrumbs' })
export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <UBreadcrumb
    :items="items"
    class="mb-4"
  >
    <template #item="{ item, active }">
      <span
        class="flex items-center gap-1.5"
        :class="active ? 'font-medium' : 'text-muted hover:text-default transition-colors'"
      >
        <UIcon
          v-if="item.icon"
          :name="item.icon"
          class="h-4 w-4"
        />
        <span>{{ item.label }}</span>
      </span>
    </template>

    <template #separator>
      <UIcon
        name="i-lucide-chevron-right"
        class="h-4 w-4 text-muted"
      />
    </template>
  </UBreadcrumb>
</template>

<script setup lang="ts">
defineProps<{
  enabled: boolean
}>()
</script>

<template>
  <UBadge :color="enabled ? 'success' : 'neutral'">
    {{ enabled ? 'Enabled' : 'Disabled' }}
  </UBadge>
</template>

<script setup>
const props = defineProps({
  dropdownItemsWorkerStaff: Array,
  value: String,
  actionName: String
});
</script>

<template>
  <Select
    id="staff"
    :value="props.value"
    :options="dropdownItemsWorkerStaff"
    filter
    class="w-full"
    @change="(event) => $emit('input', event.value)"
  >
    <template #value>
      <div class="flex items-center h-[25px]">
        <p>{{ props.value }}</p>
      </div>
    </template>

    <template #option="slotProps">
      <div class="flex items-center">
        <div>
          <span>{{ slotProps.option }}</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="p-3 text-[--primary-color]">
        <Button :label="actionName" fluid text size="small" icon="pi pi-plus" @click="$emit('clickToAction')" />
      </div>
    </template>
  </Select>
</template>

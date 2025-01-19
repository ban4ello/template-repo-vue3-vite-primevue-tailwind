<script setup>
const emit = defineEmits(['changeValue']);

const props = defineProps({
  title: {
    type: String,
    default: 'Налоговые начисления'
  },
  taxTotal: {
    type: Number,
    default: 0
  },
  taxData: {
    type: Array,
    default: () => []
  },
  computedTaxData: {
    type: Object,
    default: () => {}
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  coeficientOfNds: {
    type: [Number, String],
    default: 0 || ''
  },
  formatNumber: {
    type: Function,
    default: () => {}
  }
});

const columns = [
  { field: 'name', header: 'Имя' },
  { field: 'coefficient', header: 'Коэффициент' },
  { field: 'subtotal', header: 'Сумма' }
];

const onCellEditComplete = (event) => {
  let { data, newValue, field, newData } = event;

  if (newData.coefficientA || newData.coefficientB) {
    data['coefficientA'] = newData.coefficientA;
    data['coefficientB'] = newData.coefficientB;
  } else {
    data[field] = newValue;
  }

  emit('changeValue', { data, newValue, field });
};
</script>

<template>
  <div class="tax-charges">
    <div class="card h-full flex flex-col gap-4">
      <div class="flex flex-row items-center justify-between gap-2">
        <div class="font-semibold text-[--primary-color] text-xl">{{ props.title }}</div>
      </div>

      <div class="flex flex-row items-center justify-between gap-2">
        <div class="text-lg">До налоговых начислений: {{ props.formatNumber(props.totalAmount) }}</div>

        <div class="flex flex-row gap-2 items-center">
          <label for="coeficientOfNds">НДС:</label>
          <InputNumber
            :modelValue="props.coeficientOfNds"
            @input="(data) => $emit('changeCoeficient', data)"
            fluid
            inputId="coeficientOfNds"
            class="max-w-[50px]"
            :minFractionDigits="1"
            :maxFractionDigits="5"
          />
        </div>
      </div>

      <DataTable :value="props.taxData" editMode="cell" @cell-edit-complete="onCellEditComplete" showGridlines>
        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
          <template #body="{ data }">
            <div v-if="col.field === 'name'">
              {{ data[col.field] }}
            </div>
            <div v-else-if="col.field === 'coefficient'">
              <div v-if="data.coefficientA || data.coefficientB">{{ data.coefficientA }} | {{ data.coefficientB }}</div>
              <div v-else-if="data.key === 'T'">
                <span class="text-[red]">
                  {{ data[col.field] }}
                </span>
              </div>
              <div v-else>
                {{ data[col.field] }}
              </div>
            </div>
            <div v-else-if="col.field === 'subtotal'">
              <div>
                {{ props.formatNumber(props.computedTaxData[data.key]) }}
              </div>
            </div>
          </template>

          <template v-if="col.field === 'coefficient'" #editor="{ data }">
            <div v-if="data.coefficientA !== null || data.coefficientB !== null">
              <InputNumber v-model="data.coefficientA" fluid :minFractionDigits="1" :maxFractionDigits="5" />
              <InputNumber v-model="data.coefficientB" fluid :minFractionDigits="1" :maxFractionDigits="5" />
            </div>
            <div v-else>
              <InputNumber v-model="data.coefficient" fluid :minFractionDigits="1" :maxFractionDigits="5" />
            </div>
          </template>
        </Column>

        <template #footer>
          <div class="flex justify-end items-center font-bold w-full">
            Итого: &nbsp;<span class="text-lg"> {{ props.formatNumber(props.taxTotal) }}</span>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

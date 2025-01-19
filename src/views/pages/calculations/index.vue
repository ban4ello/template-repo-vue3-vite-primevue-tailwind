<script setup>
import ApiService from '@/service/ApiService';
import { MochDataService } from '@/service/MochDataService';
import { onBeforeMount, ref } from 'vue';
// import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter } from 'vue-router';

const router = useRouter();
// const toast = useToast();
const dropdownItemsParentCalculations = ref([]);
const expandedRows = ref([]);
const calculationPlanId = ref(null);
const loading = ref(false);

let calculationsData = ref([]);
const confirm = useConfirm();

const confirmDeleteEntity = async (data, typeOfEntity = 'parent-calculation') => {
  confirm.require({
    message: 'Вы действительно хотите удалить эту запись?',
    header: 'Внимание!',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Отменить',
    rejectProps: {
      label: 'Отменить',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Удалить',
      severity: 'danger'
    },
    accept: async () => {
      loading.value = true;

      try {
        switch (typeOfEntity) {
          case 'parent-calculation':
            calculationsData.value = calculationsData.value.filter((item) => item.id !== data.id);
            await ApiService.deleteItemFromParentCalculation(data.id);

            break;
          case 'calculation':
            calculationsData.value = calculationsData.value.map((item) => {
              return {
                ...item,
                childrens: item.childrens.filter((children) => children.id !== data.id)
              };
            });
            await ApiService.deleteCalculation(data.id);

            break;
        }
      } catch (error) {
        console.log(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

onBeforeMount(() => {
  MochDataService.getCalculationsData().then((data) => {
    dropdownItemsParentCalculations.value = data.map((item) => item.name);
  });

  ApiService.getParentCalculations().then((res) => {
    const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());
    const camelizeData = res.data.map((item) => {
      return Object.keys(item).reduce((acc, key) => {
        acc[camelize(key)] = item[key];

        return acc;
      }, {});
    });

    calculationsData.value = camelizeData;
  });
});

const expandRow = (row) => {
  ApiService.getParentCalculationChildren(row.data.id).then((res) => {
    const updatedData = JSON.parse(JSON.stringify(calculationsData.value));
    calculationPlanId.value = res.data.filter((item) => item.calculation_type === 'plan')[0].id;

    const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase());
    const camelizeData = res.data.map((item) => {
      return Object.keys(item).reduce((acc, key) => {
        acc[camelize(key)] = item[key];

        return acc;
      }, {});
    });

    calculationsData.value = updatedData.map((item) => {
      if (Number(item.id) === Number(row.data.id)) {
        item.childrens = camelizeData;
      }

      return item;
    });
  });
};
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>
  <Fluid>
    <div class="card">
      <div class="flex gap-4 justify-between">
        <div class="font-semibold text-[--primary-color] text-xl mb-4">Калькуляции</div>

        <div
          class="font-semibold hover:text-[--primary-color] hover:cursor-pointer text-xl mb-4"
          @click="router.push({ path: '/calculations/create' })"
        >
          создать новую калькуляцию-план +
        </div>
      </div>
      <!-- :paginator="true" -->
      <DataTable
        v-model:expandedRows="expandedRows"
        :value="calculationsData"
        :rows="10"
        :rowHover="true"
        dataKey="id"
        @row-expand="expandRow"
      >
        <template #empty> Нет данных для отображения </template>

        <template #loading> Загружается список... Пожалуйста подождите. </template>

        <Column expander style="width: 5rem" />

        <Column field="title" header="Название" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.title }}
          </template>
        </Column>

        <Column field="dateOfCreation" header="Дата создания" style="min-width: 12rem">
          <template #body="{ data }">
            {{ new Date(data.dateOfCreation).toLocaleDateString() }}
          </template>
        </Column>

        <Column :exportable="false">
          <template #body="slotProps">
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteEntity(slotProps.data)" />
          </template>
        </Column>

        <template #expansion="slotProps">
          <DataTable showGridlines :value="slotProps.data.childrens" class="shadow-md" sortField="calculationType" :sortOrder="-1">
            <Column field="title" header="Название" sortable style="min-width: 12rem">
              <template #body="{ data }">
                <div
                  class="hover:text-[--primary-color] hover:cursor-pointer"
                  @click="router.push({ path: `/calculations/${data.id}`, query: { parentId: slotProps.data.id, type: data.type } })"
                >
                  {{ data.title }}
                </div>
              </template>
            </Column>

            <Column field="dateOfCreation" header="Дата создания" sortable style="min-width: 12rem">
              <template #body="{ data }">
                {{ new Date(data.dateOfCreation).toLocaleDateString() }}
              </template>
            </Column>

            <Column field="calculationType" header="Вид калькуляции" sortable style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.calculationType === 'plan' ? 'План' : 'Факт' }}
              </template>
            </Column>

            <Column :exportable="false" style="min-width: 12rem">
              <template #body="{ data }">
                <div>
                  <!-- <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" /> -->
                  <Button
                    v-if="data.calculationType === 'fact'"
                    icon="pi pi-trash"
                    outlined
                    rounded
                    severity="danger"
                    @click="confirmDeleteEntity(data, 'calculation')"
                  />
                </div>
              </template>
            </Column>

            <template #footer>
              <div
                class="flex justify-center items-center text-[--primary-color] hover:cursor-pointer"
                @click="
                  router.push({ path: '/calculations/create', query: { parentId: slotProps.data.id, type: 'fact', calculationPlanId } })
                "
              >
                добавить калькуляцию-факт +
              </div>
            </template>
          </DataTable>
        </template>
      </DataTable>
    </div>

    <ConfirmDialog></ConfirmDialog>
  </Fluid>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}
</style>

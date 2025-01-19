<script setup>
import { onBeforeMount, ref, computed, watch } from 'vue';
import { MochDataService } from '@/service/MochDataService';
import ApiService from '@/service/ApiService';
// import { useToast } from 'primevue/usetoast';
import SearchSelect from '@/components/custom-ui/SearchSelect.vue';
import TaxCharges from '@/components/TaxCharges.vue';
import * as XLS from 'xlsx';
import { useRouter } from 'vue-router';

// const toast = useToast();
const router = useRouter();
const fileupload = ref();
// const dropdownItemsWorkerStaff = ref(['Бабенко', 'Червань Антон', 'Васильев', 'Атаманенко', 'Татарский']);
const dropdownItemsWorkerStaff = ref([]);
const dropdownItemsITR = ref(['Кристина', 'Олька', 'Танюха', 'Тёмка', 'Николаев', 'Никита', 'Шеф']);
const dropdownItemsWorkersRole = ref([
  { label: 'Рабочий', key: 'worker' },
  { label: 'ИТР', key: 'ITR' }
]);
const dropdownItemsUnitOfMeasurement = ref(['тн', 'кг', 'шт', 'м']);

const parentId = ref(null);
const currentCalculationType = ref(null);
const calculationPlanId = ref(null);
const isAmountWithoutMetal = ref(false);
const expandAccordionTotalCosts = ref([]);
const newStaffData = ref({ name: '', numberOfHoursWorked: null, salaryPerDay: null });
const newITRStaffData = ref({ name: '', salaryPerMonth: null });

const calculationPlanTotal = ref(null);
const selectedStaff = ref(null);
const selectedITRStaff = ref(null);
const newStaffDialog = ref(false);
const newITRStaffDialog = ref(false);
const createNewWorkerDialog = ref(false);
const loading = ref(false);

let calculationData = ref({
  itrWorkedDays: 1,
  numberOfDaysPerShift: 21,
  numberOfHoursPerShift: 8,
  coeficientOfNds: 1.2,
  costOfElectricityPerDay: 0,
  galvanizedValue: 0,
  rentalCostPerDay: 0,
  profitabilityCoeficient: 0,
  title: '',
  transportValue: 0,
  lastEditDate: '',
  calculationType: 'plan',

  specificationData: {
    table: [],
    notes: ''
  },
  workersData: {
    table: [],
    notes: ''
  },
  itrData: {
    table: [],
    notes: ''
  },
  consumablesData: [],
  hardwareData: [],
  metalData: [],
  workersTaxData: [],
  itrTaxData: [],
  total: null
});

// // NOTE: need for test
// let currentDate = new Date();
// const today = `${currentDate.getDate()}.${currentDate.getMonth()}.${currentDate.getFullYear()}`;
// const currentTime = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

// let calculationData = ref({
//   title: 'Калькуляция-' + today,
//   dateOfCreation: today,
//   lastEditDate: today + ' ' + currentTime,
//   calculationType: 'plan',
//   galvanizedValue: 1000,
//   transportValue: 2000,
//   rentalCostPerDay: 170,
//   costOfElectricityPerDay: 550,
//   profitabilityCoeficient: 0.1,
//   numberOfHoursPerShift: 8,
//   coeficientOfNds: 1.2,
//   numberOfDaysPerShift: 21,
//   itrWorkedDays: 13,
//   specificationData: {
//     table: [
//       {
//         id: 1,
//         name: 'Изделие №1',
//         quantity: 1,
//         valuePerUnit: 2.0018,
//         unitOfMeasurement: 'тн',
//         totalWeight: null
//       }
//     ],
//     notes: 'specificationData notes'
//   },
//   workersData: {
//     table: [
//       {
//         id: 1,
//         name: 'Бабенко',
//         numberOfHoursWorked: 63,
//         salaryPerDay: 1690
//       },
//       {
//         id: 2,
//         name: 'Червань Антон',
//         numberOfHoursWorked: 79,
//         salaryPerDay: 1700
//       },
//       {
//         id: 3,
//         name: 'Червань Артем',
//         numberOfHoursWorked: 77,
//         salaryPerDay: 1680
//       }
//     ],
//     notes: 'workersData notes'
//   },
//   itrData: {
//     table: [
//       {
//         id: 1,
//         name: 'Кристина',
//         salaryPerMonth: 1000
//       },
//       {
//         id: 2,
//         name: 'Олька',
//         salaryPerMonth: 10000
//       },
//       {
//         id: 3,
//         name: 'Танюха',
//         salaryPerMonth: 0
//       },
//       {
//         id: 4,
//         name: 'Тёмка',
//         salaryPerMonth: 3000
//       },
//       {
//         id: 5,
//         name: 'Николаев',
//         salaryPerMonth: 15000
//       },
//       {
//         id: 6,
//         name: 'Шеф',
//         salaryPerMonth: 5000
//       }
//     ]
//   },
//   consumablesData: [
//     // {
//     //   order: 1,
//     //   name: 'Проволока сварочная 15 кг',
//     //   unitOfMeasurement: 'бухты',
//     //   quantity: 2,
//     //   taxPrice: '1 016,10',
//     //   price: '2 032,20'
//     // }
//   ],
//   hardwareData: [
//     // {
//     //   order: 17,
//     //   name: 'Болты М20*60',
//     //   unitOfMeasurement: 'шт',
//     //   quantity: 276,
//     //   taxPrice: '24,00',
//     //   price: '6 624,00'
//     // }
//   ],
//   metalData: [
//     // {
//     //   order: 1,
//     //   name: 'Лист металла',
//     //   unitOfMeasurement: 'тн',
//     //   quantity: 12,
//     //   taxPrice: '1124,00',
//     //   price: '8 624,00'
//     // }
//   ],
//   workersTaxData: [],
//   itrTaxData: [],
//   total: null
// });

let newWorkerData = ref({ name: '', lastname: '', position: '' });
let increaseInSalary = ref(0);

const salariesOfWorkersTotal = computed(() =>
  calculationData.value.workersData.table.reduce((acc, item) => {
    return acc + parseFloat(Number((item.salaryPerDay / calculationData.value.numberOfHoursPerShift) * item.numberOfHoursWorked).toFixed());
  }, 0)
);

const salariesOfITRTotal = computed(() =>
  calculationData.value.itrData.table.reduce((acc, item) => {
    return (
      acc +
      Number(parseFloat((item.salaryPerMonth / calculationData.value.numberOfDaysPerShift) * calculationData.value.itrWorkedDays).toFixed())
    );
  }, 0)
);

const salariesOfITRTotalPerMonth = computed(() =>
  calculationData.value.itrData.table.reduce((acc, item) => {
    return acc + Number(parseFloat(item.salaryPerMonth));
  }, 0)
);

const totalSpecificationItems = computed(
  () =>
    calculationData.value.specificationData.table.reduce((acc, item) => {
      return acc + Number(item.quantity * item.valuePerUnit);
    }, 0) || 0
);

const taxTotal = computed(() => {
  const numberOfDecimal = 2;

  return Number(
    parseFloat(
      (computedWorkerTaxData.value.T +
        computedWorkerTaxData.value.TN +
        computedWorkerTaxData.value.K +
        computedWorkerTaxData.value.KMIL +
        computedWorkerTaxData.value.KESV) *
        calculationData.value.coeficientOfNds
    ).toFixed(numberOfDecimal)
  );
});

const taxITRTotal = computed(() => {
  const numberOfDecimal = 2;

  return Number(
    parseFloat(
      (computedItrTaxData.value.T +
        computedItrTaxData.value.TN +
        computedItrTaxData.value.K +
        computedItrTaxData.value.KMIL +
        computedItrTaxData.value.KESV) *
        calculationData.value.coeficientOfNds
    ).toFixed(numberOfDecimal)
  );
});

const totalConsumables = computed(() => getTotalPrice(calculationData.value.consumablesData));
const totalHardware = computed(() => getTotalPrice(calculationData.value.hardwareData));
const totalMetal = computed(() => getTotalPrice(calculationData.value.metalData));

const priceData = computed(() => {
  return [
    {
      id: 1,
      name: 'Металл',
      key: 'metal',
      statistics: getPercentOfTotal(totalMetal.value),
      total: totalMetal.value || 0,
      perItem: totalSpecificationItems.value ? truncateDecimal(totalMetal.value / totalSpecificationItems.value, 2) : 0
    },
    {
      id: 2,
      name: 'Метизы',
      key: 'hardware',
      statistics: getPercentOfTotal(totalHardware.value),
      total: totalHardware.value || 0,
      perItem: totalSpecificationItems.value ? truncateDecimal(totalHardware.value / totalSpecificationItems.value, 2) : 0
    },
    {
      id: 3,
      name: 'Расходники',
      key: 'consumables',
      statistics: getPercentOfTotal(totalConsumables.value),
      total: totalConsumables.value || 0,
      perItem: totalSpecificationItems.value ? truncateDecimal(totalConsumables.value / totalSpecificationItems.value, 2) : 0
    },
    {
      id: 4,
      name: 'Цех',
      key: 'workshop',
      statistics: getPercentOfTotal(taxTotal.value),
      total: taxTotal.value || 0,
      perItem: taxTotal.value / totalSpecificationItems.value
    },
    {
      id: 5,
      name: 'Зарплата ИТР',
      key: 'wagesOfEngineers',
      statistics: getPercentOfTotal(taxITRTotal.value),
      total: taxITRTotal.value || 0,
      perItem: taxITRTotal.value / totalSpecificationItems.value
    },
    {
      id: 6,
      name: 'Оцинковка',
      key: 'galvanizing',
      statistics: getPercentOfTotal(calculationData.value.galvanizedValue),
      total: calculationData.value.galvanizedValue || 0,
      perItem: totalSpecificationItems.value ? calculationData.value.galvanizedValue / totalSpecificationItems.value : 0
    },
    {
      id: 7,
      name: 'Транспорт',
      key: 'transport',
      statistics: getPercentOfTotal(calculationData.value.transportValue),
      total: calculationData.value.transportValue || 0,
      perItem: totalSpecificationItems.value ? calculationData.value.transportValue / totalSpecificationItems.value : 0
    },
    {
      id: 8,
      name: 'Аренда',
      key: 'rent',
      statistics: getPercentOfTotal(calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays),
      total: calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays || 0,
      perItem: totalSpecificationItems.value
        ? (calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays) / totalSpecificationItems.value
        : 0
    },
    {
      id: 9,
      name: 'Эл. эн.',
      key: 'electricity',
      statistics: getPercentOfTotal(calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) || 0,
      total: calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays || 0,
      perItem: totalSpecificationItems.value
        ? (calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) / totalSpecificationItems.value
        : 0
    },
    {
      id: 10,
      name: 'Рентабельность',
      key: 'profitability',
      statistics: getPercentOfTotal(
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
          calculationData.value.profitabilityCoeficient
      ),
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
        calculationData.value.profitabilityCoeficient,
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            calculationData.value.galvanizedValue +
            calculationData.value.transportValue +
            calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
            calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
            calculationData.value.profitabilityCoeficient) /
          totalSpecificationItems.value
        : 0
    },
    {
      id: 11,
      name: 'Итого',
      key: 'total',
      statistics: 0,
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
          calculationData.value.profitabilityCoeficient +
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays),
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            calculationData.value.galvanizedValue +
            calculationData.value.transportValue +
            calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
            calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
            calculationData.value.profitabilityCoeficient +
            (totalMetal.value +
              totalHardware.value +
              totalConsumables.value +
              taxTotal.value +
              taxITRTotal.value +
              calculationData.value.galvanizedValue +
              calculationData.value.transportValue +
              calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
              calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays)) /
          totalSpecificationItems.value
        : 0
    }
  ];
});

const finalPriceData = computed(() => {
  return [
    {
      id: 1,
      name: 'Металл',
      key: 'metalTotal',
      statistics: getPercentOfTotal(totalMetal.value + totalHardware.value),
      total: totalMetal.value + totalHardware.value,
      perItem: totalSpecificationItems.value ? truncateDecimal((totalMetal.value + totalHardware.value) / totalSpecificationItems.value) : 0
    },
    {
      id: 2,
      name: 'Переработка',
      key: 'processing',
      statistics: getPercentOfTotal(
        totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays
      ),
      total:
        totalConsumables.value +
        taxTotal.value +
        taxITRTotal.value +
        calculationData.value.galvanizedValue +
        calculationData.value.transportValue +
        calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
        calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays,
      perItem: totalSpecificationItems.value
        ? truncateDecimal(
            (totalConsumables.value +
              taxTotal.value +
              taxITRTotal.value +
              calculationData.value.galvanizedValue +
              calculationData.value.transportValue +
              calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
              calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) /
              totalSpecificationItems.value,
            2
          )
        : 0
    },
    {
      id: 3,
      name: 'Рентабельность',
      key: 'profitability',
      statistics: getPercentOfTotal(
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
          calculationData.value.profitabilityCoeficient
      ),
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
        calculationData.value.profitabilityCoeficient,
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            calculationData.value.galvanizedValue +
            calculationData.value.transportValue +
            calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
            calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
            calculationData.value.profitabilityCoeficient) /
          totalSpecificationItems.value
        : 0
    },
    {
      id: 4,
      name: 'Итого',
      key: 'total',
      statistics: 0,
      total:
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
          calculationData.value.profitabilityCoeficient +
        (totalMetal.value +
          totalHardware.value +
          totalConsumables.value +
          taxTotal.value +
          taxITRTotal.value +
          calculationData.value.galvanizedValue +
          calculationData.value.transportValue +
          calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
          calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays),
      perItem: totalSpecificationItems.value
        ? ((totalMetal.value +
            totalHardware.value +
            totalConsumables.value +
            taxTotal.value +
            taxITRTotal.value +
            calculationData.value.galvanizedValue +
            calculationData.value.transportValue +
            calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
            calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
            calculationData.value.profitabilityCoeficient +
            (totalMetal.value +
              totalHardware.value +
              totalConsumables.value +
              taxTotal.value +
              taxITRTotal.value +
              calculationData.value.galvanizedValue +
              calculationData.value.transportValue +
              calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
              calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays)) /
          totalSpecificationItems.value
        : 0
    }
  ];
});

const computedWorkerTaxData = computed(() => {
  const numberOfDecimal = 2;

  return calculationData.value.workersTaxData.reduce(
    (acc, item) => {
      switch (item.key) {
        case 'T':
          acc.T = Number(parseFloat(item.coefficient * salariesOfWorkersTotal.value).toFixed(numberOfDecimal));
          break;
        case 'TN':
          acc.TN = Number(parseFloat((acc.T / item.coefficientA) * item.coefficientB).toFixed(numberOfDecimal));
          break;
        case 'K':
          acc.K = Number(parseFloat(salariesOfWorkersTotal.value - acc.T).toFixed(numberOfDecimal));
          break;
        case 'KMIL':
          acc.KMIL = Number(parseFloat(acc.K * item.coefficient).toFixed(numberOfDecimal));
          break;
        case 'KESV':
          acc.KESV = Number(parseFloat((acc.K + acc.KMIL) * item.coefficient).toFixed(numberOfDecimal));
          break;

        default:
          break;
      }

      return acc;
    },
    { TN: 0, K: 0, KMIL: 0, KESV: 0 }
  );
});

const computedItrTaxData = computed(() => {
  const numberOfDecimal = 2;

  return calculationData.value.itrTaxData.reduce(
    (acc, item) => {
      switch (item.key) {
        case 'T':
          acc.T = Number(parseFloat(item.coefficient * salariesOfITRTotal.value).toFixed(numberOfDecimal));
          break;
        case 'TN':
          acc.TN = Number(parseFloat((acc.T / item.coefficientA) * item.coefficientB).toFixed(numberOfDecimal));
          break;
        case 'K':
          acc.K = Number(parseFloat(salariesOfITRTotal.value - acc.T).toFixed(numberOfDecimal));
          break;
        case 'KMIL':
          acc.KMIL = Number(parseFloat(acc.K * item.coefficient).toFixed(numberOfDecimal));
          break;
        case 'KESV':
          acc.KESV = Number(parseFloat((acc.K + acc.KMIL) * item.coefficient).toFixed(numberOfDecimal));
          break;

        default:
          break;
      }

      return acc;
    },
    { TN: 0, K: 0, KMIL: 0, KESV: 0 }
  );
});

const getPercentOfTotal = (totalNumber) => {
  return (totalNumber / finalTotalPrice.value) * 100 || 0;
};

onBeforeMount(async () => {
  const query = router.currentRoute.value.query;

  parentId.value = query.parentId;
  currentCalculationType.value = query.type;
  calculationPlanId.value = query.calculationPlanId;

  MochDataService.getWorkersTaxData().then((data) => {
    calculationData.value.workersTaxData = data;
  });

  MochDataService.getItrTaxData().then((data) => {
    calculationData.value.itrTaxData = data;
  });

  // !!! NOTE: need for testing
  // MochDataService.getConsumables().then((data) => {
  //   calculationData.value.consumablesData = data;
  // });
  // MochDataService.getHardware().then((data) => {
  //   calculationData.value.hardwareData = data;
  // });
  // MochDataService.getMetal().then((data) => {
  //   calculationData.value.metalData = data;
  // });

  try {
    if (currentCalculationType.value === 'fact') {
      const calculationPlanRes = await ApiService.getCalculationById(calculationPlanId.value);
      const camelize = (s) => s.replace(/_./g, (x) => x[1].toUpperCase()); // TODO: refactor
      const camelizeData = Object.keys(calculationPlanRes.data).reduce((acc, key) => {
        acc[camelize(key)] = calculationPlanRes.data[key];

        if (key === 'calculationType') {
          acc['calculationType'] = 'fact';
        }

        return acc;
      }, {});

      calculationPlanTotal.value = Number(camelizeData.total);
      calculationData.value = { ...calculationData.value, ...camelizeData };
    }
  } catch (error) {
    console.log(error);
  }
});

const finalTotalPrice = computed(() => {
  let totalPrice = null;

  if (isAmountWithoutMetal.value) {
    totalPrice =
      (totalHardware.value +
        totalConsumables.value +
        taxTotal.value +
        taxITRTotal.value +
        calculationData.value.galvanizedValue +
        calculationData.value.transportValue +
        calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
        calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
        calculationData.value.profitabilityCoeficient +
      (totalHardware.value +
        totalConsumables.value +
        taxTotal.value +
        taxITRTotal.value +
        calculationData.value.galvanizedValue +
        calculationData.value.transportValue +
        calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
        calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays);
  } else {
    totalPrice =
      (totalMetal.value +
        totalHardware.value +
        totalConsumables.value +
        taxTotal.value +
        taxITRTotal.value +
        calculationData.value.galvanizedValue +
        calculationData.value.transportValue +
        calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
        calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays) *
        calculationData.value.profitabilityCoeficient +
      (totalMetal.value +
        totalHardware.value +
        totalConsumables.value +
        taxTotal.value +
        taxITRTotal.value +
        calculationData.value.galvanizedValue +
        calculationData.value.transportValue +
        calculationData.value.rentalCostPerDay * calculationData.value.itrWorkedDays +
        calculationData.value.costOfElectricityPerDay * calculationData.value.itrWorkedDays);
  }

  return totalPrice;
});

function getTotalPrice(array) {
  return array.reduce((acc, item) => {
    if (item.price) {
      acc = acc + item.price;
    }

    return acc;
    // return acc + parseFloat(item.price.replaceAll(' ', '').replaceAll(',', '.'));
  }, 0);
}

const onUpload = async ({ event, tableName, accordionIndex }) => {
  const newFile = event.files[0];
  const arrayBuferFile = await newFile.arrayBuffer();
  const wb = XLS.read(arrayBuferFile);
  const sheet = wb.Sheets[wb.SheetNames[0]];

  let consumablesDataRes = [];
  let hardwareDataRes = [];
  let metalDataRes = [];

  const setTableData = (array, formatedRow) => {
    if (formatedRow['Наименование']) {
      array.push({
        quantity: formatedRow['К-во'],
        name: formatedRow['Наименование'],
        price: formatedRow['Стоимость'],
        unitOfMeasurement: formatedRow['ед.изм.'],
        taxPrice: formatedRow['цена НДС'],
        order: formatedRow['№ п/п']
      });
    }
  };

  XLS.utils.sheet_to_json(sheet).forEach((row) => {
    const formatedRow = {};

    Object.keys(row).forEach((key) => {
      formatedRow[key.trim()] = row[key];
    });

    switch (tableName) {
      case 'consumablesDataRes':
        setTableData(consumablesDataRes, formatedRow);
        break;

      case 'hardwareDataRes':
        setTableData(hardwareDataRes, formatedRow);
        break;
      case 'metalDataRes':
        setTableData(metalDataRes, formatedRow);
        break;

      default:
        break;
    }
  });

  switch (tableName) {
    case 'consumablesDataRes':
      calculationData.value.consumablesData = consumablesDataRes;
      break;

    case 'hardwareDataRes':
      calculationData.value.hardwareData = hardwareDataRes;
      break;
    case 'metalDataRes':
      calculationData.value.metalData = metalDataRes;
      break;

    default:
      break;
  }

  expandAccordionTotalCosts.value = [accordionIndex];
};

const onCellEditComplete = (event) => {
  let { data, newValue, field } = event;

  switch (data.name) {
    case 'Оцинковка':
      calculationData.value.galvanizedValue = Number(newValue);
      break;
    case 'Транспорт':
      calculationData.value.transportValue = Number(newValue);
      break;

    default:
      break;
  }

  data[field] = newValue;
};

const showDialog = async (key, flag = true) => {
  let workersRes = {};
  workersRes = await getWorkers();

  dropdownItemsWorkerStaff.value = workersRes.data.map((item) => item.name);

  switch (key) {
    case 'newStaffDialog':
      newStaffDialog.value = flag;
      break;
    case 'newITRStaffDialog':
      newITRStaffDialog.value = flag;
      break;
    case 'createNewWorkerDialog':
      createNewWorkerDialog.value = flag;
      break;

    default:
      break;
  }
};

const addNewWorkerToDB = async ({ name, lastname, position }) => {
  loading.value = true;

  try {
    await ApiService.createWorker({ name, lastname, position: position.key });
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const getWorkers = async () => {
  loading.value = true;

  try {
    return await ApiService.getWorkers();
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const copySpecification = (data) => {
  calculationData.value.specificationData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    quantity: data.quantity,
    valuePerUnit: data.valuePerUnit,
    unitOfMeasurement: data.unitOfMeasurement,
    totalWeight: data.totalWeight
  });
};

const addNewSpecification = () => {
  calculationData.value.specificationData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: null,
    quantity: null,
    valuePerUnit: null,
    unitOfMeasurement: null,
    totalWeight: null
  });
};

const confirmDeleteSpecification = (data) => {
  calculationData.value.specificationData.table = calculationData.value.specificationData.table.filter((item) => item.id !== data.id);
};

const copyStaffWorker = (data) => {
  calculationData.value.workersData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    numberOfHoursWorked: data.numberOfHoursWorked,
    salaryPerDay: data.salaryPerDay,
    salaryPerHour: null,
    total: null
  });
};

const saveNewStaff = () => {
  calculationData.value.workersData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: newStaffData.value.name,
    numberOfHoursWorked: newStaffData.value.numberOfHoursWorked,
    salaryPerDay: newStaffData.value.salaryPerDay,
    salaryPerHour: null,
    total: null
  });

  newStaffDialog.value = false;
  newStaffData.value = {
    name: '',
    numberOfHoursWorked: null,
    salaryPerDay: null
  };
};

const confirmDeleteWorker = (item) => {
  if (item) {
    calculationData.value.workersData.table = calculationData.value.workersData.table.filter((worker) => worker.id !== item.id);
  } else {
    selectedStaff.value.forEach((item) => {
      calculationData.value.workersData.table = calculationData.value.workersData.table.filter((worker) => worker.id !== item.id);
    });
  }

  newStaffDialog.value = false;
  selectedStaff.value = null;

  newStaffData.value = {
    name: '',
    numberOfHoursWorked: null,
    salaryPerDay: null
  };
};

const saveNewITRStaff = () => {
  calculationData.value.itrData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: newITRStaffData.value.name,
    salaryPerMonth: newITRStaffData.value.salaryPerMonth
  });

  newITRStaffDialog.value = false;
  newITRStaffData.value = {
    name: '',
    salaryPerMonth: null
  };
};

const confirmDeleteITRStaff = (item) => {
  if (item) {
    calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
  } else {
    selectedITRStaff.value.forEach((item) => {
      calculationData.value.itrData.table = calculationData.value.itrData.table.filter((worker) => worker.id !== item.id);
    });
  }

  newITRStaffDialog.value = false;
  selectedITRStaff.value = null;

  newITRStaffData.value = {
    name: '',
    salaryPerMonth: null
  };
};

const copyITRWorker = (data) => {
  calculationData.value.itrData.table.push({
    id: (Math.random() * 1000).toFixed(),
    name: data.name,
    salaryPerMonth: data.salaryPerMonth
  });
};

const changeSelectedItem = (event, type) => {
  if (type === 'workers') {
    newStaffData.value.name = event.value;
  } else {
    newITRStaffData.value.name = event.value;
  }
};

const showNewWorkerModal = () => {
  showDialog('createNewWorkerDialog');
};

const saveNewWorker = async (worker) => {
  dropdownItemsWorkerStaff.value.push(worker.name);
  await addNewWorkerToDB(worker);

  if (newStaffDialog.value) {
    newStaffData.value.name = newWorkerData.value.name;
  }

  if (newITRStaffDialog.value) {
    newITRStaffData.value.name = newWorkerData.value.name;
  }

  newWorkerData.value = { name: '', lastname: '', position: '' };
  showDialog('createNewWorkerDialog', false);
};

const formatNumber = (numberData) => {
  if (numberData && numberData.value) {
    return new Intl.NumberFormat('ru-RU').format(numberData.value);
  } else if (numberData) {
    return new Intl.NumberFormat('ru-RU').format(numberData);
  } else {
    return 0;
  }
};

const truncateDecimal = (num, decimalPlaces) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.trunc(num * factor) / factor;
};

const createCalculation = async () => {
  loading.value = true;

  try {
    const calculationRes = await ApiService.createCalculation({
      ...calculationData.value,
      calculationType: router.currentRoute.value.query.type || 'plan',
      lastEditDate: new Date(),
      consumablesData: JSON.stringify(calculationData.value.consumablesData),
      hardwareData: JSON.stringify(calculationData.value.hardwareData),
      metalData: JSON.stringify(calculationData.value.metalData),
      parentCalculationId: Number(parentId.value),
      total: finalTotalPrice.value
    });

    router.push({ path: `/calculations/${calculationRes.data.id}` });
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

watch(increaseInSalary, (newValue, oldValue) => {
  let increment = newValue > oldValue ? 5 : -5;

  // если меняется "increaseInSalary" - то должно меняться значение "salaryPerDay"
  calculationData.value.workersData.table = calculationData.value.workersData.table.map((item) => {
    const newPrice = Number(item.salaryPerDay) + Number(increment);

    return { ...item, salaryPerDay: newPrice };
  });
});

const changeTaxValue = ({ data, newValue, field }, dataName) => {
  // TODO: refactor: почему-то не работает реактивность на обновление значения "К" из "Налоговые начисления"
  calculationData.value[dataName] = calculationData.value[dataName].map((item) => {
    if (item.key === data.key) {
      item[field] = newValue;
    }

    return item;
  });
};

const computedStyleClass = computed(() => {
  return {
    'text-[--secondary-color]': currentCalculationType.value === 'fact',
    'text-[--primary-color]': currentCalculationType.value === 'plan'
  };
});
</script>

<template>
  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>
  <Fluid>
    <div class="card calculation-title z-50 sticky top-[60px] shadow-md flex flex-row items-center justify-between gap-2">
      <div class="flex flex-row justify-between items-center gap-2">
        <div class="flex gap-2">
          <div class="flex flex-col gap-2">
            <div class="font-semibold text-md" :class="computedStyleClass">
              <span>Название калькуляции-{{ currentCalculationType === 'fact' ? 'факт' : 'план' }}:</span
              ><span><InputText v-model="calculationData.title" type="text" /></span>
            </div>

            <div v-if="calculationData.dateOfCreation" class="font-semibold text-md">
              <span :class="computedStyleClass">Дата создания: </span>
              <span> {{ new Date(calculationData.dateOfCreation).toLocaleDateString() }}</span>
            </div>
          </div>

          <Divider layout="vertical" />
        </div>

        <div class="flex gap-2">
          <div v-if="finalTotalPrice" class="font-semibold text-md flex items-center">
            <div class="flex flex-col">
              <div
                class="flex flex-row gap-2 items-center"
                :style="{
                  border: finalTotalPrice > calculationPlanTotal && currentCalculationType === 'fact' ? '1px solid red' : '',
                  'border-radius': '5px',
                  padding: '5px'
                }"
              >
                <div :class="computedStyleClass" class="max-w-[200px]">Итоговая сумма калькуляции:</div>
                <span
                  class="font-bold"
                  :class="{ 'text-[red]': finalTotalPrice > calculationPlanTotal, 'text-xl': finalTotalPrice > calculationPlanTotal }"
                >
                  {{ formatNumber(truncateDecimal(finalTotalPrice, 1)) }}
                </span>
              </div>

              <Divider layout="horizontal" />

              <div v-if="totalSpecificationItems" class="flex flex-row gap-2">
                <div :class="computedStyleClass">На 1 ед:</div>
                <span class="font-bold">
                  {{ formatNumber(truncateDecimal(finalTotalPrice / totalSpecificationItems, 1)) }}
                </span>
              </div>

              <Divider layout="horizontal" />

              <div class="flex gap-2 items-center">
                <Checkbox v-model="isAmountWithoutMetal" :value="isAmountWithoutMetal" :binary="true" />
                <label :class="computedStyleClass" class="font-semibold items-center text-md">Сумма без металла</label>
              </div>
            </div>
          </div>

          <Divider layout="vertical" />
        </div>

        <div v-if="currentCalculationType === 'fact'" class="flex gap-2">
          <div v-if="finalTotalPrice" class="font-semibold text-md flex items-center">
            <div class="flex flex-col">
              <div class="flex flex-row gap-2 items-center">
                <div class="text-[--primary-color] max-w-[200px]">Сумма калькуляции-плана:</div>
                <span class="font-bold">
                  {{ formatNumber(truncateDecimal(calculationPlanTotal, 1)) }}
                </span>
              </div>

              <Divider layout="horizontal" />

              <div v-if="totalSpecificationItems" class="flex flex-row gap-2">
                <div class="text-[--primary-color]">На 1 ед:</div>
                <span class="font-bold">
                  {{ formatNumber(truncateDecimal(calculationPlanTotal / totalSpecificationItems, 1)) }}
                </span>
              </div>
            </div>
          </div>

          <Divider layout="vertical" />
        </div>

        <div class="font-semibold text-lg">
          <p :class="computedStyleClass">Общее кол-во:</p>
          <p>
            {{ truncateDecimal(totalSpecificationItems, 5) }}
            <span v-if="calculationData.specificationData?.table.length">
              {{ calculationData.specificationData.table[0].unitOfMeasurement }}
            </span>
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <Button
          label="Сохранить калькуляцию"
          :loading="loading"
          size="large"
          severity="success"
          class="text-xs"
          @click="createCalculation"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <div class="specification card h-full flex flex-col gap-4">
        <Accordion :value="['0']" multiple>
          <AccordionPanel value="0">
            <AccordionHeader>
              <div class="font-semibold text-xl" :class="computedStyleClass">Спецификация</div>
            </AccordionHeader>

            <AccordionContent>
              <DataTable
                :value="calculationData.specificationData.table"
                editMode="cell"
                @cell-edit-complete="onCellEditComplete"
                showGridlines
              >
                <template #empty> Нет данных для отображения </template>

                <Column field="name" header="Наименование изделия" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>

                  <template #editor="{ data }">
                    <InputText v-model="data.name" type="text" />
                  </template>
                </Column>

                <Column field="quantity" header="Количество" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>

                  <template #editor="{ data }">
                    <InputText v-model="data.quantity" type="number" />
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="Единица измерения" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>

                  <template #editor="{ data }">
                    <Select
                      id="unitOfMeasurement"
                      v-model="data.unitOfMeasurement"
                      :options="dropdownItemsUnitOfMeasurement"
                      class="w-full"
                    ></Select>
                  </template>
                </Column>

                <Column field="valuePerUnit" header="Значение за одну единицу" style="width: 25%">
                  <template #body="{ data }">
                    {{ data.valuePerUnit }}
                  </template>

                  <template #editor="{ data }">
                    <InputText v-model="data.valuePerUnit" type="number" />
                  </template>
                </Column>

                <Column field="totalWeight" header="Общий вес" style="width: 25%">
                  <template #body="{ data }">
                    {{ truncateDecimal(data.quantity * data.valuePerUnit, 5) }}
                  </template>
                </Column>

                <Column :exportable="false" style="min-width: 12rem">
                  <template #body="slotProps">
                    <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" @click="copySpecification(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteSpecification(slotProps.data)" />
                  </template>
                </Column>

                <template #footer>
                  <div
                    class="flex justify-center items-center hover:cursor-pointer"
                    :class="computedStyleClass"
                    @click="addNewSpecification"
                  >
                    добавить строку +
                  </div>

                  <div class="flex justify-end gap-4 w-full">
                    <div class="flex items-center">
                      Итого: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(truncateDecimal(totalSpecificationItems, 4)) }}</span>
                    </div>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>

        <div>
          <label for="specificationData" :class="computedStyleClass">Заметки:</label>
          <Textarea v-model="calculationData.specificationData.notes" />
        </div>
      </div>

      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="card subtotal mb-0">
          <div class="flex flex-row justify-between gap-2">
            <div class="font-semibold text-xl" :class="computedStyleClass">Подытог</div>
          </div>

          <DataTable :value="priceData" editMode="cell" @cell-edit-complete="onCellEditComplete" showGridlines>
            <template #empty> Нет данных для отображения </template>

            <Column field="name">
              <template #body="{ data }">
                <div>
                  {{ data.name }}
                </div>
              </template>
            </Column>

            <Column field="total" header="Общая">
              <template #body="{ data }">
                <div :class="{ 'text-[red]': data.key === 'total' }">
                  {{ formatNumber(data.total) }}
                </div>
              </template>

              <template #editor="{ data }">
                <InputText v-if="data.key === 'galvanizing'" v-model="data.total" type="number" />
                <InputText v-if="data.key === 'transport'" v-model="data.total" type="number" />
              </template>
            </Column>

            <Column field="perItem" header="На 1 единицу">
              <template #body="{ data }">
                {{ formatNumber(data.perItem) }}
              </template>
            </Column>

            <Column header="Статистика" class="progress_cell">
              <template #body="{ data }">
                <div v-if="data.key !== 'total'">
                  <ProgressBar
                    v-tooltip="`${parseFloat(data.statistics).toFixed()}%`"
                    :showValue="false"
                    :value="Number(parseFloat(data.statistics).toFixed())"
                    style="border-radius: 0; background-color: transparent; height: 40px"
                  ></ProgressBar>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <div class="card final-statement">
          <div class="flex flex-row justify-between gap-2">
            <div class="font-semibold text-xl" :class="computedStyleClass">Итоговая ведомость</div>
          </div>

          <DataTable
            :value="finalPriceData"
            editMode="cell"
            @cell-edit-complete="onCellEditComplete"
            showGridlines
            :style="{ border: '2px solid green', 'margin-bottom': '2rem' }"
          >
            <template #empty> Нет данных для отображения </template>

            <Column field="name">
              <template #body="{ data }">
                <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
                  {{ data.name }}
                </div>
              </template>
            </Column>

            <Column field="total" header="Общая">
              <template #body="{ data }">
                <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
                  {{ formatNumber(truncateDecimal(Number(data.total), 1)) }}
                </div>
              </template>
            </Column>

            <Column field="perItem" header="На 1 единицу">
              <template #body="{ data }">
                <div :class="{ 'font-bold': data.key === 'total', 'text-lg': data.key === 'total' }">
                  {{ formatNumber(truncateDecimal(Number(data.perItem), 1)) }}
                </div>
              </template>
            </Column>

            <Column header="Статистика" class="progress_cell">
              <template #body="{ data }">
                <div v-if="data.key !== 'total'">
                  <ProgressBar
                    v-tooltip="`${parseFloat(data.statistics).toFixed()}%`"
                    :showValue="false"
                    :value="Number(parseFloat(data.statistics).toFixed())"
                    style="border-radius: 0; background-color: transparent; height: 40px"
                  ></ProgressBar>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="card h-full flex flex-col gap-4">
        <div class="flex flex-row items-center justify-between gap-2">
          <div class="font-semibold text-xl" :class="computedStyleClass">Переменные</div>
        </div>

        <div class="flex flex-col gap-2 mb-4 max-w-[450px]">
          <div class="grid grid-cols-1fr-40 gap-2 items-center">
            <label for="rentalCostPerDay">Стоимость аренды в день:</label>
            <InputNumber v-model="calculationData.rentalCostPerDay" inputId="rentalCostPerDay" class="" fluid />
          </div>

          <div class="grid grid-cols-1fr-40 gap-2 items-center">
            <label for="costOfElectricityPerDay">Стоимость эл. эн. в день:</label>
            <InputNumber v-model="calculationData.costOfElectricityPerDay" inputId="costOfElectricityPerDay" class="" fluid />
          </div>

          <div class="grid grid-cols-1fr-40 gap-2 items-center">
            <label for="profitabilityCoeficient">Коэффициент рентабельности:</label>
            <InputNumber
              v-model="calculationData.profitabilityCoeficient"
              inputId="profitabilityCoeficient"
              class=""
              :minFractionDigits="1"
              :maxFractionDigits="5"
              fluid
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="shop">
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2">
              <div class="font-semibold text-xl" :class="computedStyleClass">Цех</div>

              <div>
                <Button
                  label="Добавить сотрудника"
                  size="small"
                  icon="pi pi-plus"
                  severity="success"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="showDialog('newStaffDialog')"
                />
                <Button
                  label="Удалить сотрудника"
                  size="small"
                  icon="pi pi-trash"
                  severity="danger"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="confirmDeleteWorker()"
                  :disabled="!selectedStaff || !selectedStaff.length"
                />
              </div>
            </div>

            <div class="flex justify-between">
              <div class="flex flex-row gap-2 max-w-[250px] mb-4">
                <label for="numberOfHoursPerShift">Количество часов в смене</label>
                <InputNumber v-model="calculationData.numberOfHoursPerShift" inputId="numberOfHoursPerShift" fluid />
              </div>

              <div class="flex flex-row gap-2 items-center">
                <label for="increaseInSalary">Увеличения ЗП</label>

                <InputNumber v-model="increaseInSalary" :step="5" showButtons buttonLayout="horizontal" style="width: 140px">
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
              </div>
            </div>

            <DataTable
              :value="calculationData.workersData.table"
              v-model:selection="selectedStaff"
              editMode="cell"
              @cell-edit-complete="onCellEditComplete"
              showGridlines
            >
              <template #empty> Нет данных для отображения </template>

              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

              <Column field="name" header="Имя сотрудника">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <template #editor="{ data }">
                  <Select id="staff" v-model="data.name" :options="dropdownItemsWorkerStaff" class="w-full"></Select>
                </template>
              </Column>

              <Column field="numberOfHoursWorked" header="Трудозатраты">
                <template #body="{ data }">
                  {{ data.numberOfHoursWorked }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.numberOfHoursWorked" type="number" />
                </template>
              </Column>

              <Column field="salaryPerDay" header="В день">
                <template #body="{ data }">
                  {{ formatNumber(truncateDecimal(data.salaryPerDay, 0)) }}
                </template>

                <template #editor="{ data }">
                  <InputText v-model="data.salaryPerDay" type="number" />
                </template>
              </Column>

              <Column field="salaryPerHour" header="В час">
                <template #body="{ data }">
                  {{ formatNumber(truncateDecimal(data.salaryPerDay / calculationData.numberOfHoursPerShift, 2)) }}
                </template>
              </Column>

              <Column field="total" header="Итого">
                <template #body="{ data }">
                  {{
                    formatNumber(truncateDecimal((data.salaryPerDay / calculationData.numberOfHoursPerShift) * data.numberOfHoursWorked, 0))
                  }}
                </template>
              </Column>

              <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                  <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" @click="copyStaffWorker(slotProps.data)" />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteWorker(slotProps.data)" />
                </template>
              </Column>

              <template #footer>
                <div class="flex justify-end gap-4 w-full">
                  <div class="flex items-center">
                    Итого: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(salariesOfWorkersTotal) }}</span>
                  </div>
                </div>
              </template>
            </DataTable>

            <div>
              <label for="workersData" :class="computedStyleClass">Заметки:</label>
              <Textarea v-model="calculationData.workersData.notes" />
            </div>

            <Dialog v-model:visible="newStaffDialog" :style="{ width: '450px' }" header="Выберите сотрудника" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>
                  <!-- <SearchSelect
                    :dropdownItemsWorkerStaff="dropdownItemsWorkerStaff"
                    :value="newStaffData.name"
                    @change="changeSelectedItem"
                    @clickToHeader="showNewWorkerModal"
                  /> -->
                  <SearchSelect
                    :dropdownItemsWorkerStaff="dropdownItemsWorkerStaff"
                    :value="newStaffData.name || ''"
                    actionName="Добавить нового сотрудника"
                    @change="(data) => changeSelectedItem(data, 'workers')"
                    @clickToAction="showNewWorkerModal"
                  />
                </div>

                <div>
                  <label for="numberOfHoursWorked" class="block font-bold mb-3">Трудозатраты</label>
                  <InputNumber v-model="newStaffData.numberOfHoursWorked" inputId="minmax" fluid />
                </div>

                <div>
                  <label for="salaryPerDay" class="block font-bold mb-3">В день</label>
                  <InputNumber v-model="newStaffData.salaryPerDay" inputId="minmax" fluid />
                </div>
              </div>

              <template #footer>
                <Button label="Отменить" icon="pi pi-times" text @click="newStaffDialog = false" />
                <Button
                  :disabled="!newStaffData.name.trim() || newStaffData.numberOfHoursWorked === null || newStaffData.salaryPerDay === null"
                  label="Сохранить"
                  icon="pi pi-check"
                  @click="saveNewStaff"
                />
              </template>
            </Dialog>
          </div>
        </div>

        <TaxCharges
          :computedTaxData="computedWorkerTaxData"
          :taxData="calculationData.workersTaxData"
          :totalAmount="salariesOfWorkersTotal"
          :taxTotal="taxTotal"
          :formatNumber="formatNumber"
          :coeficientOfNds="calculationData.coeficientOfNds"
          @changeCoeficient="(data) => (calculationData.coeficientOfNds = data.value)"
          @changeValue="(data) => changeTaxValue(data, 'workersTaxData')"
        />
      </div>

      <div class="grid grid-cols-1fr-40 gap-4 mb-[2rem]">
        <div class="ITR">
          <div class="card h-full">
            <div class="flex flex-row items-center justify-between gap-2 mb-4">
              <div class="font-semibold text-xl" :class="computedStyleClass">ИТР</div>

              <div class="">
                <Button
                  label="Добавить сотрудника"
                  size="small"
                  icon="pi pi-plus"
                  severity="success"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="showDialog('newITRStaffDialog')"
                />
                <Button
                  label="Удалить сотрудника"
                  size="small"
                  icon="pi pi-trash"
                  severity="danger"
                  class="mr-2 text-xs max-w-[100px]"
                  @click="confirmDeleteITRStaff()"
                  :disabled="!selectedITRStaff || !selectedITRStaff.length"
                />
              </div>
            </div>

            <div class="flex gap-2 mb-4 items-center">
              <div class="flex flex-row gap-2 items-center">
                <label for="numberOfDaysPerShift">Количество дней в мес.</label>
                <InputNumber v-model="calculationData.numberOfDaysPerShift" inputId="numberOfDaysPerShift" class="max-w-[50px]" fluid />
              </div>

              <div class="flex flex-row gap-2 items-center">
                <label for="itrWorkedDays">Количество дней (трудозатраты)</label>
                <InputNumber v-model="calculationData.itrWorkedDays" inputId="itrWorkedDays" class="max-w-[50px]" fluid />
              </div>
            </div>

            <DataTable
              :value="calculationData.itrData.table"
              v-model:selection="selectedITRStaff"
              editMode="cell"
              @cell-edit-complete="onCellEditComplete"
              showGridlines
            >
              <template #empty> Нет данных для отображения </template>

              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

              <Column field="name" header="Имя сотрудника" style="width: 25%">
                <template #body="{ data }">
                  {{ data.name }}
                </template>

                <template #editor="{ data }">
                  <Select id="staff" v-model="data.name" :options="dropdownItemsITR" class="w-full"></Select>
                </template>
              </Column>

              <Column field="salaryPerMonth" header="ЗП в месяц" style="width: 25%">
                <template #body="{ data }">
                  {{ formatNumber(data.salaryPerMonth) }}
                </template>

                <template #editor="{ data }">
                  <InputNumber v-model="data.salaryPerMonth" inputId="minmax" fluid />
                </template>
              </Column>

              <Column field="salaryPerDay" header="ЗП по факту" style="width: 25%">
                <template #body="{ data }">
                  {{
                    formatNumber(
                      truncateDecimal((data.salaryPerMonth / calculationData.numberOfDaysPerShift) * calculationData.itrWorkedDays, 0)
                    )
                  }}
                </template>
              </Column>

              <Column :exportable="false" style="min-width: 12rem">
                <template #body="slotProps">
                  <Button icon="pi pi-copy" class="mr-2" outlined rounded severity="success" @click="copyITRWorker(slotProps.data)" />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteITRStaff(slotProps.data)" />
                </template>
              </Column>

              <template #footer>
                <div class="flex justify-end gap-4 w-full">
                  <div class="flex items-center">
                    Итого ЗП за полный месяц работы: &nbsp;<span class="font-bold text-lg">
                      {{ formatNumber(salariesOfITRTotalPerMonth) }}</span
                    >
                  </div>

                  <div class="flex items-center">
                    Итого ЗП по факту: &nbsp;<span class="font-bold text-lg"> {{ formatNumber(salariesOfITRTotal) }}</span>
                  </div>
                </div>
              </template>
            </DataTable>

            <Dialog v-model:visible="newITRStaffDialog" :style="{ width: '450px' }" header="Выберите сотрудника" :modal="true">
              <div class="flex flex-col gap-6">
                <div>
                  <label for="name" class="block font-bold mb-3">Имя</label>

                  <SearchSelect
                    :dropdownItemsWorkerStaff="dropdownItemsWorkerStaff"
                    :value="newITRStaffData.name || ''"
                    actionName="Добавить нового сотрудника"
                    @change="(data) => changeSelectedItem(data, 'itr')"
                    @clickToAction="showNewWorkerModal"
                  />
                </div>

                <div>
                  <label for="salaryPerMonth" class="block font-bold mb-3">ЗП в месяц</label>
                  <InputNumber v-model="newITRStaffData.salaryPerMonth" inputId="minmax" fluid />
                </div>
              </div>

              <template #footer>
                <Button label="Отменить" icon="pi pi-times" text @click="newStaffDialog = false" />
                <Button
                  :disabled="!newITRStaffData.name.trim() || newITRStaffData.salaryPerMonth === null"
                  label="Сохранить"
                  icon="pi pi-check"
                  @click="saveNewITRStaff"
                />
              </template>
            </Dialog>
          </div>
        </div>

        <TaxCharges
          :computedTaxData="computedItrTaxData"
          :taxData="calculationData.itrTaxData"
          :totalAmount="salariesOfITRTotal"
          :taxTotal="taxITRTotal"
          :formatNumber="formatNumber"
          :coeficientOfNds="calculationData.coeficientOfNds"
          @changeCoeficient="(data) => (calculationData.coeficientOfNds = data.value)"
          @changeValue="(data) => changeTaxValue(data, 'itrTaxData')"
        />
      </div>

      <div class="card total-costs">
        <div class="flex flex-row justify-between gap-2">
          <div class="font-semibold text-xl" :class="computedStyleClass">Общие затраты</div>
        </div>

        <Accordion multiple :value="expandAccordionTotalCosts">
          <AccordionPanel value="0">
            <AccordionHeader>
              <div class="flex gap-6 items-center justify-between w-full">
                <div class="flex gap-6 items-center gap-2 w-full">
                  <span>
                    Расходники
                  </span>

                  <FileUpload
                    ref="consumablesDataFileupload"
                    mode="basic"
                    accept=".xlsx"
                    chooseLabel="Выберите файл"
                    customUpload
                    auto
                    @uploader="(e) => onUpload({ event: e, tableName: 'consumablesDataRes', accordionIndex: 0 })"
                  />
                </div>
                
                <div v-if="totalConsumables" class="flex justify-end items-center font-bold w-full mr-4">
                  Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalConsumables) }}</span>
                </div>
              </div>
            </AccordionHeader>

            <AccordionContent>
              <DataTable :value="calculationData.consumablesData" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> Нет данных для отображения </template>

                <Column field="order" header="№ п/п" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.order }}
                  </template>
                </Column>

                <Column field="name" header="Наименование" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>
                </Column>

                <Column field="quantity" header="К-во" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>
                </Column>

                <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.taxPrice }}
                  </template>
                </Column>

                <Column field="price" header="Стоимость" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.price }}
                  </template>
                </Column>

                <template #footer>
                  <div class="flex justify-end items-center font-bold w-full">
                    Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalConsumables) }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="1">
            <AccordionHeader>
              <div class="flex gap-6 items-center justify-between w-full">
                <div class="flex gap-6 items-center gap-2 w-full">
                  <span>
                    Метизы
                  </span>

                  <FileUpload
                    ref="hardwareDataFileupload"
                    mode="basic"
                    accept=".xlsx"
                    chooseLabel="Выберите файл"
                    customUpload
                    auto
                    @uploader="(e) => onUpload({ event: e, tableName: 'hardwareDataRes', accordionIndex: 1 })"
                  />
                </div>
                
                <div v-if="totalHardware" class="flex justify-end items-center font-bold w-full mr-4">
                  Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalHardware) }}</span>
                </div>
              </div>
            </AccordionHeader>

            <AccordionContent>
              <DataTable :value="calculationData.hardwareData" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> Нет данных для отображения </template>

                <Column field="order" header="№ п/п" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.order }}
                  </template>
                </Column>

                <Column field="name" header="Наименование" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>
                </Column>

                <Column field="quantity" header="К-во" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>
                </Column>

                <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.taxPrice }}
                  </template>
                </Column>

                <Column field="price" header="Стоимость" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.price }}
                  </template>
                </Column>

                <template #footer>
                  <div class="flex justify-end items-center font-bold w-full">
                    Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalHardware) }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>

          <AccordionPanel value="2">
            <AccordionHeader>
              <div class="flex gap-6 items-center justify-between w-full">
                <div class="flex gap-6 items-center gap-2 w-full">
                  <span>
                    Металл
                  </span>

                  <FileUpload
                    ref="metalDataFileupload"
                    mode="basic"
                    accept=".xlsx"
                    chooseLabel="Выберите файл"
                    customUpload
                    auto
                    @uploader="(e) => onUpload({ event: e, tableName: 'metalDataRes', accordionIndex: 2 })"
                  />
                </div>
                
                <div v-if="totalMetal" class="flex justify-end items-center font-bold w-full mr-4">
                  Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalMetal) }}</span>
                </div>
              </div>
            </AccordionHeader>

            <AccordionContent>
              <DataTable :value="calculationData.metalData" dataKey="order" :rowHover="true" showGridlines>
                <template #empty> Нет данных для отображения </template>

                <Column field="order" header="№ п/п" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.order }}
                  </template>
                </Column>

                <Column field="name" header="Наименование" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.name }}
                  </template>
                </Column>

                <Column field="unitOfMeasurement" header="ед.изм." style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.unitOfMeasurement }}
                  </template>
                </Column>

                <Column field="quantity" header="К-во" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.quantity }}
                  </template>
                </Column>

                <Column field="taxPrice" header="цена НДС" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.taxPrice }}
                  </template>
                </Column>

                <Column field="price" header="Стоимость" style="min-width: 12rem">
                  <template #body="{ data }">
                    {{ data.price }}
                  </template>
                </Column>

                <template #footer>
                  <div class="flex justify-end items-center font-bold w-full">
                    Итого: &nbsp;<span class="text-lg">{{ formatNumber(totalMetal) }}</span>
                  </div>
                </template>
              </DataTable>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </div>

    <Dialog v-model:visible="createNewWorkerDialog" header="Новый сотрудник" :style="{ width: '450px' }" modal>
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">ФИО</label>
          <InputText v-model="newWorkerData.name" type="text" />
        </div>

        <div>
          <label for="numberOfHoursWorked" class="block font-bold mb-3">Должность</label>
          <Select id="role" v-model="newWorkerData.position" :options="dropdownItemsWorkersRole" class="w-full">
            <template #value="slotProps">
              <div class="flex items-center h-[25px]">
                <div>{{ slotProps.value.label }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="createNewWorkerDialog = false" />
        <Button :disabled="!newWorkerData.name.trim()" label="Сохранить" icon="pi pi-check" @click="saveNewWorker(newWorkerData)" />
      </template>
    </Dialog>
  </Fluid>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}

.grid-cols-1fr-35 {
  grid-template-columns: 1fr 35%;
}

.grid-cols-1fr-40 {
  grid-template-columns: 1fr 38%;
}

.grid-cols-35-1fr {
  grid-template-columns: 35% 1fr;
}
</style>

<style lang="scss">
.progress_cell {
  padding: 3px 0 !important;
  height: 40px;

  &.p-datatable-header-cell {
    padding: var(--p-datatable-header-cell-padding) !important;
  }
}
</style>

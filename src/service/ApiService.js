import api from '@/service/api';

export default {
  createCalculation({
    itrWorkedDays,
    coeficientOfNds,
    costOfElectricityPerDay,
    galvanizedValue,
    numberOfDaysPerShift,
    numberOfHoursPerShift,
    rentalCostPerDay,
    profitabilityCoeficient,
    title,
    transportValue,
    dateOfCreation,
    lastEditDate,
    parentCalculationId,
    calculationType,
    consumablesData,
    hardwareData,
    metalData,
    specificationData,
    workersData,
    itrData,
    workersTaxData,
    itrTaxData,
    total
  }) {
    return api().post('/calculation', {
      itrWorkedDays,
      coeficientOfNds,
      costOfElectricityPerDay,
      galvanizedValue,
      numberOfDaysPerShift,
      numberOfHoursPerShift,
      rentalCostPerDay,
      profitabilityCoeficient,
      title,
      transportValue,
      dateOfCreation,
      lastEditDate,
      parentCalculationId,
      calculationType,
      consumablesData,
      hardwareData,
      metalData,
      specificationData,
      workersData,
      itrData,
      workersTaxData,
      itrTaxData,
      total
    });
  },

  updateCalculation({
    itrWorkedDays,
    coeficientOfNds,
    costOfElectricityPerDay,
    galvanizedValue,
    numberOfDaysPerShift,
    numberOfHoursPerShift,
    rentalCostPerDay,
    profitabilityCoeficient,
    title,
    transportValue,
    lastEditDate,
    id,
    consumablesData,
    hardwareData,
    metalData,
    specificationData,
    workersData,
    itrData,
    workersTaxData,
    itrTaxData,
    total
  }) {
    return api().put(`/calculation/${id}`, {
      itrWorkedDays,
      coeficientOfNds,
      costOfElectricityPerDay,
      galvanizedValue,
      numberOfDaysPerShift,
      numberOfHoursPerShift,
      rentalCostPerDay,
      profitabilityCoeficient,
      title,
      transportValue,
      lastEditDate,
      consumablesData,
      hardwareData,
      metalData,
      specificationData,
      workersData,
      itrData,
      workersTaxData,
      itrTaxData,
      total
    });
  },

  getCalculations() {
    return api().get('/calculations');
  },

  getCalculationById(id) {
    return api().get(`/calculation/${id}`);
  },

  createParentCalculation({ title }) {
    return api().post('/parent-calculation', { title });
  },

  getParentCalculations() {
    return api().get('/parent-calculations');
  },

  getParentCalculationById(id) {
    return api().get(`/parent-calculation/${id}`);
  },

  getParentCalculationChildren(parentId) {
    return api().get(`/calculation?id=${parentId}`);
  },

  deleteItemFromWorkersData(workerId) {
    return api().delete(`/workers-data-table/${workerId}`);
  },

  deleteItemFromItrData(workerId) {
    return api().delete(`/itr-data-table/${workerId}`);
  },

  deleteItemFromSpecificationData(specificationId) {
    return api().delete(`/specification-data-table/${specificationId}`);
  },

  deleteItemFromParentCalculation(parentCalculationId) {
    return api().delete(`/parent-calculation/${parentCalculationId}`);
  },

  deleteCalculation(calculationId) {
    return api().delete(`/calculation/${calculationId}`);
  },

  createWorker({ name, lastname, position }) {
    return api().post('/worker', {
      name,
      lastname,
      position
    });
  },

  getWorkers() {
    return api().get('/workers');
  },

  test() {
    return api().get('/test');
  }
};

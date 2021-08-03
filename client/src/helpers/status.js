const status = {
  not_mailed: 'non contacté',
  not_confirmed: 'non confirmé',
  confirmed: 'confirmé',
  need_correction: 'à corriger'
};

const statusValues = Object.values(status);

const statusFilters = statusValues.map(status => {
  return {
    text: status,
    value: status,
  };
});

export {status, statusFilters };

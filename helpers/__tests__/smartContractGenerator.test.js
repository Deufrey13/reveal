const { ExpectationFailed } = require("http-errors");
const smartContractGenerator = require("../smartContractGenerator");

test ('Should return a formatted url', async () => {
  const url = await smartContractGenerator('610bc8699b7a4d00157d723a');
  const regex = /^(https:\/\/reveal\/smart-contract\/)(\S){60}(.com)$/;
  expect(regex.test(url)).toBeTruthy();
});
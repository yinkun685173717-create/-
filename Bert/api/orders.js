const { handleOrdersApi } = require("../lib/orders");

module.exports = async function handler(request, response) {
  await handleOrdersApi(request, response);
};

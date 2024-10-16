const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/recommend",
    createProxyMiddleware({
      target: "https://similar-product.azurewebsites.net",
      changeOrigin: true,
    })
  );

  app.use(
    "/get_most_selling_product",
    createProxyMiddleware({
      target: "https://reccomendation-customer-history.azurewebsites.net",
      changeOrigin: true,
      pathRewrite: {
        "^/get_most_selling_product": "/get_most_selling_product",
      },
    })
  );
};

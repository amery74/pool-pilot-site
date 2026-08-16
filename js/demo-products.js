(() => {
  const root = document.querySelector('[data-poolpilot-official-demo]');
  if (!root) return;

  const DEMO_PRODUCTS = [
    {
      entity_id: 'sensor.demo_product_ph_minus',
      state: '5',
      attributes: {
        id: 'demo-ph-minus',
        product_id: 'demo-ph-minus',
        friendly_name: 'pH- granulés',
        name: 'pH- granulés',
        brand: 'Produit de démonstration',
        category: 'ph_minus',
        category_label: 'pH-',
        product_type: 'ph_minus',
        form: 'granules',
        stock_quantity: 5,
        initial_stock_quantity: 5,
        stock_max: 5,
        stock_unit: 'kg',
        unit_of_measurement: 'kg',
        dose_unit: 'g',
        reference_volume_m3: 10,
        normal_dose_amount: 100,
        ph_delta: 0.1,
        treatment_place: 'pool',
      },
    },
    {
      entity_id: 'sensor.demo_product_chlorine_shock',
      state: '5',
      attributes: {
        id: 'demo-chlorine-shock',
        product_id: 'demo-chlorine-shock',
        friendly_name: 'Chlore choc granulés',
        name: 'Chlore choc granulés',
        brand: 'Produit de démonstration',
        category: 'chlorine_shock',
        category_label: 'Chlore choc',
        product_type: 'chlorine_shock',
        form: 'granules',
        stock_quantity: 5,
        initial_stock_quantity: 5,
        stock_max: 5,
        stock_unit: 'kg',
        unit_of_measurement: 'kg',
        dose_unit: 'g',
        reference_volume_m3: 10,
        normal_dose_amount: 150,
        shock_dose_amount: 150,
        treatment_place: 'pool',
      },
    },
  ];

  customElements.whenDefined('pool-pilot-dashboard').then(() => {
    const Card = customElements.get('pool-pilot-dashboard');
    if (!Card || Card.prototype.__poolPilotDemoProductsPatched) return;

    const originalProducts = Card.prototype._products;
    Card.prototype._products = function () {
      const products = typeof originalProducts === 'function' ? originalProducts.call(this) : [];
      if (Array.isArray(products) && products.length) return products;
      return DEMO_PRODUCTS.map((product) => ({
        entity_id: product.entity_id,
        state: product.state,
        attributes: { ...product.attributes },
      }));
    };

    Card.prototype.__poolPilotDemoProductsPatched = true;

    const card = root.querySelector('pool-pilot-dashboard');
    if (card) {
      card.config = { ...(card.config || {}), enable_pool_house: true };
      if (typeof card.render === 'function') card.render();
    }
  });
})();

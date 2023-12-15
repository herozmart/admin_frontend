export function calculateTotalWithDeliveryPrice(deliveries, total) {
  const totalDeliveryPrice = deliveries.reduce(
    (total, item) => (total += item.delivery_fee),
    0
  );
  let totalPrice = total;

  if (totalDeliveryPrice) {
    totalPrice += totalDeliveryPrice;
  }

  return totalPrice;
}

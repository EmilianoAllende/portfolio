type CartItem = {
  price: number;
  quantity: number;
};

export const getTotalAmount = (items: CartItem[]) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);
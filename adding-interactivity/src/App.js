import { useState } from "react";

const initialProducts = [
  {
    id: 0,
    name: "Baklava",
    count: 1,
  },
  {
    id: 1,
    name: "Cheese",
    count: 5,
  },
  {
    id: 2,
    name: "Spaghetti",
    count: 2,
  },
];

export default function ShoppingCart() {
  const [products, setProducts] = useState(initialProducts);

  function handleIncreaseClick(productId) {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, count: product.count + 1 }
          : product
      )
    );
  }

  function handleDescreaseClick(productId) {
    setProducts(
      products
        .map((product) =>
          product.id === productId
            ? { ...product, count: product.count - 1 }
            : product
        )
        .filter((product) => product.count > 0)
    );
  }

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} (<b>{product.count}</b>)
          <button onClick={() => handleIncreaseClick(product.id)}>+</button>
          <button onClick={() => handleDescreaseClick(product.id)}>–</button>
        </li>
      ))}
    </ul>
  );
}

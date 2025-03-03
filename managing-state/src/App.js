import { useState } from "react";
import { foods, filterItems } from "./data.js";

function SearchBar({ query, handleChange }) {
  return (
    <label>
      Search: <input value={query} onChange={handleChange} />
    </label>
  );
}

function List({ items }) {
  return (
    <table>
      {items.map((food) => (
        <tr key={food.id}>
          <td>{food.name}</td>
          <td>{food.description}</td>
        </tr>
      ))}
    </table>
  );
}

export default function FilterableList() {
  const [query, setQuery] = useState("");
  const filteredItems = filterItems(foods, query);

  return (
    <>
      <SearchBar query={query} handleChange={(e) => setQuery(e.target.value)} />
      <hr />
      <List items={filteredItems} />
    </>
  );
}

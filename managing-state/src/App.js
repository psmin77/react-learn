import { useState } from "react";
import { letters } from "./data.js";
import Letter from "./Letter.js";

export default function MailClient() {
  const [selectedIds, setSelectedIds] = useState([]);

  function handleToggle(toggledId) {
    // TODO: allow multiple selection
    const foundItem = selectedIds.includes(toggledId);

    const newIds = foundItem
      ? selectedIds.filter((id) => id !== toggledId)
      : [...selectedIds, toggledId];
    setSelectedIds([...newIds]);
  }

  return (
    <>
      <h2>Inbox</h2>
      <ul>
        {letters.map((letter) => (
          <Letter
            key={letter.id}
            letter={letter}
            isSelected={selectedIds.includes(letter.id)}
            onToggle={handleToggle}
          />
        ))}
        <hr />
        <p>
          <b>You selected {selectedIds.length} letters</b>
        </p>
      </ul>
    </>
  );
}

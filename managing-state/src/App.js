import { useState } from "react";

function Input({ label, text, onChangeText }) {
  return (
    <label>
      {label}{" "}
      <input value={text} onChange={(e) => onChangeText(e.target.value)} />
    </label>
  );
}

export default function SyncedInputs() {
  const [text, setText] = useState("");

  return (
    <>
      <Input label="First input" text={text} onChangeText={setText} />
      <Input label="Second input" text={text} onChangeText={setText} />
    </>
  );
}

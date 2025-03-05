import { useRef } from 'react';

export default function Page() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <nav>
        <button onClick={handleClick}>Search</button>
      </nav>
      <input
      ref={inputRef}
        placeholder="Looking for something?"
      />
    </>
  );
}

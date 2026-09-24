import { useEffect, useState } from "react";

// Returns a version of `value` that only updates after the value has
// stopped changing for `delay` ms. Used so we don't call the API on every
// keystroke while the user is still typing.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cancels the pending update if value changes again before delay passes
  }, [value, delay]);

  return debounced;
}
import { useEffect, useState } from "react";

/**
 * https://developer.mozilla.org/docs/Web/API/Window/matchMedia
 */
export default function useMediaQuery(
  query: string,
  initialValue: boolean = false,
  initialCheckInEffect: boolean = true,
) {
  const [matches, setMatches] = useState(initialValue);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    if (initialCheckInEffect) listener();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

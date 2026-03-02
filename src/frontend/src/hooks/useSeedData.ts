import { useEffect, useRef } from "react";
import { useActor } from "./useActor";

const SEED_KEY = "vtc_seeded_v1";

export function useSeedData() {
  const { actor } = useActor();
  const seeded = useRef(false);

  useEffect(() => {
    if (!actor || seeded.current) return;
    if (localStorage.getItem(SEED_KEY)) {
      seeded.current = true;
      return;
    }

    seeded.current = true;
    actor
      .seedDemoData()
      .then(() => {
        localStorage.setItem(SEED_KEY, "1");
      })
      .catch(() => {
        seeded.current = false;
      });
  }, [actor]);
}

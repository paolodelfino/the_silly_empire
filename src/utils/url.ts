export async function urlConnectionExists(url: string) {
  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 2000);

    try {
      await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        mode: "no-cors",
      });
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }

    return true;
  } catch (error) {
    return false;
  }
}

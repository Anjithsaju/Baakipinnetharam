export async function isUserInSession(): Promise<boolean> {
  try {
    const res = await fetch("https://baakipinnetharam.onrender.com/session", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.warn(`Session check failed with status ${res.status}`);
      return false;
    }

    const data = await res.json();
    return !!data.session; // Convert truthy to actual boolean
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}

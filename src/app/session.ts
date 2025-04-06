export async function isUserInSession(): Promise<boolean> {
  try {
    const res = await fetch("https://baakipinnetharam.onrender.com/session", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    return data.loggedIn;
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}

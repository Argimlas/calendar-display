const API = {
  baseUrl: window.location.origin,

  async fetchStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`);
      if (!response.ok) throw new Error("Status fetch failed");
      return await response.json();
    } catch (error) {
      console.error("API Error (fetchStatus):", error);
      return null;
    }
  },

  async fetchEvents(year, month) {
    try {
      const monthStr = `${year}-${String(month).padStart(2, "0")}`;
      const response = await fetch(
        `${this.baseUrl}/api/events?month=${monthStr}`,
      );
      if (!response.ok) throw new Error("Events fetch failed");
      return await response.json();
    } catch (error) {
      console.error("API Error (fetchEvents):", error);
      return null;
    }
  },

  async quickBook(durationMinutes, title) {
    try {
      const response = await fetch(`${this.baseUrl}/api/quickbook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: durationMinutes, title }),
      });
      if (!response.ok) throw new Error("Quick booking failed");
      return await response.json();
    } catch (error) {
      console.error("API Error (quickBook):", error);
      return null;
    }
  },

  async createBooking(date, startTime, endTime, title) {
    try {
      const response = await fetch(`${this.baseUrl}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime, endTime, title }),
      });
      if (!response.ok) throw new Error("Booking failed");
      return await response.json();
    } catch (error) {
      console.error("API Error (createBooking):", error);
      return null;
    }
  },

  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/status`);
      if (!response.ok) throw new Error("Auth check failed");
      return await response.json();
    } catch (error) {
      console.error("API Error (checkAuthStatus):", error);
      return { authenticated: false };
    }
  },
};

window.API = API;

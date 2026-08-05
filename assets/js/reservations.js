/* Reservation request form — no backend yet, so a submission is just
   logged to the console and the visitor gets an inline confirmation.
   See README for what a real implementation needs next. */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservation-form");
  const confirmation = document.getElementById("reservation-confirmation");
  if (!form) return;

  // Don't let anyone pick a date that's already passed.
  const dateInput = form.querySelector('input[name="date"]');
  if (dateInput) {
    dateInput.min = new Date().toISOString().slice(0, 10);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      partySize: form.partySize.value,
      date: form.date.value,
      time: form.time.value,
      specialRequests: form.specialRequests.value.trim(),
      submittedAt: new Date().toISOString()
    };

    // This is where a real implementation would call an API to actually
    // notify the restaurant — see the README's "Reservations" section.
    console.log("[Reservation request]", data);

    form.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector(".reservation-summary").textContent =
      `Party of ${data.partySize} on ${data.date} at ${data.time}, under ${data.name}.`;
  });
});

(() => {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const guestCountInput = document.getElementById("guestCount");
  const extraGuestsWrap = document.getElementById("extraGuests");
  const statusEl = document.getElementById("form-status");
  const trackerLink = document.getElementById("tracker-link");

  const TRACKER_URL = "https://example.com/your-excel-rsvp-tracker";

  const renderAdditionalGuestFields = () => {
    const guestCount = Number.parseInt(guestCountInput.value || "0", 10);
    extraGuestsWrap.innerHTML = "";

    if (guestCount <= 0) return;

    for (let i = 0; i < guestCount; i += 1) {
      const card = document.createElement("section");
      card.className = "guest-card";
      card.innerHTML = `
        <h3>Additional Guest ${i + 1}</h3>
        <div class="form-row">
          <label for="guestName-${i}">Full Name</label>
          <input id="guestName-${i}" name="guestName-${i}" type="text" required />
        </div>
        <div class="form-row">
          <label for="guestEmail-${i}">Email (optional)</label>
          <input id="guestEmail-${i}" name="guestEmail-${i}" type="email" />
        </div>
      `;
      extraGuestsWrap.appendChild(card);
    }
  };

  const buildPayload = () => {
    const additionalGuestCount = Number.parseInt(guestCountInput.value || "0", 10);
    const additionalGuests = [];

    for (let i = 0; i < additionalGuestCount; i += 1) {
      const guestName = form.querySelector(`#guestName-${i}`)?.value?.trim();
      const guestEmail = form.querySelector(`#guestEmail-${i}`)?.value?.trim();

      if (!guestName) {
        throw new Error(`Please enter a full name for Additional Guest ${i + 1}.`);
      }

      additionalGuests.push({
        name: guestName,
        email: guestEmail || ""
      });
    }

    return {
      timestamp: new Date().toISOString(),
      parent: {
        name: form.parentName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        attendance: form.attendance.value
      },
      additionalGuestCount,
      additionalGuests,
      notes: form.notes.value.trim()
    };
  };

  guestCountInput.addEventListener("input", renderAdditionalGuestFields);
  renderAdditionalGuestFields();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "Submitting...";
    statusEl.style.color = "var(--muted)";

    try {
      if (!form.checkValidity()) {
        form.reportValidity();
        throw new Error("Please complete all required fields.");
      }

      const payload = buildPayload();
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("RSVP submission failed. Please try again.");
      }

      statusEl.textContent = "RSVP received. Thank you!";
      statusEl.style.color = "#1d6e2f";
      form.reset();
      renderAdditionalGuestFields();

      trackerLink.href = TRACKER_URL;
      trackerLink.classList.remove("hidden");
    } catch (error) {
      statusEl.textContent = error.message || "Submission error. Please try again.";
      statusEl.style.color = "#992727";
    }
  });
})();

document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../public/login.html";
        return;
    }

    function handleAuthError(res) {
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "../public/login.html";
            return true;
        }
        return false;
    }

    function getStatusClass(status) {

        switch (status) {

            case "Scheduled":
                return "pending";

            case "Confirmed":
                return "confirmed";

            case "In Progress":
                return "progress";

            case "Cancelled":
                return "cancelled";

            case "Late":
                return "late";

            default:
                return "";
        }

    }

    const petList = document.querySelector(".pet-list");

    // ---------------- OWNER ----------------
    async function loadOwner() {
        try {
            const res = await fetch("/api/users/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (handleAuthError(res)) return;

            if (!res.ok) {
                console.error("Failed to load owner");
                return;
            }

            const owner = await res.json();

            document.querySelector(".owner-name").textContent =
                `${owner.first_name} ${owner.last_name}`;

            document.querySelector(".owner-email").textContent =
                owner.email;

            document.querySelector(".owner-phone").textContent =
                owner.phone_number;

        } catch (err) {
            console.error("Owner error:", err);
        }
    }

    async function loadAppointments() {

        const res = await fetch("/api/appointments", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (handleAuthError(res)) return;

        if (!res.ok) {
            console.error("Failed to load appointments");
            return;
        }

        const appointments = await res.json();

        console.log(appointments);

        const container = document.querySelector(".appointments-grid");

        container.innerHTML = "";

        const upcoming = appointments.filter(appointment => {

            return (
                new Date(appointment.start_datetime) >= new Date() &&
                appointment.status !== "Completed" &&
                appointment.status !== "Cancelled" &&
                appointment.status !== "No Show"
            );

        });

        if (upcoming.length === 0) {

            container.innerHTML = `
                    <div class="appointment-card">
                        <p>No upcoming appointments.</p>
                    </div>
                `;

                return;
            }

            upcoming.forEach(appointment => {

                const card = document.createElement("div");

                card.className = "appointment-card";

                const date = new Date(appointment.start_datetime);

                const groomer =
                    appointment.staff_first_name && appointment.staff_last_name
                        ? `${appointment.staff_first_name} ${appointment.staff_last_name}`
                        : "Not assigned";

                card.innerHTML = `
                    <div class="ticket-card">

                        <div class="ticket-stub">

                            <span class="stub-label">
                                Pet
                            </span>

                            <div class="stub-heading">

                                <h3>${appointment.pet_name}</h3>

                                <span class="stamp ${getStatusClass(appointment.status)}">
                                    ${appointment.status}
                                </span>

                            </div>

                        </div>

                        <div class="ticket-perf"></div>

                        <div class="ticket-details">

                            <dl>

                                <div>
                                    <dt>Date</dt>
                                    <dd>${date.toLocaleDateString()}</dd>
                                </div>

                                <div>
                                    <dt>Time</dt>
                                    <dd>${date.toLocaleTimeString([], {
                                        hour: "numeric",
                                        minute: "2-digit"
                                    })}</dd>
                                </div>

                                <div>
                                    <dt>Groomer</dt>
                                    <dd>${groomer}</dd>
                                </div>

                                <div>
                                    <dt>Total</dt>
                                    <dd>₱${Number(appointment.total_price).toFixed(2)}</dd>
                                </div>

                                <div>
                                    <dt>Payment</dt>
                                    <dd>${appointment.payment_status}</dd>
                                </div>

                            </dl>

                        </div>

                        <div class="ticket-actions">

                            <button class="btn-outline">
                                View
                            </button>

                            <button class="btn-text-danger">
                                Cancel
                            </button>

                        </div>

                    </div>
            `;

            container.appendChild(card);

        });

    }

    loadOwner();
    loadAppointments();

});
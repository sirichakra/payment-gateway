const API = "http://localhost:8000";

fetch(`${API}/payments`)
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById("transactions");
    tbody.innerHTML = "";

    data.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.order_id || "-"}</td>
        <td>₹${p.amount / 100}</td>
        <td>${p.method}</td>
        <td class="${p.status}">${p.status}</td>
        <td>${new Date(p.created_at).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => {
    alert("Failed to load transactions");
    console.error(err);
  });

  const apiKey = localStorage.getItem("apiKey");
const apiSecret = localStorage.getItem("apiSecret");

if (!apiKey || !apiSecret) {
  window.location.href = "login.html";
}
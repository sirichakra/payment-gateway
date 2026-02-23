const API = "http://localhost:8000";

fetch(`${API}/payments`)
  .then(res => res.json())
  .then(data => {
    let total = data.length;
    let success = 0;
    let failed = 0;

    const tbody = document.getElementById("transactions");
    tbody.innerHTML = "";

    data.forEach(p => {
      if (p.status === "success") success++;
      if (p.status === "failed") failed++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>₹${p.amount / 100}</td>
        <td class="${p.status}">${p.status}</td>
        <td>${new Date(p.created_at).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("total").innerText = total;
    document.getElementById("success").innerText = success;
    document.getElementById("failed").innerText = failed;
  })
  .catch(err => {
    alert("Failed to load dashboard data");
    console.error(err);
  });

  const apiKey = localStorage.getItem("apiKey");
const apiSecret = localStorage.getItem("apiSecret");

if (!apiKey || !apiSecret) {
  window.location.href = "login.html";
}
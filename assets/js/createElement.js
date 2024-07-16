import {constructGraph} from "./index.js";

export function createTableRow(data) {
    let row = document.createElement("tr");
    row.classList.add("transaction-table__body-row");
    row.setAttribute("tabindex", "0");
    row.setAttribute("data-custid", data.customer_id);

    row.innerHTML = `
        <td class="transaction-table__body-name">${data.name}</td>
        <td class="transaction-table__body-date">${data.date}</td>
        <td class="transaction-table__body-amount">${data.amount}</td>
    `;

    row.addEventListener("click", constructGraph);

    row.addEventListener("focus", function() {
        this.classList.add("focused-row");
    });

    row.addEventListener("blur", function() {
        this.classList.remove("focused-row");
    });

    return row;
}
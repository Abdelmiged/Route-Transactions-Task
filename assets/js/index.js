import * as element from "./createElement.js";

let tableBody = document.querySelector(".transaction-table tbody");
let barChartCanvas = document.getElementById("barChart");
let currentChart = null;
let chartBackgroundColor = "rgb(255, 255, 255)";

window.addEventListener("load", async function() {
    let data = await getData("/Route-Transactions-Task/assets/data/transactions.json");
    
    initializeTable(data);
});

document.querySelector(".filter-form__name-field").addEventListener("input", function() {
    filterByName(this.value.toLowerCase());
});

document.querySelector(".filter-form__amount-field").addEventListener("input", function() {
    filterByAmount(Number(this.value));
});

document.querySelector(".options-menu__floater-button").addEventListener("click", function() {
    let optionsMenu = document.querySelector(".options-menu__sorting-floater");
    optionsMenu.classList.toggle("top-0");
    optionsMenu.classList.toggle("-top-[4.5rem]");
    optionsMenu.classList.toggle("opacity-0");
    optionsMenu.classList.toggle("opacity-100");
});

document.querySelector(".sort-by-name__ascending").addEventListener("click", function() {
    sortRows("name", true);
});

document.querySelector(".sort-by-name__descending").addEventListener("click", function() {
    sortRows("name", false);
});

document.querySelector(".sort-by-date__ascending").addEventListener("click", function() {
    sortRows("date", true);
});

document.querySelector(".sort-by-date__descending").addEventListener("click", function() {
    sortRows("date", false);
});

document.querySelector(".sort-by-amount__ascending").addEventListener("click", function() {
    sortRows("amount", true);
});

document.querySelector(".sort-by-amount__descending").addEventListener("click", function() {
    sortRows("amount", false);
});

document.querySelector(".options-menu__dark-mode-button").addEventListener("click", function() {
    document.documentElement.classList.toggle("dark");

    const root = document.querySelector(":root");
    if(document.documentElement.classList.contains("dark")) {
        root.style.setProperty("--odd-row-bg-clr", "#646464");
        root.style.setProperty("--even-row-bg-clr", "#1e1e1e");
        root.style.setProperty("--row-text-clr", "black");
        chartBackgroundColor = "rgb(47, 47, 47)";
    }
    else {
        root.style.setProperty("--odd-row-bg-clr", "rgb(240, 242, 248)");
        root.style.setProperty("--even-row-bg-clr", "#ffffff");
        root.style.setProperty("--row-text-clr", "white");
        chartBackgroundColor = "rgb(255, 255, 255)";
    }

    this.querySelector(".light-mode-icon").classList.toggle("hidden");
    this.querySelector(".dark-mode-icon").classList.toggle("hidden");
    currentChart.update();
});

async function getData(link) {
    let response = await fetch(link);
    let data = await response.json();
    return data;
}


function initializeTable(data) {
    for(let i = 0; i < data.transactions.length; i++) {
        let row = element.createTableRow(
            {
                customer_id: data.transactions[i].customer_id,
                name: getName(data.customers, data.transactions[i].customer_id),
                date: data.transactions[i].date,
                amount: data.transactions[i].amount,
            }
        );

        if((i + 1) % 2 == 1)
            row.classList.add("odd-row-color");
        else
            row.classList.add("even-row-color");

        tableBody.append(row);
    }

    document.querySelectorAll(".transaction-table__body-row")[0].click();
}

function getName(customers, id) {
    for(let customer of customers) {
        if(customer.id === id)
            return customer.name;
    }
}

function filterByName(value) {
    let tableRows = tableBody.querySelectorAll(".transaction-table__body-row");

    for(let tableRow of tableRows) {
        let indexValue = tableRow.querySelector(".transaction-table__body-name").textContent.toLowerCase().indexOf(value);

        if(indexValue == -1)
            tableRow.classList.add("hidden", "hidden-name");
        else if(indexValue > -1 && tableRow.classList.contains("hidden") && !tableRow.classList.contains("hidden-amount"))
            tableRow.classList.remove("hidden", "hidden-name");
        else
            tableRow.classList.remove("hidden-name");
    }

    repaintRows(tableRows);
}


function filterByAmount(value) {
    let tableRows = tableBody.querySelectorAll(".transaction-table__body-row");

    for(let tableRow of tableRows) {
        let amountValue = tableRow.querySelector(".transaction-table__body-amount").textContent;

        if(Number(amountValue) < value)
            tableRow.classList.add("hidden", "hidden-amount");
        else if(Number(amountValue) >= value && !tableRow.classList.contains("hidden-name"))
            tableRow.classList.remove("hidden", "hidden-amount");
        else
            tableRow.classList.remove("hidden-amount");
    }

    repaintRows(tableRows);
}


function repaintRows(tableRows) {
    let filteredRows = Array.from(tableRows).filter(function(element) {
        return !element.classList.contains("hidden");
    })

    for(let i = 0; i < filteredRows.length; i++) {
        filteredRows[i].classList.add("no-transition");
        if((i + 1) % 2 == 1) {
            filteredRows[i].classList.add("odd-row-color");
            filteredRows[i].classList.remove("even-row-color");
            filteredRows[i].offsetHeight; // This line is used to call on computed values to flush the reflow/repaint queue and force scheduled style changes before transition is turned back on
            // All explained in the following article https://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
        }
        else {
            filteredRows[i].classList.add("even-row-color");
            filteredRows[i].classList.remove("odd-row-color");
            filteredRows[i].offsetHeight;
        }
        filteredRows[i].classList.remove("no-transition");
    }
}

function sortRows(sortCriteria, sortOrder) {
    let rows = Array.from(document.querySelectorAll(".transaction-table__body-row"));
    rows = rows.sort((a, b) => {
        let aValue = a.querySelector(`.transaction-table__body-${sortCriteria}`).textContent;
        let bValue = b.querySelector(`.transaction-table__body-${sortCriteria}`).textContent;

        if(sortCriteria == "amount") {
            aValue = Number(aValue);
            bValue = Number(bValue);
        }

        if(aValue < bValue) {
            return (sortOrder) ? -1 : 1;
        }
        else if(aValue > bValue) {
            return (sortOrder) ? 1 : -1;
        }

        return 0;
    });
    
    emptyTable();
    insertRows(rows);
}

function emptyTable() {
    for(let item of tableBody.querySelectorAll(".transaction-table__body-row")) {
        item.remove();
    }
}

function insertRows(rows) {
    for(let item of rows) {
        tableBody.append(item);
    }
    repaintRows(rows);
}

// Chart Plugin
const chartAreaBackgroundColor = {
    id: "chartAreaBackgroundColor",
    beforeDraw(chart, args, plugins) {
        const {ctx, chartArea: {
            top,
            bottom,
            left,
            right,
            width,
            height
        }} = chart;

        ctx.save();
        ctx.fillStyle = chartBackgroundColor;
        ctx.fillRect(left, top, width, height);
    },
};


export async function constructGraph() {
    if(currentChart != null || currentChart != undefined) 
        currentChart.destroy();

    let customerId = this.getAttribute("data-custid");

    let data = await getData("/Route-Transactions-Task/assets/data/transactions.json");
    
    let customerTransactions = new Map();
    
    for(let item of data.transactions) {
        if(customerId == item.customer_id) {
            if(customerTransactions.has(item.date))
                customerTransactions.set(item.date, customerTransactions.get(item.date) + item.amount);
            else
                customerTransactions.set(item.date, item.amount);
        }
    }

    customerTransactions = new Map([...customerTransactions.entries()].sort());

    currentChart = new Chart(barChartCanvas, {
        type: 'bar',
        data: {
            labels: Array.from(customerTransactions.keys()),
            datasets: [
                {
                    label: this.querySelector(".transaction-table__body-name").textContent,
                    data: Array.from(customerTransactions.values()),
                },
            ],
        },
        options: {
            elements: {
                bar: {
                    backgroundColor: "rgb(232, 181, 247)",
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                },
                y: {
                    beginAtZero: true,
                },
            },
            barThickness: 100,
        },
        plugins: [chartAreaBackgroundColor],
    });

    document.querySelector(".canvas-container").scrollIntoView(false);
}
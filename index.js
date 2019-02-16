// {
//   bills: [
//     {
//       date: DateTime,
//       description: "Dinner",
//       category: "Food",
//       amount: 25,
//     },
//     {
//       date: DateTime,
//       description: "Watch Aquaman with family.",
//       category: "Entertainment",
//       amount: 40
//     }
//   ];
//   sortBy: "date";
//   order: {
//     date: "descending"
//     description: "descending"
//     category: "descending"
//     amount: "descending"
//   }
// }

document.addEventListener("DOMContentLoaded", () => {
  const expenses = loadData()

  loadTable(expenses)
  loadCategory(expenses)
  addDeleteHandler(expenses)
})


const form = document.querySelector(".form")
const category = document.querySelector("#category")
const remove_category = document.querySelector("#remove_category")
const category_add = document.querySelector("#category_add")
const category_remove = document.querySelector("#category_remove")
const table_body = document.querySelector("#table-body")
const sort_buttons = document.querySelectorAll(".sort-btn")

// Event Listener

form.addEventListener("submit", onFormSubmit)
category_add.addEventListener("submit", onCategoryAdd)
category_remove.addEventListener("submit", onCategoryRemove)
sort_buttons.forEach(button => {
  button.addEventListener("click", onClickSort)
})

// Listener

function onFormSubmit(event) {
  event.preventDefault();

  const form_elements = Array.from(event.target.elements).slice(0, -1)
  const bill = form_elements.reduce((obj, element) => {
    const { name, value } = element
    obj[name] = value
    return obj
  }, {})

  if (validInput(bill)) {
    bill["id"] = generateID(bill)
    addBill(bill)
    
    for (let i = 0; i < event.target.elements.length; i++) {
      console.log(i)
      if (i === 2 || i === 4) {
        continue
      }
      event.target.elements[i].value = ""
    }
    updateCharts()
  }
}

function onCategoryAdd(event) {
  event.preventDefault()

  const { value } = event.target.elements.add_category
  addCategory(value)

  event.target.elements.add_category.value = ""
}

function onCategoryRemove(event) {
  event.preventDefault()

  const expenses = loadData()

  const { value } = event.target.elements.remove_category
  removeCategory(expenses, value)
  removeBillsWith(expenses, value)
  loadCategory(expenses)
  loadTable(expenses)
  updateCharts()
}

function onClickSort(event) {
  const { keyword } = event.target.dataset

  const expenses = loadData()

  sortBillsBy(expenses, keyword)
  updateCharts()
}

function onClickDelete(event) {
  const { id } = event.target.dataset
  const expenses = loadData()

  expenses.bills = expenses.bills.filter(bill => bill["id"] !== id)

  saveData(expenses)
  loadTable(expenses)
  addDeleteHandler()
  updateCharts()
}

// Event Listener for Dynamic Delete Elements

function addDeleteHandler() {
  const delete_buttons = document.querySelectorAll(".btn-delete")
  delete_buttons.forEach(button => {
    button.addEventListener("click", onClickDelete)
  })
}


// Data handler

function loadData() {
  const example_expenses = {
    bills: [
      {
        amount: 10,
        category: "Food",
        date: "2019-01-04",
        description: "Pizza",
        id: "2019-01-04PizzaFood100.44793901387493196"
      },
      {
        amount: 5,
        category: "Food",
        date: "2019-01-05",
        description: "Egg",
        id: "2019-01-05EggFood50.3767270936665854"
      },
      {
        amount: 10,
        category: "Electronic",
        date: "2019-01-07",
        description: "Hairdryer",
        id: "2019-01-07HairdryerElectronic100.8916893624568858"
      },
      {
        amount: 4,
        category: "Food",
        date: "2019-01-09",
        description: "Döner",
        id: "2019-01-09DönerFood40.6601415974956448"
      },
    ], 
    sortBy: "date", 
    order: {
      date: "descending",
      description: "descending",
      category: "descending",
      amount: "descending"
    }, 
    categories: ["Entertainment", "Food", "Electronic"]
  }

  const expenses = JSON.parse(localStorage.getItem("Expenses")) || example_expenses

  // Convert Number Strings into Numbers
  expenses.bills = expenses.bills.map(bill => {
    bill.amount = Number(bill.amount)
    return bill
  })
  
  return expenses
}

function saveData(expenses) {
  localStorage.setItem("Expenses", JSON.stringify(expenses))
}


// Bill handler

function addBill(bill) {
  const expenses = loadData()

  expenses.bills.unshift(bill)

  expenses.bills = sort(expenses.sortBy, expenses.order, expenses.bills)

  saveData(expenses)
  loadTable(expenses)
  addDeleteHandler()
  daily_keys = Object.keys(dailyAmount())
  daily_values = Object.values(dailyAmount())
  myChart.update()
}



function validInput(bill) {
  data = Object.values(bill)
  return data.every(str => str.length > 0)
}

// Category handler

function addCategory(category) {
  const expenses = loadData()

  if (expenses.categories.includes(category)) {
    
  } else {
    expenses.categories.push(category)
    expenses.categories.sort()
    saveData(expenses)
    loadCategory(expenses)
  }
}

function removeCategory(expenses, category) {
  expenses.categories = expenses.categories.filter(cat => cat != category)
  saveData(expenses)
}

function removeBillsWith(expenses, category) {
  expenses.bills = expenses.bills.filter(bill => (
    bill.category != category
  ))
  saveData(expenses)
  return expenses
}


// Sort handler

function sort(by, order, bills) {
  function compare(el1, el2) {
    if (el1[by] < el2[by]) {
      return order === "descending" ? 1 : -1
    } else if (el1[by] > el2[by]) {
      return order === "descending" ? -1 : 1
    } else {
      return 0
    }
  }

  return bills.sort(compare)
}

function changeOrder(expenses) {
  let order = expenses.order[expenses.sortBy]

  if (order === "descending") {
    order = "ascending"
  } else {
    order = "descending"
  }
  expenses.order[expenses.sortBy] = order
  return expenses
}

function setSortBy(expenses, keyword) {
  expenses.sortBy = keyword
  return expenses
}

function sortBillsBy(expenses, keyword) {
  setSortBy(expenses, keyword)
  changeOrder(expenses)

  const { sortBy, order } = expenses
  expenses.bills = sort(sortBy, order[sortBy], expenses.bills)

  saveData(expenses)
  loadTable(expenses)
  addDeleteHandler()
}

// Generator

function generateID(bill) {
  const { date, description, category, amount } = bill
  const description_array = description.split(" ")
  const id = date + description_array[0] + category + amount + Math.random()
  return id
}

// Caculate Expenses for Charts

function dailyAmount() {
  const expenses = loadData()

  const { bills } = expenses

  const daily_array = bills.reduce((obj, bill) => {
    const { date, amount } = bill

    if (obj[date]) {
      obj[date] += +amount
    } else {
      obj[date] = +amount
    }
    return obj
  }, {})

  return daily_array
}

function categoricalAmount() {
  const expenses = loadData()

  const { bills } = expenses

  const daily_array = bills.reduce((obj, bill) => {
    const { category, amount } = bill

    if (obj[category]) {
      obj[category] += +amount
    } else {
      obj[category] = +amount
    }
    return obj
  }, {})

  return daily_array
}

// Update Charts

function updateCharts() {
  myChart.data.labels = Object.keys(dailyAmount())
  myChart.data.datasets[0].data = Object.values(dailyAmount())
  myChart.update()

  myChart2.data.labels = Object.keys(categoricalAmount())
  myChart2.data.datasets[0].data = Object.values(categoricalAmount())
  myChart2.update()
}



// UI

function loadCategory(expenses) {
  
  const temp_array = expenses.categories.map(category => (
    `<option value='${category}'>${category}</option>`
  ))

  category.innerHTML = temp_array
  remove_category.innerHTML = temp_array

}

function loadTable(expenses) {

  table_body.innerHTML = expenses.bills.map(bill => (
    `<tr>
      <td>${bill.date}</td>
      <td>${bill.description}</td>
      <td>${bill.category}</td>
      <td>${bill.amount}</td>
      <td><button class="btn-delete" data-id=${bill.id}>x</button></td>
    </tr>
    `
  )).join("")
}

// Charts

// Line Chart

var ctx = document.getElementById("myChart");

var myChart = new Chart(ctx, {
  type: 'line',
  data: {
      labels: Object.keys(dailyAmount()),
      datasets: [{
          data: Object.values(dailyAmount()),
          
          borderWidth: 1
      }]
  },
  options: {
      scales: {
          yAxes: [{
              ticks: {
                  beginAtZero:true
              }
          }]
      },
      title: {
        display: true,
        text: "Daily Expenses"
      },
      // maintainAspectRatio: false,
      legend: {
        display: false
      },
      responsive: false
  }
});

// Box Chart

var ctx2 = document.getElementById("myChart2");

var myChart2 = new Chart(ctx2, {
  type: 'bar',
  data: {
      labels: Object.keys(categoricalAmount()),
      datasets: [{
          data: Object.values(categoricalAmount()),
          
          borderWidth: 1
      }]
  },
  options: {
      scales: {
          yAxes: [{
              ticks: {
                  beginAtZero:true
              }
          }]
      },
      title: {
        display: true,
        text: "Cumulative Expenses By Category"
      },
      // maintainAspectRatio: false,
      legend: {
        display: false
      },
      responsive: false
  }
});
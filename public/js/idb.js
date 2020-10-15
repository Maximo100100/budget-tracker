//setup IndexedDB
let db;
const request = indexedDB.open('budget-tracker', 1);

// if version changes
request.onupgradeneeded = function(event) { 
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// DB created on success
request.onsuccess = function(event) {
    db = event.target.result;
  
    if (navigator.onLine) {
      uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// if offline... 
function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    budgetObjectStore.add(record);
}

//gets all data 
function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    const getAll = budgetObjectStore.getAll();
    //only happens on success
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        //uploads data
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['new_budget'], 'readwrite');
          const budgetObjectStore = transaction.objectStore('new_budget');
          budgetObjectStore.clear();

          alert('All saved budget inputs has been submitted!');
        })
        //catch error
        .catch(err => {
          console.log(err);
        });
    }
  };
}

window.addEventListener('online', uploadBudget);
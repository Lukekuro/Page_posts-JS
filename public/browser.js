function itemTemplate(item) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.item_name}</span>
    <div>
    <button data-id="${item.item_id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
    <button data-id="${item.item_id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
</li>`
}

//General
let item_list = document.getElementById("item-list");

// Initial page load render
let ourUlHTML = items.map(function(item) {
    return itemTemplate(item);
}).join('')

item_list.insertAdjacentHTML("beforeend", ourUlHTML);

//Create item
document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault();
    let createField = e.target.querySelector("input");
    axios.post('/create-item', { item_name: createField.value }).then(function(response) {
        item_list.insertAdjacentHTML("beforeend", itemTemplate(response.data))
        createField.value = ""
        createField.focus()
    }).catch(function() {
        console.log("please try again");
    })
})


document.addEventListener("click", function(e) {
    //Update item
    if(e.target.classList.contains("edit-me")) {
        let userInput = prompt("Enter your desired new text for Name", e.target.parentElement.parentElement.querySelector('.item-text').innerHTML);
        if ( userInput ) {
            axios.post('/update-item', { item_name: userInput, item_id: e.target.getAttribute("data-id")}).then(function(response) {
                e.target.parentElement.parentElement.querySelector('.item-text').innerHTML = response.data.item_name;
            }).catch(function() {
                console.log("please try again");
            })
        }
    }

    //Delete item
    if(e.target.classList.contains("delete-me")) {
        if ( confirm("Are you sure?") ) {
            axios.post('/delete-item', { item_id: e.target.getAttribute("data-id")}).then(function() {
                e.target.parentElement.parentElement.remove();
            }).catch(function() {
                console.log("please try again");
            })
        }
    }
})

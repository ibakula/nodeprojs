let isLoaded = false;

function handleAddContent(response, listElement) {
  if (response && 'id' in response.data) {
    if (listElement.firstElementChild == null) {
      listElement.appendChild(document.createElement("li"));
    }
    else {
      listElement.insertBefore(document.createElement("li"), listElement.firstChild);
    }
    listElement.firstElementChild.className = "col-sm-auto m-2";
    listElement.firstElementChild.appendChild(document.createElement("img"));
    listElement.firstElementChild
    .lastElementChild.setAttribute("src", response.data.img);
    listElement.firstElementChild
    .lastElementChild.setAttribute("width", "240px");
    listElement.firstElementChild
    .lastElementChild.setAttribute("height", "180px"); 
    listElement.firstElementChild
    .lastElementChild.setAttribute("alt", "Category Image");
    listElement.firstElementChild.appendChild(document.createElement("a"));
    listElement.firstElementChild
    .lastElementChild.setAttribute("href", ("category.html?id="+response.data.id));
    listElement.firstElementChild
    .lastElementChild.appendChild(document.createElement("h2"));
    listElement.firstElementChild
    .lastElementChild.lastElementChild.className = "d-block bg-dark text-white p-2 font-weight-light h2-width-240";
    listElement.firstElementChild
    .lastElementChild.lastElementChild.innerText = response.data.title;
    if (response.data.id == 1) {
      isLoaded = true;
    }
  } 
}

function handleError(error) {
}

function handleSelectLastIdFromCategories(response) {
  let content = document.getElementById("content");
  if (response && 'id' in response.data) {
    let lastId = response.data.id+1;
    let contentArr = [];
    for (let i = 0; 
      i < content.children.length; 
      ++i) {
      contentArr.push(content.children[i]);
    }
    for (let i = 0; 
      i < contentArr.length; 
      ++i) {
      contentArr[i].remove();
    }
    contentArr = [];
    content.appendChild(document.createElement("ul"));
    content.lastElementChild.style = 'list-style-type:none;';
    content.lastElementChild.className = 'row p-0';
    for (let i = response.data.id; 
         i < lastId && i > 0; //LastId can be used for paging 
         --i) {
      axios.get(('/api/categories/'+i))
      .catch(handleError) 
      .then(response => { handleAddContent(response, content.lastElementChild); })
      .catch(handleError);
      /*
       * Notes/remarks: Should there be too many
       * categories pagination control is to be
       * reckoned with.
       */
    }
  }
  else {
   // Note: Currently no categories added
    if (content.children.length > 0) {
      for (let i = 0; i < content.children.length; ++i) {
        content.children[i].remove();
      }
    }
    content.appendChild(document.createElement("div"));
    content.lastElementChild.className = "row container-fluid alert-light p-4";
    content.lastElementChild.innerText = "There seems to be no categories currently added to be displayed.";
  }
}

function loadUserUI() {
  if (localStorage.getItem("id") === null || localStorage.getItem("permissions") == null) {
    return;
  }

  document.getElementById("top").firstElementChild.firstElementChild.children[1].remove();
  let logoutBtn = document.createElement("li");
  logoutBtn.className = "col-sm";
  logoutBtn.appendChild(document.createElement("ul"));
  logoutBtn.firstChild.className = "navbar-nav justify-content-sm-end";
  logoutBtn.firstChild.appendChild(document.createElement("li"));
  logoutBtn.firstChild.firstChild.className = "nav-item";
  logoutBtn.firstChild.firstChild.appendChild(document.createElement("a"));
  logoutBtn.firstChild.firstChild.firstChild.className = "nav-link";
  logoutBtn.firstChild.firstChild.firstChild.setAttribute("href", "logout.html");
  logoutBtn.firstChild.firstChild.firstChild.innerText = "Logout";
  let list = document.getElementById("top").firstElementChild.firstElementChild;
  list.insertBefore(logoutBtn, list.lastElementChild);
}

function handleError(error) {
}

// This is for logged-in users
loadUserUI();

axios.get('/api/categories')
.catch(handleError)
.then(handleSelectLastIdFromCategories)
.catch(handleError);


function handleAddContent(response, listElement) {
  if (response && 'id' in response.data) {
    if (listElement.firstElementChild == null) {
      listElement.appendChild(document.createElement("li"));
    }
    else {
      listElement.insertBefore(document.createElement("li"), listElement.firstChild);
    }
    listElement.lastElementChild.className = "col-sm-auto m-2";
    listElement.lastElementChild.appendChild(document.createElement("img"));
    listElement.lastElementChild
    .lastElementChild.setAttribute("src", response.data.img);
    listElement.lastElementChild
    .lastElementChild.setAttribute("width", "240px");
    listElement.lastElementChild
    .lastElementChild.setAttribute("height", "180px"); 
    listElement.lastElementChild
    .lastElementChild.setAttribute("alt", "Category Image");
    listElement.lastElementChild.appendChild(document.createElement("a"));
    listElement.lastElementChild
    .lastElementChild.setAttribute("href", ("category.html?id="+response.data.id));
    listElement.lastElementChild
    .lastElementChild.appendChild(document.createElement("h2"));
    listElement.lastElementChild
    .lastElementChild.lastElementChild.className = "d-block bg-dark text-white p-2 font-weight-light h2-width-240";
    listElement.lastElementChild
    .lastElementChild.lastElementChild.innerText = response.data.title;
  } 
}

function handleError(error) {
}

function handleSelectLastIdFromCategories(response) {
  let content = document.getElementById("content");
  if (response && 'id' in response.data) {
    let lastId = response.data.id+1;
    let contentArr = [];
    for (let i in content.children) {
      contentArr.push(i);
    }
    for (let i in contentArr) {
      i.remove();
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
  if (localStorage.getItem("userId") === null || localStorage.getItem("permissions") == null) {
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


let isLoaded = false;
let userElementHeader = document.getElementById("top").nextElementSibling;
let userContent = document.getElementById("content").firstElementChild;
let params = new URLSearchParams(window.location.search);
let userData = {
  first_name: '',
  last_name: '',
  password: '',
  email: ''
}

function main() {
  if (!params.has('id')) {
    LoadUserOwnData();
    return;
  }
  let id = parseInt(params.get('id'));
  axios.get(`/api/users/${id}`)
  .catch(handleGetError)
  .then(handleGetUserById)
  .catch(handleGetError);
}

function handleGetError(error) {
}

function LoadUserOwnData() {
  if (localStorage.getItem("first_name") == null) {
    alert("You have to be logged in to view this page. Redirecting..");
    setTimeout(() => { location.href = '/'; }, 4000);
    return;
  }
  
  userElementHeader.lastElementChild.firstElementChild.innerText = localStorage.getItem("first_name") + " " + localStorage.getItem("last_name");

  const length = userContent.children.length;
  for (let i = 0; 
    i < length; 
    ++i) {
    userContent.children[0].remove();
  }
  
  userData.first_name = localStorage.getItem("first_name");
  userData.last_name = localStorage.getItem("last_name");
  userData.email = localStorage.getItem("email");
  
  axios.get(('/api/users/'+localStorage.getItem("id")))
  .catch(handleGetError)
  .then(fetchRestUserData)
  .catch(handleGetError);
}

function fetchRestUserData(response) {
  if (response.data && 'permissions' in response.data) {
    userData['permissions'] = response.data.permissions;
    userData['signup_date'] = response.data.signup_date;
    userData['login_date'] = response.data.login_date;
  }
  LoadFormData();
}

function LoadFormData() {
  userContent.appendChild(document.createElement("form"));
  userContent.lastElementChild.className = "ml-4";
  userContent.lastElementChild.id = "user_form";
  userContent.style = "border:0px;";

  for (let item in userData) {
    if ((userData[item] == null ||
        userData[item].length < 1) && item != 'password') {
      continue;
    }
    let formNameStr = item;
    if (formNameStr.search("_") > -1) {
      formNameStr = formNameStr.replace("_", " ");
    }
    formNameStr = formNameStr.replace(formNameStr.charAt(0), formNameStr.charAt(0).toUpperCase());
    let divGroup = document.createElement("div");
    divGroup.className = "form-group";
    divGroup.appendChild(document.createElement("label"));
    divGroup.lastElementChild.setAttribute("for", `user_${item}`);
    divGroup.lastElementChild.className = "lead";
    divGroup.lastElementChild.innerText = formNameStr;
    divGroup.appendChild(document.createElement("input"));
    divGroup.lastElementChild.setAttribute("type", "text");
    divGroup.lastElementChild.className = "form-control form-control-md";
    divGroup.lastElementChild.id = `user_${item}`;
    if (item == 'permissions' || item == 'login_date' || item == 'signup_date') {
      divGroup.lastElementChild.disabled = true;
    }
    if (item == 'password') {
      divGroup.lastElementChild.setAttribute("placeholder", "Enter new password");
    }
    if (item == 'signup_date' || item == 'login_date') {
      let date = new Date(parseInt(userData[item]));
      divGroup.lastElementChild.value = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
    }
    else {
      divGroup.lastElementChild.value = (item == 'password' ? '' : userData[item]);
    }
    userContent.lastElementChild.appendChild(divGroup);
  }
  userContent.lastElementChild.appendChild(document.createElement("button"));
  userContent.lastElementChild.lastElementChild.setAttribute("type", "email");
  userContent.lastElementChild.lastElementChild.className = "btn btn-primary";
  userContent.lastElementChild.lastElementChild.innerText = "Save changes";
  userContent.lastElementChild.lastElementChild.addEventListener("click", handleSaveUserChanges);
  isLoaded = true;
}

function handleSaveUserChanges(e) {
  e.preventDefault();
  isLoaded = false;
  let params = new URLSearchParams();
  userData['password'] = userContent.querySelector("#user_password").value;
  for (let item in userData) {
    if (item.search("date") > -1 || item == 'permissions') {
      continue;
    }
    let field = userContent.querySelector(("#user_"+item));
    if (userData[item] != field.value || (item == 'password' && 'password' in userData && userData[item].length > 5)) {
      let _Pos = item.search("_");
      let item2 = item;
      if (_Pos > -1) {
        item2 = item2.replace(item2.charAt((_Pos+1)), item2.charAt((_Pos+1)).toUpperCase());
        item2 = item2.replace("_", "");
      }
      params.append(item2, userData[item]);
    }
  }
  axios.put(('/api/users/' + localStorage.getItem('id')), params)
  .catch(handleGetError)
  .then(handleUpdateUser)
  .catch(handleGetError);
}

function handleUpdateUser(response) {
  let outputDiv = document.createElement("div");
  if (response.data && 'result' in response.data) {
     let html = "<p class=\"lead text-center\">";
     if (response.data['result'] == "Success!") {
       html += "Your data was edited successfully.</p>";
       outputDiv.className = "alert alert-success p-4 mt-3";
       outputDiv.innerHTML = html;
       for (let item in userData) {
         let field;
       }
     }
     else {
       html += "Something went wrong. " + ('reason' in response.data ? ('Reason: ' + response.data['reason']) : '' ) + "</p>";
       outputDiv.className = "alert alert-danger p-4 mt-3";
       outputDiv.innerHTML = html;
     }
  }
  else {
    html += "Something went wrong, update has failed..</p>";
    outputDiv.className = "alert alert-danger p-4 mt-3";
    outputDiv.innerHTML = html;
  }
  userContent.appendChild(outputDiv);
  isLoaded = true;
}

main();

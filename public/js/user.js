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
    if ((userData[item] == null &&
        item != 'password') ||
        userData[item].length < 1) {
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
    if (item == 'permissions' || item == 'last_login' || item == 'signup_date') {
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
}

function handleSaveUserChanges(e) {
}

main();

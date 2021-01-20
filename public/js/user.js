let isLoaded = false;
let userElementHeader = document.getElementById("top").nextElementSibling;
let userContent =  document.getElementById("content").firstElementChild;
let params = new URLSearchParams(window.location.search);
let userData = {
  firstName: '',
  lastName: '',
  password: '',
  email: '',
  lastLogin: '',
  signupDate: ''
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
  
  userData.firstName = localStorage.getItem("first_name");
  userData.lastName = localStorage.getItem("last_name");
  userData.email = localStorage.getItem("email");
  userData.lastLogin = localStorage.getItem("last_login");
  userData.signupDate = localStorage.getItem("signup_date");

  userContent.appendChild(document.createElement("form"));
  userContent.lastElementChild.className = "ml-4";
  userContent.lastElementChild.id = "user_form";

  for (let item in userData) {
    if ((userData[item] == null && 
        item != 'password') || 
        userData[item].length < 1) {
      continue;
    }
    let divGroup = document.createElement("div");
    divGroup.className = "form-group";
    divGroup.appendChild(document.createElement("label"));
    divGroup.lastElementChild.setAttribute("for", `user_${item}`);
    divGroup.lastElementChild.className = "lead";
    divGroup.lastElementChild.innerText = item;
    divGroup.appendChild(document.createElement("input"));
    divGroup.lastElementChild.setAttribute("type", "text");
    divGroup.lastElementChild.className = "form-control form-control-md";
    divGroup.lastElementChild.id = `user_${item}`;
    divGroup.lastElementChild.value = (item == 'password' ? '' : userData[item]);
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

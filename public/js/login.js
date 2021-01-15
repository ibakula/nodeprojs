if (localStorage.getItem("userId") !== null) {
  let loginForm = document.getElementById("login_form");
  for (let i = 0; i < loginForm.children.length; ++i) {
    loginForm.children[i].remove();
  }
  loginForm.innerHTML = "<div id=\"login_output\" role=\"alert\" class=\"alert alert-danger p-4 mt-3\" bis_skin_checked=\"1\"><p>You are already logged in!<br>You are thus being redirected..</p></div>";
  setTimeout(() => { window.location.href = "/index.html"; }, 4000);
}

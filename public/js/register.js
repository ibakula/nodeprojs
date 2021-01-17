let isLoaded = true;

if (localStorage.getItem("user_id") !== null) {
  isLoaded = false;
  let registerForm = document.getElementById("register_form");
  for (let i = 0; i < registerForm.children.length; ++i) {
    registerForm.children[i].remove();
  }
  registerForm.innerHTML = "<div id=\"login_output\" role=\"alert\" class=\"alert alert-danger p-4 mt-3\" bis_skin_checked=\"1\"><p>You are currently in an active session!<br><br>Thus you are being redirected..</p></div>";
  setTimeout(() => { window.location.href = "/index.html"; }, 4000);
}


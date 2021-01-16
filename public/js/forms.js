var formsList = [];

for (var i = 0; i < document.forms.length; ++i) {
    if (document.forms.item(i) != null) {
        formsList.push(document.forms[i]);
    }
}

if (formsList != null && formsList.length > 0) {
    formsList.forEach(_helperFuncAddEventListener);
}

function _helperFuncAddEventListener(item, index) {
    item.addEventListener("submit", function(e) { handleFormSubmit(e, (item.id), (index)); } );
}

function _helperFuncFormSubmit(e, FormId, index) {
    handleFormSubmit(e, FormId, index);
}

function fuseChildrenValuesToArray(childrenElements) {
    var simplified_data = new Array();
    
    for (var i = 0; i < childrenElements.length; ++i) {
        if (childrenElements[i].children[1] != null) {
            simplified_data.push(childrenElements[i].children[1].value);
        }
    }
    
    return simplified_data;
}

function _helperFuncUpdateOutputElement(outputName) {
    var output_div = document.getElementById(outputName);
    
    if (output_div == null) {
        output_div = document.createElement("div");
        output_div.id = outputName;
        output_div.setAttribute("role", "alert");
    }
    else {
        if (output_div.childNodes.length > 0) {
            output_div.removeChild(output_div.childNodes[0]);
        }
    }
    
    return output_div;
}

function handleResponse(err) {
  if (err.response) {
          
  }
  else if (err.request) {
          
  }
  else {
          
  }
}

function handleFormSubmit(e, formName, formIndex) {
  e.preventDefault();
  const params = new URLSearchParams();
  switch(formName) {
    case 'register_form':
      params.append("firstName", formsList[formIndex].querySelector("#register_fname").value);
      params.append("lastName", formsList[formIndex].querySelector("#register_lname").value);
      params.append("password", formsList[formIndex].querySelector("#register_password").value);
      params.append("email", formsList[formIndex].querySelector("#register_email").value);
      axios.post('/api/users', params).catch(handleResponse).then((response) => { postOutput(response, formName, formIndex); }).catch(handleResponse);
      break;
    case 'login_form':
      params.append("email", formsList[formIndex].querySelector("#email").value);
      params.append("password", formsList[formIndex].querySelector("#password").value);
      axios.post('api/user/login', params).catch(handleResponse).then((response) => { postOutput(response, formName, formIndex); }).catch(handleResponse);
      break;
    case 'commentary_form':
      break;
  }
}

function handleLoadUserData(response) {
  if (response.data && 'id' in response.data) {
    for (let i in response.data) {
      localStorage.setItem(i, response.data[i]);
    }
    setTimeout(() => { window.location.href = "/index.html"; }, 2000);
  }
}

function postOutput(response, formName, formIndex) {
  if (response.data && 'result' in response.data) {
    //var input = null;
    var output_div = null;
    var output_name = "";

    switch(formName) {
      case "subscription_form":
        output_name = "subscription_output";
        break;
      case "register_form":
        output_name = "register_output";
        break;
      case "login_form":
        output_name = "login_output";
        break;
      case "commentary_form":
        output_name = "commentary_output";
        break;
    }
    
   if (output_name != "") {
      output_div = _helperFuncUpdateOutputElement(output_name);
      formsList[formIndex].parentElement.appendChild(output_div);
      //input = fuseChildrenValuesToArray(formsList[formIndex].children);
    }
    
    if (output_div != null /*&& input != null*/ && response.data['result'] == 'Success!') {
      var merged = "<p class=\"lead text-center\">Success! Redirecting..";
      /*input.forEach(function(currentValue) {
          merged += currentValue + "<br>";
      });*/
      output_div.innerHTML += merged + "</p>";
      output_div.className = "alert alert-success p-4 mt-3";
      axios.get('/api/user/status').catch(handleResponse).then(handleLoadUserData).catch(handleResponse);
    }
    else {
      output_div.className = "alert alert-danger p-4 mt-3";
      output_div.innerHTML = "<p>Error: Something seems to went wrong with the input.</p>";
    }
  }
  else {
    output_div.className = "alert alert-danger p-4 mt-3";
    output_div.innerHTML = "<p>Error: Something seems to went wrong with the input.</p>";
  }
}

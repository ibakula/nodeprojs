var formsList = new Array();

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

function handleFormSubmit(e, formName, formIndex) {
    e.preventDefault();
    var input = null;
    var output_div = null;
    var output_name = new String();
    
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
        input = fuseChildrenValuesToArray(formsList[formIndex].children);
    }
    
    if (output_div != null) {
        if (input != null) {
            var merged = "<p class=\"lead text-center\">";
            input.forEach(function(currentValue) {
                merged += currentValue + "<br>";
                console.log(currentValue);
            });
            output_div.innerHTML += merged + "</p>";
            output_div.className = "alert alert-success p-4 mt-3";
        }
        else {
            output_div.className = "alert alert-danger p-4 mt-3";
            output_div.innerHTML = "<p>Error: Something seems to went wrong with the input.</p>"
        }
    }
}
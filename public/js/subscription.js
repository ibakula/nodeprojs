let subForm = document.getElementById("subscription_form");
let subButton = subForm.lastElementChild;
let subEmailField = subForm.firstElementChild.lastElementChild;

subButton.addEventListener("click", handleSubscribe);

function handleSubscribe(e) {
  e.preventDefault();
  let params = new URLSearchParams();
  params.append('email', subEmailField.value);
  axios.post('/api/subscription', params)
  .catch(handleErrors)
  .then(handleSubscriptionAnswer)
  .catch(handleErrors);
}

function handleErrors(error) {
  
}

function handleSubscriptionAnswer(response) {
  removeFields();
  subForm.parentElement.appendChild(document.createElement("p"));
  if (response.data && 
    'result' in response.data && 
    response.data.result == 'Failed!') {
    subForm.parentElement.lastElementChild.className = "text-danger";
    subForm.parentElement.lastElementChild.innerHTML = "Sorry, could not add you to the list. " + ('reason' in response.data ? response.data.reason : '<br>You have possibly already enlisted.');
    subForm.parentElement.appendChild("button");
    return;
  }
  subForm.parentElement.lastElementChild.className = "text-success";
  subForm.parentElement.lastElementChild.innerText = "Success! You have been added to the subscribers list.";
}

function removeFields() {
  subForm.style = "display:none;";
}

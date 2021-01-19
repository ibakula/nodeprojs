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
    response.data.result == 'Failure!') {
    subForm.parentElement.lastElementChild.className = "text-warning";
    subForm.parentElement.lastElementChild.innerText = "Failure! " + ('reason' in response.data ? response.data.reason : 'Unknown error on server-end has occured.');
    return;
  }
  subForm.parentElement.lastElementChild.className = "text-success";
  subForm.parentElement.lastElementChild.innerText = "Success! You have been added to the subscribers list.";
}

function removeFields() {
  subForm.style = "display:none;";
}

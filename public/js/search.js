const navBarList = document.querySelector("header#top nav ul");
const searchForm = navBarList.lastElementChild.firstElementChild;
const searchBtn = searchForm.lastElementChild;
let info = false;
let resultsFound = false;
let finishedSearching = false;

const siteContainer = document.body.firstElementChild;

searchBtn.addEventListener("click", handleSearchBtnClick);

function handleSearchBtnClick(e) {
  e.preventDefault();
  resultsFound = false;
  finishedSearching = false;
  if (!isLoaded) {
    if (!info) {
      alert("Your search request will be executed after the initial requests are done executing.");
      info = true;
    }
    setTimeout(() => { handleSearchBtnClick(e); }, 5000);
    return;
  }
  let sections = siteContainer.getElementsByTagName("section");
  const sectionsLength = sections.length;
  for (let i = 0; i < sectionsLength; ++i) {
    sections[0].remove();
  }
  let searchElement = document.createElement("section");
  searchElement.appendChild(document.createElement("div"));
  searchElement.className = "container-fluid col-sm mb-5 p-3";
  searchElement.lastElementChild.appendChild(document.createElement("p"));
  searchElement.lastElementChild.lastElementChild.className = "lead";
  searchElement.lastElementChild.lastElementChild.innerHTML = `Search results based on your inquiry, please <a href="${location.pathname}">reload page<a> to go back!:`;
  let dummyLoadingBarHtml = '<div class="mb-4 ml-2" style="background-color:#eeeeee;width:280px;height:3.5ex;"></div><div class="mb-3 ml-2" style="background-color:#eeeeee;width:480px;height:3.5ex;"></div><div class="mb-4 ml-2" style="background-color:#eeeeee;width:480px;height:3.5ex;"></div><div class="mb-4 ml-2" style="background-color:#eeeeee;width:180px;height:3.5ex;"></div>';
  searchElement.innerHTML = searchElement.innerHTML + dummyLoadingBarHtml;
  siteContainer.insertBefore(searchElement, siteContainer.children[1]);
  // Articles
  let params = new URLSearchParams();
  params.append("term", searchForm.firstElementChild.value);
  axios.post('/api/posts/search', params)
  .catch(handleError)
  .then(response => { 
    handleLoadResults(response, 'posts', searchElement); 
  })
  .catch(handleError);
  // Users
  axios.post('/api/users/search', params)
  .catch(handleError)
  .then(response => {
    handleLoadResults(response, 'users', searchElement, true);
  })
  .catch(handleError);
  checkResults(searchElement);
  info = false;
}

function handleError(error) {
}

// isLast boolean value which means that this is 
// the VERY last search result we are waiting on
function handleLoadResults(response, type, searchElement, isLast) {
  if (!response.data || !Array.isArray(response.data) || response.data.length < 1) {
    // basically covers the same thing
    // as the last if statement at the end
    // of this function
    if (isLast) {
       finishedSearching = true;
    }
    return;
  }
  for (let i = 0; i < response.data.length; ++i) {
    const divElement = document.createElement("div");
    if (type == 'users') {
      divElement.appendChild(document.createElement("a"));
      divElement.lastElementChild.setAttribute("href", ("user.html?id="+response.data[i].id));
      divElement.lastElementChild.appendChild(document.createElement("h4"));
      divElement.lastElementChild.lastElementChild.className = "ml-2";
      divElement.lastElementChild.lastElementChild.innerText = response.data[i].first_name + " " +  response.data[i].last_name;
      divElement.appendChild(document.createElement("p"));
      divElement.lastElementChild.className = "lead ml-2";
      divElement.lastElementChild.innerText = "User profile";
    }
    else if (type == 'posts') {
      divElement.appendChild(document.createElement("a"));
      divElement.lastElementChild.setAttribute("href", ("article.html?id="+response.data[i].id));
      divElement.lastElementChild.appendChild(document.createElement("h4"));
      divElement.lastElementChild.lastElementChild.className = "ml-2";
      divElement.lastElementChild.lastElementChild.innerText = response.data[i].title;
      divElement.appendChild(document.createElement("p"));
      divElement.lastElementChild.innerText = response.data[i].text;
      divElement.lastElementChild.className = "lead ml-2";
      divElement.appendChild(document.createElement("p"));
      divElement.lastElementChild.className = "lead ml-2";
      divElement.lastElementChild.innerText = "An article";
    }
    if (!resultsFound) {
      hideDummies(searchElement);
      resultsFound = true;
    }
    searchElement.appendChild(divElement);
  }
  
  // the search has officially ended
  if (isLast) {
    finishedSearching = true;
  }
}

function hideDummies(searchElement) {
  const searchLength = searchElement.children.length;
  for (let i = 1; i < searchLength; ++i) {
    if (searchElement.children[1].firstElementChild != null) {
      break;
    }
    searchElement.children[1].remove();
  }
}

function checkResults(searchElementSection) {
  if (!finishedSearching) {
    setTimeout(() => { checkResults(searchElementSection); }, 5000);
    return;
  }
  const searchLength = searchElementSection.children.length;
  hideDummies(searchElementSection);
  if (!resultsFound && searchElementSection != null) {
    searchElementSection.appendChild(document.createElement("div"));
    searchElementSection.className = "container-fluid col-sm mb-5 p-3";
    searchElementSection.lastElementChild.appendChild(document.createElement("p"));
    searchElementSection.lastElementChild.lastElementChild.className = "text-muted ml-2";
    searchElementSection.lastElementChild.lastElementChild.innerHTML = 'Sorry, no results found.';
  }
}

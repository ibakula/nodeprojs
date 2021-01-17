const navBarList = document.querySelector("header#top nav ul");
const searchForm = navBarList.lastElementChild.firstElementChild;
const inputField = searchForm.lastElementChild;
let info = false;
let resultsFound = false;
let finishedSearching = false;

const siteContainer = document.body.firstElementChild;

inputField.addEventListener("click", handleSearchBtnClick);

function handleSearchBtnClick(e) {
  e.preventDefault();
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
  searchElement.lastElementChild.lastElementChild.innerHTML = `Search results based on your inquiry, <a href="${location.pathname}">reload page<a> to go back!:`;
  searchElement.appendChild(document.createElement("div"));
  let dummyLoadingBarHtml = '<div class="mb-4 ml-2" style="background-color:#eeeeee;width:280px;height:3.5ex;"></div><div class="mb-3 ml-2" style="background-color:#eeeeee;width:480px;height:3.5ex;"></div><div class="mb-4 ml-2" style="background-color:#eeeeee;width:480px;height:3.5ex;"></div><div class="ml-2" style="background-color:#eeeeee;width:180px;height:3.5ex;"></div>';
  searchElement.innerHTML = searchElement.innerHTML + dummyLoadingBarHtml;
  siteContainer.insertBefore(searchElement, siteContainer.children[1]);
  // Articles
  axios.get('/api/posts/last')
  .catch(handleGetError)
  .then(response => { 
    performSearch(response, searchElement, 'posts'); 
  })
  .catch(handleGetError);
  // Users
  axios.get('/api/users/last')
  .catch(handleGetError)
  .then(response => {
    performSearch(response, searchElement, 'users', true);
  })
  .catch(handleGetError);
  checkResults(searchElement);
  info = false;
}

function handleGetError(error) {
}

// Note: set third arg to true on the last table
// on search sequence statement inside click function
function performSearch(response, searchElement, type, last = false) {
  if (!response.data || !('id' in response.data)) {
    return;
  }
  for (let i = response.data.id; 
    i < (response.data.id+1) && i >= 0; 
    --i) {
    axios.get(('/api/'+type+'/'+i))
    .catch(handleGetError)
    .then(res => { handleLoadResults(res, type, searchElement, last, (i == 1)); })
    .catch(handleGetError);
  }
}

// isLast boolean value which means that this is 
// the VERY last search result we are waiting on
// lastId is i == 0 in for loop of performSearch func
function handleLoadResults(response, type, searchElement, isLast, lastId) {
  if (!response.data || !('id' in response.data)) {
    // basically covers the same thing
    // as the last if statement at the end
    // of this function
    if (isLast && lastId) {
       finishedSearching = true;
    }
    return;
  }
  
  // the search has officially ended
  if (isLast && response.data.id == 1) {
    finishedSearching = true;
  }
}

function checkResults(searchElementSection) {
  if (!finishedSearching) {
    setTimeout(() => { checkResults(searchElementSection); }, 5000);
    return;
  }
  if (!resultsFound && searchElementSection != null) {
    const searchLength = searchElementSection.children.length;
    for (let i = 1; i < searchLength; ++i) {
      searchElementSection.children[1].remove();
    }
    searchElementSection.appendChild(document.createElement("div"));
    searchElementSection.className = "container-fluid col-sm mb-5 p-3";
    searchElementSection.lastElementChild.appendChild(document.createElement("p"));
    searchElementSection.lastElementChild.lastElementChild.className = "text-muted ml-2";
    searchElementSection.lastElementChild.lastElementChild.innerHTML = 'Sorry, no results found.';
  }
}

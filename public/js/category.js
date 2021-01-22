/*
 * Note: No paging system has been
 * implemented yet.
 *
 */

// Note: (isLoaded)
// currently needed by search function 
// in order to schedule search events
// evaluates to true once the last category (id 1)
// has been loaded by handleAddCategoryRelatedArticle
let isLoaded = false;
let params = new URLSearchParams(window.location.search);
let categoryId = -1;
let titleSection = document.getElementById("title");
let contentSection = document.getElementById("content");
let lastPostId = -1;
let maxPostsPerPage = 6;
let oldContentIsWiped = false;

function skimTextFromArticle(articleText) {
  let text = articleText;
  let imgTagPos = articleText.search('<img');
  if (imgTagPos > -1) {
    let imgTagEndPos = articleText.search('>');
    text = articleText.slice(imgTagEndPos);
  }
  return text;
}

function AddCategoryRelatedArticle(article, categoryId, categoryTitle) {
  let articleElement = document.createElement("article");
  let articleDate = new Date(parseInt(article.date));
  let articleText = skimTextFromArticle(article.text);
  articleElement.className = "col-sm-5 m-4 card card-body";
  articleElement.appendChild(document.createElement("div"));
  articleElement.lastElementChild.className = "col-sm";
  articleElement.lastElementChild
  .appendChild(document.createElement("h5"));
  articleElement.lastElementChild
  .lastElementChild.className = "display-5 mb-4 text-primary";
  articleElement.lastElementChild
  .lastElementChild.innerText = categoryTitle;
  articleElement.lastElementChild
  .appendChild(document.createElement("a"));
  articleElement.lastElementChild
  .lastElementChild.setAttribute("href", ("article.html?id="+article.id));
  articleElement.lastElementChild
  .lastElementChild.appendChild(document.createElement("h3"));
  articleElement.lastElementChild
  .lastElementChild.lastElementChild.className = "display-5 card-title";
  articleElement.lastElementChild
  .lastElementChild.lastElementChild.innerText = article.title;
  articleElement.lastElementChild
  .appendChild(document.createElement("p"));
  articleElement.lastElementChild
  .lastElementChild.className = "text-muted";
  articleElement.lastElementChild
  .lastElementChild.innerText = articleDate.getDate() + "." + (articleDate.getMonth()+1) + ".";
  articleElement.lastElementChild
  .appendChild(document.createElement("p"));
  articleElement.lastElementChild
  .lastElementChild.className = "card-text lead";
  articleElement.lastElementChild
  .lastElementChild.innerText = articleText;
  contentSection.appendChild(articleElement);
}

function wipeAllContent(section) {
  if (section.children.length > 0) {
    let items = new Array();
    for (let i = 0;
      i < section.children.length;
      ++i) {
      items.push(section.children[i]);
    }
    for (let i = 0;
      i < items.length;
      ++i) {
      items[i].remove();
    }
    items = [];
  }
}

function handleAddCategoryRelatedArticle(response, categoryId, categoryTitle) {
  if (response.data === null || !('id' in response.data)) {
    return;
  }
  
  if (response.data['category_id'] == categoryId) {
    // Purpose of this is that this function
    // will get multiple calls and this is ought
    // to be executed only once
    if (!oldContentIsWiped) {
      if (contentSection.children.length > 0) {
        wipeAllContent(contentSection);
      }
      oldContentIsWiped = true;
    }
    AddCategoryRelatedArticle(response.data, categoryId, categoryTitle);
  }
}

function handleError(error) {
}

function handleListPostsByCategoryId(response, categoryId, categoryTitle) {
  if (response.data === null || !('id' in response.data)) {
    return;
  }

  lastPostId = (response.data.id+1);
  let promises = [];
  let n = 0;
  for (let i = response.data.id;
       i < lastPostId && i > 0;
       --i, ++n) {
    if (n >= maxPostsPerPage) {
      lastPostId = (i+1);
      break;
    }
    promises.push(axios.get(('/api/posts/'+i))
    .catch(handleError)
    .then(res => { handleAddCategoryRelatedArticle(res, categoryId, categoryTitle); })
    .catch(handleError));
  }
  Promise.allSettled(promises).then(() => { isLoaded = true; });
}

function handleGetCategory(response) {
  if (response.data === null || !('id' in response.data)) {
    return;
  }
  wipeAllContent(titleSection);
  titleSection.appendChild(document.createElement("img"));
  titleSection.lastElementChild.setAttribute("width", "280px");
  titleSection.lastElementChild.setAttribute("height", "180px");
  titleSection.lastElementChild.setAttribute("alt", "Category image");
  titleSection.lastElementChild.setAttribute("src", response.data.img);
  titleSection.appendChild(document.createElement("h2"));
  titleSection.lastElementChild.className = "mt-4 display-5 text-white";
  titleSection.lastElementChild.appendChild(document.createElement("em"));
  titleSection.lastElementChild.lastElementChild.innerText = `You are vieweing the ${response.data.title.toLowerCase()} category`;
  
  axios.get('/api/posts/last')
  .catch(handleError)
  .then(res => { handleListPostsByCategoryId(res, response.data.id, response.data.title); })
  .catch(handleError);
}

function resetAll() {
  params = new URLSearchParams(window.location.search);
  categoryId = -1;
  lastPostId = -1;
  oldContentIsWiped = false;
}

function loadUserUI() {
  if (localStorage.getItem("id") === null || localStorage.getItem("permissions") == null) {
    return;
  }

  document.getElementById("top").firstElementChild.firstElementChild.children[1].remove();
  let logoutBtn = document.createElement("li");
  logoutBtn.className = "col-sm";
  logoutBtn.appendChild(document.createElement("ul"));
  logoutBtn.firstChild.className = "navbar-nav justify-content-sm-end";
  logoutBtn.firstChild.appendChild(document.createElement("li"));
  logoutBtn.firstChild.firstChild.className = "nav-item";
  logoutBtn.firstChild.firstChild.appendChild(document.createElement("a"));
  logoutBtn.firstChild.firstChild.firstChild.className = "nav-link";
  logoutBtn.firstChild.firstChild.firstChild.setAttribute("href", "logout.html");
  logoutBtn.firstChild.firstChild.firstChild.innerText = "Logout";
  let list = document.getElementById("top").firstElementChild.firstElementChild;
  list.insertBefore(logoutBtn, list.lastElementChild);
}

if (categoryId == -1) {
  loadUserUI();
  if (!params.has("id")) {
    alert("Could not load content, redirecting..");
    setTimeout(() => { window.location.href = "/"; }, 4000);
  }
  let strId = params.get('id');
  if (strId !== null) {
    let id = parseInt(strId);
    if (Number.isSafeInteger(id)) {
      axios.get(('/api/categories/'+id)).catch(handleError).then(handleGetCategory).catch(handleError);
    }
  }
  //resetAll();
}

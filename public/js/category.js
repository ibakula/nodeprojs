/*
 * Note: No paging system has been
 * implemented yet.
 *
 */

let url = new URLSearchParams(window.location.search);
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
  .lastElementChild.innerText = 
  (articleDate.getDate() + "." (articleDate.getMonth()+1));
  articleElement.lastElementChild
  .appendChild(document.createElement("p"));
  articleElement.lastElementChild
  .lastElementChild.className = "card-text lead";
  articleElement.lastElementChild
  .lastElementChild.innerText = articleText;
  contentSection.appendChild(articleElement);
}

function wipeAllContent() {
  for (let i = 0;
    i < contentSection.children.length;
    ++i) {
    contentSection.fristElementChild.remove();
  }
}

function handleAddCategoryRelatedArticle(response, categoryId, categoryTitle) {
  if (response.data === null || !('id' in response.data)) {
    return;
  }
  
  if (response.data.categoryId == categoryId) {
    // Purpose of this is that this function
    // will get multiple calls and this is ought
    // to be executed only once
    if (!oldContentIsWiped) {
      if (contentSection.children.length > 0) {
        wipeAllContent();
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
  for (let i = lastPostId; i < lastPostId; --i) {
    if (i >= maxPostsPerPage) {
      lastPostId = (i+1);
      break;
    }
    axios.get(('/api/posts/'+i))
    .catch(handleError)
    .then(response => { handleAddCategoryRelatedArticle(response, categoryId, categoryTitle); })
    .catch(handleError);
  }
}

function handleGetCategory(response) {
  if (response.data === null || !('id' in response.data)) {
    return;
  }

  for (let i = 0;
    i < titleSection.children.length;
    ++i) {
    titleSection.fristElementChild.remove();
  }
  titleSection.appendChild(document.createElement("img"));
  titleSection.lastElementChild.setAttribute("width", "280px");
  titleSection.lastElementChild.setAttribute("height", "180px");
  titleSection.lastElementChild.setAttribute("alt", "Category image");
  titleSection.lastElementChild.setAttribute("src", response.data.img);
  titleSection.appendChild(document.createElement("h2"));
  titleSection.lastElementChild.className = "mt-4 display-5 text-white";
  titleSection.lastElementChild.appendChild(document.createElement("em"));
  titleSection.lastElementChild.lastElementChild.innerText = response.data.title;
  
  axios.get('/api/posts/last')
  .catch(handleError)
  .then(response => { handleListPostsByCategoryId(response, response.data.id, response.data.title); })
  .catch(handleError);
}

function resetAll() {
  url = new URLSearchParams(window.location.search);
  categoryId = -1;
  lastPostId = -1;
  oldContentIsWiped = false;
}

if (categoryId == -1) {
  let strId = url.get('id');
  if (strId !== null) {
    let id = parseInt(strId);
    if (Number.isSafeInteger(id)) {
      axios.get(('/api/category'+id)).catch(handleError).then(handleGetCategory).catch(handleError);
    }
  }
  resetAll();
}

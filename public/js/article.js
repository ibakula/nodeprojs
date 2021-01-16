let params = new URLSearchParams(window.location.search);
let id = -1;
let sectionElements = {
  'articleSection' : document.getElementById("content").firstElementChild.firstElementChild,
  'aside' : document.getElementById("content").lastElementChild,
  'recommendation' : document.getElementById("content").nextElementSibling.lastElementChild
}

let confLoadMaxArticles = {
  'recommendation' : 6
}

let loadedPostCount = {
  'recommendation' : 0
}

let loadedPostPos = {
  'recommendation' : -1
}

let subscriptionElement = null;

main();

function main() {
  if (localStorage.getItem("user_id")"
  loadUserUI();
  let strId = params.get('id');
  if (strId == null) {
    return;
  }
  id = parseInt(strId);
  if (!Number.isSafeInteger(id)) {
    return;
  }
  // First load the article
  axios.get(('/api/posts/'+id))
  .catch(handleGetError)
  .then(handleFetchArticle)
  .catch(handleGetError);
  // Now load the most popular sidebar
  axios.get('/api/posts/popular')
  .catch(handleGetError)
  .then((response) => { handleGetPopularArticles(response, 'aside'); })
  .catch(handleGetError);
  // And now recommended articles
  setTimeout(() => { axios.get('/api/posts/last')
  .catch(handleGetError)
  .then(handleGetArticlesFromEnd)
  .catch(handleGetError); }, 3000);
  // Load comments
  axios.get(('/api/comments/post/'+id))
  .catch(handleGetError)
  .then(handleGetComments)
  .catch(handleGetError);
}

function handleGetComments(response) {
  if (response.data == null || !('id' in response.data)) {
    return;
  }
  let commentSection = document.querySelector("footer").previousElementSibling.firstElementChild;
  let elements = [];
  for (let i = 3; 
    i < commentSection.children.length; 
    ++i) {
    elements.push(commentSection.children[i]);
  }
  for (let item of elements) {
    item.remove();
  }
  elements = [];
  for (let item of response.data) {
    axios.get(('/api/user/'+item.user_id))
    .catch(handleGetError)
    .then(res => { handleGetUser(res, commentSection, response.data.text); })
    .catch(handleGetError);
  }
}

function handleGetUser(res, element, text) {
  if (!res || !('id' in res)) {
    return;
  }
  let date = new Date(parseInt(res.date));
  element.appendChild(document.createElement("div"));
  element.lastElementChild.appendChild(document.createElement("p"));
  element.lastElementChild
  .lastElementChild.innerText = `Written by ${res.first_name} ${res.last_name} on ` + date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
  element.lastElementChild.appendChild(document.createElement("p"));
  element.lastElementChild.lastElementChild.innerText = text; 
}

function handleGetArticlesFromEnd(response) {
  if (!response.data || !('id' in response.data)) {
    return;
  }

  let title = sectionElements['articleSection'].children[sectionElements['articleSection'].children.length-2].innerText;
  let keywords = [];
  let l = 0;
  for (let i = 0; i < title.length; ++i) {
    if (title[i] == ' ') {
      ++l;
      continue;
    }
    if (keywords[l] === undefined) {
      keywords[l] = '';
    }
    keywords[l] += title[i];
  }

  if (keywords.length < 1) {
    // If no keywords then dont search
    // ToDo: add page content for no similar posts match
    return;
  }

  removeAllContent('recommendation');

  for (let i = response.data.id;
    i < (response.data.id+1) && i > 0 ;
    --i) {
    if (i == id) {
      continue;
    }
    if (loadedPostCount['recommendation'] >= confLoadMaxArticles['recommendation']) {
     /*
      * these two settings can be used to load
      * "more" pages or "show more" / next
      * ..in case there is much more content
      * in db, it could be searched thoroughly
      */
      loadedPostPos['recommendation'] = i;
      loadedPostCount['recommendation'] = 0;
      break;
    }
    axios.get(('/api/posts/'+i))
    .catch(handleGetError)
    .then(res => { handleGetArticleAndFindSimilarTopics(res, keywords); })
    .catch(handleGetError);
  }
}

function handleGetArticleAndFindSimilarTopics(response, keywords) {
  if (!response.data || !('id' in response.data)) {
    return;
  }
  let keywordPoints = 0;
  for (let i = 0;
    i < keywords.length;
    ++i) {
    if ((response.data.text.search(keywords[i]) > -1) || (response.data.title.search(keywords[i]) > -1)) {
      ++keywordPoints;
      if (keywordPoints > 1) {
        addRecommendedArticle(response.data);
      }
    }
  }
}

function addRecommendedArticle(articleData) {
  let skimmed = skimData(articleData.text);
  let date = new Date(parseInt(articleData.date));
  let html = `<article class="card card-body mr-5 mt-3 overflow-hidden"><a class="card-title card-link" href="article.html?id=${articleData.id}"><h3>${articleData.title}</h3></a>`;
  if (skimmed.img.length > 0) {
    html += skimmed.img;
  }
  html += `<p class="text-muted lead">` + date.getDate() + "." + (date.getMonth()+1)  + `</p><p class="card-text lead">${skimmed.text}</p></article>`;
  sectionElements['recommendation'].innerHTML = sectionElements['recommendation'].innerHTML + html;
}



function handleGetPopularArticles(response, type) {
  if (!response.data || !Array.isArray(response.data) || response.data.length < 1) {
    return;
  }
  removeAllContent('aside');
  for (let i = 0; i < response.data.length; ++i) {
    setTimeout(() => { loadArticle(response.data[i], type); }, (2000*(i+1)));
  }
}

function loadArticle(data, type) {
  if (data && 'text' in data) {
    let article = createNewArticle(type, data);
    if (type == 'main') {
      article.className = "row overflow-hidden lead";
    }
    if (subscriptionElement == null) {
      subscriptionElement = sectionElements[type].children[1];
    }
    sectionElements[type].insertBefore(article, subscriptionElement);
  }
}

function createNewArticle(type = 'main', data) {
  let article = document.createElement("article");
  let skimmed = skimData(data.text); // { img: tag, text: text }

  if (skimmed.img.length > 0) {
    article.innerHTML = skimmed.img;
  }
  article.appendChild(document.createElement("a"));
  article.lastElementChild.setAttribute("href", ("article.html?id="+data.id));
  article.lastElementChild.appendChild(document.createElement("h3"));
  article.lastElementChild.lastElementChild.innerText = data.title;
  article.appendChild(document.createElement("p"));
  article.lastElementChild.className = "lead overflow-hidden";
  article.lastElementChild.innerText = skimmed.text;
  return article;
}

function loadUserUI() {
  if (localStorage.getItem("id") === null || localStorage.getItem("permissions") == null) {
    document.getElementById("top").nextElementSibling.remove();
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

function handleGetError(error) {
}

function handleFetchArticle(response) {
  if (response.data && 'id' in response.data) {
    removeAllContent('articleSection');
    let date = new Date(parseInt(response.data.date));
    let skimmedData = skimData(response.data.text);
    sectionElements['articleSection'].appendChild(document.createElement("p"));
    sectionElements['articleSection'].appendChild(document.createElement("p"));
    sectionElements['articleSection'].lastElementChild.className = "text-muted";
    sectionElements['articleSection'].lastElementChild.innerText = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes();
    if (skimmedData.img.length > 0) {
      sectionElements['articleSection'].appendChild(document.createElement("img"));
      sectionElements['articleSection'].innerHTML = skimmedData.img;
      sectionElements['articleSection'].appendChild(document.createElement("br"));
      sectionElements['articleSection'].appendChild(document.createElement("br"));
    }
    sectionElements['articleSection'].appendChild(document.createElement("h1"));
    sectionElements['articleSection'].lastElementChild.innerText = response.data.title;
    sectionElements['articleSection'].appendChild(document.createElement("p"));
    sectionElements['articleSection'].lastElementChild.innerText = skimmedData.text;
    axios.get(('/api/users/'+response.data['author_id']))
    .catch(handleGetError)
    .then(handleGetAuthorById)
    .catch(handleGetError);
  }
}

function removeAllContent(type) {
  if (((type == 'articleSection' || type == 'recommendation') && sectionElements[type].children.length > 0) ||
    (type == 'aside' && sectionElements[type].children.length > 2)) {
    let content = [];
    for (let i = (type == 'aside' ? 1 : 0);
      i < (type == 'aside' ? (sectionElements[type].children.length-2) : sectionElements[type].children.length);
      ++i) {
      content.push(sectionElements[type].children[i]);
    }
    for (let i = 0; 
      i < content.length; 
      ++i) {
      content[i].remove();
    }
    content = [];
  }
}

function skimData(text) {
  let skimmed = {
    'text' : text,
    'img' : ''
  };
  let imgPos = text.search("<img");
  if (imgPos > -1) {
    let imgEndPos = text.search(">");
    if (imgEndPos > -1) {
      skimmed.text = text.slice(imgPosEnd);
      skimmed.img = text.slice(imgPos, (imgPosEnd+1));
    }
  }
  return skimmed; 
}

function handleGetAuthorById(response) {
  if (response.data && 'id' in response.data) {
    sectionElements['articleSection'].firstElementChild.innerText = `Authored by ${response.data.first_name} ${response.data.last_name}`;
  }
}


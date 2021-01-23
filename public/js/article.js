let isLoaded = false;
let params = new URLSearchParams(window.location.search);
let id = -1;
let sectionElements = {
  'articleSection' : document.getElementById("content").firstElementChild.firstElementChild,
  'aside' : document.getElementById("content").lastElementChild,
  'recommendation' : document.getElementById("content").nextElementSibling.lastElementChild,
  'comments' : document.querySelector("footer").previousElementSibling.firstElementChild
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
  loadUserUI();
  if (!params.has("id")) {
    alert("Could not load content, redirecting..");
    setTimeout(() => { window.location.href = "/"; }, 4000);
    return;
  }
  let strId = params.get('id');
  if (strId == null) {
    return;
  }
  id = parseInt(strId);
  if (!Number.isSafeInteger(id) || id == null) {
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
  document.getElementById('commentary_form').lastElementChild.addEventListener("click", handleSendFormData);
}

function handleSendFormData(e) {
  e.preventDefault();
  if (localStorage.getItem("id") === null) {
    alert("You need to be logged in first!");
    return;
  }
  let params = new URLSearchParams();
  params.append('postId', id);
  params.append('userId', localStorage.getItem("id"));
  params.append('text', document.getElementById('comment_text').value);
  axios.post('/api/comments', params)
  .catch(handleGetError)
  .then(handlePostMethod)
  .catch(handleGetError);
}

function handlePostMethod(res) {
  if (!res.data || 
    ('result' in res.data &&
    (res.data['result'] == 'Failure!' || 
     res.data['result'] == 'Failed!'))) {
    alert("Error! Couldnt submit. Please check your session or validity of text input.");
    return;
  }
  if (res.data.result == 'Success!') {
    let date = new Date();
    let divElement = document.createElement("div");
    divElement.appendChild(document.createElement("p"));
    divElement.lastElementChild.innerText = `Written by ` + localStorage.getItem("first_name") + " "  + localStorage.getItem("last_name") + ` on ` + date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
    divElement.appendChild(document.createElement("p"));
    divElement.lastElementChild.innerText = document.getElementById('comment_text').value;
    sectionElements['comments'].insertBefore(divElement, sectionElements['comments'].children[3]);
    document.getElementById('comment_text').value = "";
  }
}

function handleGetComments(response) {
  let elements = [];
  for (let i = 3;
    i < sectionElements['comments'].children.length;
    ++i) {
    elements.push(sectionElements['comments'].children[i]);
  }
  for (let item of elements) {
    item.remove();
  }
  elements = [];

  if (response.data == null || 
    !Array.isArray(response.data) || 
    response.data.length < 1) {
    isLoaded = true;
    return;
  }
  
  for (let item of response.data) {
    axios.get(('/api/users/'+item.user_id))
    .catch(handleGetError)
    .then(res => { handleGetUser(res, item.text, item.date); })
    .catch(handleGetError);
  }
  isLoaded = true;
}

function handleGetUser(res, text, commentDate) {
  if (!res || !('id' in res.data)) {
    return;
  }
  let date = new Date(parseInt(commentDate));
  sectionElements['comments'].appendChild(document.createElement("div"));
  sectionElements['comments'].lastElementChild.appendChild(document.createElement("p"));
  sectionElements['comments'].lastElementChild
  .lastElementChild.innerText = `Written by ${res.data.first_name} ${res.data.last_name} on ` + date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
  sectionElements['comments'].lastElementChild.appendChild(document.createElement("p"));
  sectionElements['comments'].lastElementChild.lastElementChild.innerText = text; 
}

function handleGetArticlesFromEnd(response) {
  removeAllContent('recommendation');
  if (!response.data || !('id' in response.data)) {
    sectionElements['recommendation'].appendChild(document.createElement("p"));
    sectionElements['recommendation'].lastElementChild.className = "lead";
    sectionElements['recommendation'].lastElementChild.innerText = "Sorry, could not find any content.. ";
    return;
  }
  
  let promises = [];
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
    promises.push(axios.get(('/api/posts/'+i))
    .catch(handleGetError)
    .then(res => { handleGetArticleAndFindSimilarTopics(res, response.data['category_id']); })
    .catch(handleGetError));
  }
  Promise.all(promises).then(() => {
    if (sectionElements['recommendation'].getElementsByTagName("article").length < 1) {
      sectionElements['recommendation'].appendChild(document.createElement("p"));
      sectionElements['recommendation'].lastElementChild.className = "lead";
      sectionElements['recommendation'].lastElementChild.innerText = "Sorry, could not find any content.. ";
    }
  });
}

function handleGetArticleAndFindSimilarTopics(response, categoryId) {
  if (!response.data || !('id' in response.data)) {
    return;
  }

  if (response.data['category_id'] == categoryId)  {
    addRecommendedArticle(response.data);
  }
}

function addRecommendedArticle(articleData) {
  let skimmed = skimData(articleData.text);
  let date = new Date(parseInt(articleData.date));
  let html = `<article class="card card-body mr-5 mt-3 overflow-hidden"><a class="card-title card-link" href="article.html?id=${articleData.id}"><h3>${articleData.title}</h3></a>`;
  if (skimmed.img.length > 0) {
    html += skimmed.img;
  }
  html += `<p class="text-muted lead">` + date.getDate() + "." + (date.getMonth()+1)  + `.</p><p class="card-text lead">${skimmed.text}</p></article>`;
  sectionElements['recommendation'].innerHTML += html;
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
    document.getElementById("top").nextElementSibling.style = "display:none;";
    return;
  }
  let topElement = document.getElementById("top");
  topElement.nextElementSibling.lastElementChild.lastElementChild.innerText = localStorage.getItem("first_name") + " " + localStorage.getItem("last_name");
  topElement.nextElementSibling.style = "";
  topElement.firstElementChild.firstElementChild.children[1].remove();
  let logoutBtn = document.createElement("li");
  logoutBtn.className = "col-sm";
  logoutBtn.appendChild(document.createElement("ul"));
  logoutBtn.firstChild.className = "navbar-nav justify-content-sm-end";
  logoutBtn.firstChild.appendChild(document.createElement("li"));
  logoutBtn.firstChild.firstChild.className = "nav-item";
  logoutBtn.firstChild.firstChild.appendChild(document.createElement("a"));
  logoutBtn.firstChild.firstChild.firstChild.className = "nav-link";
  logoutBtn.firstChild.firstChild.firstChild.setAttribute("href", ("article.html?"+id));
  logoutBtn.firstChild.firstChild.firstChild.innerText = "Logout";
  logoutBtn.addEventListener("click", handleDestroySession);
  let list = topElement.firstElementChild.firstElementChild;
  list.insertBefore(logoutBtn, list.lastElementChild);
}

function handleDestroySession(e) {
  e.preventDefault();
  axios.get('/api/user/logout')
  .catch(handleGetError)
  .then(handleDestroyCookie)
  .catch(handleGetError);
}

function handleDestroyCookie(response) {
  if (!response.data || ('result' in response.data && response.data.result != 'Success!')) {
    return;
  }
  alert("You are logging out, you will be redirected..");
  localStorage.removeItem("id");
  localStorage.removeItem("permissions");
  localStorage.removeItem("first_name");
  localStorage.removeItem("last_name");
  localStorage.removeItem("email");
  localStorage.removeItem("last_login");
  setTimeout(() => { window.location.reload(); }, 1000);
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


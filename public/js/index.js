// Styling for article children
const articlesSection = {
  'main' : document.querySelector("main"),
  'aside' : document.querySelector("aside")
};
const lastLoadedPost = {
  'main' : -1,
  'aside' : -1
}; // -1 is not yet init
// this relates to article count loader 
// and hence fixates it
const loadArticlesConf = {
  'main' : 5,
  'aside' : 3
};
let userData = null;

function clearContent(type) {
  if ((type == 'main' && articlesSection[type].children.length > 0) || (type == 'aside' && articlesSection[type].children.length > 1)) {
    let items = new Array();
    for (let i = (type == 'aside' ? 1 : 0); i < articlesSection[type].children.length; ++i) {
      items.push(articlesSection[type].children[i]);
    }
    for (let i of items) {
      i.remove();
    }
  }
}

/*
*  ATTENTION: If text data contains HTML tag with an image
*  it will be cut out including its attributes!
*/
function splitData(data) {
  let skimmedData = { 
    img : '', 
    text : '' 
  };

  let imgPos = data.search("<img");
  let endPos = -1;
  if (imgPos != -1) {
    endPos = data.search(">");
    if (endPos != -1) {
      let imgTag = '';
      for (let i = imgPos; i <= endPos; ++i) {
        imgTag += data.charAt(i);
      }
      if (imgTag.length > 0) {
        skimmedData.img = imgTag;
      }
      skimmedData.text = data.slice(endPos);
    }
    else {
      skimmedData.text = data;
    }
  }
  else {
    skimmedData.text = data;
  }
  return skimmedData;
}

function createNewArticle(type = 'main', data) {
  let article = document.createElement("article");
  let skimmed = splitData(data.text); // { img: tag, text: text }

  switch (type) {
    case 'main':
      let date = new Date(parseInt(data.date));
      article.appendChild(document.createElement("div"));
      article.lastElementChild.className = "col-sm-auto";
      if (skimmed.img.length > 0) {
          article.lastElementChild.innerHTML = skimmed.img;
      }
      article.appendChild(document.createElement("div"));
      article.lastElementChild.className = "col-sm";
      article.lastElementChild.appendChild(document.createElement("a"));
      article.lastElementChild.lastElementChild.setAttribute("href", ("article.html?id="+data.id));
      article.lastElementChild.lastElementChild.appendChild(document.createElement("h1"));
      article.lastElementChild.lastElementChild.lastElementChild.className = "mb-0";
      article.lastElementChild.lastElementChild.lastElementChild.innerText = data.title;
      article.lastElementChild.appendChild(document.createElement("p"));
      article.lastElementChild.lastElementChild.className = "text-muted";
      article.lastElementChild.lastElementChild.innerText = date.getDate() + "." + (date.getMonth()+1) + ".";
      article.lastElementChild.appendChild(document.createElement("p"));
      article.lastElementChild.lastElementChild.innerText = skimmed.text;
      break;
    case 'aside':
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
      break;
  }
  return article;
}

function loadArticle(data, type) {
  if (data && 'text' in data) {
    let article = createNewArticle(type, data);
    if (type == 'main') {
      article.className = "row overflow-hidden lead";
    }
    articlesSection[type].appendChild(article);
  }
}

function handleLoadPopularArticles(response, type) {
  if (response.data && Array.isArray(response.data)) {
    clearContent(type);
    for (let i = 0; i < response.data.length; ++i) {
      setTimeout(() => { loadArticle(response.data[i], type); }, (2000*(i+1)));
    }
  }
}

function handleLoadArticlesFromEnd(response, type) {
  if (response.data && 'id' in response.data && response.data.id > 0) {
    lastLoadedPost[type] = response.data.id;
    if (lastLoadedPost[type] > 0) {
      clearContent(type);
      for (let loadedCount = 0; 
           lastLoadedPost[type] > 0;
            --lastLoadedPost[type], ++loadedCount) {

        if (loadedCount >= loadArticlesConf[type]) {
          break;
        }
        axios.get(('/api/posts/' + lastLoadedPost[type]))
        .catch(handleGetError)
        // Added timeout to give animation "perception"
        .then((response) => { 
          setTimeout(() => { loadArticle(response.data, type) },
          (2000 * (loadedCount+1))); });
      }
    }
  }
}

function loadUserUI() {
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

function handleLoadUserData(response) {
  if (response.data && 'userId' in response.data) {
    for (let i in response.data) {
      localStorage.setItem(i, response.data[i]);
    }
    loadUserUI();
  }
  else {
    localStorage.removeItem('userId');
    localStorage.removeItem('permissions');
    localStorage.removeItem('email');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('lastLogin');
  }
}

function handleGetError(err) {
  if (err) {
    if (err.response) {
          
    }
    else if (err.request) {
          
    }
    else {
          
    }
  }
}

function main() {
  axios.get('/api/user/status')
    .catch(handleGetError)
    .then(handleLoadUserData);
  axios.get('/api/posts/last')
    .catch(handleGetError)
    .then((response) => { handleLoadArticlesFromEnd(response, 'main'); });
  axios.get('/api/posts/popular')
    .catch(handleGetError)
    .then((response) => { handleLoadPopularArticles(response, 'aside'); });
}

main();

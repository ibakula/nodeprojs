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

function clearContent(tag) {
  for (let element of tag.children) {
    tag.remove();
  }
}

/*
*  ATTENTION: If text data contains HTML tag with an image
*  it will be cut out including its attributes!
*/
function splitData(data) {
  let skimmedData = { 
    img : '<img alt="Article image" src="/img/NotFound.jpg" width="160px" height="100px">', 
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
      article.lastElementChild.innerHTML = skimmed.img;
      article.lastElementChild.lastElementChild.innerHTML = skimmed.img;
      article.appendChild(document.createElement("div"));
      article.lastElementChild.className = "col-sm";
      article.lastElementChild.appendChild(document.createElement("a"));
      article.lastElementChild.lastElementChild.setAttribute("href", "article.html#");
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
      article.innerHTML = skimmed.img;
      article.appendChild(document.createElement("a"));
      article.lastElementChild.setAttribute("href", "article.html");
      article.lastElementChild.appendChild(document.createElement("h3"));
      article.lastElementChild.lastElementChild.innerText = data.title;
      article.appendChild(document.createElement("p"));
      article.lastElementChild.className = "lead";
      article.lastElementChild.innerText = skimmed.text;
      break;
  }
  return article;
}

function loadArticle(data, type) {
  if (data && 'text' in data) {
    // Old content flush
    //clearContent(mainTag);
    //clearContent(asideTag);
    let article = createNewArticle(type, data);
    if (type == 'main') {
      article.className = "row overflow-hidden lead";
    }
    articlesSection[type].appendChild(article);
  }
}

function handleLoadPopularArticles(response, type) {
  if (response.data && Array.isArray(response.data)) {
    for (let i = 0; i < response.data.length; ++i) {
      setTimeout(() => { loadArticle(response.data[i], type); }, (2000*(i+1)));
    }
  }
  setTimeout(() => {
      articlesSection[type].children[1].remove();
  }, (4000*loadArticlesConf[type]));
}

function handleLoadArticlesFromEnd(response, type) {
  if (response.data && 'id' in response.data && response.data.id > 0) {
    lastLoadedPost[type] = response.data.id;
    if (lastLoadedPost[type] > 0) {
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
      setTimeout(() => { 
          if (type == 'main') {
            articlesSection[type].firstElementChild.remove();
          }
          else if (type == 'aside') {
            articlesSection[type].children[1].remove();
          }
        }, (4000*loadArticlesConf[type]));
    }
  }
}

function loadUserUI() {
  document.getElementById("top").firstElementChild.firstElementChild.children[1].remove();
}

function handleLoadUserData(response) {
  if (response.data && 'id' in response.data) {
    userData = response.data;
    loadUserUI();
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

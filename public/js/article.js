let params = new URLSearchParams(window.location.search);
let id = -1;
let articleSection = document.getElementById("content").firstElementChild.firstElementChild;

main();

function main() {
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
  .then(handleGetPostData)
  .catch(handleGetError);
}

function loadUserUI() {
  if (localStorage.getItem("userId") === null || localStorage.getItem("permissions") == null) {
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

function handleGetPostData(response) {
  if (response.data && 'id' in response.data) {
    removeAllContent();
    let date = new Date(parseInt(response.data.date));
    let skimmedData = skimData(response.data.text);
    articleSection.appendChild(document.createElement("p"));
    articleSection.appendChild(document.createElement("p"));
    articleSection.lastElementChild.className = "text-muted";
    articleSection.lastElementChild.innerText = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes();
    if (skimmedData.img.length > 0) {
      articleSection.appendChild(document.createElement("img"));
      articleSection.innerHTML = skimmedData.img;
      articleSection.appendChild(document.createElement("br"));
      articleSection.appendChild(document.createElement("br"));
    }
    articleSection.appendChild(document.createElement("h1"));
    articleSection.lastElementChild.innerText = response.data.title;
    articleSection.appendChild(document.createElement("p"));
    articleSection.lastElementChild.innerText = skimmedData.text;
    axios.get(('/api/users/'+response.data['author_id']))
    .catch(handleError)
    .then(handleGetAuthorById)
    .catch(handleError);
  }
}

function removeAllContent() {
  if (articleSection.children.length > 0) {
    let content = [];
    for (let i = 0;
      i < articleSection.children.length;
      ++i) {
      content.push(articleSection.children[i]);
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
    articleSection.firstElementChild.innerText = `Authored by ${response.data.first_name} ${response.data.last_name}`;
  }
}

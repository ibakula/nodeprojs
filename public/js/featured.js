//isLoaded = false;
let featured = document.getElementById("featured").firstElementChild;

axios.get('/api/posts/last')
.catch(handleErrors)
.then(handleLoadPostsFromEnd)
.catch(handleErrors);

function handleErrors(error) {
}

function handleLoadPostsFromEnd(response) {
  if (!response.data || !('id' in response.data)) {
    return;
  }
  let lastId = response.data.id;
  let count = 0;
  let loadMax = calculateAvailableSlides();
  for (let i = lastId; 
    i > 0 && i <= lastId && count <= loadMax; 
    --i, ++count) {

    let c = count;
    axios.get(`/api/posts/${i}`)
    .catch(handleErrors)
    .then((res) => { handleLoadNextPost(res, c); })
    .catch(handleErrors);
  }
}

function calculateAvailableSlides() {
  let count = 0;
  if (featured == null) { 
    return 0;
  }
  for (let i = 0; 
    i < featured.children.length; 
    ++i) {
    if (featured.children[i].tagName == "DIV") {
      ++count;
    }
  }
  return count;
}

function handleLoadNextPost(response, count) {
  if (!response.data && !('id' in response.data)) {
    return;
  }
  if (featured == null) {
    return;
  }
  let skimmed = splitData(response.data.text);

  // Remove all inner HTML
  let element = document.createElement("p");
  element.innerHTML = response.data.title;
  response.data.title = element.innerText;
  element.innerHTML = skimmed.text;
  skimmed.text = element.innerText;
  element.innerHTML = skimmed.img;
  skimmed.text.trim();
  skimmed.title.trim();
  
  for (let i = 0; 
    i < featured.children[2+count].children.length; 
    ++i) {
    if (featured.children[2+count].children[i].tagName == "IMG" && skimmed.img.length > 0) {
      featured.children[2+count].children[i].setAttribute("src", element.firstElementChild.getAttribute("src"));
    }
    if (featured.children[2+count].children[i].tagName == "H2") {
      featured.children[2+count].children[i].innerHTML = response.data.title;
    }
    if (featured.children[2+count].children[i].tagName == "P") {
      featured.children[2+count].children[i].innerHTML = skimmed.text.slice(0, 100);
    }
  }
}

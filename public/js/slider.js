var sliderBackground = document.getElementById("featured");
var sliderLeftCtrl = document.getElementById("left");
var sliderRightCtrl = document.getElementById("right");
var sliderData = sliderBackground.firstElementChild.getElementsByClassName("d-none");
var selection = 0;
var time = 500000;

function slide() {
    if (sliderData != null && selection < sliderData.length && sliderBackground != null) {
        sliderBackground.style.backgroundImage = "url(" + sliderData[selection].firstElementChild.getAttribute("src") + ")";
        sliderBackground.firstElementChild.lastElementChild.firstElementChild.innerHTML = sliderData[selection].children[1].innerHTML;
        sliderBackground.firstElementChild.lastElementChild.lastElementChild.innerHTML = sliderData[selection].children[2].innerHTML;
    }
}

slide();

if (sliderLeftCtrl != null) {
    sliderLeftCtrl.addEventListener("click", function(e) { handleLeftClickCtrl(e); });
}

if (sliderRightCtrl != null) {
    sliderRightCtrl.addEventListener("click", function(e) { handleRightClickCtrl(e); });
}

function handleLeftClickCtrl(e) {
    if (selection > 0) {
        --selection;
    }
    else selection = (sliderData.length-1);
    
    slide();
}

function handleRightClickCtrl(e) {
    if (selection < (sliderData.length-1)) {
        ++selection;
    }
    else selection = 0;
    
    slide();
}
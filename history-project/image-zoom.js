'use strict';

function clickOnImage(e) {
	let img = e.target || e.srcElement;
	// determine path to the image
	let src = img.getAttribute('src');

	// change image's src in popup
	setPopupImg(src);

	// set image caption if exists
	let caption = img.parentNode.getElementsByClassName('image-caption');
	if (caption[0]) {
		caption = caption[0];
		setCaption(caption.innerText);
	}

	showPopup();

	if (img.parentNode.classList.contains('image-set-item')) {
		let itemsSet = img.parentNode.parentNode.getElementsByClassName('image-set-item');
		showPopupControls();
		setImageItemsIndeces(itemsSet);
		currentImageSet = itemsSet;

		popup.setAttribute('data-index', img.parentNode.getAttribute('data-index'));
	} else {
		hidePopupControls();
	}
}

function setCaption(text) {
	popup.getElementsByClassName('image-popup-caption')[0].innerText = text;
}

function setPopupImg(src) {
	popup.getElementsByTagName('img')[0].setAttribute('src', src);
}

function setImageItemsIndeces(imageSet) {
	for (let i = 0; i < imageSet.length; i++) {
		imageSet[i].setAttribute('data-index', i);
	}
}

function showImg(imageItems, currentIndex) {
	setPopupImg(imageItems[currentIndex].getElementsByTagName('img')[0].getAttribute('src'));

	let caption = imageItems[currentIndex].getElementsByClassName('image-caption')[0];
	caption = caption ? caption.innerText : '';
	setCaption(caption);
}

function hidePopup() {
	popup.classList.remove('active');
	hidePopupControls();
	popup.setAttribute('data-index', 0);
	currentImageSet = undefined;
	setCaption('');
}

function showPopupControls() {
	Array.from(popup.getElementsByClassName('image-popup-control')).forEach(function(element) {
		element.classList.add('active');
	});
}

function hidePopupControls() {
	Array.from(popup.getElementsByClassName('image-popup-control')).forEach(function(element) {
		element.classList.remove('active');
	});
}

function showPopup() {
	popup.classList.add('active');
}

function clickOnPopupToClose(e) {
	let target = e.target || e.srcElement;
	//console.log(target);
	let classesToClick = [
		'image-popup',
		'image-popup-cross',
		'image-popup-cross-btn',
		'image-popup-control image-popup-forward',
		'image-popup-control image-popup-back',
		'image-popup-control image-popup-forward active',
		'image-popup-control image-popup-back active',
		'image-popup-wrapper',
		'image-popup active', 
	];

	// clicked not on controls and not on image
	if (classesToClick.includes(target.className)) {
		hidePopup();
	}

	// TODO: cleanup this code
}

var popup = document.getElementsByClassName('image-popup')[0];
var currentImageSet;

popup.addEventListener('click', clickOnPopupToClose);

Array.from(document.getElementsByClassName('image-zoomable')).forEach(function(element) {
	Array.from(element.getElementsByTagName('img')).forEach(function(img) {
		img.addEventListener('click', clickOnImage);
	});
});

document.getElementsByClassName('image-popup-control-btn-forward')[0].addEventListener('click', function(e) {
	let currentImageIndex = +popup.getAttribute('data-index');

	currentImageIndex += 1;
	if (currentImageIndex == currentImageSet.length) {
		currentImageIndex = 0;
	}

	showImg(currentImageSet, currentImageIndex);

	popup.setAttribute('data-index', currentImageIndex);
});

document.getElementsByClassName('image-popup-control-btn-back')[0].addEventListener('click', function(e) {
	let currentImageIndex = +popup.getAttribute('data-index');

	currentImageIndex -= 1;
	if (currentImageIndex == -1) {
		currentImageIndex = currentImageSet.length-1;
	}

	showImg(currentImageSet, currentImageIndex);

	popup.setAttribute('data-index', currentImageIndex);
});

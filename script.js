const imagesWrapper = document.querySelector(".images");
const loadMoreBtn = document.querySelector(".load-more");
const searchImagesBtn = document.querySelector(".search-box input");
const downloadBtn = document.querySelector(".buttons .fa-download");
const lightBoxBtn = document.querySelector(".ligthbox");
const popularKeyword = document.querySelectorAll(".popular-keyword ul li");
const messageHanding = document.querySelector(".message-handling");

const apiKey = "wWpKoeicP43bcGMr4dUFIRw495oSX5dS6n08FLy1yqW78lVJ56aCVgxl";
let perPage = 15;
let currentPage = 1;
let searchKeywords = null;
let apiURLDefault = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
let timing = 1;

const downloadImg = (imageURL) => {
  fetch(imageURL)
    .then((res) => res.blob())
    .then((file) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = new Date().getTime();
      a.click();
    })
    .catch(() => alert("Failed to download image!"));
};

const showLightBox = (name, image, alt) => {
  document.body.style.overflow = "hidden";
  lightBoxBtn.querySelector("span").innerText = name;
  lightBoxBtn.querySelector("img").src = image;
  lightBoxBtn.querySelector(".image-name p").innerText = alt;
  lightBoxBtn.classList.add("show");
};

const disableLightbox = () => {
  lightBoxBtn.classList.remove("show");
  document.body.style.overflow = "scroll";
};

const generateHTMl = (images) => {
  imagesWrapper.innerHTML += images
    .map(
      (image) =>
        `<li onclick="showLightBox('${image.photographer}', '${image.src.large2x}', '${image.alt}')">
    <img src="${image.src.large2x}" alt="${image.alt}">
    <div class="detail">
       <div class="photographer">
          <i class="fa-solid fa-camera"></i>
          <span>${image.photographer}</span>
       </div>
       <button onclick="downloadImg('${image.src.large2x}');event.stopPropagation()"><i class="fa-solid fa-download"></i></button>
    </div>
 </li>`
    )
    .join("");
};

const getImages = (apiURL) => {
  loadMoreBtn.innerText = "Loading...";
  loadMoreBtn.classList.add("loading");
  fetch(apiURL, {
    headers: {
      Authorization: apiKey,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      generateHTMl(res.photos);
      if (res.photos.length === 0) {
        messageHanding.style.display = "flex";
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "flex";
        messageHanding.style.display = "none";
        loadMoreBtn.innerText = "Load More";
        loadMoreBtn.classList.remove("loading");
      }
    });
};

const loadMoreImage = () => {
  currentPage++;
  apiURLDefault = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
  getImages(
    searchKeywords
      ? `https://api.pexels.com/v1/search/?page=${currentPage}&per_page=${perPage}&query=${searchKeywords}`
      : apiURLDefault
  );
};

const searchImages = () => {
  searchKeywords = searchImagesBtn.value;
  if (searchKeywords === "") {
    return (searchKeywords = null);
  }

  for (let i = 0; i < popularKeyword.length; i++) {
    if (popularKeyword[i].classList.contains("active")) {
      popularKeyword[i].classList.remove("active");
    }
  }
  timing++;
  let valueA = timing;
  setTimeout(() => {
    let valueB = timing;
    if (valueA === valueB) {
      imagesWrapper.innerHTML = "";
      currentPage = 1;
      getImages(
        `https://api.pexels.com/v1/search/?page=${currentPage}&per_page=${perPage}&query=${searchKeywords}`
      );
      timing = 1;
    } else {
      return;
    }
  }, 750);
};

popularKeyword.forEach((btn) => {
  btn.addEventListener("click", () => {
    for (let i = 0; i < popularKeyword.length; i++) {
      if (popularKeyword[i].classList.contains("active")) {
        popularKeyword[i].classList.remove("active");
      }
    }
    searchImagesBtn.value = null;
    btn.classList.add("active");
    currentPage = 1;
    imagesWrapper.innerHTML = "";
    searchKeywords = btn.innerText;
    getImages(
      `https://api.pexels.com/v1/search/?page=${currentPage}&per_page=${perPage}&query=${searchKeywords}`
    );
  });
});

getImages(apiURLDefault);
loadMoreBtn.addEventListener("click", loadMoreImage);
searchImagesBtn.addEventListener("keyup", searchImages);
downloadBtn.addEventListener("click", () => {
  downloadImg(lightBoxBtn.querySelector("img").src);
});

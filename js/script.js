const imagesWrapper = document.querySelector(".images");
const loadMoreBtn = document.querySelector(".load-more");
const searchImagesBtn = document.querySelector(".search-box input");
const downloadBtn = document.querySelector(".buttons .fa-download");
const lightBoxBtn = document.querySelector(".ligthbox");
const popularKeyword = document.querySelectorAll(".popular-keyword ul li");
const messageHanding = document.querySelector(".message-handling h2");
const languages = document.querySelectorAll(".language p a");
const contentHeader = document.querySelector(".content");

const apiKey = "wWpKoeicP43bcGMr4dUFIRw495oSX5dS6n08FLy1yqW78lVJ56aCVgxl";
let perPage = 15;
let currentPage = 1;
let searchKeywords = null;
let apiURLDefault = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
let timing = 1;
let error = false;
let popularKeyStatus = null;
let isEnglish = true;

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

const showLightBox = async (name, image, alt) => {
  document.body.style.overflow = "hidden";
  lightBoxBtn.querySelector("span").innerText = name;
  lightBoxBtn.querySelector("img").src = image;
  if (error) {
    lightBoxBtn.querySelector(".image-name p").innerText =
      "Terjemahan tidak tersedia. Mohon tunggu beberapa saat";
  } else {
    lightBoxBtn.querySelector(".image-name p").innerText = alt;
  }
  lightBoxBtn.classList.add("show-ligthbox");
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("show-ligthbox")) {
      disableLightbox();
    }
  });
};

const disableLightbox = () => {
  lightBoxBtn.classList.remove("show-ligthbox");
  document.body.style.overflow = "scroll";
};

const generateHTMl = async (images) => {
  let imageName = [];
  let index = 0;

  for (let i = 0; i < images.length; i++) {
    imageName.push(images[i].alt);
  }

  if (!isEnglish) {
    imageName = await translateKeywords(
      `https://api.mymemory.translated.net/get?q=${imageName}&langpair=en|id&de=tsuzuran4@gmail.com`
    );
    imageName = imageName.split(",");
    loadMoreBtn.innerText = "Muat Lebih";
  } else {
    loadMoreBtn.innerText = "Load More";
  }
  loadMoreBtn.classList.remove("loading");
  imagesWrapper.innerHTML += images
    .map(
      (image) =>
        `<li onclick="showLightBox('${image.photographer}', '${
          image.src.large2x
        }', '${imageName[index++]}')">
    <img src="${image.src.large2x}" alt="${image.alt}">
    <div class="detail">
       <div class="photographer">
          <i class="fa-solid fa-camera"></i>
          <span>${image.photographer}</span>
       </div>
       <button onclick="downloadImg('${
         image.src.large2x
       }');event.stopPropagation()"><i class="fa-solid fa-download"></i></button>
    </div>
 </li>`
    )
    .join("");
};

const getImages = (apiURL) => {
  if (isEnglish) {
    loadMoreBtn.innerText = "Loading...";
  } else {
    loadMoreBtn.innerText = "Memuat...";
  }
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
        messageHanding.style.display = "block";
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "flex";
        messageHanding.style.display = "none";
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

const translateKeywords = async (apiURL) => {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    error = false;
    if (data.responseStatus > 400 || !data.matches) {
      error = true;
    }
    return data.responseData.translatedText;
  } catch {
    return "Terjemahan tidak tersedia";
  }
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
  setTimeout(async () => {
    let valueB = timing;
    if (valueA === valueB) {
      imagesWrapper.innerHTML = "";
      currentPage = 1;
      if (!isEnglish) {
        searchKeywords = await translateKeywords(
          `https://api.mymemory.translated.net/get?q=${searchKeywords}&langpair=id|en`
        );
      }
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
    popularKeyStatus = btn.innerText;
    searchKeywords = btn.innerText;
    btn.classList.add("active");
    currentPage = 1;
    imagesWrapper.innerHTML = "";
    getImages(
      `https://api.pexels.com/v1/search/?page=${currentPage}&per_page=${perPage}&query=${searchKeywords}`
    );
  });
});

const changeLanguage = () => {
  if (isEnglish) {
    error = false;
    contentHeader.querySelector("h1").innerText =
      "Stunning royalty-free images & royalty-free stock";
    contentHeader.querySelector("p").innerText =
      "Over 4 million+ high quality stock images, videos and music shared by our talented community";
    contentHeader.querySelector("input").placeholder =
      "Search for all image here";
    messageHanding.innerText = "Sorry, we couldn't find any matches";
  } else {
    contentHeader.querySelector("h1").innerText =
      "Gambar-gambar memukau & menakjubkan bebas royalti";
    contentHeader.querySelector("p").innerText =
      "Lebih dari 4 juta+ gambar berkualitas tinggi yang dibagikan oleh komunitas berbakat kami";
    contentHeader.querySelector("input").placeholder =
      "Cari semua gambar di sini";
    messageHanding.innerText = "Maaf, kami tidak menemukan hasil yang sesuai";
  }
  refreshData();
};

const refreshData = () => {
  if (popularKeyStatus !== null) {
    currentPage = 1;
    imagesWrapper.innerHTML = "";
    getImages(
      `https://api.pexels.com/v1/search/?page=${currentPage}&per_page=${perPage}&query=${popularKeyStatus}`
    );
  } else {
    currentPage = 1;
    imagesWrapper.innerHTML = "";
    getImages(apiURLDefault);
  }
};

languages.forEach((language) => {
  language.addEventListener("click", (e) => {
    for (let i = 0; i < languages.length; i++) {
      languages[i].classList.remove("active");
    }
    language.classList.add("active");
    if (language.classList.contains("en")) {
      isEnglish = true;
    } else {
      isEnglish = false;
    }
    changeLanguage();
  });
});

getImages(apiURLDefault);
loadMoreBtn.addEventListener("click", loadMoreImage);
searchImagesBtn.addEventListener("keyup", searchImages);
downloadBtn.addEventListener("click", () => {
  downloadImg(lightBoxBtn.querySelector("img").src);
});

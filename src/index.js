import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { searchByQuery } from './js/api';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
  searchInput: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more')
};

let counter = 1;
let searchQuery = '';

refs.searchInput.addEventListener('submit', onSearch);

const options = {
  rootMargin: '0px',
  threshold: 1.0
}

const observer = new IntersectionObserver(onLoadMore, options);

async function onSearch(e) {
  e.preventDefault()
  searchQuery = e.currentTarget.searchQuery.value.replaceAll(' ', '+');
  counter = 1;

  try {
    const resp = await searchByQuery(searchQuery, counter);
    const totalHits = resp.data.totalHits;

    if (!totalHits) {
      throw new Error('Sorry, there are no images matching your search query. Please try again.');
    };

    Notify.info(`Hooray! We found ${totalHits} images.`);

    const cardsMarkup = resp.data.hits.map(createCardMarkup).join('');
    refs.gallery.innerHTML = cardsMarkup;
  } catch (err) {
    Notify.warning(err.message);
    return;
  }

  counter = 1;
  refs.loadMore.addEventListener('click', onLoadMore);

  lightbox.refresh();
  observer.observe(refs.loadMore);
};

async function onLoadMore(entries) {
  if (entries[0].intersectionRatio <= 0) return;
  counter += 1;

  try {
    const resp = await searchByQuery(searchQuery, counter);
    const cardsMarkup = resp.data.hits.map(createCardMarkup).join('');

    if (counter*40 >= resp.data.totalHits) {
      throw new Error(`We're sorry, but you've reached the end of search results.`);
    };

    refs.gallery.insertAdjacentHTML('beforeend', cardsMarkup);
  } catch (err) {
    Notify.warning(`${err.message}`);
    observer.unobserve(entries[0].target)
    return;
  }

  lightbox.refresh();

  // Мені не сподобалось як це працює з infinity scroll, але розібрався)
  // smoothScroll()
}

const lightbox = new SimpleLightbox('.gallery a',({showCounter: false}))

function createCardMarkup({ webformatURL, tags, likes, views, comments, downloads, largeImageURL }) {
    return `<a href="${largeImageURL}" class="photo-card">
  <div class="img-container"><img class="card-img" src="${webformatURL}" alt="${tags}" loading="lazy" /></div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> <span class="text-number">${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b> <span class="text-number">${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b> <span class="text-number">${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b> <span class="text-number">${downloads}</span>
    </p>
  </div>
</a>`
}

function smoothScroll() {
  const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
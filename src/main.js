import { fetchPhotos } from './js/pixabay-api.js';
import { createGalleryCard } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more');

let currentQuery = '';
let currentPage = 1;
const perPage = 9; 
let totalHits = 0;
let lightbox;

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function showErrorToast(message) {
  iziToast.error({
    title: '',
    message,
    position: 'topRight',
    timeout: 5000,
    backgroundColor: '#f14646',
    class: 'custom-toast',
  });
}

async function onSearch(event) {
  event.preventDefault();

  const query = event.currentTarget.elements.searchQuery.value.trim();
  if (!query) {
    showErrorToast('Please enter a search query.');
    return;
  }

  currentQuery = query;
  currentPage = 1;
  clearGallery();
  loadMoreBtn.style.display = 'none';
  showLoader();

  try {
    const data = await fetchPhotos(currentQuery, currentPage, perPage);

    hideLoader();
    if (data.hits.length === 0) {
      showErrorToast('Sorry, there are no images matching<br>your search query. Please, try again!');
      return;
    }

    totalHits = data.totalHits;
    renderGallery(data.hits);

    lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();

    if (data.hits.length < totalHits) {
      loadMoreBtn.style.display = 'block';
    }
  } catch (error) {
    hideLoader();
    showErrorToast('Something went wrong. Please try again later.');
  }
}

async function onLoadMore() {
  currentPage += 1;
  loadMoreBtn.style.display = 'none';
  showLoader();

  try {
    const data = await fetchPhotos(currentQuery, currentPage, perPage);

    hideLoader();
    renderGallery(data.hits);
    lightbox.refresh();

    const totalLoaded = currentPage * perPage;
    if (totalLoaded >= totalHits) {
      loadMoreBtn.style.display = 'none';
      showErrorToast("We're sorry, but you've reached the end of search results.");
    } else {
      loadMoreBtn.style.display = 'block';
    }

    smoothScroll();
  } catch (error) {
    hideLoader();
    showErrorToast('Something went wrong. Please try again later.');
  }
}

function renderGallery(images) {
  const markup = images.map(createGalleryCard).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  gallery.innerHTML = '';
}

function smoothScroll() {
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

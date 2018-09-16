let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = () => {
  if (self.restaurant){
    return Promise.resolve(self.restaurant);
  }
  const id = parseInt(getParameterByName('id'));
  if (!id || id === NaN) {
    return Promise.reject('No restaurant id in URL')
  } else {
    return DBHelper.fetchRestaurantById(id)
    .then(restaurant => {
      if (!restaurant) {
        return Promise.reject(`Restaurant with ID ${id} was not found`)
      }
      self.restaurant = restaurant;
      fillRestaurantHTML();
      return restaurant;
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name + 'image of restaurant';

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;



  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
console.log('populate reviews');
DBHelper.fetchReviewsByRestId(restaurant.id)
.then(reviews => fillReviewsHTML(reviews))
}
/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  if (!navigator.onLine){
    const connection_status = document.createElement('p');
    connection_status.classList.add('offline_label')
    connection_status.innerHTML = "Offline"
    li.classList.add("reviews_offline")
    li.appendChild(connection_status);
  }
  const name = document.createElement('p');
  name.innerHTML = `Name: ${review.name}`;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = `Date: ${new Date(review.createAt).toLocaleString()}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

addReview = () =>{
  event.preventDefault();

  let restaurantId = getParameterByName('id');
  let name = document.getElementById('review-author').value;
  let rating;
  let comments = document.getElementById('review-comments').value;
  rating = document.querySelector('#rating_select option: checked').value;
  const review = [name, rating, comments, restaurantId];

  const frontEndReview = {
    restaurant_id: parseInt(review[3]),
    rating: parseInt(review[1]),
    name: review [0],
    comments: review [2].substring(0,300),
    createdAt: new Date()
  };

  DBHelper.addReview(frontEndReview);
  addReviewHTML(frontEndReview);
  document.getElementById('review-form').reset();
}

addReview =() =>{
  event.preventDefault();

  let restaurantId = getParameterByName('id');
  let name = document.getElementById('review-author').value;
  let rating;
  let comments = document.getElementById('review-comments').value;
  rating = document.querySelector('#rating-select option:checked').value;
  const review = [name,rating,comments,restaurantId];

  const frontEndReview = {
    restaurant_id: parseInt(review[3]),
    rating: parseInt(review[1]),
    name: review[0],
    comments: review[2].substring(0,300),
    createdAt: new Date()
  };

  DBHelper.addReview(frontEndReview);
  addReviewHTML(frontEndReview);
  document.getElementById('review-form').reset();
}

addReviewHTML = (review) => {
  if(document.getElementById('no-review')){
    document.getElementById('no-review').remove();
  }
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');

  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  container.appendChild(ul);
}
/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

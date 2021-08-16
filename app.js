const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const container = document.getElementById('root');
const store = {
  currentPage: 1,
  feeds: [],
};

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }
  return feeds;
}

function newsFeed() {
  let newsFeed = store.feeds;
  const newsList = [];
  let template = `
  <section class="main">
    <header class="title">
      <h1>Hacker News</h1>
    </header>
    <main class="news-list">
      {{__news_feed__}}
    </main>
    <div class="pagination">
      <a href="#/page/{{__prev_page__}}">
        Previous
      </a>
      <a href="#/page/{{__next_page__}}">
        Next
      </a>
    </div>
  </section>
  `;
  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
  }

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
    <section class="content" ${
      newsFeed[i].read
        ? 'style="background-color:#d3eedb;'
        : 'style="background-color:#fff"";'
    }>
      <a href="#/show/${newsFeed[i].id}">
      <div class="content-title">
        <h2>${newsFeed[i].title}</h2>
        <span class="content-comment">${newsFeed[i].comments_count}</span>
      </div>
      <div class="content-info">
        <div class="user-name">
          <i class="fas fa-user"></i> 
          <span>${newsFeed[i].user}</span>
        </div>
        <div class="like">
          <i class="fas fa-thumbs-up"></i>
          <span>${newsFeed[i].points}</span>
        </div>
        <div class="time-ago">
          <i class="far fa-clock"></i>
          <span>${newsFeed[i].time_ago}</span>
        </div>
      </div>
      </a>
    </section>
  `);
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace(
    '{{__prev_page__}}',
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace('{{__next_page__}}', store.currentPage + 1);
  container.innerHTML = template;
}

function newsDetail() {
  const id = location.hash.substr(7);
  const newsContent = getData(CONTENT_URL.replace('@id', id));
  let template = `
    <header class="title">  
      <h1>Hacker News</h1>
        <a href="#/page/${store.currentPage}" class="pagination">
          <i class="fas fa-times"></i>
        </a>
    </header>
    <section class="contents">
      <div class="contents-title">
        <h2>${newsContent.title}</h2>
      </div>
      <div class="contents-main">
        ${newsContent.content}
      </div>
      <div class="contents-comment">
        {{__comments__}}
      </div>
      </section>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  function makeComment(comments, called = 0) {
    const commentString = [];
    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
      <div class="comments-box" style="padding-left:${called * 40}px;">
        <div class="comments-info">
          <div class="comments-icon">
            <i class="far fa-comment-alt"></i>
          </div>
          <div class="user-name">
            <i class="fas fa-user"></i> 
            <span>${comments[i].user}</span>
          </div>
          <div class="time-ago">
            <i class="far fa-clock"></i>
            <span>${comments[i].time_ago}</span>
          </div>    
        </div>
        <div class="comments-main">
          ${comments[i].content}
        </div>
      </div>
        
      `);
      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1));
      }
    }

    return commentString.join('');
  }
  container.innerHTML = template.replace(
    '{{__comments__}}',
    makeComment(newsContent.comments)
  );
}

function router() {
  const routerPath = location.hash;

  if (routerPath === '') {
    newsFeed();
  } else if (routerPath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routerPath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener('hashchange', () => {
  router();
});

router();

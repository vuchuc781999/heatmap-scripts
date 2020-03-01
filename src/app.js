
import initial from './initial';
import collectClick from './click/collect';
import { showData, hideData } from './click/show';
import collectScroll from './scroll/collect';

window.addEventListener('load', async () => {
  await initial();
  window.show = showData;
  window.hide = hideData;
  collectClick();
  collectScroll();
});

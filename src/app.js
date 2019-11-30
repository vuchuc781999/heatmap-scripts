
import initial from './initial';
import collect from './collect';
import { showData, hideData} from './show';

(async () => {
  await initial();
  window.show = showData;
  window.hide = hideData;
  collect();
})();

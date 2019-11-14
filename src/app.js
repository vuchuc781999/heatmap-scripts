
import initial from './initial';
import collect from './collect';
import show from './show';

const hide = () => {
  const heatMap = document.getElementById("heat_map");

  if (heatMap) {
    heatMap.remove();
  }
}

(async () => {
  await initial();
  window.show = show;
  window.hide = hide;
  collect();
})();

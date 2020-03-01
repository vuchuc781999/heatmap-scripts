
import { rootUrl } from './config';

let pageId = '';
const loadedTimestamp = new Date();

const getId = async (url, data) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const obj = await res.json();
  return obj;
};

const initial = async () => {
  const url = `${rootUrl}/page/create`;

  const data = {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  };

  const result = await getId(url, data);
  pageId = result.pageId;
  console.log(result.status);
};

export default initial;
export { pageId, loadedTimestamp };

"use strict";

import { rootUrl } from './config';
import { pageId } from './initial';

const url = `${rootUrl}/click/create`;

const findIndex = async (node) => {
  try {
    if (node === null) {
      return -1;
    }

    const { parentNode } = node;
    if (parentNode === null) {
      return -1;
    }

    const nodesCollection = parentNode.childNodes;
    for (const [index, childNode] of nodesCollection.entries()) {
      if (childNode === node) {
        return index;
      }
    }

    return -1;
  } catch (e) {
    console.error(e);
  }
};

const findPosition = async (node, positionString = '') => {
  try {
    if (node.nodeName === 'HTML') {
      return positionString;
    }

    positionString = (await findIndex(node)) + positionString;
    return await findPosition(node.parentNode, positionString);
  } catch (e) {
    console.error(e);
  }
};

const postData = async (url, data) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
};

const processClick = async (e) => {
  try {
    const position = await findPosition(e.target);
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = (e.x - left) / width;
    const y = (e.y - top) / height;

    const data = {
      pathname: window.location.pathname,
      pageId,
      tagName: e.target.tagName,
      position,
      x,
      y,
    };

    await postData(url, data);
  } catch (e) {
    console.error(e);
  }
};

const collectData = () => {
  window.addEventListener('click', processClick);
};

export default collectData;
export { findPosition, processClick };
"use strict";

import { processedData } from './show';
import { findPosition } from './collect';

const binarySearch = async (array, left, right, element) => {
  if (right >= left) {
    const mid = left + Math.floor((right - left) / 2);
    const _position = await findPosition(element);
    const { tagName } = element;
    const { tag_name, position, element_id } = array[mid];

    if (tagName === tag_name && _position === position) {
      return {
        index: mid,
        elementId: element_id
      };
    }

    if (_position < position) {
      return await binarySearch(array, left, mid - 1, element);
    } else if (_position > position) {
      return await binarySearch(array, mid + 1, right, element);
    } else if (tagName < tag_name) {
      return await binarySearch(array, left, mid - 1, element);
    } else {
      return await binarySearch(array, mid + 1, right, element);
    }
  }

  return -1;
}

const showTooltip = async (e) => {
  if (!processedData) {
    return;
  }

  const length =  processedData.length;
  let elements = document.elementsFromPoint(e.x, e.y);
  let ratio = 0;

  for (let i = 0; i < elements.length; i++) {
    const e = elements[i];
    if (e.tagName === 'DIV' && e.id === 'heat_map') {
      elements = elements.slice(i + 1);
      break;
    }
  }

  for (const e of elements) {
    const result = await binarySearch(processedData, 0, processedData.length - 1, e);
    if (result !== -1) {
      const id = result.elementId;
      let j = result.index;
      let count = 0;
      
      while (j >= 0) {
        if (processedData[j].element_id === id) {
          count++;
          j--;
        } else {
          break;
        }
      }

      j = result.index + 1;

      while (j < length) {
        if (processedData[j].element_id === id) {
          count++;
          j++;
        } else {
          break;
        }
      }

      ratio = count / length;
      document.getElementById('hm_ratio_text').innerText = `${e.tagName.toLowerCase()} --- ${(ratio * 100).toFixed(2)}%`;
      break;
    }
  }
} 

export default showTooltip;
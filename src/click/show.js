"use strict";

import * as d3 from 'd3';
import { rootUrl } from '../config';
import { pageId } from '../initial';
import showTooltip from './tooltip';
import { processClick } from './collect'
import { showedStatus, getData } from '../helper';

let weight = 1;
let bandwidth = 1;
let processedData = null;
let showed = new showedStatus();

// const getData = async (url) => {
//   try {
//     const res = await fetch(url);
//     const obj = await res.json();
//     return obj.data;
//   } catch (e) {
//     console.error(e);
//   }
// };

// const checkPosition = async (tagName, position) => {
//   try {
//     let element = document.getElementsByTagName('html')[0];
//     while (position) {
//       if (!element) {
//         return false;
//       }
//       const index = position.charAt(0);
//       position = position.slice(1);
//       element = element.childNodes[index];
//     }

//     if (element.tagName != tagName) {
//       return false;
//     }

//     const { left, top, width, height } = element.getBoundingClientRect();
//     const _element = document.elementFromPoint(left + width / 2, top + height / 2);

//     if (element !== _element) {
//       return false;
//     }

//     return { left, top, width, height };
//   } catch (e) {
//     console.error(e);
//   }
// };

const getRectByPosition = async (tagName, position) => {
  try {
    let element = document.getElementsByTagName('html')[0];
    while (position) {
      if (!element) {
        return null;
      }
      const index = position.charAt(0);
      position = position.slice(1);
      element = element.childNodes[index];
    }

    if (element.tagName != tagName) {
      return null;
    }

    return element.getBoundingClientRect();
  } catch (e) {
    console.error(e);
  }
}

const draw = async (data, weight, bandwidth) => {
  const density = document.getElementById('hm_density');
  if (density) {
    density.remove();
  }

  const width = Math.max(
    document.body.scrollWidth, document.documentElement.scrollWidth,
    document.body.offsetWidth, document.documentElement.offsetWidth,
    document.body.clientWidth, document.documentElement.clientWidth
  );
  const height = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );

  const colour = d3.scaleLinear()
    .domain([0, 0.134, 0.293, 0.5, 1])
    .range([ "#ffffff", "#7fff7f", "#7f7fff", "#ffff7f", "#ff0000" ]);

  const densityData = d3.contourDensity()
    .x(d => d.x)
    .y(d => d.y)
    .weight(d => weight)
    .size([width, height])
    .bandwidth(bandwidth)
    (data);

  const svg = d3.select('#heat_map')
    .append('div')
    .attr('id', 'hm_density')
    .attr('style', 'opacity: .75')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  /* svg.insert('g', 'g')
    .selectAll('circle')
    .data(data)
    .enter().append('circle')
      .attr('r', 4)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('fill', 'red'); */

  svg.insert('g', 'g')
    .selectAll('path')
    .data(densityData)
    .enter().append('path')
      .attr('d', d3.geoPath())
      .attr('stroke', 'none')
      .attr('fill', (d) => colour(d.value));
  
}

const tooltip = async (heatMap) => {
  const ratio = document.createElement('div');
  const ratioText = document.createElement('p');
  
  ratio.id = 'hm_ratio';
  ratio.style.position = 'fixed';
  ratio.style.bottom = '0';
  ratio.style.left = '0';
  ratio.style.padding = '1px';
  ratio.style.zIndex = '99';

  ratioText.id = 'hm_ratio_text';
  ratioText.style.margin = '0';
  ratioText.style.fontWeight = '1rem';
  ratioText.style.fontFamily = 'monospace';

  ratio.appendChild(ratioText);
  heatMap.appendChild(ratio);

  window.addEventListener('click', showTooltip);
}

const slider = async (heatMap, data) => {
  const divSlider = document.createElement('div');
  const weightSlider = document.createElement('input');
  const bandwidthSlider = document.createElement('input');
  divSlider.id = 'hm_slider';
  divSlider.style.position = 'fixed';
  divSlider.style.bottom = '0';
  divSlider.style.right = '0';
  divSlider.style.padding = '1px';
  divSlider.style.zIndex = '99';

  weightSlider.id = 'hm_weight_slider'
  weightSlider.type = 'range';
  weightSlider.min = '1';
  weightSlider.max = '300';
  weightSlider.value = '1';
  // weightSlider.style.margin = 0;

  bandwidthSlider.id = 'hm_bandwidth_slider'
  bandwidthSlider.type = 'range';
  bandwidthSlider.min = '1';
  bandwidthSlider.max = '50';
  bandwidthSlider.value = '1';
  // bandwidthSlider.style.margin = 0;

  divSlider.appendChild(weightSlider);
  divSlider.appendChild(bandwidthSlider);
  heatMap.appendChild(divSlider);

  let ticking = false;

  weightSlider.addEventListener('input', (e) => {
    weight = e.target.value;

    if (!ticking) {
      window.requestAnimationFrame(async () => {
        await draw(data, weight, bandwidth);
        ticking = false;
      });

      ticking = true;
    }
  });

  bandwidthSlider.addEventListener('input', (e) => {
    bandwidth = e.target.value;

    if (!ticking) {
      window.requestAnimationFrame(async () => {
        await draw(data, weight, bandwidth);
        ticking = false;
      });

      ticking = true;
    }
  })
}

const showData = async () => {
  try {
    if (showed.isShowed()) {
      return;
    }

    const url = `${rootUrl}/page/read?pathname=${window.location.pathname.replace(/\//g, '%2F')}&pageId=${pageId}`;
    let result = await getData(url);
    if (!result) {
      return console.error('Error: no data.');
    }

    if (!result.length) {
      return console.error('Error: no data.');
    }

    // result = result.filter((e) => {
    //   const x = e.x_position;
    //   const y = e.y_position;

    //   return x >= 0 && y >= 0 && x <= 1 && y <= 1;
    // });

    result = result.sort((a, b) => {
      const pa = a.position;
      const pb = b.position;
      const na = a.tag_name;
      const nb = b.tag_name;

      if (pa > pb) {
        return 1;
      }

      if (pa < pb) {
        return -1;
      }

      if (na == nb) {
        return 0;
      }

      if (na > nb) {
        return 1;
      }

      return -1;
    });

    const firstElement = result[0];
    let size = await getRectByPosition(firstElement.tag_name, firstElement.position);
    let temp = 0;

    for (let i = 1; i < result.length; i++) {
      const element = result[i];
      const previousElement = result[i - 1];

      if (size) {
        const { left, top, width, height } =  size;
        previousElement.x_position = Math.round(previousElement.x_position * width) + left + window.scrollX;
        previousElement.y_position = Math.round(previousElement.y_position * height) + top + window.scrollY;
      }

      if (!(element.element_id == previousElement.element_id)) {
        if (!size) {
          result.splice(temp, i - temp);
          i = temp;
        } else {
          temp = i;
        }
        size = await getRectByPosition(element.tag_name, element.position);
      }
    }

    if (!size) {
      result.splice(temp, result.length - temp);
    } else {
      const { left, top, width, height } =  size;
      const lastElement = result[result.length - 1];

      lastElement.x_position = left + Math.round(lastElement.x_position * width);
      lastElement.y_position = top + Math.round(lastElement.y_position * height);
    }

    processedData = [...result];

    const data = result.map((t) => {
      return {
        x: t.x_position,
        y: t.y_position
      }
    });

    const heatMap = document.createElement('div');
    heatMap.setAttribute('id', 'heat_map');
    heatMap.style.position = 'fixed';
    heatMap.style.top = '0px';
    heatMap.style.left = '0px';
    heatMap.style.margin = '0px';
    heatMap.style.padding = '0px';

    const body = document.getElementsByTagName('body')[0];
    body.appendChild(heatMap);

    window.removeEventListener('click', processClick);
    await draw(data, weight, bandwidth);

    // let lastWeight = weight;
    // let lastBandwidth = bandwidth;

    // setInterval(async () => {
    //   if (weight !== lastWeight || bandwidth !== lastBandwidth) {
    //     await draw(data, weight, bandwidth);
    //     lastWeight = weight;
    //     lastBandwidth = bandwidth;
    //   }
    // }, 250);
    showed.status(true);
    await slider(heatMap, data);
    await tooltip(heatMap);
  } catch (e) {
    console.error(e);
  }
};

const hideData = () => {
  if (showed.isShowed()) {
    document.getElementById("heat_map").remove();
    window.removeEventListener('click', showTooltip);
    window.addEventListener('click', processClick);
    showed.status(false);
  }
}

export { showData, hideData, processedData };


import * as d3 from 'd3';
import { rootUrl } from './config';
import { pageId } from './initial';

const getData = async (url) => {
  try {
    const res = await fetch(url);
    const obj = await res.json();
    return obj.data;
  } catch (e) {
    console.error(e);
  }
};

const checkPosition = async (tagName, position) => {
  try {
    let element = document.getElementsByTagName('html')[0];
    while (position) {
      if (!element) {
        return false;
      }
      const index = position.charAt(0);
      position = position.slice(1);
      element = element.childNodes[index];
    }

    if (element.tagName != tagName) {
      return false;
    }

    const { left, top, width, height } = element.getBoundingClientRect();
    const _element = document.elementFromPoint(left + width / 2, top + height / 2);

    if (element !== _element) {
      return false;
    }

    return { left, top, width, height };
  } catch (e) {
    console.error(e);
  }
};

const draw = async (data) => {
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

  const density = document.createElement('div');
  density.setAttribute('id', 'heat_map');
  density.style.position = 'fixed';
  density.style.top = '0px';
  density.style.left = '0px';
  density.style.margin = '0px';
  density.style.padding = '0px';
  density.style.opacity = '.75';

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(density);

  const colour = d3.scaleLinear()
    .domain([0, 0.134, 0.293, 0.5, 1])
    .range([ "#ffffff", "#7fff7f", "#7f7fff", "#ffff7f", "#ff0000" ]);

  const densityData = d3.contourDensity()
    .x(d => d.x)
    .y(d => d.y)
    .weight(d => 100)
    .size([width, height])
    .bandwidth(20)
    (data);

  const svg = d3.select('#heat_map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // svg.insert('g', 'g')
  //   .selectAll('circle')
  //   .data(data)
  //   .enter().append('circle')
  //     .attr('r', 4)
  //     .attr('cx', d => d.x)
  //     .attr('cy', d => d.y)
  //     .attr('fill', 'red');

  svg.insert('g', 'g')
    .selectAll('path')
    .data(densityData)
    .enter().append('path')
      .attr('d', d3.geoPath())
      .attr('stroke', 'none')
      .attr('fill', (d) => colour(d.value));
  
}

const showData = async () => {
  try {
    const density = document.getElementById('heat_map')

    if (density) {
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

    result = result.filter((e) => {
      const x = e.x_position;
      const y = e.y_position;

      return x >= 0 && y >= 0 && x <= 1 && y <= 1;
    });

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
    let valid = await checkPosition(firstElement.tag_name, firstElement.position);
    let temp = 0;

    for (let i = 1; i < result.length; i++) {
      const element = result[i];
      const previousElement = result[i - 1];

      if (valid) {
        const { left, top, width, height } =  valid;
        previousElement.x_position = left + Math.round(previousElement.x_position * width);
        previousElement.y_position = top + Math.round(previousElement.y_position * height);
      }

      if (!(element.tag_name == previousElement.tag_name && element.position == previousElement.position)) {
        if (!valid) {
          result.splice(temp, i - temp);
          i = temp;
        } else {
          temp = i;
        }
        valid = await checkPosition(element.tag_name, element.position);
      }
    }

    if (!valid) {
      result.splice(temp, result.length - temp);
    } else {
      const { left, top, width, height } =  valid;
      const lastElement = result[result.length - 1];

      lastElement.x_position = left + Math.round(lastElement.x_position * width);
      lastElement.y_position = top + Math.round(lastElement.y_position * height);
    }

    const data = result.map((t) => {
      return {
        x: t.x_position,
        y: t.y_position
      }
    });

    await draw(data);

  } catch (e) {
    console.error(e);
  }
};

export default showData;

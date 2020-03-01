import * as d3 from 'd3';
import { rootUrl } from '../config';
import { pageId } from '../initial';
import { getData, showedStatus } from '../helper'

let weight = 1,
  bandwidth = 1,
  showed = new showedStatus(),
  fetchedData = null;



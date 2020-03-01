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

const getData = async (url) => {
  try {
    const res = await fetch(url),
      obj = await res.json();

      return obj.data;
  } catch (e) {
    console.error(e);
  }
}

const showedStatus = (() => {
  let initial,
    showed = false;

  return function() {
    if (initial) {
      return initial;
    }

    initial = this;

    this.isShowed = () => {
      return showed;
    }

    this.status = (status) => {
      if (typeof status === 'boolean') {
        showed = status;
      }
    }
  }
})();

export { postData, getData, showedStatus };
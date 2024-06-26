

export async function FetchData () {

  const response = await fetch('https://my.api.mockaroo.com/users.json?key=0286e5e0');

  if (!response.ok) {
    const error = new Error('An error occured while fetching the data');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data  = await response.json();

  return  data;
}


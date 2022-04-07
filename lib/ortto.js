import axios from "axios";

const ecommerceEvent = async (events) => {
  const chunk_size = 10;

  for (let i = 0; i < events.length; i += chunk_size) {
    const chunk = events.slice(i, i + chunk_size);
    const json = {
      events: chunk,
    };

    try {
      const { data } = await axios.post(
        "https://api.ap3api.com/v1/ecommerce/event",
        JSON.stringify(json),
        {
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": process.env.AP_API_KEY,
          },
        }
      );
      //return data
    } catch (e) {
      console.error(e);
    }
  }

  return;
};

export default ecommerceEvent;

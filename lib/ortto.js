import axios from 'axios';

const execute = async (events) => {


    const chunk_size = 10

    for (let i = 0; i < events.length; i += chunk_size) {

        const chunk = events.slice(i, i+chunk_size) 
        const json = {
            "events": chunk
        } 

        console.log(chunk)
        try {
            const response = await axios.post('https://api.ap3api.com/v1/ecommerce/event',
                JSON.stringify(json),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': process.env.AP_API_KEY
                    }
                })
            // console.log("chunk response",response.data)
        } catch (e) {
            console.error(e)
        }

    }

    return

}

export default execute
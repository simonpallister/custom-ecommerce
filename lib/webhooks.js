const axios = require('axios')

const createWebhooks = async () => {

    const objects = ["order","customer","product","category", "subscriber", "cart"]

    objects.map(async obj=>{
        const body = {
            "scope": `store/${obj}/*`,
            "destination": `${process.env.DOMAIN}api/${obj}`,
            "is_active": true
        }

        try {
            const response = await axios.post(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/hooks`, 
            JSON.stringify(body),
            { 
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": process.env.BC_AUTH_TOKEN
            }
        })

        } catch (e) {
            console.log(e.response.data)
        }
    
    })    
}



const deleteAll = async () => {

    const { data : {data:  webhooks}} = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/hooks`, 
        { 
            headers: {
                "Content-Type": "application/json",
                "X-Auth-Token": process.env.BC_AUTH_TOKEN
        }
    })

    webhooks.map(async (hook) => {
        const webhooks = await axios.delete(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/hooks/${hook.id}`, 
            { 
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-Token": process.env.BC_AUTH_TOKEN
            }
        })
    })
    
}


export default createWebhooks
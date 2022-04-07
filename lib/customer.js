import axios from 'axios'
import ecommerceEvent from './ortto'

const get_customers = async (page) => {

    const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/customers?limit=10&page=${page}`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.BC_AUTH_TOKEN
        }
    })

    return response.data
}

const syncCustomers = async () => {

    let allCustomers = []
    let i=1
    while(true){
        const customers = await get_customers(i)
        if (customers.data.length === 0){
            break
        }
        allCustomers = [...allCustomers, ...customers.data]
        i++
    }

    const ap = allCustomers.map(customer=>{

        const event = {
			resource: "customer",
			event: "created",
			data_source_id: process.env.AP_DATA_SOURCE_ID,
			data: {
                id: customer.id.toString(),
                email: customer.email,
                email_marketing: customer.accepts_product_review_abandoned_cart_emails,
                phone: customer.phone,
                first_name: customer.first_name,
                last_name: customer.last_name,
                billing: {},
                created_at: customer.date_created,
                updated_at: customer.date_modified
            }
        }
        return event

    })

    const result = await ecommerceEvent(ap)

}

export default syncCustomers